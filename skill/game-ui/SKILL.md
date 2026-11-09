---
name: game-ui
description: Build game UI in an ink-outline, thick-block-button style with bright colors for any platform and technology the user chooses (web, React/Vue/Svelte/Angular, mobile, desktop, engine). Ask the user before building. Includes a kit, code standards, palettes, and visual checks.
---

# Game UI: ink outlines, thick blocks

Game UI rules and kit for **every platform**: web, PWA, mobile apps (React Native, Flutter, SwiftUI, Compose), desktop software (Electron, Tauri), and engines (Unity, Godot). The skill fixes the **visual identity** and **quality standards** (clean code, engaging color, smooth experience, finished visuals). Everything else (what the game is, technology, size, colors, sound) is **decided by the user**, and the skill **adapts to their chosen technology** instead of forcing a technology change.

## Step 0: Ask first; do not guess (required)

**Do not write any UI before receiving answers.** Do not invent the game name or rules, or choose the platform, size, colors, or sound yourself. The template only demonstrates how to combine the kit; it is **not a default game**. Do not copy its content.

Skip anything the user has already answered clearly in their request or documentation. Ask only the missing questions, concisely in one round.

**Round 1: ask in words (open questions; do not choose for the user)**

- **What is the game?** Name, rules, number of players, and required screens. If the user has not described it, ask exactly this. Do not provide a genre list for them to choose from.
- **What technology will it use?** Language, framework, and build tool (for example React + TypeScript, Vue, Flutter, SwiftUI, Unity…). If a project already exists, read `package.json` / `pubspec.yaml` / `*.csproj` / `build.gradle`, then **confirm it in one sentence** instead of guessing. Any technology is workable; do not suggest changing it.

**Round 2: choices** (use `AskUserQuestion` when available, at most 4 questions per round; otherwise ask in words)

| Question | Choices |
| --- | --- |
| Which platform will it run on? | Web / PWA · Mobile app (specify RN, Flutter, or native) · Desktop software (Electron, Tauri…) · Engine (Unity, Godot) |
| Which size should design prioritize? | Portrait mobile · Landscape mobile · Desktop · Both mobile and desktop |
| What should the colors be? | Choose from the available palettes (6 sets, send a preview image, see `references/palettes.md`) · Brand colors (request color codes) · Game theme (request a description, propose two directions) |
| Will it use sound? | Sound + haptics · Sound only · Haptics only · Neither |

**Ask more when the answers above are not enough to build:**

- Is there a stage scene (sky + platform for characters)? What is the platform made of: grass, ice, sand, wood, a card table…?
- Are there characters? What do they represent (players, roles, AI opponents)?
- UI language: Vietnamese, English, or multiple languages?
- Are any screens or features required (leaderboard, online play, tutorial…)?

**When nobody is available to ask** (scheduled run, user absent): do not build. Record the missing questions and stop.

**Record the answers** as a “Design brief” at the top of the game’s main file (comment) or in the README:

```
/* DESIGN BRIEF: based on the user's answers
  Game: <user description>
  Technology: <…>       Platform: <…>        Preferred size: <…>
  Colors: <default | color codes | theme>  Sound: <…>
  Scene/platform: <…>   Characters: <…>     Language: <…> */
```

All later changes must follow this brief. If the user changes their mind, update the brief first, then change the code.

## Step 1: Choose the build approach by technology

| User-selected technology | Use |
| --- | --- |
| Plain HTML/JS, PWA, Electron, Tauri, Capacitor, WebView | `assets/kit.css` + `assets/kit.js` unchanged |
| React, Preact, Solid, Vue, Svelte, Angular, Next/Nuxt/SvelteKit | `kit.css` + `kit.js` through a thin wrapper; **the framework renders UI, `GameUI` handles services** (sound, toasts, confirmations…). Details and SSR: `references/frameworks.md` |
| Canvas/WebGL game (Phaser, PixiJS, Three.js…) | Canvas for the game world, **DOM overlay for UI** using the kit. `references/frameworks.md` |
| React Native, Flutter, SwiftUI, Compose, Unity, Godot | `references/tokens.json` + formulas in `references/platforms.md` |
| Other technologies (Qt, WPF, JavaFX, pygame…) | Build the four core formulas from `tokens.json` using that technology’s theme mechanism and one widget library. Final section of `references/frameworks.md` |

