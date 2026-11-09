#!/usr/bin/env python3
"""Render một màn của trang game với từng bộ màu trong references/palettes.md, ghép thành một ảnh.

  preview_palettes.py assets/template.html --out palettes.png [--width 390 --height 780]

Dùng để người dùng chọn bộ màu bằng mắt. Trang cần nạp được qua file:// (kit.css/kit.js đặt cạnh).
Nếu trang có ô nhập #name-in (như template) thì thêm vài người chơi để thấy nhân vật trên bệ.
Máy không có mạng sẽ dùng font dự phòng; màu vẫn đúng.
"""
import argparse
import base64
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

PALETTES_MD = Path(__file__).resolve().parent.parent / "references" / "palettes.md"
NAMES = ["An", "Bình", "Chi", "Dũng"]


def load_presets():
    """[(tên, css)] từ palettes.md; bộ mặc định có css rỗng."""
    text = PALETTES_MD.read_text(encoding="utf-8")
    presets = []
    for m in re.finditer(r"^### (.+?)\n(.*?)(?=^### |^---|\Z)", text, re.S | re.M):
        name, body = m.group(1).strip(), m.group(2)
        css = re.search(r"```css\n(.*?)```", body, re.S)
        presets.append((name.replace(" (mặc định)", ""), css.group(1) if css else ""))
    return presets


def launch(p):
    try:
        return p.chromium.launch(args=["--no-sandbox"])
    except Exception:
        return p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])


def shoot(browser, url, css, w, h):
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = ctx.new_page()
    page.goto(url)
    page.wait_for_timeout(300)
    if css:
        page.add_style_tag(content=css)
    if page.query_selector("#name-in"):
        for n in NAMES:
            page.fill("#name-in", n)
            page.press("#name-in", "Enter")
    page.wait_for_timeout(900)
    png = page.screenshot()
    ctx.close()
    return png


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("html")
    ap.add_argument("--out", default="palettes.png")
    ap.add_argument("--width", type=int, default=390)
    ap.add_argument("--height", type=int, default=780)
    args = ap.parse_args()

    url = Path(args.html).resolve().as_uri()
    presets = load_presets()
    if not presets:
        sys.exit("Không đọc được bộ màu nào từ palettes.md")

    with sync_playwright() as p:
        browser = launch(p)
        shots = [(name, shoot(browser, url, css, args.width, args.height)) for name, css in presets]
        cells = "".join(
            f'<figure><img src="data:image/png;base64,{base64.b64encode(png).decode()}"><figcaption>{name}</figcaption></figure>'
            for name, png in shots)
        sheet = browser.new_page(viewport={"width": (args.width + 24) * len(shots) + 24, "height": args.height + 80})
        sheet.set_content(
            "<style>body{margin:0;padding:24px 12px;background:#fff;font:700 18px system-ui;display:flex;gap:24px}"
            "figure{margin:0}img{display:block;border:2px solid #2f3650;border-radius:18px}"
            "figcaption{text-align:center;padding-top:8px}</style>" + cells)
        sheet.wait_for_timeout(300)
        sheet.screenshot(path=args.out, full_page=True)
        browser.close()
    print(f"Đã ghi {args.out} ({len(presets)} bộ: {', '.join(n for n, _ in presets)})")


if __name__ == "__main__":
    main()
