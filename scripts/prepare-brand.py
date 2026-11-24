"""
Derive web-ready files from the two supplied brand assets. Nothing is redrawn,
recoloured or retouched: frames and pixels come straight from the originals and
are only trimmed, resized and re-encoded.

    npm run brand        (runs: python -I scripts/prepare-brand.py)

Inputs (supplied by the founder, never edited):
    brand/the-lumen-desk-logo.png       1254x1254 still, opaque off-white canvas
    brand/the-lumen-desk-animated.gif   512x512, 40 frames, ~3.85 s loop

Outputs:
    public/brand/lamp-switch-on.webp    frames 0-22 of the GIF (laptop opens, the
                                        lamp light switches on), lossless, plays ONCE
                                        and holds on the fully lit frame
    public/brand/lamp-lit.webp|png      frame 22 (fully lit) as a still: the reduced
                                        motion / no-animation fallback
    public/brand/lamp-off.webp          frame 0 (lamp off, laptop closed): the 404 page
    public/brand/logo-{256,512}.webp    the still logo, resized
    public/brand/logo.png               the still logo at 512px (for JSON-LD / email)
    src/app/icon.png, apple-icon.png, favicon.ico
"""
import os
import sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_PNG = os.path.join(ROOT, "brand", "the-lumen-desk-logo.png")
SRC_GIF = os.path.join(ROOT, "brand", "the-lumen-desk-animated.gif")
OUT = os.path.join(ROOT, "public", "brand")
APP = os.path.join(ROOT, "src", "app")

LIT_FRAME = 22  # the frame the original animation holds for 1.35 s, fully lit

os.makedirs(OUT, exist_ok=True)
os.makedirs(APP, exist_ok=True)

# ---- animation: play once, end lit -----------------------------------------
gif = Image.open(SRC_GIF)
if gif.n_frames <= LIT_FRAME:
    sys.exit(f"expected at least {LIT_FRAME + 1} frames, got {gif.n_frames}")

frames, durations = [], []
for i in range(LIT_FRAME + 1):
    gif.seek(i)
    frames.append(gif.convert("RGB"))
    durations.append(gif.info.get("duration", 50))

frames[0].save(
    os.path.join(OUT, "lamp-switch-on.webp"),
    save_all=True,
    append_images=frames[1:],
    duration=durations,
    loop=1,          # WebP loop count: 1 = play once, then hold the last frame
    lossless=True,   # keeps the flat brand colours exact (canvas ~#F4F3F1)
    method=6,
)
lit = frames[LIT_FRAME]
lit.save(os.path.join(OUT, "lamp-lit.webp"), lossless=True, method=6)
lit.save(os.path.join(OUT, "lamp-lit.png"), optimize=True)
frames[0].save(os.path.join(OUT, "lamp-off.webp"), lossless=True, method=6)

# ---- still logo ---------------------------------------------------------------
logo = Image.open(SRC_PNG).convert("RGB")  # opaque canvas; alpha channel is all 255
for size in (256, 512):
    logo.resize((size, size), Image.LANCZOS).save(
        os.path.join(OUT, f"logo-{size}.webp"), quality=92, method=6
    )
logo.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, "logo.png"), optimize=True)

# ---- icons (the official artwork, unchanged, at icon sizes) -------------------
logo.resize((512, 512), Image.LANCZOS).save(os.path.join(APP, "icon.png"), optimize=True)
logo.resize((180, 180), Image.LANCZOS).save(os.path.join(APP, "apple-icon.png"), optimize=True)
# ICO frames must be RGBA PNGs for some decoders (Turbopack); the canvas stays opaque.
logo.convert("RGBA").resize((256, 256), Image.LANCZOS).save(
    os.path.join(APP, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)]
)

for name in sorted(os.listdir(OUT)):
    p = os.path.join(OUT, name)
    print(f"{os.path.getsize(p):>8}  public/brand/{name}")
print("icons written to src/app/")
