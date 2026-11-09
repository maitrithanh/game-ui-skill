# Generated visuals: polished and complete

Applies to **every visual** created by the skill: characters, accessories, icons, platforms and scenes, badges, ribbons, app icons, cover images, banners, and documentation illustrations. “Complete” means ready for the user to use without additional fixes.

## Construction principles

- **Vector first.** Draw with SVG (or HTML/CSS using tokens), then export PNG when needed. Do not use bitmap images for UI. Bitmap “drawings” can have inconsistent linework, so do not use them.
- **One consistent line family.** Use a uniform thick ink outline by scale (viewBox 80: 2.2–3.2), rounded corners (`stroke-linecap/linejoin: round`), and rounded shapes; use sharp corners only for small details.
- **Three layers for each shape:** a flat color area, a highlight (top-left), and a dark area (bottom). Keep the light direction consistent across the set.
- **Use token colors only**, with a `-d` variant for each color. Soft gradients and blurred shadows are allowed only in High Graphics mode.
- **Add a ground shadow** (soft ellipse) for objects standing on a platform.
- **Complete faces:** eyes, cheeks, mouth, and highlights. Expressions show state; accessories show role. Never leave a face blank.
- **Leave frame padding:** keep at least 3% on every `viewBox` edge so strokes and shadows do not touch the boundary. Center the image horizontally.
- **Readable at small sizes:** remove or enlarge details below about 1.5 units (viewBox 80). The image must be recognizable at 24px.
- **Keep the set coherent, not identical.** A new hat, icon, or character must belong to the same art direction as the chosen theme. Share a deliberate line family, lighting logic, and token system, but allow silhouette, material, proportions, and texture to change when the character’s role or world calls for it.
- **Theme before template.** Do not reuse the default round avatar, grass platform, or candy palette when they conflict with the brief. Translate the theme into a visual concept first, then build the asset set around that concept.
- **Render every variant.** Every hat must work with every expression; every icon must have both ink and white versions. No combination may break.

## What complete means

- No placeholders, “TODO” markers, gray boxes, or fake text (lorem).
- Nothing is clipped by the frame or extends outside the `viewBox`.
- No accidental overlap (such as a hat covering the eyes or strokes crossing the face).
- No missing states: normal, selected, disabled, error, win, and loss when the visual supports those states.
- Include every required platform size (see the table below).
- Use clear filenames and group files by directory (`assets/characters`, `assets/icons`, `assets/scenes`).

## Required process: build, render, LOOK, revise

1. **Build** the visual according to the principles above.
2. **Render and measure:**
   ```bash
   python3 scripts/render_check.py assets/icons assets/characters --out check.png
   python3 scripts/render_check.py --kit-avatars --full --out avatars.png   # when modifying kit characters
   ```
   The script reports ERRORS (clipping, empty output) and warnings (near edge, off-center, too small), then combines previews at 96/48/24px on a checkerboard background.
3. **Open and inspect the image visually** (read the image file). The script catches measurable errors; only visual inspection can answer “does it look good, does it fit the style, does the face feel right?” Check whether the visuals share a line family, text remains readable, and any area feels rough or incomplete.
4. **Revise and repeat** until both checks are clean: no script ERRORS and a satisfactory visual review.
5. Deliver only after inspection. **Without an image viewer, do not claim the visual is finished**; state clearly that visual inspection was not performed.

## Export sizes

| Use | Requirement |
| --- | --- |
| Web, in-app | Original SVG. PNG when needed: @1x, @2x, @3x |
| Favicon | SVG + PNG 32, 180 (Apple touch) |
| iOS app icon | PNG 1024×1024, **solid background, no alpha, no rounded corners** (the system rounds it) |
| Android icon | Adaptive layer 432×432; character inside the **central 66% safe area**; solid background on a separate layer |
| Store, cover, and social images | Use each platform’s dimensions; build with HTML + tokens, then capture in a browser |

App icon: **one large character, a bold solid-color background, no small text**, recognizable at 48px.

## Previews and documentation illustrations

Build with the kit and template themselves (real HTML), then capture screenshots in a browser at the target size (`deviceScaleFactor: 2` for user-facing images). Capture a state with **reasonable sample data**, not an empty screen. Review the capture using step 3 above.
