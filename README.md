# Cosmic Birthplace — experimental browser prototype

## v0.7 — Miles alongside kilometres (user request, 22 October 2026)

- Preserve v0.6 **3D Birth Sky — PASS** (user acceptance, 22 October 2026); this acceptance is for the feature, not a certification of ephemeris accuracy.
- Display **miles as well as kilometres** in the journey metrics, Sun-centred orbital separation, galactic path, light-distance explanation, speeds, cosmic expansion and exported SVG postcard. Light-years and AU remain where useful.
- Uses the international conversion **1 mile = 1.609344 km**; calculations remain in their existing units, with miles displayed as companions only.
- Keep the approved layout, all ten experiments, 2D views and three accepted 3D viewers. The new distance formatting requires browser-level regression and user acceptance separately.



## v0.6 — Interactive 3D Birth Sky (development review)

**Status:** **PASS — user acceptance recorded 22 October 2026.** Automated checks passed earlier; this approval does not claim independent high-precision astronomical accuracy.

### Requirements implemented
- Existing **My Birth Sky** 2D chart remains the default and can be restored at any point.
- Observer-centred 3D sky dome uses the same simplified altitude/azimuth source as the 2D chart.
- Bright-star catalogue, planets, Sun and Moon are rendered at their calculated sky directions when above the horizon.
- Four selected *asterism guide patterns* — Orion, the Plough (Ursa Major), Cassiopeia and Cygnus — connect catalogue stars where both endpoints are above the horizon. These are not official constellation boundaries or a full star atlas.
- Touch/mouse look-around, pinch/scroll zoom, keyboard arrow controls, Reset view, labelled star/object dropdown, and direct object selection by tap/click.
- Optional constellation line display; scene resources are cleaned up when changing experiments.
- Fallback returns to 2D on WebGL/module failure. No additional services, accounts or remote 3D downloads.
- Keeps approved v0.4 orbit and v0.5 birth-light modes intact.

### Scientific and accessibility limits
- The dome displays **directions, not stellar distances**. The chart uses simplified J2000 star coordinates without date-dependent precession, parallax or proper motion.
- Planets use approximate NASA/JPL Keplerian elements; lunar position is simplified. No refraction, daylight extinction, weather or local terrain.
- Users must enter **UTC** birth time; automatic historical local-civil-time conversion has not been implemented. Do not infer an accurate local sky from an unconverted civil birth time.
- Keyboard controls and an object dropdown supplement pointer interaction; screen-reader usability on actual mobile hardware still needs human review.

## v0.5: Birth-light 3D acceptance specification

**Preserve all ten experiments and the existing visual layout.** 2D must remain the default in both the orbit and light experiments.

### Feature requirements
- **Switch:** Experiment 04 (“My birth light”) offers 2D/3D; switching back retains the current lifetime position.
- **3D shell:** Semi-transparent spherical shell is centred on a schematic birth-event marker, with a clear direction/scale caveat.
- **Distances:** Sphere radius in light-years equals elapsed Julian years times the existing lifetime-slider fraction (within formatting tolerance). Sample star distances are reused from the 2D feature.
- **Reached examples:** Example stars inside/outside the sphere differ visibly; counts and the adjacent text update as the slider moves.
- **Interaction:** Touch or mouse rotation; pinch or wheel zoom; camera reset; keyboard-accessible Play/Pause button, slider and mode controls.
- **Playback:** A short, user-initiated animation expands the sphere from birth to the present. Pause, hidden tab and navigation stop playback; no automatic background animation.
- **Fallback:** If WebGL or module loading fails, return to 2D with a brief message.
- **Responsive:** No horizontal overflow at common phone, tablet and desktop widths. Restore 2D cleanly on navigation.
- **Scientific caution:** Directions are schematic, distances are rounded samples, and Earth has moved from the birth event; do not imply the 3D image is a surveyed 3D local star map.

### Scientific boundaries
A simplified shell model in a chosen reference frame. Assumes light propagation through vacuum; does not simulate actual detectable signals, absorption, gravitational lensing, proper motion, or full time-dependent astrometry. Star radial distances come from the existing illustrative data. This is an educational visualisation, not an observation planner.

### v0.4: 3D orbital milestone (preserved)
Experiment 01 offers 2D/3D based on the existing approximate JPL-derived Earth positions. The 3D view supports rotation, zoom and reset, and returns to 2D if WebGL is unavailable.

### Local development
Serve this folder over HTTP, e.g. `python -m http.server 8000`, then open `http://localhost:8000/`. Browser ES modules require HTTP(S).

### Dependencies and privacy
Includes locally hosted Three.js 0.186.1 and OrbitControls (MIT licence: `vendor/THREE_LICENSE.txt`); no external CDN. Scientific calculations run locally in the browser. Optional birthplace search sends only the typed place name to Open-Meteo. No accounts or analytics.

### Acceptance
- **v0.5 Birth-Light 3D — PASS (user visual acceptance, 22 October 2026).** Preserve the accepted 3D experience, optional 2D view, controls and scientific disclaimers in further work.
- Automated browser checks passed for desktop, tablet and phone-sized viewports, including slider, animation, rotation, zoom, reset and 2D fallback.
- Acceptance does not imply full scientific validation of all ten experiments.
- **Next candidate:** v0.6 interactive birth-sky 3D; not yet implemented or approved.
