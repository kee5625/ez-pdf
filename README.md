# PDF Tools

A lightweight, offline desktop app for merging and splitting PDFs. Nothing is uploaded anywhere — all processing happens on your machine.

![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri-orange)

## Features

- **Merge** — combine multiple PDFs into one file
- **Split** — extract specific pages from a PDF using page numbers or ranges (e.g. `1-3, 5, 7`)
- Fully offline — no internet required, no data leaves your machine
- Output saved directly to your Downloads folder

## Download

> Grab the latest installer from the [Releases](../../releases) page.

No additional software required — just install and run.

## Usage

### Merge PDFs
1. Click **Merge PDFs** on the home screen
2. Click **Add PDFs** and select two or more files
3. Click **Merge** and then **Download**

### Split a PDF
1. Click **Split PDF** on the home screen
2. Click **Pick PDF** and select your file
3. Enter the pages you want to extract:
   - Individual pages: `1, 3, 5`
   - Ranges: `1-3, 7-10`
   - Mixed: `1, 3-5, 8`
4. Click **Extract Pages** and then **Download**

Merged and split files are saved to your Downloads folder as `merged_<timestamp>.pdf`.

## Building from Source

**Prerequisites**
- [Node.js](https://nodejs.org) v18+
- [Rust](https://rustup.rs)
- [Python](https://python.org) 3.10+
- [uv](https://github.com/astral-sh/uv)

```powershell
# 1. Clone
git clone https://github.com/your-username/pdf-tools
cd pdf-tools

# 2. Install JS dependencies
npm install

# 3. Build the Python sidecar (one-time, redo if merger.py changes)
powershell -ExecutionPolicy Bypass -File build-sidecar.ps1

# 4. Dev mode
npm run tauri dev

# 5. Production build (outputs installer to src-tauri/target/release/bundle/)
npm run tauri build
```

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React + Vite |
| Desktop shell | Tauri v2 (Rust) |
| PDF processing | Python + pypdf |
| Packaging | PyInstaller |

## License

MIT
