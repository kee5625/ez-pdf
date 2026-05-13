use tauri::{AppHandle, Manager};
use tauri_plugin_shell::ShellExt;

fn log_debug(msg: &str) {
    use std::io::Write;
    let log_dir = std::env::temp_dir().join("pdf-merger");
    let _ = std::fs::create_dir_all(&log_dir);
    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_dir.join("app.log"))
    {
        let ts = chrono::Local::now().format("%Y-%m-%d %H:%M:%S");
        let _ = writeln!(f, "[{ts}] {msg}");
    }
    eprintln!("[pdf-merger] {msg}");
}

async fn run_sidecar(app: &AppHandle, args: &[&str]) -> Result<serde_json::Value, String> {
    log_debug(&format!("sidecar args: {:?}", args));

    let output = app
        .shell()
        .sidecar("merger")
        .map_err(|e| { log_debug(&format!("sidecar lookup failed: {e}")); e.to_string() })?
        .args(args)
        .output()
        .await
        .map_err(|e| { log_debug(&format!("sidecar spawn failed: {e}")); e.to_string() })?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    log_debug(&format!(
        "exit: {:?} | stdout: {} | stderr: {}",
        output.status.code(),
        stdout.trim(),
        stderr.trim()
    ));

    if !output.status.success() {
        let detail = [stdout.trim(), stderr.trim()]
            .iter()
            .filter(|s| !s.is_empty())
            .cloned()
            .collect::<Vec<_>>()
            .join(" | ");
        let code = output.status.code().unwrap_or(-1);
        return Err(format!(
            "Sidecar exited {} — {}",
            code,
            if detail.is_empty() { "no output" } else { &detail }
        ));
    }

    let json: serde_json::Value = serde_json::from_str(stdout.trim())
        .map_err(|e| format!("Bad sidecar response ({:?}): {}", stdout.trim(), e))?;

    if json["status"] == "error" {
        return Err(json["message"].as_str().unwrap_or("Unknown error").to_string());
    }

    Ok(json)
}

#[tauri::command]
async fn merge_pdfs(app: AppHandle, files: Vec<String>) -> Result<String, String> {
    if files.len() < 2 {
        return Err("Need at least 2 PDF files".to_string());
    }
    let mut args = vec!["merge"];
    let file_refs: Vec<&str> = files.iter().map(|s| s.as_str()).collect();
    args.extend(file_refs.iter());

    let json = run_sidecar(&app, &args).await?;
    json["path"].as_str().map(|s| s.to_string())
        .ok_or_else(|| "No output path returned".to_string())
}

#[tauri::command]
async fn get_page_count(app: AppHandle, file: String) -> Result<u32, String> {
    let json = run_sidecar(&app, &["info", &file]).await?;
    json["pages"].as_u64()
        .map(|n| n as u32)
        .ok_or_else(|| "No page count returned".to_string())
}

#[tauri::command]
async fn split_pdf(app: AppHandle, file: String, pages: String) -> Result<String, String> {
    if pages.trim().is_empty() {
        return Err("No pages specified".to_string());
    }
    let json = run_sidecar(&app, &["split", &file, &pages]).await?;
    json["path"].as_str().map(|s| s.to_string())
        .ok_or_else(|| "No output path returned".to_string())
}

#[tauri::command]
async fn download_pdf(app: AppHandle, path: String) -> Result<String, String> {
    use std::path::Path;

    let src = Path::new(&path);
    if !src.exists() {
        return Err("Temp file not found — try again".to_string());
    }

    let downloads = app
        .path()
        .download_dir()
        .map_err(|e: tauri::Error| e.to_string())?;

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let filename = format!("merged_{}.pdf", timestamp);
    let dest = downloads.join(&filename);

    std::fs::copy(src, &dest).map_err(|e| format!("Copy failed: {}", e))?;
    log_debug(&format!("downloaded to: {:?}", dest));
    Ok(filename)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            merge_pdfs,
            get_page_count,
            split_pdf,
            download_pdf
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
