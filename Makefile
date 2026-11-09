SHELL := /bin/sh

SKILL_NAME := game-ui
VERSION := $(shell tr -d '[:space:]' < VERSION)
SOURCE_DIR := skills/$(SKILL_NAME)
RELEASE_DIR := releases
RELEASE_FILE := $(RELEASE_DIR)/$(SKILL_NAME).skill
VERSIONED_RELEASE_FILE := $(RELEASE_DIR)/$(SKILL_NAME)-v$(VERSION).skill
CHANGELOG_FILE := CHANGELOG.md
AGENT_DIR ?= .agents/skills

.PHONY: help build-release validate-release release install-agent clean

help:
	@printf '%s\n' \
		'make build-release      Build the versioned and latest release archives' \
		'make validate-release   Validate the release archive' \
		'make release            Build and validate the release archive' \
		'make install-agent     Install source into .agents/skills/game-ui' \
		'make install-agent AGENT_DIR=.claude/skills' \
		'make clean              Remove the generated release archive'

build-release:
	@test -s VERSION || (printf 'Missing or empty VERSION file\n' >&2; exit 1)
	@test -f $(CHANGELOG_FILE) || (printf 'Missing changelog: $(CHANGELOG_FILE)\n' >&2; exit 1)
	@grep -q '^## \[$(VERSION)\]' $(CHANGELOG_FILE) || (printf 'Missing changelog entry for v%s\n' '$(VERSION)' >&2; exit 1)
	@test -f $(SOURCE_DIR)/SKILL.md || (printf 'Missing entry point: $(SOURCE_DIR)/SKILL.md\n' >&2; exit 1)
	@test -f $(SOURCE_DIR)/LICENSE || (printf 'Missing license: $(SOURCE_DIR)/LICENSE\n' >&2; exit 1)
	@command -v zip >/dev/null 2>&1 || (printf 'zip is required to build the release\n' >&2; exit 1)
	@mkdir -p $(RELEASE_DIR)
	@rm -f $(RELEASE_FILE) $(VERSIONED_RELEASE_FILE)
	@cd skills && zip -qr ../$(VERSIONED_RELEASE_FILE) $(SKILL_NAME)
	@cp $(VERSIONED_RELEASE_FILE) $(RELEASE_FILE)
	@printf 'Built %s\n' '$(VERSIONED_RELEASE_FILE)'
	@printf 'Updated %s\n' '$(RELEASE_FILE)'

validate-release:
	@test -f $(RELEASE_FILE) || (printf 'Missing release: $(RELEASE_FILE)\n' >&2; exit 1)
	@unzip -tq $(RELEASE_FILE)
	@unzip -tq $(VERSIONED_RELEASE_FILE)
	@unzip -p $(RELEASE_FILE) $(SKILL_NAME)/SKILL.md | grep -q '^name: $(SKILL_NAME)$$'
	@unzip -Z1 $(RELEASE_FILE) | grep -q '^$(SKILL_NAME)/LICENSE$$'
	@unzip -Z1 $(RELEASE_FILE) | grep -q '^$(SKILL_NAME)/assets/kit.css$$'
	@printf 'Validated %s\n' '$(RELEASE_FILE)'

release: build-release validate-release

install-agent:
	@mkdir -p $(AGENT_DIR)/$(SKILL_NAME)
	@cp -R $(SOURCE_DIR)/. $(AGENT_DIR)/$(SKILL_NAME)/
	@printf 'Installed %s into %s/%s\n' '$(SKILL_NAME)' '$(AGENT_DIR)' '$(SKILL_NAME)'

clean:
	@rm -f $(RELEASE_FILE) $(VERSIONED_RELEASE_FILE)
	@printf 'Removed release archives for v%s\n' '$(VERSION)'
