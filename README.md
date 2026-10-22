# Cosmic Birthplace — experimental browser prototype

This is the experimental public test version of Cosmic Birthplace. It contains the ten original science experiments.

## 3D milestone (v0.4)
Experiment 01 now offers **2D / 3D** diagram buttons.
- 2D remains the default and is not replaced.
- 3D is loaded only after selecting it and uses the same approximate JPL-derived Earth positions as 2D.
- One-finger drag or left mouse drag rotates. Pinch or mouse-wheel zooms. Two-finger move or right mouse button pans. Reset view restores the camera.
- The existing lifetime slider updates the selected Earth position. Labels distinguish birth and selected dates.
- Sun/Earth sizes, the star backdrop and some visual effects are illustrative. The positions have a Sun-centred reference frame; the scene does not model the Galaxy's translation.
- A missing WebGL context or failed script load returns to the 2D diagram.

## How to run
On a local machine, serve this folder using a small web server and open it in a browser, for example:

```shell
python -m http.server 8000
```

Open http://localhost:8000/ . The 3D module uses browser ES modules and therefore needs HTTP(S). GitHub Pages serves this directly.

## Privacy
Calculations run in the browser. Optional place lookup sends the entered place-name query to Open-Meteo. No account or analytics is included.

## Libraries
The 3D mode includes Three.js 0.186.1 and OrbitControls, licensed MIT; see `vendor/THREE_LICENSE.txt`. All library files are served locally rather than from an external CDN.

## Accuracy
This is an educational experience, not a full ephemeris or astrometric simulator. Read "Methods, accuracy and sources" in the app.