For a web view: read `assets/template.html` to see how to combine the pieces, then copy the kit into the project (inline it if the game is one HTML file). **Do not rewrite components already in the kit.** Follow section 10 (code standards) for all added code.

Pass the answers into `init`; do not let defaults choose for the user:

```js
GameUI.init({
  id: "ten-game",          // storage prefix
  layout: "mobile",        // mobile | landscape | desktop | auto  ← “preferred size” answer
  sound: true,             // ← “sound” answer
  haptics: true,           // ← “sound” answer (haptics)
  sky: true,               // ← “stage scene” answer
});
```

Size mapping: portrait mobile → `"mobile"`, landscape mobile → `"landscape"`, desktop → `"desktop"`, both → `"auto"` (portrait below 900px, wide from 900px).

## Step 2: Apply colors from the answers

- **Keep the default:** do not change tokens.
- **Available palette:** paste the matching `:root` block from `references/palettes.md`.
- **Brand colors:** `python3 scripts/palette.py derive yellow=#code` generates `-d`, `-l`, and contrast reports; apply at runtime on the web with `GameUI.theme({ yellow: "#code" })`. If the user wants a brand color as the primary CTA, ask again because the default primary CTA is green (“move forward”).
- **Theme-based:** change the `--sky-*`, `--ground-*`, and character-color groups. **Keep the meaning** of button colors (table in section 3). Tell the user if their theme conflicts with the rules (for example, a full-screen dark background).
- Change every `--x` / `--x-d` pair together. Do not add colors outside the tokens; when a new color is needed, add its `-d` variant too.
- Then run `python3 scripts/palette.py check <css file>` and inspect the rendered image (section 11).

---

## 1. Fixed identity (consistent across games)

- **Ink outline:** every object has a 2px `ink` outline (`#2f3650`). No pure black or pale gray outlines. Primary text and icons also use ink.
- **Thick blocks, no blur:** an interactive object has a 4px `-d` bottom lip, a hard ink shadow offset by 3, and a white highlight at the top. Blur shadows are only for High Graphics mode.
- **Press sinks:** on press, move down exactly 3 (the hard-shadow height) and reduce the bottom lip.
- **Large radii:** buttons 16–22, panels 20, cards 24–26, chips/pills fully rounded. No square corners.
- **Two fonts:** Grandstander 800/900 for headings, buttons, and labels; Baloo 2 600–800 for content. Both support Vietnamese diacritics, use the OFL license, and can be bundled with the app.
- **Ink-outlined headings**, with exactly **one** yellow-highlighted keyword phrase (web: `.ol` + `.y`).
- **Characters** (when present): single-color round bodies, large eyes, pink cheeks, highlights, and thick ink outlines. Accessories show roles; expressions show state.
- **Stage** (when selected): a soft sky with drifting clouds; characters and primary objects stand on a layered platform (face, side, ink outline), not floating over a panel.

## 2. Per-game choices

Change tokens only (web: override in `:root`; native: edit the project’s `tokens.json`). Do not modify components.

- **Stage:** `sky*`, `cloud`, `ground*`. The platform must retain its face, side, and ink outline. Screens that do not need a platform use `.stage.flat`.
- **Characters:** add accessories to `GameUI.HATS` and choose body colors. Keep the round shape and face style.
- **Accent colors**, names, content, custom sound (`GameUI.SFX`), and unique mechanics.

## 3. Semantic colors

| Web class | Meaning | Examples |
| --- | --- | --- |
| `.btn.green` | Move forward, screen primary CTA | Play now, Start, Done |
| `.btn` (yellow) | Positive secondary action, selected state | Add, Replay, Continue |
| `.btn.red` | Destructive, irreversible | Exit, Remove |
| `.btn.blue` | Safe choice in a dialog | Stay, Cancel |
| `.btn.azure` | Information, secondary navigation | Tutorial |
| `.rbtn` (teal) | System button | Settings, Home |

