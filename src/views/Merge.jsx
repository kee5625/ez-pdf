import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, FilePlus, X, Download, Loader2 } from "lucide-react";

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}${String(d.getSeconds()).padStart(2,"0")}`;
}

export default function Merge({ onBack }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [outputPath, setOutputPath] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [downloadedName, setDownloadedName] = useState(null);

  async function pickFiles() {
    const selected = await open({
      multiple: true,
      filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    });
    if (!selected) return;
    const picked = Array.isArray(selected) ? selected : [selected];
    setFiles((prev) => [...prev, ...picked]);
    setStatus("idle");
    setOutputPath(null);
    setDownloadedName(null);
    setErrorMsg(null);
  }

  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setStatus("idle");
    setOutputPath(null);
    setDownloadedName(null);
  }

  function clearAll() {
    setFiles([]);
    setStatus("idle");
    setOutputPath(null);
    setDownloadedName(null);
    setErrorMsg(null);
  }

  async function merge() {
    if (files.length < 2) return;
    setStatus("merging");
    setErrorMsg(null);
    setDownloadedName(null);
    try {
      const path = await invoke("merge_pdfs", { files });
      setOutputPath(path);
      setStatus("done");
    } catch (e) {
      setErrorMsg(String(e));
      setStatus("error");
    }
  }

  async function download() {
    const filename = `ezpdf_merged_${timestamp()}.pdf`;
    try {
      const name = await invoke("download_file", { path: outputPath, filename });
      setDownloadedName(name);
    } catch (e) {
      setErrorMsg(String(e));
    }
  }

  const basename = (p) => p.replace(/\\/g, "/").split("/").pop();

  return (
    <div className="container">
      <div className="header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1>Merge PDFs</h1>
        <p className="subtitle">Combine multiple PDFs into one</p>
      </div>

      <div className="card">
        <div className="card-actions">
          <button onClick={pickFiles} className="btn-primary">
            <FilePlus size={15} /> Upload
          </button>
          {files.length > 0 && (
            <button onClick={clearAll} className="btn-ghost">Clear all</button>
          )}
        </div>

        {files.length === 0 && (
          <div className="empty-state"><p>No files added yet.</p></div>
        )}

        {files.length > 0 && (
          <ul className="file-list">
            {files.map((f, i) => (
              <li key={i} className="file-item">
                <span className="file-name" title={f}>{basename(f)}</span>
                <button onClick={() => removeFile(i)} className="btn-remove" title="Remove">
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {files.length === 1 && (
        <p className="hint">Add at least one more PDF to merge.</p>
      )}

      {files.length >= 2 && status !== "done" && (
        <button onClick={merge} className="btn-merge" disabled={status === "merging"}>
          {status === "merging"
            ? <span className="spinner-row"><Loader2 size={15} className="spin" /> Merging…</span>
            : `Merge ${files.length} PDFs`}
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
              <p className="success-msg">Merge complete — ready to download.</p>
              <button onClick={download} className="btn-download">
                <Download size={15} /> Download to Downloads folder
              </button>
            </>
          )}
          <button onClick={clearAll} className="btn-ghost" style={{ marginTop: "0.5rem" }}>
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
