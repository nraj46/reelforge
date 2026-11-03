#!/usr/bin/env python3
"""
ReelForge sample renderer — PHOTO-background edition.

Same scene text/layout as the original ReelForge samples (emoji, centered
kicker/headline/body, accent bars top+bottom, "N / 5" counter,
"<Business> · Made with ReelForge AI" footer), but the flat color gradient
is replaced by an AI-generated base photo per business, full-bleed, with a
dark gradient overlay so the text stays readable. Each scene crops/zooms
the base photo a little differently so scenes don't look identical.

Usage:
  python3 render_photo_samples.py <samples_dir> <workdir>

<samples_dir> holds bg-<biz>.jpg and the ORIGINAL sample-<biz>.mp4 files
(their audio tracks are reused untouched — same TTS voiceover, same sync).
Scene durations are cut at the original reels' inter-line silence midpoints,
recovered from the shipped MP4s on 2026-11-02.
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FG = (255, 255, 255)
BODY = (233, 229, 242)
MUTED = (206, 200, 218)
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"


def font(size: int, bold: bool = True):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def hex_rgb(h: str):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


BIZ = {
    "salon": {
        "name": "Luxe Locks Salon",
        "accent": "#F270B6",
        "emoji": "\U0001F487",  # person getting haircut
        "durations": [6.15, 6.42, 7.70, 4.85, 6.31],
        "scenes": [
            ("STOP SCROLLING", "50% OFF ALL HAIRCUTS", "This week only — at Luxe Locks Salon"),
            ("WHY LUXE LOCKS?", "Fresh Look, Zero Effort", "Top stylists · premium products · walk out brand new"),
            ("SO EASY", "Book in Seconds", "Call, DM, or just walk in — we handle the rest"),
            ("HURRY", "When It's Gone, It's Gone", "Chairs are filling fast — this week only"),
            ("LUXE LOCKS SALON", "Book Your Chair Today", "50% off all haircuts — see you soon!"),
        ],
    },
    "tacos": {
        "name": "Casa Fuego Tacos",
        "accent": "#F9913A",
        "emoji": "\U0001F32E",  # taco
        "durations": [6.59, 5.68, 5.11, 4.94, 6.65],
        "scenes": [
            ("TACO TUESDAY", "2-FOR-1 TACOS", "Every Tuesday — at Casa Fuego Tacos"),
            ("TASTE THE FIRE", "Fresh. Bold. Loaded.", "Fresh tortillas · bold flavors · generous portions"),
            ("DOUBLE UP", "Buy One, Get One Free", "Bring a friend — the second taco is on us"),
            ("ALL DAY TUESDAY", "Don't Miss It", "When Tuesday ends, so does the deal"),
            ("CASA FUEGO TACOS", "Come Hungry", "2-for-1 tacos every Tuesday — bring a friend!"),
        ],
    },
    "gym": {
        "name": "IronPeak Gym",
        "accent": "#33D298",
        "emoji": "\U0001F4AA",  # flexed biceps
        "durations": [5.39, 4.96, 6.03, 5.19, 6.50],
        "scenes": [
            ("IRONPEAK GYM", "FIRST MONTH FREE", "And no joining fee — zero to start"),
            ("TRAIN WITH US", "Real Coaches, Real Results", "Modern equipment · plans that fit your life"),
            ("ALL LEVELS WELCOME", "Start Where You Are", "No judgment — just progress, every week"),
            ("NO PRESSURE", "No Lock-In Contracts", "Just walk in and start today"),
            ("IRONPEAK GYM", "Start Today", "First month free · no joining fee · join now"),
        ],
    },
}

# per-scene (zoom, center-x fraction, center-y fraction) over the base photo
CROPS = [
    (1.00, 0.50, 0.42),
    (1.10, 0.36, 0.34),
    (1.18, 0.64, 0.56),
    (1.08, 0.40, 0.64),
    (1.26, 0.50, 0.50),
]


def crop_variant(photo: Image.Image, zoom: float, cxf: float, cyf: float) -> Image.Image:
    pw, ph = photo.size
    cw, ch = pw / zoom, ph / zoom
    # keep the 1080x1920 aspect in the crop window
    target = W / H
    if cw / ch > target:
        cw = ch * target
    else:
        ch = cw / target
    x0 = min(max(cxf * pw - cw / 2, 0), pw - cw)
    y0 = min(max(cyf * ph - ch / 2, 0), ph - ch)
    return photo.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.LANCZOS)


def dark_overlay() -> Image.Image:
    """Vertical dark gradient: strong at top & bottom, lighter mid-frame,
    plus a soft extra band behind the text block."""
    stops = [(0.00, 225), (0.16, 165), (0.30, 128), (0.55, 118), (0.74, 150), (0.88, 205), (1.00, 238)]
    alphas = []
    for y in range(H):
        t = y / (H - 1)
        for (t0, a0), (t1, a1) in zip(stops, stops[1:]):
            if t0 <= t <= t1:
                alphas.append(int(a0 + (a1 - a0) * (t - t0) / (t1 - t0)))
                break
        else:
            alphas.append(stops[-1][1])
    ov = Image.new("L", (1, H))
    ov.putdata(alphas)
    black = Image.new("RGBA", (W, H), (5, 2, 10, 255))
    black.putalpha(ov.resize((W, H)))
    return black


OVERLAY = dark_overlay()


def wrap(draw, text, fnt, max_width):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        trial = f"{cur} {w_}".strip()
        if draw.textlength(trial, font=fnt) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines


def emoji_patch(char: str, size: int = 330) -> Image.Image:
    # this system's NotoColorEmoji CBDT build only ships a 109px strike;
    # draw on an oversized tile and crop to the glyph bbox so wide glyphs
    # (e.g. the taco) are never clipped
    tile = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    f = ImageFont.truetype(FONT_EMOJI, 109)
    d.text((100, 100), char, font=f, embedded_color=True)
    bbox = tile.getbbox()
    glyph = tile.crop(bbox)
    scale = size / max(glyph.width, glyph.height)
    return glyph.resize((round(glyph.width * scale), round(glyph.height * scale)), Image.LANCZOS)


def render_slide(biz_key: str, idx: int, photo: Image.Image, out: Path):
    spec = BIZ[biz_key]
    accent = hex_rgb(spec["accent"])
    kicker, headline, body = spec["scenes"][idx]
    zoom, cxf, cyf = CROPS[idx]
    img = crop_variant(photo, zoom, cxf, cyf).convert("RGBA")
    # mute the photo a touch overall, then the legibility gradient
    img = Image.blend(img, Image.new("RGBA", (W, H), (0, 0, 0, 255)), 0.16)
    img.alpha_composite(OVERLAY)

    # text layer (with soft shadows for photo legibility)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    def ctext(y, text, fnt, fill, shadow_alpha=150):
        tw = d.textlength(text, font=fnt)
        x = (W - tw) / 2
        d.text((x, y + 4), text, font=fnt, fill=(0, 0, 0, shadow_alpha))
        d.text((x, y), text, font=fnt, fill=fill + (255,))

    # emoji
    patch = emoji_patch(spec["emoji"])
    img.alpha_composite(patch, (int((W - patch.width) / 2), 245))
    # kicker
    ctext(668, kicker, font(56), accent)
    # headline
    hsize = 118 if idx == 0 else 96
    hf = font(hsize)
    y = 806
    for ln in wrap(d, headline, hf, W - 130):
        ctext(y, ln, hf, FG)
        y += int(hsize * 1.18)
    # body
    y += 38
    bf = font(52, bold=False)
    for ln in wrap(d, body, bf, W - 130):
        ctext(y, ln, bf, BODY)
        y += 70
    # counter + footer
    total = len(spec["scenes"])
    counter = f"{idx + 1} / {total}"
    cf = font(38, bold=False)
    d.text((W - 70 - d.textlength(counter, font=cf), H - 182), counter, font=cf, fill=MUTED + (255,))
    d.text((70, H - 128), f"{spec['name']} · Made with ReelForge AI", font=cf, fill=MUTED + (255,))

    img.alpha_composite(layer)
    d2 = ImageDraw.Draw(img)
    d2.rectangle([0, 0, W, 26], fill=accent + (255,))
    d2.rectangle([0, H - 26, W, H], fill=accent + (255,))
    img.convert("RGB").save(out, "PNG")
    print("slide", out)


def run(cmd):
    print("+", " ".join(str(c) for c in cmd))
    subprocess.run(cmd, check=True)


def build(biz_key: str, samples_dir: Path, work: Path):
    spec = BIZ[biz_key]
    photo = Image.open(samples_dir / f"bg-{biz_key}.jpg").convert("RGB")
    bdir = work / biz_key
    bdir.mkdir(parents=True, exist_ok=True)
    # reuse the ORIGINAL reel's audio untouched (same TTS voiceover & sync)
    audio = bdir / "audio.m4a"
    run(["ffmpeg", "-v", "error", "-y", "-i", str(samples_dir / f"sample-{biz_key}.mp4"),
         "-vn", "-c:a", "copy", str(audio)])
    segs = []
    for i, dur in enumerate(spec["durations"]):
        slide = bdir / f"slide-{i + 1}.png"
        render_slide(biz_key, i, photo, slide)
        seg = bdir / f"seg-{i + 1}.mp4"
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", f"{dur:.2f}", "-i", str(slide),
             "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "24",
             str(seg)])
        segs.append(seg)
    listfile = bdir / "concat.txt"
    listfile.write_text("".join(f"file '{s}'\n" for s in segs))
    silent = bdir / "video.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listfile),
         "-c", "copy", str(silent)])
    out_mp4 = samples_dir / f"sample-{biz_key}.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", str(silent), "-i", str(audio),
         "-map", "0:v", "-map", "1:a", "-c", "copy", str(out_mp4)])
    run(["ffmpeg", "-v", "error", "-y", "-ss", "1", "-i", str(out_mp4), "-frames:v", "1",
         "-q:v", "3", str(samples_dir / f"sample-{biz_key}-poster.jpg")])
    print("built", out_mp4)


if __name__ == "__main__":
    samples_dir = Path(sys.argv[1])
    work = Path(sys.argv[2])
    work.mkdir(parents=True, exist_ok=True)
    for key in BIZ:
        build(key, samples_dir, work)