Timers and energy meters: green > 50%, yellow > 20%, red and pulsing ≤ 20%. Never communicate state through color alone: always include text, an icon, or a check mark.

## 4. Layout (based on the user’s selected size)

Common to every size:

- **Three-position topbar:** left = exit/home, center = context chip, right = settings. Keep it on every screen.
- **One primary CTA per screen.** **One task per screen.** The user’s game defines the flow; use Setup → Play → Reveal → Result → Replay as a reference.
- **Show Replay immediately on the result screen**, preserving players and settings.
- No horizontal scrolling. Respect the safe area.

| Size | Layout |
| --- | --- |
| Portrait mobile | One column, max 560px. CTA `.btn.big.full` near the bottom within thumb reach (`.dock`). Play screens do not scroll and fit `dvh` |
| Landscape mobile | Short height: `.split` divides two columns, compresses the heading and stage, and puts the CTA in the right column |
| Desktop | 1120px-wide column, `.split` = main content + 360px side column, compact CTA in the lower-right corner. **Keyboard shortcuts are required** (Enter = CTA, Esc = close/go back, Space = primary action), with hover and `<kbd>` key hints |
| Both | Build portrait mobile first, then let `layout: "auto"` expand to desktop from 900px. Check both |

## 5. Motion and feedback

- **Every action has visual feedback.** Add sound and haptics **exactly as the user answered**.
- **Springy, not linear:** use `spring` for entry and `glide` for screen transitions.
- **Major moments have pacing:** suspense → flip → result (`GameUI.reveal`). Do not show the result immediately.
- **Win:** the character jumps, confetti uses the winning side’s colors, and winning music plays when sound is enabled (`GameUI.celebrate`).
- **When sound is enabled:** synthesize with Web Audio without files (native: see `platforms.md`); play only after the first interaction; provide a Sound toggle in Settings.
- **When sound is disabled:** `sound: false`. The kit creates no AudioContext and hides the toggle. Compensate with clearer visual feedback.
- **Settings always includes** a High Graphics toggle persisted between launches. Normal mode must still be attractive and complete.

## 6. Voice and copy

- Use the user’s selected language. Vietnamese should be friendly, short, and energetic ("Tên này đã có rồi!", "Nhập tên trước đã nhé!").
- Button labels are 2–3-word verbs and are automatically capitalized.
- Report errors with a toast and explain how to fix them. Do not use `alert()` or system dialogs.
- Use `GameUI.confirm()` for irreversible actions; the red button names the action (`ok: "Loại!"`, not "OK").

## 7. Accessibility and resilience (the kit handles this; do not break it)

- Regular text contrast ≥ 4.5:1. White text on colored backgrounds **must have an ink outline** (white on green is only 2.4:1 without it).
- Secondary text uses `mut` (`#565e7c`), never lighter.
- Hit areas ≥ 40. `.rbtn.sm` / `.rbtn.xs` are only for secondary list actions, with ≥ 8 spacing from neighboring buttons.
- Icon-only buttons need an accessibility label (`aria-label` / `accessibilityLabel` / `contentDescription`). Toggles and choices report on/off state (`aria-pressed`). Preserve focus outlines.
- Web: do not use `user-scalable=no`; prevent double-tap zoom with `touch-action`.
- Every animation respects the system reduced-motion setting.
- Escape all user data before putting it into HTML (`GameUI.esc`). Route storage and haptics through `GameUI.store` / `GameUI.buzz` (already wrapped in `try/catch`).
- Keep player secrets on screen only while being viewed: `const hide = GameUI.peek(el, html)`, then call `hide()` immediately after viewing.

## 8. UI performance

- **Local updates.** Add one element with exactly one `insertAdjacentHTML` line; remove it with that line’s `remove()`; select/deselect with `setPressed` / `setText`. Rebuild a list only when its source data actually changes.
- **Keep the pressed button in place.** Split each screen into `build…()` (build once) and `update…()` (update properties). Native: split state so only the changed row re-renders (stable key, `memo`).
- **Write only when values change** (`setText`, `setAttr`, `setPressed`, and `meter` already compare first).
- **Do not store an index in an attribute** when a list can reorder. Compute from the row position at click time, or use a stable id.

