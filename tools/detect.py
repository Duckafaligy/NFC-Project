"""
Find the card in a photo and flatten it.

The countertop is always the image border, so its colour is sampled from a
border ring and everything far from it is treated as card. The card is then
fitted with a quadrilateral (min-area rectangle for orientation, then the
true corner nearest each rectangle corner) and perspective-corrected, which
removes both the rotation and the camera tilt in one step.
"""
import sys, json, math
import numpy as np
from PIL import Image

CARD_RATIO = 54.0 / 85.6  # ISO 7810 ID-1, portrait (w/h)


def load(path, max_side=1400):
    im = Image.open(path).convert("RGB")
    scale = max_side / max(im.size)
    small = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    return im, np.asarray(small).astype(np.float32), scale


def card_mask(a):
    """True where the pixel is unlike the countertop."""
    h, w, _ = a.shape
    ring = np.concatenate([
        a[: h // 20].reshape(-1, 3), a[-h // 20:].reshape(-1, 3),
        a[:, : w // 20].reshape(-1, 3), a[:, -w // 20:].reshape(-1, 3),
    ])
    bg = np.median(ring, axis=0)
    mx, mn = a.max(axis=2), a.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1)
    bg_sat = (bg.max() - bg.min()) / max(bg.max(), 1)
    luma = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    bg_luma = float(bg @ np.array([0.299, 0.587, 0.114]))
    # Three ways to be card: strongly coloured (the Instagram print), brighter
    # than the counter (the white Google card), or far darker than it (the
    # black Google card). Deliberately NOT "different from the background",
    # because cast shadow is different too and would be swallowed into the
    # mask, dragging the detected corners outwards. The dark threshold is set
    # well past what a shadow on a pale counter reaches, so shadow still does
    # not qualify.
    m = (sat > bg_sat + 0.14) | (luma > bg_luma + 11) | (luma < bg_luma - 60)
    return clean(m)


def clean(m):
    """Keep the largest blob, then fill it in."""
    from collections import deque
    h, w = m.shape
    seen = np.zeros_like(m, dtype=bool)
    best, best_n = None, 0
    for sy in range(0, h, 8):
        for sx in range(0, w, 8):
            if not m[sy, sx] or seen[sy, sx]:
                continue
            q, comp = deque([(sy, sx)]), []
            seen[sy, sx] = True
            while q:
                y, x = q.popleft()
                comp.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
            if len(comp) > best_n:
                best, best_n = comp, len(comp)
    out = np.zeros_like(m)
    if best:
        ys, xs = zip(*best)
        out[np.array(ys), np.array(xs)] = True
    return out


def hull(points):
    pts = sorted(map(tuple, points))
    def half(ps):
        st = []
        for p in ps:
            while len(st) >= 2 and (st[-1][0] - st[-2][0]) * (p[1] - st[-2][1]) - (st[-1][1] - st[-2][1]) * (p[0] - st[-2][0]) <= 0:
                st.pop()
            st.append(p)
        return st
    return np.array(half(pts)[:-1] + half(pts[::-1])[:-1], dtype=np.float64)


def min_area_angle(H):
    best, best_a = None, 0.0
    for i in range(int(90 / 0.25)):
        a = math.radians(i * 0.25)
        c, s = math.cos(a), math.sin(a)
        R = np.array([[c, -s], [s, c]])
        P = H @ R.T
        area = np.ptp(P[:, 0]) * np.ptp(P[:, 1])
        if best is None or area < best:
            best, best_a = area, a
    return best_a


def fit_line(pts):
    """Total-least-squares line through points -> (point_on_line, direction)."""
    c = pts.mean(axis=0)
    _, _, vt = np.linalg.svd(pts - c)
    return c, vt[0]


def intersect(p1, d1, p2, d2):
    A = np.array([d1, -d2]).T
    t = np.linalg.solve(A, p2 - p1)
    return p1 + t[0] * d1


def corners(mask):
    ys, xs = np.nonzero(mask)
    H = hull(np.stack([xs, ys], axis=1))
    a = min_area_angle(H)
    c, s = math.cos(a), math.sin(a)
    R = np.array([[c, -s], [s, c]])
    P = H @ R.T
    x0, x1 = P[:, 0].min(), P[:, 0].max()
    y0, y1 = P[:, 1].min(), P[:, 1].max()
    w, h = x1 - x0, y1 - y0

    # Assign each hull point to the side it hugs, ignoring the rounded corner
    # zones, then fit a line per side and intersect them. Fitting whole edges
    # beats picking the nearest hull point to each rectangle corner: one stray
    # pixel can no longer drag a corner off the card.
    band, keep = 0.06, 0.16
    sides = []
    for lo, hi, axis, edge in (
        (y0, y0 + band * h, 0, "top"),
        (x1 - band * w, x1, 1, "right"),
        (y1 - band * h, y1, 0, "bottom"),
        (x0, x0 + band * w, 1, "left"),
    ):
        coord = P[:, 1] if axis == 0 else P[:, 0]
        other = P[:, 0] if axis == 0 else P[:, 1]
        omin, omax = (x0, x1) if axis == 0 else (y0, y1)
        sel = (coord >= lo) & (coord <= hi)
        sel &= (other > omin + keep * (omax - omin)) & (other < omax - keep * (omax - omin))
        if sel.sum() < 2:
            sel = (coord >= lo) & (coord <= hi)
        sides.append(fit_line(H[sel]))

    (pt, dt), (pr, dr), (pb, db), (pl, dl) = sides
    return np.array([
        intersect(pt, dt, pl, dl),
        intersect(pt, dt, pr, dr),
        intersect(pb, db, pr, dr),
        intersect(pb, db, pl, dl),
    ])


def perspective_coeffs(dst, src):
    A, B = [], []
    for (dx, dy), (sx, sy) in zip(dst, src):
        A.append([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy])
        A.append([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy])
        B += [sx, sy]
    return np.linalg.solve(np.array(A, dtype=np.float64), np.array(B, dtype=np.float64))


def flatten(path, out, quarter=0, height=1500, bleed=0.004):
    full, small, scale = load(path)
    quad = corners(card_mask(small)) / scale

    # Nudge each corner outward so the card's own edge is not shaved off.
    c = quad.mean(axis=0)
    quad = c + (quad - c) * (1 + bleed)

    # Long side vertical unless the caller asks for a quarter turn.
    e1 = np.linalg.norm(quad[1] - quad[0])
    e2 = np.linalg.norm(quad[2] - quad[1])
    if e1 > e2:
        quad = np.roll(quad, -1, axis=0)  # make the first edge the short one
    for _ in range(quarter):
        quad = np.roll(quad, -1, axis=0)

    W = round(height * CARD_RATIO)
    dst = [(0, 0), (W, 0), (W, height), (0, height)]
    co = perspective_coeffs(dst, [tuple(p) for p in quad])
    flat = full.transform((W, height), Image.PERSPECTIVE, co, Image.BICUBIC)
    flat.save(out, quality=96)
    return {"quad": quad.tolist(), "size": [W, height]}


if __name__ == "__main__":
    cfg = json.loads(sys.argv[1])
    print(json.dumps(flatten(**cfg)))
