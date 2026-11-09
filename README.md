# Game UI Skill

An open-source game UI skill for web, mobile, desktop, and game-engine products. It creates interfaces with **ink outlines**, **thick block buttons**, bright colors, responsive motion, and standards for accessibility, performance, code, and visual assets.

This skill defines the interface and quality workflow, but does not decide the game, rules, technology, colors, or sound on its own. Before building the UI, it asks the user to provide those choices.

## Features

- Supports HTML/JS, PWA, Electron, Tauri, Capacitor, React, Vue, Svelte, Angular, Next/Nuxt/SvelteKit.
- Formulas for React Native, Flutter, SwiftUI, Compose, Unity, Godot, and other technologies.
- Ready-to-use web kit: tokens, components, responsive layouts, modals, toasts, sound, haptics, storage, and game effects.
- Layouts for portrait mobile, landscape mobile, desktop, and automatic adaptation.
- Semantic color rules, contrast, hit areas, focus, reduced motion, and user-data protection.
- Tools for palette checks, SVG rendering, palette previews, and finding existing project code.
- Theme-driven art direction: the agent proposes visual directions and adapts backgrounds, palettes, materials, typography, and character silhouettes to the game.

## Installation

### Agent Skills Marketplace

This repository follows the marketplace layout `skills/game-ui/SKILL.md`. Install it with the Skills CLI:

```bash
npx skills add maitrithanh/game-ui-skill
```

Install globally for the current user:

```bash
npx skills add maitrithanh/game-ui-skill -g -y
```

### One-command install

From the root of a project, run:

```bash
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh
```

This downloads the latest release and installs it into `.github/skills/game-ui/`.

Install for a specific agent instead:

```bash
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh \
  | sh -s -- --agent copilot
```

Supported targets are `copilot` (`~/.copilot/skills`), `claude` (`~/.claude/skills`), `codex` (`~/.codex/skills`), `gemini` (`~/.gemini/skills`), and `agents` (`~/.agents/skills`). Use `--dir PATH` for a custom agent directory.

Examples:

```bash
# GitHub Copilot
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh -s -- --agent copilot

# Claude Code
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh -s -- --agent claude

# OpenAI Codex
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh -s -- --agent codex

# Gemini CLI
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh -s -- --agent gemini
```

### Use in a workspace that supports skill packages

Download `releases/game-ui.skill` from this repository, then place the downloaded `game-ui.skill` in the workspace's skills directory, or install it through the skill-package mechanism of your tool. The archive contains `game-ui/`, with `SKILL.md` as its entry point.

### Open and read manually

The `.skill` file is a ZIP archive. Inspect its contents with:

```bash
unzip -l releases/game-ui.skill
unzip -p releases/game-ui.skill '*/SKILL.md'
```

For web projects, copy the files in `skills/game-ui/assets/` into your project. For native platforms or engines, use the tokens and formulas in `skills/game-ui/references/` instead of copying the entire web kit.

## Usage workflow

1. Describe the game, rules, number of players, and required screens.
2. Choose the technology, platform, preferred size, colors, and sound.
3. Add missing choices such as the stage, characters, and language.
4. Record the choices in a “Design brief” before writing the UI.
5. Use the kit or formulas that match the selected technology.
6. Check the palette, accessibility, responsive layout, performance, and visuals before delivery.

The skill does not choose the game name, rules, screens, features, or technology for the user.

## Activating the skill

Installing a skill makes it available to the agent; it does not force the skill into every conversation. The agent loads it when the request matches the `description` in `SKILL.md`.

To activate it explicitly, use the skill command if your agent exposes slash commands:

```text
/game-ui
```

You can also mention it in the request:

```text
Use the game-ui skill to design the settings screen for my game.
```

For project-specific use, install it under `.github/skills/game-ui/` for GitHub Copilot, `.claude/skills/game-ui/` for Claude Code, or the agent's documented skills directory. The folder name and the frontmatter `name` must both be `game-ui`.

This repository also includes `AGENTS.md` with project-level instructions. Where the agent supports `AGENTS.md`, those instructions are loaded on each run and tell the agent when to use `game-ui`.

Install the local source into an agent directory with Make:

```bash
make install-agent
make install-agent AGENT_DIR=.claude/skills
make install-agent AGENT_DIR=.github/skills
```

## Web initialization example

After copying `assets/kit.css` and `assets/kit.js`, initialize the kit with the choices confirmed by the user:

```html
<link rel="stylesheet" href="kit.css">
<script src="kit.js"></script>
<script>
  GameUI.init({
    id: "ten-game",
    layout: "mobile",  // mobile | landscape | desktop | auto
    sound: true,
    haptics: true,
    sky: true
  });
</script>
```

