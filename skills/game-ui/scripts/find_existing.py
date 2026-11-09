#!/usr/bin/env python3
"""Tìm thứ đã có trước khi viết mới.

  find_existing.py <từ khoá>... [--project DIR] [--limit N]

Tìm ở hai nơi:
  1. Kit của skill: API của GameUI và các class CSS (đọc từ SKILL.md và kit.js).
  2. Mã nguồn của project (nếu truyền --project): hàm, class, hằng số có tên chứa từ khoá.

Từ khoá tiếng Việt được hiểu (thông báo, xác nhận, rung, lưu, âm thanh...).
Ví dụ:  find_existing.py thông báo xác nhận lưu --project .
"""
import argparse
import re
import sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent

SYNONYMS = {
    "thông báo": ["toast", "notify", "notification", "snackbar", "message"],
    "báo lỗi": ["toast", "error", "err"],
    "xác nhận": ["confirm", "sheet", "dialog", "modal"],
    "hộp thoại": ["modal", "sheet", "dialog", "confirm"],
    "rung": ["buzz", "vibrate", "haptic"],
    "âm thanh": ["sfx", "sound", "audio", "tone"],
    "lưu": ["store", "storage", "save", "persist"],
    "cài đặt": ["settings", "setting", "options", "prefs"],
    "tiến độ": ["meter", "progress", "bar"],
    "đồng hồ": ["meter", "timer", "clock", "countdown"],
    "nhân vật": ["avatar", "character", "hat", "mood"],
    "pháo giấy": ["confetti", "celebrate"],
    "ăn mừng": ["celebrate", "confetti"],
    "tiết lộ": ["reveal", "flip"],
    "lật": ["flip", "reveal"],
    "bí mật": ["peek", "secret"],
    "chuyển màn": ["show", "screen", "navigate", "route"],
    "màn": ["screen"],
    "nút": ["btn", "button", "rbtn"],
    "danh sách": ["list", "li"],
    "màu": ["theme", "color", "palette", "shades"],
    "icon": ["icon", "svg"],
    "escape": ["esc", "escape", "sanitize"],
    "chữ bật": ["burst", "combo", "popup"],
    "bố cục": ["layout", "split", "wrap", "desk"],
}

SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".nuxt", ".svelte-kit", "vendor", "Pods",
             ".dart_tool", ".gradle", "__pycache__", "venv", ".venv", "coverage", "out", "Library", "Temp"}
CODE_EXT = {".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".dart", ".swift", ".kt", ".java", ".cs",
            ".py", ".gd", ".css", ".scss", ".html"}
DEF_HINT = re.compile(r"\b(function|def|func|fun|class|const|let|var|void|export|public|private|static|async|interface|type|struct)\b|=>")


def expand(word):
    w = word.lower()
    terms = {w}
    for vn, alts in SYNONYMS.items():
        if vn in w or w in vn:
            terms.update(alts)
    return terms


def kit_rows():
    """Các dòng bảng tra cứu (API và component) trong SKILL.md."""
    path = SKILL / "SKILL.md"
    if not path.exists():
        return []
    return [ln.strip() for ln in path.read_text(encoding="utf-8").splitlines()
            if ln.startswith("| ") and "`" in ln and not ln.startswith("| ---")]


def kit_exports():
    path = SKILL / "assets" / "kit.js"
    if not path.exists():
        return []
    m = re.search(r"root\.GameUI\s*=\s*\{(.*?)\};", path.read_text(encoding="utf-8"), re.S)
    return re.findall(r"[A-Za-z_$][\w$]*", m.group(1)) if m else []


def search_kit(terms):
    rows = [r for r in kit_rows() if any(t in r.lower() for t in terms)]
    names = [n for n in kit_exports() if any(t in n.lower() for t in terms)]
    return rows, names


def iter_files(root):
    for p in root.rglob("*"):
        if p.is_file() and p.suffix in CODE_EXT and not (set(p.parts) & SKIP_DIRS):
            yield p


def search_project(root, terms, limit):
    hits = []
    for p in iter_files(root):
        try:
            lines = p.read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        for i, ln in enumerate(lines, 1):
            low = ln.lower()
            if any(t in low for t in terms) and DEF_HINT.search(ln) and len(ln) < 200:
                hits.append(f"{p.relative_to(root)}:{i}: {ln.strip()}")
                if len(hits) >= limit:
                    return hits
    return hits


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("keywords", nargs="+")
    ap.add_argument("--project", help="thư mục mã nguồn của project")
    ap.add_argument("--limit", type=int, default=12, help="số kết quả tối đa trong project mỗi từ khoá")
    args = ap.parse_args()

    root = Path(args.project).resolve() if args.project else None
    if root and not root.is_dir():
        sys.exit(f"Không có thư mục: {root}")

    for kw in args.keywords:
        terms = expand(kw)
        print(f"\n=== {kw}  (tìm: {', '.join(sorted(terms))})")
        rows, names = search_kit(terms)
        if rows or names:
            print("-- Kit có sẵn, DÙNG cái này:")
            if names:
                print("   GameUI." + ", GameUI.".join(names))
            for r in rows[:8]:
                print("   " + r)
        found = search_project(root, terms, args.limit) if root else []
        if found:
            print("-- Trong project, xem trước khi viết mới:")
            for h in found:
                print("   " + h)
        if not rows and not names and not found:
            print("-- Không thấy. Được viết mới: đặt ở thư mục dùng chung, tên rõ, tham số hoá (code-standards.md mục 1).")


if __name__ == "__main__":
    main()
