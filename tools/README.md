# Card photo pipeline

Turns a phone photo of a card on a counter into site-ready imagery. Used for
everything in `public/images/products` and the lifestyle shots in
`public/images/hero`.

Requires `numpy` and `pillow` (`pip install numpy pillow`).

## 1. Flatten — `detect.py`

Finds the card and removes both the rotation and the camera tilt.

The counter is always at the photo's border, so its colour is sampled from a
border ring. A pixel counts as card if it is strongly coloured (the Instagram
print) or brighter than the counter (the white Google card) — deliberately
*not* "different from the background", because cast shadow is different too
and would drag the detected corners outwards. The card's outline is then fitted
with one line per side and the lines intersected, so a single stray pixel
cannot pull a corner off the card.

```bash
python3 tools/detect.py '{"path":"IMG_1234.jpeg","out":"flat.jpg"}'
```

Add `"quarter": 1..3` to rotate in 90° steps if the card lands sideways.

**It cannot fix a card that runs off the edge of the frame** — shoot with the
whole card visible and some counter around it.

## 2. Colour — `finish.py`

Trims the last of the counter off the edge and removes the indoor warm cast,
using the white print on both cards as a neutral reference.

```bash
python3 tools/finish.py '{"src":"flat.jpg","out":"final.png"}'
```

Then encode to WebP with rounded, transparent corners (see the `card()` helper
used in the change log entry for 2026-08-02).

## 3. Lifestyle — `lifestyle.py`

Keeps the angled photo as-is and crops a fixed-aspect window around the card.

```bash
python3 tools/lifestyle.py '{"path":"IMG_1234.jpeg","out":"life.jpg","aspect":1.3333}'
```
