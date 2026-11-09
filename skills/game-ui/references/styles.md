# Game UI Style Profiles

Choose one profile before styling. A profile is a visual direction, not a reason to ignore the layout contract, accessibility, semantic action colors, safe areas, or performance rules in `SKILL.md`.

## Selection protocol

1. Read the game brief: audience, mechanics, setting, emotional promise, platform, play duration, and content density.
2. Select one profile that supports the mechanics and audience. If the user has not chosen, propose two profiles with a short tradeoff and recommend one.
3. Write the selected profile into the Design brief before creating UI.
4. Apply the profile to five layers: environment, surfaces, typography, characters/assets, and motion/sound.
5. Render the same screen in the required viewport matrix. Reject a profile if its contrast, density, hierarchy, or material treatment harms playability.

Do not mix profiles accidentally. A hybrid is allowed only when it has a named rationale, such as `Storybook Paper + Neon Arcade reveal`, and each profile owns a specific layer.

## Shared constraints

Every profile must:

- Keep primary, destructive, safe, information, and system actions semantically distinguishable.
- Pass regular-text contrast of at least 4.5:1 and preserve visible focus states.
- Keep hit areas at least 40px, respect safe areas, and pass the layout contract.
- Use one dominant environment, one surface language, one display/body type pairing, and at most 4–5 dominant color families per screen unless the game explicitly needs more.
- Give characters distinct value, silhouette, accessory, pattern, or name. Hue alone is not enough.
- Use the selected technology’s asset conventions. Prefer SVG or tokenized CSS for UI; do not use a bitmap as a substitute for a designed system.
- Explain deviations from the profile instead of silently falling back to Ink Candy.

## 1. Ink Candy

**Best for:** casual, party, trivia, family, and children’s games.

- **Environment:** light sky, soft atmosphere, simple scene depth, calm background behind the play area.
- **Surfaces:** thick tactile blocks, rounded corners, hard offset shadows, small white highlights.
- **Palette:** bright warm accent against a cool or fresh background; use the semantic action colors from the kit.
- **Typography:** expressive rounded display face with a highly readable rounded body face.
- **Characters:** friendly rounded silhouettes, readable faces, role accessories, bouncy idle motion.
- **Motion:** spring entry, short glide transitions, small press sink, celebratory bounce.
- **Avoid:** generic rainbow screens, excessive pills, more than one competing CTA, and decorative confetti during ordinary actions.

## 2. Storybook Paper

**Best for:** narrative, word, family, educational, and chapter-based games.

- **Environment:** paper, parchment, illustrated margin, page, map, desk, garden, or scene vignette. Use texture sparingly and never behind small text.
- **Surfaces:** paper cards, stitched or inked borders, subtle offset layers, controlled roughness. Keep text surfaces flat enough to scan.
- **Palette:** 2–3 quiet base colors plus one warm accent and semantic action colors. Avoid muddy brown monotony.
- **Typography:** literary or hand-lettered display paired with a neutral, highly readable body face. Verify all required diacritics.
- **Characters:** silhouette and props should communicate chapter, profession, origin, or role. Expressions are smaller and more narrative than mascot-like.
- **Motion:** page turn, ink reveal, bookmark slide, gentle parallax. Keep transitions below 350ms for routine actions.
- **Avoid:** fake paper noise that reduces contrast, ornamental borders around every control, and type that looks handwritten but cannot be read quickly.

## 3. Neon Arcade

**Best for:** action, rhythm, score-chasing, cyber, sports, and fast repeat-play games.

- **Environment:** dark or deep-toned stage with a clear playfield boundary, glow accents, grids, signals, or abstract city/tech geometry.
- **Surfaces:** crisp panels, bright edge accents, restrained glow only where it communicates state. Use hard depth for controls; glow is not a substitute for focus.
- **Palette:** one dark base, one cool structural hue, one hot accent, and semantic action colors. Keep text contrast measurable; do not use neon text on neon surfaces.
- **Typography:** compact display face for score and status, neutral body face for instructions. Numbers need tabular alignment.
- **Characters:** strong silhouette, visor/helmet/vehicle/weapon or role prop, high-contrast value blocks, readable at 24px.
- **Motion:** beat-synced pulses, score pop, directional streaks, and fast feedback. Respect reduced motion by replacing pulses with static state changes.
- **Avoid:** full-screen animated noise, permanent glow, flashing faster than safe limits, and relying on color or glow alone to signal danger.

