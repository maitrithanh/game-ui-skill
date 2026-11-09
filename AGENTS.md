# Agent Instructions

## Game UI tasks

For any request involving a game UI, game HUD, game menu, game screen, game layout, game visual style, game palette, or game character:

1. Use the `game-ui` skill before designing or editing UI.
2. Load and follow `skills/game-ui/SKILL.md` when working from this repository. If the skill is installed for the current agent, use that installed copy instead.
3. Ask for the missing game, technology, platform, size, theme, language, sound, stage, and character decisions before writing UI. Do not invent them.
4. Follow the mandatory layout contract: one shell, one scroll owner, stable grid/flex tracks, bounded text, safe-area handling, no horizontal overflow, and the required viewport checks.
5. Treat palettes, backgrounds, typography, materials, scenes, and characters as theme-driven choices. Propose two visual directions and recommend one before applying a theme unless the user explicitly delegates the decision.
6. Never create or restyle characters without asking first; follow `skills/game-ui/references/characters.md` (none, kit default, custom set, or user assets).
7. Preserve accessibility, semantic action colors, focus states, reduced motion, user-data escaping, and the project’s existing conventions.
8. Before delivery, render and inspect the result at the required mobile, landscape, and desktop sizes. Do not claim the UI is complete without checking for clipping, overlap, imbalance, or layout shifts.

The `skills/game-ui/` directory is the editable marketplace source. The installable package is built with `make release`.
Always read `skills/game-ui/AGENTS.md` and then `skills/game-ui/SKILL.md` before applying game UI changes.
