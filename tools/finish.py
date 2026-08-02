"""
Finish a flattened card: trim the last of the counter off the edge, correct
the indoor colour cast, and write a clean PNG for sharp to encode.

White balance uses a white-patch assumption — both cards carry white print, so
the 97th percentile of each channel is a known-neutral reference and scaling
it to near-white removes the warm cast without touching hue elsewhere.
"""
import sys, json
import numpy as np
from PIL import Image


def finish(src, out, trim=0.012, lift=1.0):
    """`trim` is a fraction of the short side, either one number for all four
    edges or [left, top, right, bottom] — detection can overshoot on a single
    side, and a symmetric trim would then have to eat into the artwork on the
    other three to clear it."""
    im = Image.open(src).convert("RGB")
    w, h = im.size
    t = [trim] * 4 if isinstance(trim, (int, float)) else list(trim)
    s = min(w, h)
    l, tp, r, b = (round(v * s) for v in t)
    im = im.crop((l, tp, w - r, h - b))

    a = np.asarray(im).astype(np.float32)
    ref = np.percentile(a.reshape(-1, 3), 97, axis=0)
    gain = (246.0 / np.maximum(ref, 1)) * lift
    # Cap the correction so a photo that is already neutral is left alone.
    gain = np.clip(gain, 0.9, 1.6)
    a = np.clip(a * gain, 0, 255).astype(np.uint8)

    Image.fromarray(a).save(out)
    return {"gain": [round(float(g), 3) for g in gain], "size": list(Image.fromarray(a).size)}


if __name__ == "__main__":
    print(json.dumps(finish(**json.loads(sys.argv[1]))))
