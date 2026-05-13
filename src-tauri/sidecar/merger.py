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
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {msg}\n")
    print(f"[{ts}] {msg}", file=sys.stderr)


def die(msg: str):
    log(f"ERROR: {msg}")
    print(json.dumps({"status": "error", "message": msg}), flush=True)
    sys.exit(1)


def ok(**kwargs):
    print(json.dumps({"status": "ok", **kwargs}), flush=True)


def parse_page_range(page_str: str, total: int) -> list[int]:
    pages = set()
    for part in page_str.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            bounds = part.split("-", 1)
            try:
                start = int(bounds[0].strip())
                end = int(bounds[1].strip())
            except ValueError:
                die(f"Invalid range: '{part}'")
            if start < 1 or end > total or start > end:
                die(f"Range {start}-{end} out of bounds (PDF has {total} pages)")
            pages.update(range(start - 1, end))  # 0-indexed
        else:
            try:
                p = int(part)
            except ValueError:
                die(f"Invalid page number: '{part}'")
            if p < 1 or p > total:
                die(f"Page {p} out of bounds (PDF has {total} pages)")
            pages.add(p - 1)
    return sorted(pages)


def cmd_merge(files: list[str]):
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
    log(f"writing merged output: {output_path}")
    try:
        with open(output_path, "wb") as f:
            writer.write(f)
    except Exception as e:
        die(f"Failed to write output: {e}")

    log(f"merge done: {output_path}")
    ok(path=output_path)


def cmd_info(filepath: str):
    if not os.path.isfile(filepath):
        die(f"File not found: {filepath}")

    try:
        from pypdf import PdfReader
    except ImportError as e:
        die(f"pypdf not installed: {e}")

    try:
        reader = PdfReader(filepath)
        count = len(reader.pages)
    except Exception as e:
        die(f"Failed to read PDF: {e}")

    log(f"info: {filepath} has {count} pages")
    ok(pages=count)


def cmd_split(filepath: str, page_str: str):
    if not os.path.isfile(filepath):
        die(f"File not found: {filepath}")

    try:
        from pypdf import PdfReader, PdfWriter
    except ImportError as e:
        die(f"pypdf not installed: {e}")

    try:
        reader = PdfReader(filepath)
        total = len(reader.pages)
    except Exception as e:
        die(f"Failed to read PDF: {e}")

    log(f"split: {filepath} ({total} pages), range='{page_str}'")

    pages = parse_page_range(page_str, total)
    if not pages:
        die("No valid pages selected")

    log(f"extracting pages (0-indexed): {pages}")

    writer = PdfWriter()
    for i in pages:
        writer.add_page(reader.pages[i])

    output_path = os.path.join(LOG_DIR, f"{uuid.uuid4()}.pdf")
    try:
        with open(output_path, "wb") as f:
            writer.write(f)
    except Exception as e:
        die(f"Failed to write output: {e}")

    log(f"split done: {output_path}")
    ok(path=output_path, extracted=len(pages), total=total)


def main():
    args = sys.argv[1:]
    log(f"started: {args}")

    if not args:
        die("No subcommand given. Use: merge | split | info")

    cmd = args[0]

    if cmd == "merge":
        cmd_merge(args[1:])
    elif cmd == "info":
        if len(args) < 2:
            die("info requires a file path")
        cmd_info(args[1])
    elif cmd == "split":
        if len(args) < 3:
            die("split requires: split <file> <page_range>")
        cmd_split(args[1], args[2])
    else:
        die(f"Unknown subcommand: {cmd}")


if __name__ == "__main__":
    main()
