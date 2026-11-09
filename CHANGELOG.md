# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versions follow [Semantic Versioning](https://semver.org/).

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