`layout` mapping: use `mobile` for portrait mobile, `landscape` for landscape mobile, `desktop` for desktop, and `auto` for both mobile and desktop.

## Package structure

| Path | Purpose |
| --- | --- |
| `SKILL.md` | Core rules, workflow, and standards |
| `assets/kit.css` | Tokens, components, stage, layout, and web UI states |
| `assets/kit.js` | `GameUI`: settings, toasts, modals, sound, storage, reveal, and DOM utilities |
| `assets/template.html` | Example combining the kit into a complete game flow |
| `references/tokens.json` | Platform-neutral token source for native platforms |
| `references/platforms.md` | Formulas for mobile, desktop, and engines |
| `references/frameworks.md` | Integration with frameworks, SSR, and canvas/WebGL |
| `references/palettes.md` | Available palettes and color rules |
| `references/code-standards.md` | Code organization and writing standards |
| `references/assets-quality.md` | Visual asset creation, rendering, and review standards |
| `scripts/palette.py` | Generate color variants and check contrast |
| `scripts/preview_palettes.py` | Create palette previews |
| `scripts/render_check.py` | Render SVG for visual checks |
| `scripts/find_existing.py` | Find existing components or functions in the project |

## Repository layout

| Path | Purpose |
| --- | --- |
| `skills/game-ui/` | Marketplace skill source (`SKILL.md`) |
| `demo/` | Landing page and browser demo for the kit |
| `releases/game-ui.skill` | Installable ZIP package |
| `README.md` | English and Vietnamese documentation |
| `CHANGELOG.md` | Versioned release notes |
| `install.sh` | One-command installer for the latest release |
| `AGENTS.md` | Project-level agent instructions |
| `LICENSE` | Repository license |

## Validation tools

The scripts require Python 3 and run from the extracted package directory:

```bash
python3 scripts/palette.py check path/to/file.css
python3 scripts/palette.py derive yellow=#f4c542
python3 scripts/preview_palettes.py
python3 scripts/render_check.py path/to/image.svg --out check.png
python3 scripts/find_existing.py button --project .
```

After rendering an SVG, open the image and inspect it visually. A successful script run alone is not enough to conclude that an image is finished.

## Core design principles

- Every object has an ink outline; primary depth comes from thick lips and hard shadows.
- Each screen has one primary CTA and one clear task.
- Button colors retain their meaning: green for moving forward, yellow for secondary actions, red for destructive actions, and blue for safe choices.
- Do not use template-style purple gradients, glassmorphism, soft shadows as the primary depth, or full-screen dark backgrounds.
- Do not use emoji as system icons.
- Do not communicate state through color alone; always include text, an icon, or a check mark.
- Prefer local updates, a single source of truth for state, and reuse of existing components.

## Contributing

1. Keep changes focused on the relevant documentation, tokens, kit, or scripts.
2. Do not modify an existing component just to create a similar copy.
3. Run the palette, rendering, and accessibility checks appropriate to the change.
4. Update reference documentation when behavior or an API changes.

## License

This package is distributed under the MIT License. See the `LICENSE` file for the complete terms. Before distributing a modified copy publicly, keep the license notice and include the same MIT License terms.

## Hướng dẫn tiếng Việt

### Giới thiệu

`game-ui` là skill giao diện game mã nguồn mở cho web, mobile, desktop và game engine. Skill cung cấp phong cách **viền mực**, **nút khối dày**, màu tươi, chuyển động có phản hồi và các tiêu chuẩn về accessibility, hiệu năng, code và hình ảnh.

Skill không tự quyết định game, luật chơi, công nghệ, kích thước, màu sắc hay âm thanh. Trước khi dựng UI, hãy cung cấp các lựa chọn đó để skill thích ứng đúng với project.

### Kích hoạt skill

Cài skill chỉ làm skill sẵn sàng cho agent; không bắt skill chạy trong mọi cuộc hội thoại. Agent sẽ tự nạp skill khi yêu cầu khớp với `description` trong `SKILL.md`.

Có thể gọi trực tiếp bằng slash command nếu agent hỗ trợ:

```text
/game-ui
```

Hoặc ghi rõ trong yêu cầu:

```text
Hãy dùng skill game-ui để thiết kế màn hình cài đặt cho game của tôi.
```

### Cài đặt nhanh

Repository dùng cấu trúc marketplace `skills/game-ui/SKILL.md`. Cài bằng Skills CLI:

```bash
npx skills add maitrithanh/game-ui-skill
```

Cài global cho user hiện tại:

```bash
npx skills add maitrithanh/game-ui-skill -g -y
```

Cài nhanh từ thư mục gốc của project:

```bash
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh
```