## 9. Do not

- No UI library; no emoji as system icons (emoji is content only); no bitmap images for UI; no template-style purple gradients; no glassmorphism; no blur shadows as the primary depth.
- Do not add colors outside the tokens.
- No full-screen dark background. This style is bright and daytime-oriented. If the user wants a dark UI, state that it conflicts with the style and ask again.
- Do not invent features, screens, content, or rules the user did not request.

## 10. Code standards (every language and technology)

Details and examples: `references/code-standards.md`. Core rules:

1. **Use what exists; do not rewrite it.** Before writing any function, component, or style, search: kit → existing project code → standard technology library → only then write new code. Use `python3 scripts/find_existing.py <keyword> --project .`. Extend similar functions instead of copying them. Put shared code in a common directory.
2. **Keep code clean and readable.** One job per function (≤ ~30 lines), verb + object names, at most 3 parameters, early returns, pure functions when possible. Avoid cryptic abbreviations.
3. **Use clear layers:** `data` (content) · `game` (pure rules, no UI) · `services` (sound, storage) · `ui` (build/update). Upper layers call lower layers, never the reverse. Name directories according to the selected technology (structure table in the reference file).
4. **No magic numbers, repeated strings, or hard-coded colors:** use named constants, tokens, and content files.
5. **One source of truth** for each datum; state changes through one gateway; screen flow is a state machine.
6. **Handle edge cases at the edge** (empty, duplicate, too many); do not swallow errors silently; always escape user data.
7. **Follow project conventions** (lint, format, naming) when present; run the formatter. No dead code, debugging `console.log`, or unnecessary libraries.

## 11. Engaging color

Details: `references/palettes.md`. Core rules:

- **Bright, saturated, cohesive like a box of candy.** All button colors share saturation (0.45–0.95) and lightness (0.50–0.72); no dull colors, harsh neon, or template-style purple gradients.
- **60 / 30 / 10:** 60% stage (light, calm), 30% panels and objects, 10% vivid accents. Keep the stage lighter than objects so objects stand out.
- **At most 4–5 color families per screen.** Warm accents contrast with cool backgrounds (or vice versa).
- **Keep color meanings** (section 3); themes change only the stage and characters.
- **Characters differ in lightness**, with names or accessories so color-blind players can distinguish them.
- Tools: `scripts/palette.py` (generate `-d`/`-l`, check contrast and vividness), `GameUI.theme()`, 6 available palettes, `scripts/preview_palettes.py` (previews for the user to choose from).

## 12. Smooth experience

- **Immediate feedback:** show the result of an action within ≤ 100 ms. Split heavy work or run it in the background; do not block the UI thread.
- **Continuous animations change only `transform` and `opacity`** (GPU-friendly). Do not animate `width`, `height`, `top`, `left`, or `box-shadow` every frame. Set `will-change` only on the moving element and remove it when finished.
- **One loop only** (`requestAnimationFrame` or the engine ticker) for all animations and the game loop. Measure **real time** (`performance.now()`); do not accumulate by tick.
- **Batch DOM reads, then writes** to avoid forcing repeated layout recalculation each frame.
- **No loading layout shifts:** reserve dimensions for images, SVG, and fonts (`font-display: swap`, preload the two main fonts). If loading exceeds 300 ms, show a waiting state (text or skeleton), never a blank screen.
- **No double taps or stuck states:** disable buttons while processing; use `touch-action: manipulation`; trap and restore focus in dialogs.
- **Screen transitions** `glide` ≤ 350 ms; entries use `spring`. Pace major moments (section 5).
- **Normal mode must be equally smooth**: High Graphics adds shadows and depth, not heavy work.
- **Native:** split state so only the changed row re-renders (stable key, `memo`/`const`/`remember`); do not do heavy work in build functions.
- **Check:** test on low-end hardware (or throttle CPU 4x in DevTools); avoid dropped frames during play and reveals.

