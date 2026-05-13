import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Upload, Download, Loader2, CheckSquare, Square } from "lucide-react";

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}${String(d.getSeconds()).padStart(2,"0")}`;
}

const basename = (p) => p?.replace(/\\/g, "/").split("/").pop()?.replace(/\.pdf$/i, "") ?? "document";

export default function Split({ onBack }) {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [activeTab, setActiveTab] = useState("range");
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [mergeOutput, setMergeOutput] = useState(true);
  const [status, setStatus] = useState("idle");
  const [outputPath, setOutputPath] = useState(null);
  const [outputMode, setOutputMode] = useState(null); // "single" | "multi"
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
    setSelectedPages(new Set());
    setStatus("loading");
    setOutputPath(null);
    setOutputMode(null);
    setDownloadedName(null);
    setErrorMsg(null);
    try {
      const count = await invoke("get_page_count", { file: f });
      setPageCount(count);
      setRangeFrom(1);
      setRangeTo(count);
      setStatus("idle");
    } catch (e) {
      setErrorMsg(String(e));
      setStatus("error");
    }
  }

  function clearAll() {
    setFile(null);
    setPageCount(null);
    setSelectedPages(new Set());
    setStatus("idle");
    setOutputPath(null);
    setOutputMode(null);
    setDownloadedName(null);
    setErrorMsg(null);
  }

  function togglePage(n) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

  function selectAll() {
    setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
  }

  function clearPages() {
    setSelectedPages(new Set());
  }

  function buildPagesStr() {
    if (activeTab === "range") {
      return rangeFrom === rangeTo ? `${rangeFrom}` : `${rangeFrom}-${rangeTo}`;
    }
    return Array.from(selectedPages).sort((a, b) => a - b).join(",");
  }

  function isReady() {
    if (activeTab === "range") return rangeFrom <= rangeTo;
    return selectedPages.size > 0;
  }

  async function split() {
    if (!file || !isReady()) return;
    setStatus("splitting");
    setErrorMsg(null);
    setDownloadedName(null);
    const pages = buildPagesStr();
    try {
      const json = await invoke("split_pdf", { file, pages, mergePages: mergeOutput });
      setOutputPath(json.path);
      setOutputMode(json.mode);
      setStatus("done");
    } catch (e) {
      setErrorMsg(String(e));
      setStatus("error");
    }
  }

  async function download() {
    const base = basename(file);
    const pages = buildPagesStr().replace(/,/g, "-");
    const ts = timestamp();
    let filename;
    if (outputMode === "multi") {
      filename = `ez-pdf_${base}_split_${ts}.zip`;
    } else {
      filename = `ez-pdf_${base}_pg${pages}_${ts}.pdf`;
    }
    try {
      const name = await invoke("download_file", { path: outputPath, filename });
      setDownloadedName(name);
    } catch (e) {
      setErrorMsg(String(e));
    }
  }

  const busy = status === "loading" || status === "splitting";

  return (
    <div className="container">
      <div className="header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1>Split PDF</h1>
        <p className="subtitle">Extract specific pages from a PDF</p>
      </div>

      <div className="card">
        <div className="card-actions">
          <button onClick={pickFile} className="btn-primary" disabled={busy}>
            <Upload size={15} /> {file ? "Change PDF" : "Upload"}
          </button>
          {file && <button onClick={clearAll} className="btn-ghost">Clear</button>}
        </div>

        {!file && <div className="empty-state"><p>No file selected.</p></div>}

        {file && (
          <div className="split-file-info">
            <span className="file-name" title={file}>{basename(file)}.pdf</span>
            {status === "loading" && <span className="page-badge loading">counting…</span>}
            {pageCount !== null && (
              <span className="page-badge">{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
            )}
          </div>
        )}

        {pageCount !== null && status !== "done" && (
          <>
            <div className="tab-bar">
              <button
                className={`tab ${activeTab === "range" ? "active" : ""}`}
                onClick={() => setActiveTab("range")}
              >Range</button>
              <button
                className={`tab ${activeTab === "pages" ? "active" : ""}`}
                onClick={() => setActiveTab("pages")}
              >Pages</button>
            </div>

            {activeTab === "range" && (
              <div className="range-inputs">
                <div className="range-field">
                  <label>From</label>
                  <input
                    type="number"
                    className="range-input"
                    min={1}
                    max={rangeTo}
                    value={rangeFrom}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(parseInt(e.target.value) || 1, rangeTo));
                      setRangeFrom(v);
                    }}
                    disabled={busy}
                  />
                </div>
                <span className="range-dash">—</span>
                <div className="range-field">
                  <label>To</label>
                  <input
                    type="number"
                    className="range-input"
                    min={rangeFrom}
                    max={pageCount}
                    value={rangeTo}
                    onChange={(e) => {
                      const v = Math.max(rangeFrom, Math.min(parseInt(e.target.value) || pageCount, pageCount));
                      setRangeTo(v);
                    }}
                    disabled={busy}
                  />
                </div>
                <span className="range-count">
                  {rangeTo - rangeFrom + 1} page{rangeTo - rangeFrom + 1 !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {activeTab === "pages" && (
              <div className="pages-section">
                <div className="pages-header">
                  <span className="pages-count">
                    {selectedPages.size} selected
                  </span>
                  <div className="pages-actions">
                    <button className="btn-text" onClick={selectAll}>All</button>
                    <button className="btn-text" onClick={clearPages}>None</button>
                  </div>
                </div>
                <div className="pages-grid">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      className={`page-chip ${selectedPages.has(n) ? "selected" : ""}`}
                      onClick={() => togglePage(n)}
                      disabled={busy}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {pageCount !== null && status !== "done" && activeTab === "pages" && (
        <label className="merge-checkbox-row">
            <button
              type="button"
              className="checkbox-btn"
              onClick={() => setMergeOutput((v) => !v)}
              disabled={busy}
              aria-pressed={mergeOutput}
            >
              {mergeOutput
                ? <CheckSquare size={18} className="checkbox-icon checked" />
                : <Square size={18} className="checkbox-icon" />}
            </button>
            <span>Merge extracted pages into a single PDF</span>
            <span className="merge-hint">
              {mergeOutput ? "→ one .pdf" : "→ .zip of individual pages"}
            </span>
        </label>
      )}

      {pageCount !== null && status !== "done" && (
        <button
          onClick={split}
          className="btn-merge"
          disabled={busy || !isReady()}
        >
          {status === "splitting"
            ? <span className="spinner-row"><Loader2 size={15} className="spin" /> Extracting…</span>
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
              <p className="success-msg">
                {outputMode === "multi"
                  ? `Extracted ${Array.from(selectedPages || []).length || (rangeTo - rangeFrom + 1)} pages as individual PDFs — download as .zip`
                  : "Extraction complete — ready to download."}
              </p>
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
