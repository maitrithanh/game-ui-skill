#!/usr/bin/env sh
set -eu

REPOSITORY="maitrithanh/game-ui-skill"
TARGET_DIR=".github/skills"

usage() {
  printf '%s\n' \
    'Usage: install.sh [--project | --agent NAME | --dir PATH]' \
    '' \
    'Agents:' \
    '  project       Install into .github/skills (default)' \
    '  copilot       Install into ~/.copilot/skills' \
    '  claude        Install into ~/.claude/skills' \
    '  codex         Install into ~/.codex/skills' \
    '  gemini        Install into ~/.gemini/skills' \
    '  agents        Install into ~/.agents/skills'
}

if [ "$#" -gt 0 ]; then
  case "$1" in
    --project)
      TARGET_DIR=".github/skills"
      ;;
    --agent)
      [ "$#" -ge 2 ] || { usage >&2; exit 1; }
      case "$2" in
        copilot) TARGET_DIR="${HOME}/.copilot/skills" ;;
        claude) TARGET_DIR="${HOME}/.claude/skills" ;;
        codex) TARGET_DIR="${HOME}/.codex/skills" ;;
        gemini) TARGET_DIR="${HOME}/.gemini/skills" ;;
        agents) TARGET_DIR="${HOME}/.agents/skills" ;;
        *) printf 'Unknown agent: %s\n\n' "$2" >&2; usage >&2; exit 1 ;;
      esac
      ;;
    --dir)
      [ "$#" -ge 2 ] || { usage >&2; exit 1; }
      TARGET_DIR="$2"
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n\n' "$1" >&2
      usage >&2
      exit 1
      ;;
  esac
fi

TEMP_DIR="$(mktemp -d)"
ARCHIVE="$TEMP_DIR/game-ui.skill"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT INT TERM

command -v curl >/dev/null 2>&1 || {
  printf '%s\n' 'curl is required to install game-ui.' >&2
  exit 1
}
command -v unzip >/dev/null 2>&1 || {
  printf '%s\n' 'unzip is required to install game-ui.' >&2
  exit 1
}

mkdir -p "$TARGET_DIR"
curl -fsSL "https://github.com/$REPOSITORY/releases/latest/download/game-ui.skill" -o "$ARCHIVE"
unzip -oq "$ARCHIVE" -d "$TARGET_DIR"
printf 'Installed game-ui into %s/game-ui\n' "$TARGET_DIR"