## 13. Visuals must be polished and complete

Details: `references/assets-quality.md`. Applies to every generated visual (characters, accessories, icons, platforms, badges, app icons, cover images, illustrations):

- **Vector (SVG) first**, with one line family: consistent thick ink outlines, rounded shapes, three layers (color area, highlight, dark area), token colors, ground shadows, and complete faces.
- **Complete:** no placeholders, no clipping at the frame edge (leave ≥ 3%), no accidental overlap, every variant (hat × expression, states) renders, recognizable at 24px.
- **Required process: build → render → LOOK → revise.** Run `python3 scripts/render_check.py <svg…> --out check.png`, then **open and inspect the image visually** before delivery. If you cannot inspect it, say so clearly and do not claim it is finished.
- Export at the correct platform sizes (iOS icon 1024 with no alpha, Android adaptive 66% safe area…).

---

## Skill contents

| File | Purpose |
| --- | --- |
| `assets/kit.css` | Tokens, components, stage, portrait/landscape/desktop layouts, High Graphics, reduced motion |
| `assets/kit.js` | `window.GameUI`: settings, sound, toasts, modals, reveals, confetti, characters, icons, DOM utilities |
| `assets/template.html` | Example combining the kit through a complete flow. Not a default game |
| `references/tokens.json` | Platform-neutral tokens, source of truth for native versions |
| `references/platforms.md` | Build formulas for RN, Flutter, SwiftUI, Compose, Unity/Godot, desktop |
| `references/frameworks.md` | Integrate the kit with React/Vue/Svelte/Angular, SSR, canvas, and technologies not in the table |
| `references/code-standards.md` | Standards for clean, reusable code, layers, and technology-specific directory structure |
| `references/palettes.md` | Color rules, 6 available palettes, and color-tool usage |
| `references/assets-quality.md` | Visual quality standards, render-review-revise workflow, and export sizes |
| `scripts/find_existing.py` | Find existing functions/classes (kit and project) before writing new ones |
| `scripts/palette.py` | Generate `-d`/`-l` pairs and check color contrast and vividness |
| `scripts/preview_palettes.py` | Render previews of every palette for the user to choose from |
| `scripts/render_check.py` | Render SVG, catch clipping/empty/off-center errors, and combine checks at multiple sizes |

## Web component reference (`kit.css`)

| Class | Description |
| --- | --- |
| `.wrap` | Content column, sized by layout |
| `.screen`, `.screen.on`, `.screen.play` | Screen; `.play` = no scrolling |
| `.split > .main + .side` (`.rev`) | Stacked on mobile; columns on desktop/landscape |
| `.topbar` | Three-position grid |
| `.btn` + `.green/.red/.blue/.azure/.teal` + `.big/.full/.sm` | Text button; inner `<kbd>` shows key hints with a mouse |
| `.rbtn` + `.red/.yellow/.blue` + `.sm/.xs` | Icon button |
| `.chip`, `.pill(.green/.red/.blue)` | HUD and small labels |
| `.panel`, `.card` | Content frame and card |
| `.choice[aria-pressed]`, `.grid2` | Checkable choice tile |
| `.field`, `.seg`, `.setting` + `.tog[aria-pressed]` | Input, segmented control, toggle |
| `.list > li > .name + .acts` | Action list |
| `.meter > i` | Time/energy meter |
| `.stage > .actors + .plinth(.wide)`, `.stage.flat` | Stage and platform |
| `.dock` | CTA group (mobile: pinned bottom; desktop: right corner) |
| `.flip > .in > .front + .back`, `.open` | Flip card |
| `.ol`, `.y`, `.h1/.h2/.h3`, `.label`, `.mut`, `.disp` | Typography |
| `.row`, `.col`, `.center`, `.grow`, `.sr` | Layout utilities |

Classes attached to `<html>` by `init`: `.desk` (desktop or landscape), `.land` (landscape phone), `.hq` (High Graphics).

## API reference (`GameUI`)

