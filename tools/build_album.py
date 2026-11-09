#!/usr/bin/env python3
"""Builds the photo gallery (photos.html) from the pictures in assets/album/.

You never need to run this yourself: .github/workflows/gallery.yml runs it on
GitHub every time something in assets/album/ changes, then publishes the result.

For each picture it writes a web-sized copy and a thumbnail to assets/album-web/
and lists them all in assets/album-web/album.json.

Naming photos (the filename becomes the label):
    assets/album/travel/2025-08 Morse theory summer -- TA'ing topology in Şirince.jpg
                 ^^^^^^ ^^^^^^^ ^^^^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                 category  date      title                caption (optional)
  - a sub-folder becomes a filter button ("travel", "research", "Nepal"…)
  - a leading date (2025, 2025-08 or 2025-08-14) sorts newest first
  - camera names like IMG_1234 are ignored, so unlabeled photos just show no title
"""
import hashlib
import json
import re
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

try:  # iPhone .HEIC photos
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:
    pass

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "album"
OUT = ROOT / "assets" / "album-web"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".gif", ".tif", ".tiff"}
FULL, THUMB = 2000, 800  # longest side, in pixels
MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()

DATE = re.compile(r"^(\d{4})(?:[-_.](\d{1,2}))?(?:[-_.](\d{1,2}))?(?:[\s_]+|-+\s*|$)")
CAMERA = re.compile(r"^(img|dsc|dscn|dscf|pxl|mvimg|photo|image|screenshot)?[\s_-]*[\d_\s.-]*$", re.I)


def parse_name(stem):
    date = None
    m = DATE.match(stem)
    if m and 1990 <= int(m.group(1)) <= 2100:
        y, mo, d = m.groups()
        date = y + (f"-{int(mo):02d}" if mo else "") + (f"-{int(d):02d}" if d else "")
        stem = stem[m.end():]
    title, _, caption = stem.partition(" -- ")
    title, caption = title.strip(), caption.strip()
    if CAMERA.match(title):
        title = ""
    return title, caption, date


def exif_date(im):
    try:
        ex = im.getexif()
        v = ex.get_ifd(0x8769).get(36867) or ex.get(306)  # DateTimeOriginal / DateTime
        if v and re.match(r"\d{4}:\d\d:\d\d", v):
            return v[:10].replace(":", "-")
    except Exception:
        pass
    return None


def pretty(date):
    if not date:
        return ""
    parts = date.split("-")
    return f"{MONTHS[int(parts[1]) - 1]} {parts[0]}" if len(parts) > 1 else parts[0]


def slug(text):
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:40] or "photo"


def save(im, size, path):
    im = im.copy()
    im.thumbnail((size, size), Image.LANCZOS)
    im.save(path, "WEBP", quality=82, method=5)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    items, keep = [], {"album.json"}
    for f in sorted(SRC.rglob("*")):
        rel = f.relative_to(SRC)
        if not f.is_file() or f.suffix.lower() not in EXTS or any(p.startswith(".") for p in rel.parts):
            continue
        data = f.read_bytes()
        name = f"{slug(f.stem)}-{hashlib.sha1(data).hexdigest()[:10]}"
        full, thumb = OUT / f"{name}.webp", OUT / f"{name}-t.webp"
        keep |= {full.name, thumb.name}
        try:
            with Image.open(f) as im:
                taken = exif_date(im)
                im = ImageOps.exif_transpose(im)  # phones store photos sideways + a rotate flag
                if im.mode not in ("RGB", "RGBA"):
                    im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
                if not full.exists():
                    save(im, FULL, full)
                if not thumb.exists():
                    save(im, THUMB, thumb)
                w, h = im.size
        except Exception as e:  # a broken or unsupported file shouldn't stop the rest
            print(f"skipped {rel}: {e}")
            continue
        title, caption, date = parse_name(f.stem)
        date = date or taken
        tag = rel.parts[0].replace("_", " ").replace("-", " ") if len(rel.parts) > 1 else ""
        items.append({
            "file": rel.as_posix(),
            "full": f"assets/album-web/{full.name}",
            "thumb": f"assets/album-web/{thumb.name}",
            "w": w, "h": h,
            "title": title, "caption": caption,
            "tag": tag, "date": date or "", "when": pretty(date),
        })
        print(f"ok  {rel}  →  {title or '(no title)'}")

    # newest first; undated photos go last, in filename order
    items.sort(key=lambda i: i["file"])
    items.sort(key=lambda i: i["date"] or "0", reverse=True)

    for old in OUT.iterdir():
        if old.name not in keep:
            old.unlink()
    (OUT / "album.json").write_text(json.dumps(items, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(items)} photos in the gallery")


if __name__ == "__main__":
    main()
