"""
Crop an angled card photo into a lifestyle shot: find the card, then place a
fixed-aspect window around it with breathing room, clamped to the frame.
"""
import sys, json
import numpy as np
from PIL import Image
from detect import load, card_mask, corners


def crop(path, out, aspect=4/3, margin=0.30, shift=(0.0, 0.0), lift=1.06):
    full, small, scale = load(path)
    quad = corners(card_mask(small)) / scale

    x0, y0 = quad[:, 0].min(), quad[:, 1].min()
    x1, y1 = quad[:, 0].max(), quad[:, 1].max()
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    cw, ch = (x1 - x0) * (1 + margin), (y1 - y0) * (1 + margin)

    # Grow to the requested aspect, never shrinking below the card + margin.
    if cw / ch < aspect:
        cw = ch * aspect
    else:
        ch = cw / aspect

    cx += cw * shift[0]
    cy += ch * shift[1]

    # Clamp inside the frame while holding the aspect ratio — clamping each
    # side independently would silently letterbox the result.
    cw = min(cw, full.width)
    ch = cw / aspect
    if ch > full.height:
        ch = full.height
        cw = ch * aspect
    left = int(min(max(cx - cw / 2, 0), full.width - cw))
    top = int(min(max(cy - ch / 2, 0), full.height - ch))
    im = full.crop((left, top, left + int(cw), top + int(ch)))

    a = np.asarray(im).astype(np.float32)
    ref = np.percentile(a.reshape(-1, 3), 99, axis=0)
    gain = np.clip((248.0 / np.maximum(ref, 1)) * lift, 0.9, 1.4)
    Image.fromarray(np.clip(a * gain, 0, 255).astype(np.uint8)).save(out, quality=95)
    return {"size": list(im.size)}


if __name__ == "__main__":
    print(json.dumps(crop(**json.loads(sys.argv[1]))))