## 4. Cozy Workshop

**Best for:** building, cooking, farming, crafting, collecting, and slow progression games.

- **Environment:** workshop, kitchen, greenhouse, market stall, desk, shelf, or homestead. Establish a believable surface and a consistent light source.
- **Surfaces:** wood, ceramic, fabric, cardboard, enamel, or chalkboard represented with simple tokenized layers. Keep controls visually distinct from decoration.
- **Palette:** warm neutral base with one plant/food/material accent and cool semantic controls for contrast. Avoid turning every surface orange or brown.
- **Typography:** friendly display face for labels paired with a calm body face; item names and quantities must scan at a glance.
- **Characters:** tools, aprons, hats, recipes, plants, pets, or crafted props communicate roles better than recoloring bodies.
- **Motion:** lift, place, pour, simmer, grow, and collect motions. Use `transform` and `opacity`; never animate layout dimensions to simulate weight.
- **Avoid:** decorative clutter around the primary task, tiny item labels, fake skeuomorphic controls that hide their affordance, and excessive shadows.

## 5. Mystic Night

**Best for:** mystery, fantasy, exploration, occult, investigation, and atmospheric strategy games.

- **Environment:** dusk, night, cave, observatory, forest, library, dream space, or star map. Use layers and focal lighting to guide attention.
- **Surfaces:** ink, glass-like tokens, stone, velvet, constellation panels, or softly illuminated cards. Keep the active control edge clear.
- **Palette:** deep base with 1–2 luminous accents and a controlled neutral surface. Semantic colors must remain legible and must not be swallowed by the atmosphere.
- **Typography:** distinctive display face with readable body copy; reserve decorative lettering for titles, not instructions or controls.
- **Characters:** silhouette, cloak, artifact, mask, familiar, constellation, or magical tool should communicate identity. Use value contrast and shape for accessibility.
- **Motion:** reveal, orbit, shimmer, constellation connect, and slow parallax. Avoid continuous animation when the player is reading or choosing.
- **Avoid:** unreadable low-contrast dark UI, purple gradients as a shortcut for “magic,” fog over controls, and excessive blur that erases hierarchy.

## 6. Field Manual

**Best for:** tactics, management, logistics, education, simulation, puzzle, and information-dense games.

- **Environment:** map, board, dashboard, lab, archive, control room, or neutral paper/metal surface. Background decoration must stay quiet.
- **Surfaces:** modular panels, tabs, stamped labels, grid lines, restrained hard borders, and clear status groups. Prefer comparison and scanning over ornament.
- **Palette:** neutral base plus 2–3 functional accents. Semantic action colors remain stable; status states also include text, icons, or symbols.
- **Typography:** highly legible sans or humanist pairing with strong numeric alignment and explicit hierarchy.
- **Characters:** use silhouettes, badges, equipment, role icons, or portraits only when they help identify a unit or actor. Do not add mascots to an operational screen without purpose.
- **Motion:** selection ring, map pan, status update, progress fill, and short confirmation. Avoid bounce and celebratory motion during repeated analysis tasks.
- **Avoid:** card piles with no hierarchy, oversized hero typography, decorative backgrounds behind data, and hidden state in color-only badges.

## Profile review checklist

Before delivery, answer yes to every applicable question:

- Can a player name the chosen profile from the environment, materials, type, characters, and motion without seeing the source code?
- Does every visual choice support the game’s setting, audience, or mechanic?
- Is the default Ink Candy language absent where it conflicts with the selected profile?
- Are semantic action colors still readable and consistent?
- Are characters distinct by silhouette, value, accessory, pattern, or role?
- Does the profile survive all required viewport sizes, reduced motion, high graphics, and long localized text?
- Were the two proposed directions and the final recommendation recorded in the Design brief?
