#!/usr/bin/env python3
"""Render hình SVG ra PNG, kiểm lỗi và ghép thành một ảnh để XEM BẰNG MẮT trước khi giao.

  render_check.py <file.svg | thư mục>... [--out sheet.png]
  render_check.py --kit-avatars [--full] [--out sheet.png]     # kiểm nhân vật của kit

Mỗi hình được vẽ lên nền trong suốt, đúng khung viewBox, rồi đo:
  LỖI   bị cắt ở mép khung (nét vẽ chạm biên) / trống, không vẽ ra gì
  Cảnh  báo: sát mép (< 2%), lệch tâm ngang (> 8%), chiếm quá ít khung (< 30%)
Ảnh ghép hiện mỗi hình ở 96 / 48 / 24 px trên nền caro (lộ chỗ trong suốt) để kiểm
độ đọc được khi nhỏ. Thoát mã 1 nếu có LỖI. Chạy xong PHẢI mở ảnh ra xem.

CSS biến (var(--ink)...) trong SVG được giải bằng kit.css.
"""
import argparse
import base64
import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BOX = 256            # cạnh dài khi render để đo
EDGE_PX = 2          # bề dày dải biên dùng để bắt cắt xén
ALPHA_MIN = 24       # alpha trên ngưỡng này mới coi là có nét
MARGIN_WARN = 0.02
OFF_CENTER_WARN = 0.08
FILL_WARN = 0.30


def read_text(path):
    return path.read_text(encoding="utf-8") if path.exists() else ""


def launch(p):
    try:
        return p.chromium.launch(args=["--no-sandbox"])
    except Exception:
        return p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])


def analyze(png):
    """Đo một ảnh RGBA. Trả (lỗi[], cảnh_báo[])."""
    alpha = np.array(Image.open(io.BytesIO(png)).convert("RGBA"))[:, :, 3]
    h, w = alpha.shape
    mask = alpha > ALPHA_MIN
    if not mask.any():
        return ["trống: không vẽ ra gì"], []
    errors, warns = [], []
    sides = {"trên": mask[:EDGE_PX, :], "dưới": mask[-EDGE_PX:, :], "trái": mask[:, :EDGE_PX], "phải": mask[:, -EDGE_PX:]}
    touched = [name for name, strip in sides.items() if strip.any()]
    if touched:
        errors.append("bị cắt ở mép " + ", ".join(touched) + " (nét vẽ chạm khung)")
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    margin = min(x0 / w, (w - 1 - x1) / w, y0 / h, (h - 1 - y1) / h)
    if not touched and margin < MARGIN_WARN:
        warns.append(f"sát mép khung ({margin * 100:.1f}%)")
    off = abs((x0 + x1) / 2 / w - 0.5)
    if off > OFF_CENTER_WARN:
        warns.append(f"lệch tâm ngang {off * 100:.0f}%")
    fill = (x1 - x0 + 1) * (y1 - y0 + 1) / (w * h)
    if fill < FILL_WARN:
        warns.append(f"chiếm chỉ {fill * 100:.0f}% khung, hình nhỏ")
    return errors, warns


def svg_files(paths):
    items = []
    for raw in paths:
        p = Path(raw)
        files = sorted(p.rglob("*.svg")) if p.is_dir() else [p]
        for f in files:
            items.append((f.name, f.read_text(encoding="utf-8")))
    return items


def page_doc(css, js=""):
    return (f"<!doctype html><meta charset=utf-8><style>{css}\nhtml,body{{margin:0;background:transparent}}"
            f"</style><script>{js}</script><body></body>")


def kit_avatar_items(page, full):
    hats = page.evaluate("Object.keys(GameUI.HATS)")
    moods = page.evaluate("Object.keys(GameUI.MOODS)")
    combos = ([(h, m) for h in hats for m in moods] if full
              else [(h, "happy") for h in hats] + [("none", m) for m in moods if m != "happy"])
    items = []
    for hat, mood in combos:
        html = page.evaluate("([h,m])=>GameUI.avatar({color:'#86c96a',hat:h,mood:m,size:170})", [hat, mood])
        items.append((f"avatar {hat}/{mood}", html))
    return items


def measure(page, html):
    """Vẽ riêng một hình đúng khung viewBox rồi chụp nền trong suốt."""
    page.evaluate("h=>{document.body.innerHTML=h}", html)
    page.evaluate(f"""()=>{{
      const s=document.querySelector('svg'); const vb=s.viewBox.baseVal;
      const k={BOX}/Math.max(vb.width,vb.height);
      s.style.cssText=`display:block;overflow:hidden;width:${{vb.width*k}}px;height:${{vb.height*k}}px;max-width:none`;
    }}""")
    return page.locator("svg").first.screenshot(omit_background=True)


def contact_sheet(page, css, rows, out):
    cells = []
    for name, html, errors, warns in rows:
        tone = "#d9534f" if errors else ("#e0a100" if warns else "#3aa655")
        note = errors[0] if errors else (warns[0] if warns else "ổn")
        cells.append(
            f'<div class="c" style="border-color:{tone}"><div class="row">'
            + "".join(f'<div class="i" style="--w:{w}px">{html}</div>' for w in (96, 48, 24))
            + f'</div><b>{name}</b><small style="color:{tone}">{note}</small></div>')
    doc = (f"<!doctype html><meta charset=utf-8><style>{css}"
           "\nbody{margin:0;padding:16px;background:#fff;font-family:system-ui;display:grid;"
           "grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}"
           ".c{border:3px solid;border-radius:14px;padding:8px;font-size:12px;line-height:1.3;"
           "background:repeating-conic-gradient(#f2f2f2 0 25%,#fff 0 50%) 0 0/16px 16px}"
           ".row{display:flex;align-items:flex-end;gap:10px;min-height:110px}"
           ".i svg{width:var(--w);height:auto;display:block;overflow:hidden}"
           ".c b{display:block;margin-top:6px}</style>" + "".join(cells))
    page.set_viewport_size({"width": 1100, "height": 600})
    page.set_content(doc)
    page.wait_for_timeout(200)
    page.screenshot(path=out, full_page=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="*")
    ap.add_argument("--kit-avatars", action="store_true")
    ap.add_argument("--full", action="store_true", help="với --kit-avatars: mọi tổ hợp mũ x nét mặt")
    ap.add_argument("--out", default="render_check.png")
    ap.add_argument("--css", default=str(ROOT / "assets" / "kit.css"), help="CSS giải biến màu")
    args = ap.parse_args()
    if not args.paths and not args.kit_avatars:
        ap.error("cần file/thư mục SVG hoặc --kit-avatars")

    css = read_text(Path(args.css))
    with sync_playwright() as p:
        browser = launch(p)
        page = browser.new_page(viewport={"width": 600, "height": 600})
        page.set_content(page_doc(css, read_text(ROOT / "assets" / "kit.js")))

        items = svg_files(args.paths) if args.paths else []
        if args.kit_avatars:
            items += kit_avatar_items(page, args.full)

        rows, bad = [], 0
        for name, html in items:
            errors, warns = analyze(measure(page, html))
            bad += bool(errors)
            rows.append((name, html, errors, warns))
            status = "LỖI " if errors else ("cảnh báo" if warns else "ok    ")
            print(f"[{status}] {name}" + (f"  -> {'; '.join(errors + warns)}" if errors or warns else ""))

        contact_sheet(page, css, rows, args.out)
        browser.close()

    print(f"\n{len(rows)} hình, {bad} lỗi. Ảnh ghép: {args.out}  <- MỞ RA XEM trước khi giao.")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
