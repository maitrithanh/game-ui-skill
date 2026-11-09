#!/usr/bin/env python3
"""Sinh và kiểm tra màu cho game UI.

Hai chế độ:

  derive   Từ mã màu nền -> sinh cặp -d (tối, làm mép dưới nút) và -l (rất nhạt),
           báo tương phản và độ "tươi" của màu. In CSS hoặc JSON.
             palette.py derive yellow=#f5c84c green=#6bbb4c --format css

  check    Đọc file CSS, tìm mọi cặp --x / --x-d, kiểm tra từng cặp.
             palette.py check assets/kit.css [--extra gold coral]
           Mặc định chỉ kiểm màu nút (yellow green red blue azure teal);
           màu thương hiệu mới thêm vào --extra.

Thuật toán sinh -d / -l PHẢI giống GameUI.theme() trong assets/kit.js.
Thoát mã 1 nếu có lỗi (tương phản mực quá thấp, cặp không tách được).
"""
import argparse
import colorsys
import json
import re
import sys

INK = "#2f3650"
DARK_DROP = 0.115     # độ sáng giảm của bản -d
DARK_SAT_PULL = 0.65  # kéo độ no của bản -d về DARK_SAT_TARGET để mép dưới "chìm" chứ không chói
DARK_SAT_TARGET = 0.55
ACTION_COLORS = {"yellow", "green", "red", "blue", "azure", "teal"}  # màu nút: bị kiểm nghiêm ngặt
LIGHT_L = 0.91        # độ sáng của bản -l
MIN_PAIR_GAP = 0.08   # -d phải tối hơn base ít nhất ngần này (theo độ sáng HSL)


def parse_hex(value):
    h = value.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if not re.fullmatch(r"[0-9a-fA-F]{6}", h):
        raise ValueError(f"Mã màu không hợp lệ: {value!r}")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def to_hex(rgb):
    return "#" + "".join(f"{max(0, min(255, round(c))):02x}" for c in rgb)


def to_hls(hex_color):
    r, g, b = (c / 255 for c in parse_hex(hex_color))
    return colorsys.rgb_to_hls(r, g, b)  # (h, l, s)


def from_hls(h, l, s):
    return to_hex(tuple(c * 255 for c in colorsys.hls_to_rgb(h, l, s)))


def luminance(hex_color):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = parse_hex(hex_color)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def contrast(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def derive(base):
    h, l, s = to_hls(base)
    return {
        "base": base.lower() if base.startswith("#") else "#" + base.lower(),
        "dark": from_hls(h, max(l - DARK_DROP, 0.18), s + (DARK_SAT_TARGET - s) * DARK_SAT_PULL),
        "light": from_hls(h, LIGHT_L, min(s, 0.9)),
    }


def vividness_notes(base):
    """Nhận xét độ thu hút. Phong cách ban ngày: no màu (s 0.45–0.95), sáng vừa (l 0.45–0.72)."""
    _, l, s = to_hls(base)
    notes = []
    if s < 0.40:
        notes.append(f"xỉn (độ no {s:.2f} < 0.40): thử tăng độ no, màu game cần tươi")
    if l > 0.80:
        notes.append(f"quá nhạt (sáng {l:.2f}) để làm màu nút; chỉ hợp làm nền hoặc bản -l")
    if l < 0.38:
        notes.append(f"quá tối (sáng {l:.2f}) cho phong cách ban ngày")
    return notes


def pair_report(name, base, dark):
    _, lb, _ = to_hls(base)
    _, ld, _ = to_hls(dark)
    return {
        "name": name,
        "base": base,
        "dark": dark,
        "ink_on_base": round(contrast(INK, base), 2),
        "white_on_base": round(contrast("#ffffff", base), 2),
        "gap": round(lb - ld, 3),
    }


def issues_for(rep):
    problems = []
    if rep["ink_on_base"] < 3.0:
        problems.append("viền mực khó thấy trên màu này (< 3:1)")
    if rep["gap"] < MIN_PAIR_GAP:
        problems.append(f"-d chỉ tối hơn base {rep['gap']:.2f}, mép dưới nút sẽ không thấy")
    return problems


def cmd_derive(args):
    result, bad = {}, False
    for item in args.colors:
        name, _, value = item.partition("=")
        if not value:
            sys.exit(f"Cú pháp: tên=#mã, nhận được {item!r}")
        d = derive(value)
        result[name] = d
        rep = pair_report(name, d["base"], d["dark"])
        problems = issues_for(rep)
        notes = vividness_notes(d["base"])
        needs_stroke = rep["white_on_base"] < 4.5
        sys.stderr.write(
            f"{name}: ink/base {rep['ink_on_base']}:1, trắng/base {rep['white_on_base']}:1"
            f"{' (chữ trắng BẮT BUỘC có stroke mực)' if needs_stroke else ''}\n")
        for p in problems:
            sys.stderr.write(f"  LỖI: {p}\n"); bad = True
        for n in notes:
            sys.stderr.write(f"  Lưu ý: {n}\n")
    if args.format == "json":
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        for name, d in result.items():
            print(f"  --{name}:{d['base']}; --{name}-d:{d['dark']}; --{name}-l:{d['light']};")
    return 1 if bad else 0


def cmd_check(args):
    text = open(args.css, encoding="utf-8").read()
    colors = dict(re.findall(r"--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b", text))
    pairs = [(n, v, colors[n + "-d"]) for n, v in colors.items()
             if n + "-d" in colors and (args.all or n in ACTION_COLORS or n in args.extra)]
    if not pairs:
        sys.exit("Không thấy cặp --x / --x-d nào trong file.")
    bad = False
    print(f"{'màu':<10}{'ink/base':>9}{'trắng/base':>11}{'gap':>7}  ghi chú")
    for name, base, dark in pairs:
        rep = pair_report(name, base, dark)
        problems = issues_for(rep)
        flags = []
        if rep["white_on_base"] < 4.5:
            flags.append("chữ trắng cần stroke")
        flags += [f"LỖI: {p}" for p in problems]
        flags += [f"lưu ý: {n}" for n in vividness_notes(base)]
        bad |= bool(problems)
        print(f"{name:<10}{rep['ink_on_base']:>9}{rep['white_on_base']:>11}{rep['gap']:>7}  {'; '.join(flags)}")
    mut = colors.get("mut")
    if mut:
        c = contrast(mut, colors.get("bg", "#e3eef5"))
        ok = c >= 4.5
        bad |= not ok
        print(f"\nchữ phụ --mut trên --bg: {c:.2f}:1 {'OK' if ok else 'LỖI: dưới 4.5:1'}")
    return 1 if bad else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("derive")
    d.add_argument("colors", nargs="+", help="tên=#mã, ví dụ yellow=#f5c84c")
    d.add_argument("--format", choices=["css", "json"], default="css")
    c = sub.add_parser("check")
    c.add_argument("css")
    c.add_argument("--extra", nargs="*", default=[], help="thêm tên màu nút ngoài danh sách chuẩn (màu thương hiệu mới)")
    c.add_argument("--all", action="store_true", help="kiểm cả màu bề mặt/cảnh (thường không cần)")
    args = ap.parse_args()
    sys.exit(cmd_derive(args) if args.cmd == "derive" else cmd_check(args))


if __name__ == "__main__":
    main()
