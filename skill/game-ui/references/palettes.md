# Color: vivid, harmonious, and meaningful

Color is the first thing players see. A game palette must be **bright, saturated, and cohesive like a box of candy**, never dull or disconnected.

## Choosing colors (ask the user; do not choose for them)

In Step 0, present three directions:

1. **An available palette** (below): show the user its name and description so they can choose one. If a browser is available, render previews of each palette (see “Preview” at the end of this file) so they can choose visually.
2. **Brand colors:** request color codes (or a logo/reference image). Use `scripts/palette.py derive` to generate `-d` / `-l` pairs and check them.
3. **A game theme:** the user describes it, you propose **two** directions, and they choose. Do not decide alone.

## Color rules

| Rule | Why |
| --- | --- |
| **60 / 30 / 10**: 60% stage (sky, platform, background), 30% panels and objects, 10% vivid accents (CTA, main character, important items) | The eye knows where to look first |
| **The stage is lighter and calmer than objects.** Use high-lightness sky and background with moderate saturation; use more saturated, darker characters and buttons | Objects stand out without needing blur shadows |
| **All button colors share “saturation and lightness”**: saturation 0.45–0.95, lightness 0.50–0.72 (measured by `palette.py`) | The palette reads as one family, with no stray color |
| **At most 4–5 color families per screen** | More becomes confusing |
| **Every color has a `-d` pair** (button bottom lip, platform side) with 0.10–0.12 lower lightness and less glare | Creates thick forms without blur shadows |
| **Warm accents (yellow, orange, pink) contrast with cool backgrounds (sky blue, green)**, or vice versa | Temperature contrast attracts more than pure lightness contrast |
| **Characters differ in lightness**, not only hue | Color-blind players can still distinguish them; add accessories or names |
| **Semantic colors are not overridden by the theme**: green = move forward, red = destructive, blue = safe (`SKILL.md` section 3) | Players read meaning faster than text |
| **Avoid:** dull gray, dirty brown, template-style purple gradients, full-screen dark backgrounds, harsh neon colors | This style is daytime and bright |

White text on colored backgrounds **always has an ink stroke**. Regular text must have contrast ≥ 4.5:1.

## Tools

```bash
# Generate -d / -l from color codes, report contrast and vividness (stderr), print CSS (stdout)
python3 scripts/palette.py derive yellow=#ff9f1c green=#2ec4b6 --format css

# Check every button-color pair in a CSS file (add new brand colors with --extra)
python3 scripts/palette.py check path/to/theme-or-kit.css --extra gold
```

Web can apply colors at runtime: `GameUI.theme({ yellow: "#ff9f1c" })` (or `GameUI.init({ colors: {...} })`). The algorithm is identical to `palette.py`. For native platforms, run `palette.py derive --format json` and paste the result into the project’s `tokens.json`.

Stage colors (`--sky-*`, `--ground-*`) have no generated pairs; set them manually using the palettes below.

---

## Available palettes

Each palette is a `:root` override block (web). For native platforms, change the corresponding values in `tokens.json` under `color.scene`. Keep button colors (green, red, blue…) unchanged so their meanings stay stable; change only the stage.

### Sweet candy (default)
Green grass and a light-blue sky. Fun, safe, and suitable for any game. No override needed.

### Sunny sea
Golden sand and a turquoise sky. Summer, travel, and playful games.

```css
:root{--sky-top:#bfe7fb;--sky-mid:#e4f5fb;--sky-bot:#fdf3d6;--cloud:rgba(255,255,255,.95);
  --ground-top:#f6dc9b;--ground-top-2:#efce80;--ground-edge:#d2a64e;--ground-side:#c98f5b;--ground-side-d:#a5703f}
```

### Snow ice
A light-blue ice island. Cool and clear, suited to puzzle and trivia games.

```css
:root{--sky-top:#cfe9fb;--sky-mid:#eaf6fd;--sky-bot:#f4fbff;--cloud:rgba(255,255,255,.96);
  --ground-top:#f2fbff;--ground-top-2:#d9effb;--ground-edge:#a9d6ef;--ground-side:#8fc3e6;--ground-side-d:#6aa6cf}
```

### Rainforest
Deeper greens and warm brown earth. Adventure and light survival.

```css
:root{--sky-top:#c9ecd9;--sky-mid:#e5f5e8;--sky-bot:#e9f3d0;--cloud:rgba(255,255,255,.9);
  --ground-top:#6fc062;--ground-top-2:#5cb04f;--ground-edge:#3a8a3c;--ground-side:#8d6a47;--ground-side-d:#6e502f}
```

### Candy sunset
Peach-orange sky and an orange-gold platform. Warm and lively, suited to party games.

```css
:root{--sky-top:#ffd2b8;--sky-mid:#ffe9d6;--sky-bot:#fff3e0;--cloud:rgba(255,255,255,.9);
  --ground-top:#ffbf69;--ground-top-2:#ffae4f;--ground-edge:#e08a2e;--ground-side:#c06b4a;--ground-side-d:#9c4f33}
```

### Cotton candy
Powder pink and mint. Cute, suited to gentle games and children’s games.

```css
:root{--sky-top:#ffd9ea;--sky-mid:#fff0f6;--sky-bot:#e3f7ee;--cloud:rgba(255,255,255,.95);
  --ground-top:#9fe5c4;--ground-top-2:#86d6b0;--ground-edge:#4fae88;--ground-side:#e9a3b8;--ground-side-d:#c97b93}
```

---

## Preview palettes (so the user can choose visually)

```bash
python3 scripts/preview_palettes.py assets/template.html --out palettes.png
```

This produces a composite image of all palettes on the same screen. Send the image to the user and ask which palette they choose.
