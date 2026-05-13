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

#[tauri::command]
async fn merge_pdfs(app: AppHandle, files: Vec<String>) -> Result<String, String> {
    if files.len() < 2 {
        return Err("Need at least 2 PDF files".to_string());
    }

    log_debug(&format!("spawning sidecar with files: {:?}", files));

    let output = app
        .shell()
        .sidecar("merger")
        .map_err(|e| { log_debug(&format!("sidecar lookup failed: {e}")); e.to_string() })?
        .args(&files)
        .output()
        .await
        .map_err(|e| { log_debug(&format!("sidecar spawn failed: {e}")); e.to_string() })?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    log_debug(&format!(
        "sidecar exit: {:?}\nstdout: {}\nstderr: {}",
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
            "Merger exited {} — {}",
            code,
            if detail.is_empty() { "no output" } else { &detail }
        ));
    }

    let json: serde_json::Value = serde_json::from_str(stdout.trim())
        .map_err(|e| format!("Bad response from merger (stdout: {:?}): {}", stdout.trim(), e))?;

    if json["status"] == "error" {
        return Err(json["message"]
            .as_str()
            .unwrap_or("Unknown error")
            .to_string());
    }

    json["path"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Merger returned no output path".to_string())
}

#[tauri::command]
async fn download_pdf(app: AppHandle, path: String) -> Result<String, String> {
    use std::path::Path;

    let src = Path::new(&path);
    if !src.exists() {
        return Err("Temp file not found — try merging again".to_string());
    }

    let downloads = app
        .path()
        .download_dir()
        .map_err(|e: tauri::Error| e.to_string())?;

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let filename = format!("merged_{}.pdf", timestamp);
    let dest = downloads.join(&filename);

    std::fs::copy(src, &dest).map_err(|e| format!("Copy failed: {}", e))?;

    Ok(filename)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![merge_pdfs, download_pdf])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
