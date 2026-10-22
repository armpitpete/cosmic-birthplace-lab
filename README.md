# Cosmic Birthplace — experimental browser prototype

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
