# Characters: ask first, then design with care

Applies whenever a game UI could use characters: players, roles, mascots, opponents, NPCs, pets, avatars, or guides.

## 1. Ask before creating (required)

Never draw, generate, or restyle a character on your own initiative. A character is a large creative and branding decision, so get a yes first.

1. **Ask whether to create characters at all.** One short question, with these choices (use `AskUserQuestion` when available):
   - **No characters:** build the UI without them (icons, initials, or name tags instead).
   - **Use the kit's default avatars:** `GameUI.avatar()`, recolored by the active style. Fastest.
   - **Design a custom set:** original characters built for this game, following this file.
   - **User provides assets:** use their files; do not redraw them.
2. **If the answer is "custom set", ask only what is missing:** how many characters, what each represents (role, personality, faction), whether they are fixed or player-customizable, and which expressions the game needs (section 4). Skip anything the brief already answers.
3. **Propose before drawing.** Give a one-line concept per character (silhouette, signature color, accessory, personality) and wait for approval. Draw only approved concepts.
4. **Record the answer** in the Design brief (`Characters: none | kit default | custom set (<n>, roles…) | user assets`). If the user later asks for more characters, ask again for the new ones.
5. **When nobody is available to ask** (scheduled run): do not create characters. Use the kit default if the brief already allows it, otherwise build without characters and note it.

Do not create mascots, logos, or marketing characters unless asked. Do not imitate existing copyrighted characters or a real person.

## 2. Design rules (custom characters)

A character must look designed, not generated. Check each point:

- **Silhouette first.** Fill the shape with one flat color: every character in the set must be recognizable and distinct from the others. Vary the mass (tall, wide, small, top-heavy), the outline (round, angular, tufted), and one signature feature (ears, horn, crest, tail, hair, hat).
- **Proportions that read at small size.** Large head, simple body, big face area. At 24px the eyes, mouth, and signature feature must still be visible; remove details smaller than 1.5 units in an 80-unit viewBox.
- **A complete face.** Eyes with a highlight, a mouth, brows when the expression needs them, and optional cheeks. A blank or single-expression face is unfinished.
- **Personality through shape and posture**, not only color: a brave character has a lifted chin and square shoulders; a shy one has a tilted head and smaller eyes. Keep the personality consistent across all expressions.
- **One line family.** Same outline weight, corner style, and light direction as the active style profile (`references/styles.md`) and as the rest of the set. Use `references/assets-quality.md` for layers (flat color, highlight, dark area) and the ground shadow.
- **Material follows the theme.** Candy gloss, paper cut-outs, neon edge light, felt and stitching, enamel and gold trim, flat technical markings. Do not paint the same plastic ball in six colors.
- **Palette discipline.** Body color, one accent, ink, and a highlight. Use design tokens with `-d` variants; check contrast with `scripts/palette.py`.
- **Accessories show role, not decoration.** A hat, tool, badge, scarf, or pattern tells the player who this is. Each character differs by value, silhouette, accessory, or pattern, never by hue alone.
- **Cultural and audience fit.** Keep faces friendly and appropriate for the audience; avoid stereotypes. Check Vietnamese name tags for diacritic clipping.

## 3. Build method

- **Vector SVG, one viewBox for the whole set** (the kit uses `0 -6 80 104`), body as a separate group from face, accessory, and shadow so expressions swap without redrawing the body.
- **Expressions are parts, not whole redraws.** Define eyes, brows, mouth, and extras (tears, sweat, sparkles) as interchangeable groups. Keep eye and mouth anchor points fixed so animation does not jump.
- **Prefer the kit.** Use `GameUI.avatar({ color, hat, mood, name })` and `GameUI.HATS` / `GameUI.MOODS` when they fit. For a custom set, add shapes to the style's character map (`AVATAR_SHAPES` in `kit.js`) or create `assets/characters/*.svg`, and keep the same `mood` names so game code does not change.
- **Animate with transform and opacity only:** idle bob, blink (scale the eyes on Y), jump on success, shake on error. Respect `prefers-reduced-motion`.
- **Escape user-provided names** and give each character an accessible name (`aria-label`) when it carries meaning; decorative ones are `aria-hidden`.

## 4. Expression set (what "appropriate" means)

Pick expressions from the game's states, not from a template. Every state the UI shows must have a matching face.

| Game moment | Expression | Face cues |
| --- | --- | --- |
| Idle, waiting | `calm` / `happy` | relaxed eyes, small smile; slow blink |
| Success, point scored | `grin` / `cheer` | raised cheeks, arched closed eyes or wide open mouth |
| Win, celebration | `cheer` | happy arcs, open mouth, jump + confetti |
| Playful, secret, bluff | `wink` / `sly` | one eye closed, lopsided smile |
| Thinking, choosing | `think` | eyes looking aside, one brow raised, small mouth |
| Surprise, reveal | `shock` | enlarged eyes, round open mouth |
| Mistake, loss | `sad` | brows tilted up inside, downturned mouth |
| Heavy loss, eliminated | `cry` | sad brows, tears; dim the body (`.avatar.out`) |
| Angry, rival, danger | `angry` | brows angled down inward, flat or snarling mouth |
| Resting, offline, AI idle | `sleep` | closed eyes, tiny mouth |

Rules:

- A character shows **one clear emotion at a time**; combine face with motion (jump, shake, slump), not with extra clutter.
- Negative expressions stay **friendly for the audience**: sad and angry faces must not look cruel in a family game.
- Expressions differ in **at least two features** (eyes, brows, mouth) so they stay readable at 24px.
- Do not rely on color change to convey an emotion; the face carries it.
- If the game needs a mood the kit lacks, add it to `MOODS` with the same data shape (`mouth`, optional `brow`, `look`, `closed`, `joy`, `wink`, `extra`) instead of drawing a one-off.

## 5. Review (required before delivery)

1. Render every character in every needed expression: `python3 scripts/render_check.py assets/characters --out check.png`, or `--kit-avatars --full` for the kit set.
2. **Open the image and look.** Check silhouettes in flat black, readability at 96 / 48 / 24 px, clipping, centering, and that no two characters are confusable.
3. Check each expression against the table in section 4: would a player read the emotion without a label?
4. Render the set inside the real screen in the active style profile and in High Graphics on/off.
5. Report any simplification (fewer expressions, shared body) to the user instead of silently shipping it.
