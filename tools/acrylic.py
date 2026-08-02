"""
Make the acrylic stand photos presentable.

The counter is warm beige and the stand is clear, so straight out of the phone
the product is a grey object on a yellow background. This neutralises the cast
using the counter itself as the white reference, lifts it to near-white, and
adds contrast so the acrylic edges and the screws read.
"""
import sys, json
import numpy as np
from PIL import Image, ImageEnhance


def clean(src, out, box=None, target=246.0, contrast=1.18, sharp=1.25):
    im = Image.open(src).convert("RGB")
    if box:
        im = im.crop(tuple(box))
    a = np.asarray(im).astype(np.float32)

    # The counter fills the frame edges, so the median of a border ring is a
    # reliable neutral reference — better than a global percentile here,
    # because the stand itself carries bright specular highlights.
    h, w, _ = a.shape
    ring = np.concatenate([
        a[: h // 12].reshape(-1, 3), a[-h // 12:].reshape(-1, 3),
        a[:, : w // 12].reshape(-1, 3), a[:, -w // 12:].reshape(-1, 3),
    ])
    bg = np.median(ring, axis=0)
    gain = np.clip(target / np.maximum(bg, 1), 0.9, 1.9)
    a = np.clip(a * gain, 0, 255)

    im = Image.fromarray(a.astype(np.uint8))
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Sharpness(im).enhance(sharp)
    im.save(out, quality=96)
    return {"bg": [round(float(v)) for v in bg], "gain": [round(float(g), 3) for g in gain], "size": list(im.size)}


if __name__ == "__main__":
    print(json.dumps(clean(**json.loads(sys.argv[1]))))