| Function | Description |
| --- | --- |
| `init({id, layout, sound, haptics, sky, colors})` | Values come from the design brief. Adds “tap” sound to every button (`data-sfx="none"` disables it, `data-sfx="add"` changes it). **Safe to call again** (StrictMode, hot reload) |
| `theme({ yellow: "#mã", … })` | Set `--x`, `--x-d`, `--x-l` at runtime from a color code (same algorithm as `palette.py`). `shades(hex)` returns `{base, dark, light}` |
| `features` | Options passed to `init` (read-only) |
| `data-key="Enter\|Escape\|Space\|1…"` | Add to a screen button: that key activates it (when no modal is open and no input is focused). `.btn` gets `<kbd>` hints automatically; for dynamic labels, wrap them in `<span>` and call `setText` on the span |
| `show(id)` | Switch screen and focus its heading |
| `esc(s)` | Escape HTML |
| `store.get(k, def)` / `store.set(k, v)` | Safe storage |
| `sfx(name)` | `tap pop add remove good bad tick drum flip win lose`; add custom sounds to `SFX` through `tone(f, dur, {type, gain, to, at})`. Silences itself when `sound: false` |
| `buzz(pattern)` | Safe haptics, respecting `haptics` and the Sound toggle |
| `openSettings({extra})` | Settings modal (Sound when available, High Graphics). Listen for `gameui:settings` on `document` when a response is needed |
| `toast(msg, {type:"err"\|"ok"})` | Short notification |
| `confirm({title, text, ok, cancel})` → `Promise<bool>` | Confirm a destructive action; `ok` is required |
| `sheet({title, body, actions, onMount})` | Custom modal with focus trap and Esc to close |
| `peek(el, html)` → `hide()` | Show a secret and return a clearing function |
| `reveal(flipEl, {fill, suspense})` | Suspense → flip → result; `fill(backEl)` fills the back |
| `celebrate({colors, avatars})`, `confetti(colors)` | Celebration |
| `burst(text, x, y)` | Pop-up text (combo, +score) |
| `avatar({color, hat, mood, name, size, cls, style, label})` | Character SVG string. `mood`: `happy grin calm sad shock angry sly sleep`. `hat`: `none crown cap party detective wizard bow leaf mask` |
| `icon(name, {white})` | Two-layer icon: `back home gear close plus minus trash eye replay check info play sound mute star` |
| `meter(el, ratio)` | 0–1 meter that changes color by threshold |
| `setText`, `setAttr`, `setPressed` | Write to the DOM only when changed |
| `PALETTE` | 8 character body colors |

## Pre-delivery checklist

1. A design brief exists; every code choice matches it, with no guesses.
2. Every block has a 2px ink outline; buttons have thickness, highlights, and press sinking.
3. Every screen has a three-position topbar, exactly one primary CTA, and exactly one yellow-highlighted heading phrase.
4. Button colors have the correct meaning; destructive actions have confirmation with a correctly named red button.
5. Sound and haptics match the user’s choices; the Sound toggle appears only when sound is enabled.
6. Test preferred sizes (mobile: 360px and 560px; desktop: 1280px and 960px; “both”: all), toggle High Graphics, and enable reduced motion. On desktop, complete the flow with the keyboard alone.
7. No colors outside tokens, no emoji as system icons, and no `alert()`.
8. User data is escaped; secrets are removed from the screen after viewing.
9. **Technology:** code matches the user’s selected technology, uses the right directories, and follows project lint/format rules.
10. **No rewrites:** run `find_existing.py` for every new function; no duplicate of the kit or existing code.
11. **Clean code:** short single-purpose functions, clear names, separated `data / game / services / ui`, no magic numbers, hard-coded colors, or dead code.
12. **Color:** `palette.py check` has no errors; inspect the render, with vivid harmonious colors, a calm stage, and prominent objects.
13. **Smoothness:** animations use only `transform`/`opacity`, loading does not shift layout, no double taps, and low-end testing is complete.
14. **Visuals:** `render_check.py` ran without errors **and the image was opened and inspected visually**; visuals fit the frame, include all variants, and share one line family.
