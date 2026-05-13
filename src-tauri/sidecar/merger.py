import sys
import json
import os
import tempfile
import uuid
from datetime import datetime

LOG_DIR = os.path.join(tempfile.gettempdir(), "pdf-merger")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "merger.log")

def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line)
    print(line, end="", file=sys.stderr)

def die(msg: str):
    log(f"ERROR: {msg}")
    print(json.dumps({"status": "error", "message": msg}), flush=True)
    sys.exit(1)

def main():
    files = sys.argv[1:]
    log(f"started with args: {files}")

    if len(files) < 2:
        die("Need at least 2 PDF files")

    try:
        from pypdf import PdfWriter
    except ImportError as e:
        die(f"pypdf not installed: {e}")

    writer = PdfWriter()

    for filepath in files:
        log(f"appending: {filepath}")
        if not os.path.isfile(filepath):
            die(f"File not found: {filepath}")
        try:
            writer.append(filepath)
        except Exception as e:
            die(f"Failed to read {os.path.basename(filepath)}: {e}")

    output_path = os.path.join(LOG_DIR, f"{uuid.uuid4()}.pdf")
    log(f"writing output to: {output_path}")

    try:
        with open(output_path, "wb") as f:
            writer.write(f)
    except Exception as e:
        die(f"Failed to write output: {e}")

    log(f"done: {output_path}")
    print(json.dumps({"status": "ok", "path": output_path}), flush=True)

if __name__ == "__main__":
    main()