Script sẽ tải release mới nhất và cài vào `.github/skills/game-ui/`.

Cài cho agent cụ thể:

```bash
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh \
  | sh -s -- --agent copilot
```

Hỗ trợ `copilot` (`~/.copilot/skills`), `claude` (`~/.claude/skills`), `codex` (`~/.codex/skills`), `gemini` (`~/.gemini/skills`) và `agents` (`~/.agents/skills`). Dùng `--dir PATH` nếu agent sử dụng thư mục riêng.

Ví dụ:

```bash
# GitHub Copilot
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh -s -- --agent copilot

# Claude Code
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh -s -- --agent claude

# OpenAI Codex
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh -s -- --agent codex

# Gemini CLI
curl -fsSL https://raw.githubusercontent.com/maitrithanh/game-ui-skill/main/install.sh | sh -s -- --agent gemini
```

Tải `releases/game-ui.skill` từ repository, sau đó giải nén vào `.github/skills`:

```bash
mkdir -p .github/skills
unzip -oq releases/game-ui.skill -d .github/skills
```

Sau khi giải nén, entry point là `.github/skills/game-ui/SKILL.md`.

### Quy trình sử dụng

1. Mô tả game, luật chơi, số người chơi và các màn hình cần có.
2. Chọn công nghệ, nền tảng, kích thước ưu tiên, màu sắc và âm thanh.
3. Ghi lại các lựa chọn thành “Phiếu thiết kế” trước khi viết UI.
4. Dùng kit hoặc công thức đúng với công nghệ đã chọn.
5. Kiểm tra palette, accessibility, responsive layout, hiệu năng và hình ảnh trước khi giao.

### Ví dụ khởi tạo web

```html
<link rel="stylesheet" href="kit.css">
<script src="kit.js"></script>
<script>
  GameUI.init({
    id: "ten-game",
    layout: "mobile",  // mobile | landscape | desktop | auto
    sound: true,
    haptics: true,
    sky: true
  });
</script>
```

Mobile dọc dùng `mobile`, mobile ngang dùng `landscape`, desktop dùng `desktop`, còn cả mobile và desktop dùng `auto`.

### Cấu trúc chính

- `SKILL.md`: quy tắc và workflow chính.
- `assets/kit.css`: token, component, sân khấu và layout web.
- `assets/kit.js`: cài đặt, toast, modal, âm thanh, lưu trữ và tiện ích DOM.
- `references/`: token, palette, framework, platform, code standard và tiêu chuẩn hình ảnh.
- `scripts/`: công cụ kiểm tra palette, render SVG và tìm code có sẵn.

### Cấu trúc repository

- `skills/game-ui/`: source marketplace có thể chỉnh sửa của skill.
- `demo/`: landing page và browser demo.
- `releases/game-ui.skill`: package để cài đặt.
- `CHANGELOG.md`: lịch sử thay đổi theo version.
- `install.sh`: script cài đặt release mới nhất bằng một lệnh.
- `AGENTS.md`: hướng dẫn agent cấp project, yêu cầu dùng `game-ui` cho task UI game.
- `README.md`: tài liệu tiếng Anh và tiếng Việt.
- `LICENSE`: giấy phép của repository.

### Giấy phép

Package được phát hành theo [MIT License](LICENSE). Font Grandstander và Baloo 2 là tài sản bên thứ ba, được phân phối theo giấy phép OFL tương ứng.

## CI/CD and releases

GitHub Actions validates pull requests and pushes to `main`. A GitHub Release is created automatically when a semantic-version tag is pushed:

```bash
printf '1.1.0\n' > VERSION
```

Add a matching `## [1.1.0]` section to `CHANGELOG.md`, then commit and push the tag:

```bash
make release
git add VERSION
git add CHANGELOG.md
git commit -m "chore: release v1.1.0"
git tag v1.1.0
git push origin main v1.1.0
```

The release workflow verifies that the tag matches `VERSION`, builds the package, and uploads `game-ui-v1.1.0.skill` to the GitHub Release.

## CI/CD và phát hành

GitHub Actions tự động kiểm tra Pull Request và các lần push vào `main`. Để phát hành bản mới, cập nhật version rồi push tag tương ứng:

```bash
printf '1.1.0\n' > VERSION
```

Thêm mục `## [1.1.0]` tương ứng vào `CHANGELOG.md`, sau đó commit và push tag:

```bash
make release
git add VERSION
git add CHANGELOG.md
git commit -m "chore: release v1.1.0"
git tag v1.1.0
git push origin main v1.1.0
```

Workflow sẽ kiểm tra tag có khớp `VERSION`, chạy build, rồi đính kèm `game-ui-v1.1.0.skill` vào GitHub Release.
