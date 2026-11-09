# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versions follow [Semantic Versioning](https://semver.org/).

## [1.3.2] - 2026-11-09

### Fixed

- Removed stray borders: settings rows (`.setting`) no longer get a profile outline, and the landing hero no longer draws a second outlined blob behind the stage.
- Dark profiles (Neon Arcade, Mystic Night) no longer render light-on-light text for headings, cards, toasts, pills, and focused fields.

### Added

- `references/characters.md`: characters are opt-in (the agent must ask whether to create none, use kit avatars, design a custom set, or use the user's assets), plus design rules, an expression-per-game-state table, build method, and a review step.
- Four new expressions in `GameUI.avatar()`: `cheer`, `wink`, `think`, `cry` (12 moods total).

### Changed

- Style profiles now differ in structure, not just color: button shape and shadow, panel treatment, heading style, sky pattern, and platform shape are profile-specific.
- Added game-specific chrome per profile: gradient HUD frames with corner brackets and scanlines (Neon Arcade), wood-grain frames with nail heads (Cozy Workshop), gold-and-violet arch frames with a keystone gem and a moon sky (Mystic Night), corner-bracket panels with hazard tabs and segmented meters (Field Manual), double-line parchment frames with dog-eared buttons (Storybook Paper).
- Each style profile now has its own display + body font pair (Vietnamese-capable), loaded automatically by `GameUI.style()`; disable with `GameUI.init({ fonts: false })`.
- Rebuilt the demo landing page with features, install tabs per agent, and a workflow section.

## [1.3.1] - 2026-11-09

### Changed

- Made Ink Candy the default ink-border profile while adding distinct outline styles for Storybook, Neon, Cozy, Mystic, and Field Manual profiles.
- Applied profile outline tokens to controls, panels, forms, stages, avatar labels, meters, and the demo style picker.

## [1.3.0] - 2026-11-09

### Added

- Runtime `GameUI.style()` and `GameUI.init({ style })` support for all six style profiles.
- Profile-specific CSS tokens for background, surfaces, typography, radius, and scene materials.
- Theme-specific avatar silhouettes instead of one fixed round character body.

### Fixed

- Responsive avatar sizing, stage wrapping, name labels, and narrow-screen spacing to reduce clipping and imbalance.

## [1.2.0] - 2026-11-09

### Added

- Six selectable game UI style profiles with detailed background, material, palette, typography, character, motion, and anti-pattern rules.
- Required style selection protocol with two-direction proposal and recommendation before applying art direction.
- Profile-specific pre-delivery review checklist to prevent accidental default styling.

## [1.1.5] - 2026-11-09

### Changed

- Restructured the repository to the Agent Skills Marketplace layout: `skills/game-ui/SKILL.md`.
- Added `npx skills add maitrithanh/game-ui-skill` installation instructions.
- Updated Makefile, CI, AGENTS.md, and README paths for marketplace discovery.

## [1.1.4] - 2026-11-09

### Added

- Package-local `AGENTS.md` bridge that directs agents to read `SKILL.md` before changing game UI.
- Root agent instructions that explicitly connect repository work to the packaged skill instructions.

## [1.1.3] - 2026-11-09

### Changed

- Reframed the visual rules as a core quality identity with theme-driven art direction.
- Allowed backgrounds, materials, typography, palettes, scenes, and character silhouettes to adapt to the game brief.
- Added a two-direction creative proposal and recommendation workflow before applying themed UI.
- Clarified that default palettes, stages, avatars, and fonts are fallbacks rather than mandatory templates.

## [1.1.2] - 2026-11-09

### Added

- Mandatory layout contract for stable shells, scroll ownership, responsive tracks, text wrapping, safe positioning, and overflow validation.
- Required viewport matrix and overlap/clipping checks for pre-delivery UI review.

## [1.1.1] - 2026-11-09

### Changed

- Improved the skill description with explicit game UI discovery triggers.
- Documented automatic and explicit skill activation for supported agents.

## [1.1.0] - 2026-11-09

### Added

- Agent-specific installation commands for Copilot, Claude, Codex, Gemini, and custom directories.
- Stable `game-ui.skill` release asset for the latest-release installer URL.
- Manual release workflow dispatch for repairing or updating an existing tag release.

### Fixed

- Installer downloads now resolve the stable release asset correctly.

## [1.0.0] - 2026-11-09

### Added

- Initial open-source `game-ui` skill package.
- English skill documentation with Vietnamese usage guidance.
- Ink-outline visual system with thick block buttons, responsive layouts, and accessible interaction patterns.
- Web kit with CSS tokens, JavaScript utilities, templates, references, and validation scripts.
- Demo landing page and component showcase.
- Makefile release workflow with versioned `.skill` archives.
- GitHub Actions CI and tag-based release automation.
- One-command `install.sh` installer for project-local and agent-specific skill directories.
- Installation examples for GitHub Copilot, Claude Code, OpenAI Codex, Gemini CLI, and custom agent paths.
- MIT license.

### Changed

- README documentation for multi-agent installation in English and Vietnamese.
- GitHub Actions workflows use `actions/checkout@v5`.
