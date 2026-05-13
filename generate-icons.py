"""Generate app icons for Tauri. Run once before building."""
from PIL import Image, ImageDraw
import os, struct, zlib

ICONS_DIR = os.path.join("src-tauri", "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

BG = (108, 99, 255)   # accent purple
FG = (255, 255, 255)

def make_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = size // 8
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)
    # Simple "PDF" shape — overlapping white rectangles
    m = size // 5
    w, h = size - 2 * m, size - 2 * m
    draw.rectangle([m, m + h // 4, m + w * 3 // 4, m + h], fill=FG + (220,))
    draw.rectangle([m + w // 4, m, m + w, m + h * 3 // 4], fill=FG + (200,))
    return img

def save_ico(img: Image.Image, path: str):
    """Save a minimal ICO file with 16, 32, 48, 256 px variants."""
    sizes = [16, 32, 48, 256]
    images = [img.resize((s, s), Image.LANCZOS) for s in sizes]
    images[0].save(path, format="ICO", sizes=[(s, s) for s in sizes])

base = make_icon(1024)
base.resize((32, 32), Image.LANCZOS).save(os.path.join(ICONS_DIR, "32x32.png"))
base.resize((128, 128), Image.LANCZOS).save(os.path.join(ICONS_DIR, "128x128.png"))
base.resize((256, 256), Image.LANCZOS).save(os.path.join(ICONS_DIR, "128x128@2x.png"))
base.save(os.path.join(ICONS_DIR, "icon.png"))
save_ico(base, os.path.join(ICONS_DIR, "icon.ico"))

# macOS ICNS — write a minimal valid ICNS (just the ic07 / 128px chunk)
icns_path = os.path.join(ICONS_DIR, "icon.icns")
img128 = base.resize((128, 128), Image.LANCZOS)
import io
buf = io.BytesIO()
img128.save(buf, format="PNG")
png_bytes = buf.getvalue()
chunk_type = b"ic07"  # 128x128 PNG
chunk_data = chunk_type + struct.pack(">I", len(png_bytes) + 8) + png_bytes
total = struct.pack(">I", len(chunk_data) + 8)
with open(icns_path, "wb") as f:
    f.write(b"icns" + total + chunk_data)

print("Icons generated in", ICONS_DIR)
