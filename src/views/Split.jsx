import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export default function Split({ onBack }) {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [pageInput, setPageInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | splitting | done | error
  const [outputPath, setOutputPath] = useState(null);
  const [downloadedName, setDownloadedName] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  async function pickFile() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    });
    if (!selected) return;
    const f = Array.isArray(selected) ? selected[0] : selected;
    setFile(f);
    setPageCount(null);
    setPageInput("");
    setStatus("loading");
    setOutputPath(null);
    setDownloadedName(null);
    setErrorMsg(null);
    try {
      const count = await invoke("get_page_count", { file: f });
      setPageCount(count);
      setStatus("idle");
    } catch (e) {
      setErrorMsg(String(e));
      setStatus("error");
    }
  }

  function clearAll() {
    setFile(null);
    setPageCount(null);
    setPageInput("");
    setStatus("idle");
    setOutputPath(null);
    setDownloadedName(null);
    setErrorMsg(null);
  }

  async function split() {
    if (!file || !pageInput.trim()) return;
    setStatus("splitting");
    setErrorMsg(null);
    setDownloadedName(null);
    try {
      const path = await invoke("split_pdf", { file, pages: pageInput.trim() });
      setOutputPath(path);
      setStatus("done");
    } catch (e) {
      setErrorMsg(String(e));
      setStatus("error");
    }
  }

  async function download() {
    try {
      const name = await invoke("download_pdf", { path: outputPath });
      setDownloadedName(name);
    } catch (e) {
      setErrorMsg(String(e));
    }
  }

  const basename = (p) => p?.replace(/\\/g, "/").split("/").pop();
  const busy = status === "loading" || status === "splitting";

  return (
    <div className="container">
      <div className="header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h1>Split PDF</h1>
        <p className="subtitle">Extract specific pages from a PDF</p>
      </div>

      <div className="card">
        <div className="card-actions">
          <button onClick={pickFile} className="btn-primary" disabled={busy}>
            {file ? "Change PDF" : "Upload"}
          </button>
          {file && (
            <button onClick={clearAll} className="btn-ghost">Clear</button>
          )}
        </div>

        {!file && (
          <div className="empty-state"><p>No file selected.</p></div>
        )}

        {file && (
          <div className="split-file-info">
            <span className="file-icon">📄</span>
            <span className="file-name" title={file}>{basename(file)}</span>
            {status === "loading" && <span className="page-badge loading">counting…</span>}
            {pageCount !== null && (
              <span className="page-badge">{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
            )}
          </div>
        )}

        {pageCount !== null && status !== "done" && (
          <div className="range-section">
            <label className="range-label">
              Pages to extract
              <span className="range-hint">e.g. 1-3, 5, 7-10</span>
            </label>
            <input
              className="range-input"
              type="text"
              placeholder={`1-${pageCount}`}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && split()}
              disabled={busy}
            />
            <p className="range-note">
              Separate individual pages with commas. Use a dash for ranges.
              Pages 1–{pageCount} are valid.
            </p>
          </div>
        )}
      </div>

      {pageCount !== null && status !== "done" && (
        <button
          onClick={split}
          className="btn-merge"
          disabled={busy || !pageInput.trim()}
        >
          {status === "splitting"
            ? <span className="spinner-row"><span className="spinner" />Splitting…</span>
            : "Extract Pages"}
        </button>
      )}

      {status === "error" && (
        <div className="error-box"><strong>Error:</strong> {errorMsg}</div>
      )}

      {status === "done" && (
        <div className="done-box">
          {downloadedName ? (
            <p className="success-msg">Saved as <strong>{downloadedName}</strong></p>
          ) : (
            <>
              <p className="success-msg">Split complete — ready to download.</p>
              <button onClick={download} className="btn-download">↓ Download to Downloads folder</button>
            </>
          )}
          <button onClick={clearAll} className="btn-ghost" style={{ marginTop: "0.5rem" }}>Start over</button>
        </div>
      )}
    </div>
  );
}
