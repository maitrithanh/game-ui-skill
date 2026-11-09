# Integrating the kit with frameworks

`assets/kit.css` is plain CSS and works anywhere. `assets/kit.js` is a framework-independent DOM script that attaches `window.GameUI`. The job is to **divide responsibilities** so the framework and kit do not interfere with each other.

## Responsibilities (applies to every framework)

| Task | Owner |
| --- | --- |
| Render screens, lists, buttons, and states | **Framework** (binding, components). Use kit classes: `btn`, `panel`, `list`… |
| Switch screens | **Framework** (state/router). The visible screen gets `screen on`. **Do not** call `GameUI.show()` |
| Update text, `aria-pressed`, and `meter` bars | **Framework** (binding). Do not use `GameUI.setText/setPressed` on framework-managed nodes |
| Sound, haptics, storage, toasts, modals, confirmations, confetti, and secrets | **`GameUI`**: these functions create their own DOM under `<body>` and do not touch the framework tree |
| Characters and icons | **`GameUI.avatar()` / `icon()`** return SVG strings; insert them using the framework’s raw-HTML mechanism |
| Colors, layout, and keyboard shortcuts | **`GameUI.init({ colors, layout })`** once; attach `data-key` to buttons |

Always call `GameUI.init(...)` **once on the client** after mount. `init` is safe to call again (StrictMode and hot reload do not attach duplicate listeners).

**Use a thin wrapper; do not rewrite the kit.** Create one `gameui` module around `window.GameUI` (lazy-loaded and SSR-safe), then import it throughout the app. Project components (`<ThickButton>`, `<Panel>`…) should only wrap kit classes and have no custom CSS.

---

## SSR (Next.js, Nuxt, SvelteKit, Astro, Remix)

`kit.js` touches `window` as soon as it loads, so **load it only on the client**. Load `kit.css` normally (including on the server).

```ts
// gameui.ts: single entry point
let ready: Promise<GameUIApi> | null = null;
export function gameUI() {
  return (ready ??= import("./vendor/kit.js").then(() => window.GameUI));
}
```

Call `await gameUI()` in `useEffect` / `onMounted` / `onMount` / `afterNextRender`. Never call it at module scope or in code that runs on the server.

---

## React / Preact / Solid

```tsx
// gameui.ts
import "./vendor/kit.css";
import "./vendor/kit.js";                    // attaches window.GameUI (client only; see SSR above)
export const G = () => window.GameUI;
```

```tsx
// App.tsx
useEffect(() => { G().init({ id: "ten-game", layout: "auto", sound: true }); }, []);

// Screen: render from state; do not use GameUI.show
{screen === "setup" && <section className="screen on" aria-labelledby="h-setup">…</section>}

// Character / icon: SVG string with inner data escaped
<span dangerouslySetInnerHTML={{ __html: G().avatar({ color, name, hat: "crown" }) }} />

// Irreversible action: use the kit confirmation
if (await G().confirm({ title: `Loại ${name}?`, ok: "Loại!" })) removePlayer(id);
```

- Lists: `key` is a **stable id**, not an array index (see section 8 of `SKILL.md`).
- Re-render only what changes: split each row into a `memo` component and pass primitive props.
- Attach `data-key="Enter"` to `<button>` as with regular HTML.

## Vue 3 / Nuxt

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import "@/vendor/kit.css";
onMounted(async () => { await import("@/vendor/kit.js"); window.GameUI.init({ id: "ten-game" }); });
</script>
<template>
  <section v-if="screen === 'setup'" class="screen on">…</section>
  <span v-html="avatarHtml" />   <!-- avatarHtml = GameUI.avatar({...}) -->
  <button class="btn big full green" data-key="Enter" @click="start">Bắt đầu</button>
</template>
```

## Svelte / SvelteKit

```svelte
<script>
  import "../vendor/kit.css";
  import { onMount } from "svelte";
  onMount(async () => { await import("../vendor/kit.js"); window.GameUI.init({ id: "ten-game" }); });
</script>
{#if screen === "setup"}<section class="screen on">…</section>{/if}
{@html avatarHtml}
```

## Angular

```ts
// app.component.ts
ngAfterViewInit() { import("./vendor/kit.js").then(() => (window as any).GameUI.init({ id: "ten-game" })); }

// Character: Angular sanitizes style/svg, so trust the kit-generated string (inner data is escaped)
avatar = this.sanitizer.bypassSecurityTrustHtml((window as any).GameUI.avatar({ color, name }));
```
```html
<span [innerHTML]="avatar"></span>
<section *ngIf="screen === 'setup'" class="screen on">…</section>
```
Put `kit.css` in the `styles` section of `angular.json`. Use `trackBy` by id for `*ngFor`.

## Web Components / Lit / htmx / server-rendered

Same as plain HTML: load `kit.css` + `kit.js`, call `GameUI.init`, and use `GameUI.show()` and the `build…/update…` functions described in section 8 of `SKILL.md`.

---

## Canvas / WebGL games (Phaser, PixiJS, Three.js, Kaplay, custom)

Use two layers and **do not** draw UI on the canvas:

1. **Game layer:** the canvas, managed by the engine.
2. **UI layer:** DOM over the canvas (`position:absolute; inset:0; pointer-events:none`), with interactive elements set to `pointer-events:auto`. Use the kit classes: topbar, buttons, panels, modals, toasts, and `meter` bars.

Why: readability at every resolution, accessibility, keyboard input, focus, and i18n are already handled by the kit. Draw **inside the canvas** only what belongs to the game world (characters, items, effects). Draw characters with SVG from `GameUI.avatar()`, then load them as textures (`new Image()` with a data URL) so their linework matches the UI.

- Loop: one `requestAnimationFrame`/engine ticker. Measure time in real time; do not accumulate by frame.
- Sound: use `GameUI.sfx` (one shared AudioContext) instead of creating one per engine.
- Scaling: size the canvas with `dvh/dvw` and `devicePixelRatio` (limit ≤ 2 for smoothness).

---

## Technologies not in the table (Qt, WPF, JavaFX, Tkinter, pygame, Godot…)

Do not change the user’s technology. Follow three steps:

1. **Read `tokens.json`** as the value source: colors, radii, outline width, `lift`, `lip`, fonts, and motion durations.
2. **Build the four core formulas** (thick block, press sinks, white text with ink outline, blur only in High Graphics mode) with that technology’s theme/style mechanism (QSS, XAML Style/ControlTemplate, JavaFX CSS, ttk.Style…), using `platforms.md`.
3. **Write one `theme` layer and one small widget library** (button, panel, chip, toast, confirmation dialog) for the whole app; do not create one-off styles per screen.

Name functions/classes according to that technology’s convention, and follow the `SKILL.md` API table for behavior (confirmation, toasts, paced reveals, settings, and safe storage).
