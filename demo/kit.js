/* ==========================================================================
   web-game-ui · kit.js — window.GameUI
   Không phụ thuộc thư viện. Dùng được với HTML thuần, React, Vue.
   ========================================================================== */
(function (root) {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- An toàn ---------- */
  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

  let NS = "game";
  const store = {
    get(key, def) {
      try { const v = localStorage.getItem(NS + ":" + key); return v == null ? def : JSON.parse(v); }
      catch { return def; }
    },
    set(key, val) {
      try { localStorage.setItem(NS + ":" + key, JSON.stringify(val)); } catch { /* chế độ riêng tư, đầy bộ nhớ… */ }
    },
  };

  const features = { sound: true, haptics: true, layout: "auto", style: "ink-candy" };
  function buzz(pattern = 20) {
    if (!features.haptics || (features.sound && !settings.sound)) return;
    try { navigator.vibrate && navigator.vibrate(pattern); } catch { /* iOS / không hỗ trợ */ }
  }

  /* ---------- Ghi DOM tối thiểu ---------- */
  function setText(el, v) { v = String(v); if (el && el.textContent !== v) el.textContent = v; }
  function setAttr(el, name, v) { v = String(v); if (el && el.getAttribute(name) !== v) el.setAttribute(name, v); }
  function setPressed(el, on) { setAttr(el, "aria-pressed", on ? "true" : "false"); }
  function meter(el, ratio) {
    const r = Math.max(0, Math.min(1, ratio));
    const v = r.toFixed(3);
    if (el.style.getPropertyValue("--v") !== v) el.style.setProperty("--v", v);
    setAttr(el, "data-level", r > 0.5 ? "hi" : r > 0.2 ? "mid" : "low");
  }

  /* var(--token) -> giá trị thật, vì thuộc tính SVG (fill="", stroke="") không chắc hỗ trợ var() trên mọi trình duyệt */
  let cssCache = null;
  function resolveVars(svg) {
    cssCache = cssCache || getComputedStyle(document.documentElement);
    return svg.replace(/var\((--[\w-]+)\)/g, (m, n) => cssCache.getPropertyValue(n).trim() || m);
  }

  /* ---------- Icon (vẽ 2 lớp: mực dày + trắng mảnh) ---------- */
  const PATHS = {
    back: "M14.5 5.5 8 12l6.5 6.5",
    home: "M4.5 11 12 4.5l7.5 6.5M7 9.5V19h10V9.5",
    gear: "M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8ZM12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7",
    close: "M6.5 6.5l11 11M17.5 6.5l-11 11",
    plus: "M12 5.5v13M5.5 12h13",
    minus: "M5.5 12h13",
    trash: "M5 7.5h14M9.5 7.5V5h5v2.5M7 7.5l1 11.5h8l1-11.5",
    eye: "M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12ZM12 9.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Z",
    replay: "M5 12a7 7 0 1 0 2.2-5.1M5 4.5v4h4",
    check: "M5.5 12.5l4.2 4.2L18.5 7.8",
    info: "M12 10.5V17M12 7v.01",
    play: "M8 5.5v13l10-6.5Z",
    sound: "M4.5 9.5h3.5L13 5.5v13L8 14.5H4.5ZM16.5 9a4 4 0 0 1 0 6",
    mute: "M4.5 9.5h3.5L13 5.5v13L8 14.5H4.5ZM16.5 9.5l4 5M20.5 9.5l-4 5",
    star: "M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6Z",
  };
  function icon(name, { white = true } = {}) {
    const d = PATHS[name] || PATHS.info;
    const top = white ? `<path d="${d}" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` : "";
    return resolveVars(`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--ink)" stroke-width="${white ? 5.6 : 2.6}" stroke-linecap="round" stroke-linejoin="round"/>${top}</svg>`);
  }

  /* ---------- Nhân vật ---------- */
  // Thân tròn một màu · mắt to · má hồng · vệt sáng · viền mực dày.
  // Phụ kiện (HATS) = vai trò. Nét mặt (mood) = trạng thái. Game chỉ thêm HATS, không đổi dáng.
  const STYLE_PROFILES = {
    "ink-candy": { bg: "#e3eef5", card: "#ebf3fd", ink: "#2f3650" },
    "storybook-paper": { bg: "#f4ead8", card: "#fff8e4", ink: "#493b45" },
    "neon-arcade": { bg: "#171b35", card: "#252b4a", ink: "#11152b" },
    "cozy-workshop": { bg: "#efe4d5", card: "#fff6e8", ink: "#4d3d37" },
    "mystic-night": { bg: "#18213b", card: "#27304f", ink: "#11182f" },
    "field-manual": { bg: "#e7e8e2", card: "#f8f8f1", ink: "#303735" },
  };
  // Mỗi profile đi cùng một cặp font (đều có tiếng Việt). Tải từ Google Fonts; tắt bằng init({ fonts: false }).
  const FONT_FAMILIES = {
    "ink-candy": "Baloo+2:wght@600;700;800&family=Grandstander:wght@800;900",
    "storybook-paper": "Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Lora:wght@500;600;700",
    "neon-arcade": "Chakra+Petch:ital,wght@0,600;0,700;1,600;1,700&family=Exo+2:wght@500;600;700",
    "cozy-workshop": "Itim&family=Nunito:wght@600;700;800",
    "mystic-night": "Cormorant+Garamond:wght@600;700&family=EB+Garamond:wght@500;600;700",
    "field-manual": "Barlow+Condensed:wght@700;800&family=Barlow:wght@500;600;700",
  };
  function loadFonts(profile) {
    if (features.fonts === false) return;
    const href = `https://fonts.googleapis.com/css2?family=${FONT_FAMILIES[profile]}&display=swap`;
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((l) => l.href === href)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = href; document.head.append(link);
  }
  const AVATAR_SHAPES = {
    "ink-candy": `<circle cx="40" cy="58" r="29" fill="var(--avatar-color)" stroke="var(--ink)" stroke-width="3.2"/>`,
    "storybook-paper": `<path d="M17 43Q19 27 40 27t23 16v28q-8 15-23 15T17 71Z" fill="var(--avatar-color)" stroke="var(--ink)" stroke-width="3.2"/>`,
    "neon-arcade": `<path d="M24 28h32l14 30-14 30H24L10 58Z" fill="var(--avatar-color)" stroke="var(--ink)" stroke-width="3.2" stroke-linejoin="round"/>`,
    "cozy-workshop": `<path d="M18 43Q18 28 31 25h18q13 3 13 18v27q-4 14-22 14T18 70Z" fill="var(--avatar-color)" stroke="var(--ink)" stroke-width="3.2"/>`,
    "mystic-night": `<path d="m40 23 25 16v31L40 87 15 70V39Z" fill="var(--avatar-color)" stroke="var(--ink)" stroke-width="3.2" stroke-linejoin="round"/>`,
    "field-manual": `<rect x="14" y="29" width="52" height="58" rx="9" fill="var(--avatar-color)" stroke="var(--ink)" stroke-width="3.2"/>`,
  };
  const HATS = {
    none: "",
    crown: `<path d="M24 26l4-14 7 9 5-12 5 12 7-9 4 14Z" fill="var(--yellow)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="20" r="2.4" fill="var(--red)" stroke="var(--ink)" stroke-width="1.5"/>`,
    cap: `<path d="M18 31c0-12 10-19 22-19s22 7 22 19Z" fill="var(--blue)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 30h20c0 3-3 5-6 5H50Z" fill="var(--blue-d)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>`,
    party: `<path d="M30 30l10-26 10 26Z" fill="var(--azure)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/><path d="M33 22h14M36 14h8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="40" cy="5" r="3.6" fill="var(--yellow)" stroke="var(--ink)" stroke-width="2"/>`,
    detective: `<path d="M14 31c6-3 46-3 52 0-4 4-48 4-52 0Z" fill="#8b6a4f" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 30c0-10 6-17 16-17s16 7 16 17" fill="#a7825f" stroke="var(--ink)" stroke-width="2.5"/><path d="M25 26h30" stroke="var(--ink)" stroke-width="3"/>`,
    wizard: `<path d="M20 31c8-3 32-3 40 0L44 2c-2 4-10 14-24 29Z" fill="var(--blue)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/><path d="M38 18l1.4 2.8 3 .4-2.2 2 .6 3-2.8-1.5-2.7 1.5.5-3-2.2-2 3-.4Z" fill="var(--yellow)" stroke="var(--ink)" stroke-width="1.2"/>`,
    bow: `<path d="M40 22l-12-8v16Zm0 0 12-8v16Z" fill="var(--red)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="22" r="4" fill="var(--red-d)" stroke="var(--ink)" stroke-width="2.5"/>`,
    leaf: `<path d="M40 27c0-8 3-14 10-17-1 8-4 13-10 17Z" fill="var(--green)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 27v-6" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/>`,
    mask: `<path d="M20 49c6-5 34-5 40 0-1 6-6 7-10 7-4 0-6-3-10-3s-6 3-10 3c-4 0-9-1-10-7Z" fill="var(--ink)"/>`,
  };
  const MOODS = {
    happy: { mouth: `<path d="M34 66q6 6 12 0" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>` },
    grin: { mouth: `<path d="M32 64q8 10 16 0Z" fill="#7a2f3b" stroke="var(--ink)" stroke-width="2.4" stroke-linejoin="round"/>` },
    calm: { mouth: `<path d="M35 66h10" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>` },
    sad: { mouth: `<path d="M34 68q6-5 12 0" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>`, brow: "sad" },
    shock: { mouth: `<ellipse cx="40" cy="67" rx="4" ry="5" fill="#7a2f3b" stroke="var(--ink)" stroke-width="2.4"/>`, big: true },
    angry: { mouth: `<path d="M34 68q6-4 12 0" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>`, brow: "angry" },
    sly: { mouth: `<path d="M34 66q8 3 12-3" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>`, look: 2 },
    sleep: { mouth: `<circle cx="40" cy="67" r="2.5" fill="var(--ink)"/>`, closed: true },
    cheer: { mouth: `<path d="M32 63q8 12 16 0Z" fill="#7a2f3b" stroke="var(--ink)" stroke-width="2.4" stroke-linejoin="round"/>`, joy: true },
    wink: { mouth: `<path d="M33 65q7 7 14 0" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>`, wink: true },
    think: { mouth: `<path d="M37 68h9" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>`, look: 2, brow: "think" },
    cry: { mouth: `<path d="M34 70q6-6 12 0" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>`, brow: "sad",
      extra: `<path d="M24 58q-4 6 0 9q4-3 0-9Z M56 58q-4 6 0 9q4-3 0-9Z" fill="var(--azure)" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/>` },
  };
  function avatar({ color = "var(--yellow)", hat = "none", mood = "happy", name = "", size = 64, cls = "", style = "", label } = {}) {
    const m = MOODS[mood] || MOODS.happy;
    const ry = m.big ? 6.4 : 5.6, rx = m.big ? 5.4 : 4.8, dx = m.look || 0.6;
    const profile = document.documentElement.dataset.style || features.style;
    const body = (AVATAR_SHAPES[profile] || AVATAR_SHAPES["ink-candy"]).replace("var(--avatar-color)", esc(color));
    const eye = (x) => m.joy
      ? `<path d="M${x - 4} 55q4-6 8 0" fill="none" stroke="var(--ink)" stroke-width="2.8" stroke-linecap="round"/>`
      : m.closed || (m.wink && x === 31)
      ? `<path d="M${x - 4} 53q4 3 8 0" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>`
      : `<ellipse cx="${x}" cy="52" rx="${rx}" ry="${ry}" fill="#fff" stroke="var(--ink)" stroke-width="2.2"/><circle cx="${x + dx}" cy="53.4" r="2.6" fill="var(--ink)"/><circle cx="${x + dx - 1}" cy="52.2" r=".9" fill="#fff"/>`;
    const brow = m.brow === "angry"
      ? `<path d="M26 42l8 4M54 42l-8 4" stroke="var(--ink)" stroke-width="2.8" stroke-linecap="round"/>`
      : m.brow === "sad" ? `<path d="M26 45l8-3M54 45l-8-3" stroke="var(--ink)" stroke-width="2.8" stroke-linecap="round"/>`
      : m.brow === "think" ? `<path d="M26 44h8M46 41l8 3" stroke="var(--ink)" stroke-width="2.8" stroke-linecap="round"/>` : "";
    const a11y = label ?? name;
    return resolveVars(`<span class="avatar avatar-${esc(profile)} ${esc(cls)}" style="--s:${+size}px;${esc(style)}">`
      + `<svg viewBox="0 -6 80 104" ${a11y ? `role="img" aria-label="${esc(a11y)}"` : 'aria-hidden="true"'}>`
      + `<ellipse cx="40" cy="90" rx="22" ry="4.5" fill="rgba(31,39,64,.22)"/>`
      + body
      + `<circle cx="40" cy="58" r="29" fill="none" stroke="rgba(0,0,0,.10)" stroke-width="6" stroke-dasharray="0 52 60 200" transform="rotate(10 40 58)"/>`
      + `<path d="M24 40q9-10 22-8" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="4.5" stroke-linecap="round"/>`
      + `<ellipse cx="26" cy="63" rx="5" ry="3.2" fill="#ff8f9c" opacity=".7"/><ellipse cx="54" cy="63" rx="5" ry="3.2" fill="#ff8f9c" opacity=".7"/>`
      + brow + eye(31) + eye(49) + m.mouth + (m.extra || "")
      + (HATS[hat] ?? "")
      + `</svg>${name ? `<span class="nm">${esc(name)}</span>` : ""}</span>`);
  }
  const PALETTE = ["#86c96a", "#7fa6e6", "#e8848f", "#f5c84c", "#a68be2", "#5ec2c2", "#f2a65a", "#9fd3e8"];

  /* ---------- Âm thanh tổng hợp (Web Audio, không cần file) ---------- */
  let ctx = null;
  function unlockAudio() {
    if (ctx || !features.sound || !settings.sound) return;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  }
  function tone(f, dur = 0.12, { type = "sine", gain = 0.18, to = null, at = 0 } = {}) {
    if (!ctx || !features.sound || !settings.sound) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.03);
    } catch { /* bỏ qua */ }
  }
  const SFX = {
    tap: () => tone(520, 0.06, { type: "triangle", gain: 0.1, to: 660 }),
    pop: () => tone(380, 0.1, { type: "sine", gain: 0.2, to: 900 }),
    add: () => { tone(660, 0.08, { type: "triangle" }); tone(990, 0.1, { type: "triangle", at: 0.06 }); },
    remove: () => tone(420, 0.14, { type: "triangle", to: 180 }),
    good: () => [660, 880, 1320].forEach((f, i) => tone(f, 0.12, { type: "triangle", at: i * 0.07 })),
    bad: () => { tone(240, 0.18, { type: "square", gain: 0.08, to: 160 }); tone(180, 0.22, { type: "square", gain: 0.07, at: 0.12, to: 110 }); },
    tick: () => tone(1200, 0.03, { type: "square", gain: 0.05 }),
    drum: () => tone(110, 0.12, { type: "sine", gain: 0.35, to: 55 }),
    flip: () => tone(300, 0.18, { type: "sawtooth", gain: 0.06, to: 1200 }),
    win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i > 3 ? 0.3 : 0.14, { type: "triangle", gain: 0.2, at: i * 0.11 })),
    lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.24, { type: "triangle", gain: 0.16, at: i * 0.18 })),
  };
  function sfx(name) { (SFX[name] || SFX.tap)(); }

  /* ---------- Cài đặt (âm thanh + đồ hoạ cao) ---------- */
  const settings = { sound: true, hq: true };
  function applySettings() {
    cssCache = null;
    document.documentElement.classList.toggle("hq", !!settings.hq);
    document.dispatchEvent(new CustomEvent("gameui:settings", { detail: { ...settings } }));
  }
  function setSetting(key, val) {
    settings[key] = !!val; store.set("settings", settings); applySettings();
    if (key === "sound" && val) { unlockAudio(); sfx("pop"); }
  }

  function openSettings({ extra = "" } = {}) {
    const sndTitle = features.haptics ? "Hiệu ứng âm thanh và rung" : "Hiệu ứng âm thanh";
    const row = (key, title, desc) => `<div class="setting"><div class="txt"><b id="st-${key}">${title}</b><small>${desc}</small></div>
      <button class="tog" data-key="${key}" aria-labelledby="st-${key}" aria-pressed="${settings[key]}"></button></div>`;
    return sheet({
      title: `<span class="ol h2">Cài <span class="y">đặt</span></span>`,
      body: (features.sound ? row("sound", "Âm thanh", sndTitle) : "") + row("hq", "Đồ hoạ cao", "Bóng đổ và chiều sâu. Tắt để máy chạy nhẹ hơn") + extra,
      actions: [{ label: "Xong", cls: "green", value: true }],
      onMount(box) {
        box.addEventListener("click", (e) => {
          const t = e.target.closest(".tog"); if (!t) return;
          const on = t.getAttribute("aria-pressed") !== "true";
          setPressed(t, on); setSetting(t.dataset.key, on);
        });
      },
    });
  }

  /* ---------- Toast ---------- */
  function toast(msg, { type = "", ms = 2200 } = {}) {
    let host = $(".toasts");
    if (!host) { host = document.createElement("div"); host.className = "toasts"; host.setAttribute("role", "status"); host.setAttribute("aria-live", "polite"); document.body.append(host); }
    const t = document.createElement("div");
    t.className = "toast " + type; t.textContent = msg; host.append(t);
    if (type === "err") { sfx("bad"); buzz(40); } else if (type === "ok") sfx("good");
    setTimeout(() => { t.classList.add("bye"); setTimeout(() => t.remove(), 220); }, ms);
  }

  /* ---------- Modal / sheet ---------- */
  function sheet({ title = "", body = "", actions = [], dismiss = true, onMount } = {}) {
    return new Promise((resolve) => {
      const prev = document.activeElement;
      const veil = document.createElement("div");
      veil.className = "veil";
      veil.innerHTML = `<div class="panel modal" role="dialog" aria-modal="true" aria-labelledby="mdl-t">
        <h2 id="mdl-t" class="center" style="text-align:center">${title}</h2>
        <div class="col">${body}</div>
        <div class="acts ${actions.length === 1 ? "one" : ""}">${actions.map((a, i) =>
          `<button class="btn big ${esc(a.cls || "")}" data-i="${i}">${esc(a.label)}</button>`).join("")}</div></div>`;
      document.body.append(veil);
      const box = $(".modal", veil);
      const close = (v) => {
        document.removeEventListener("keydown", onKey);
        veil.classList.add("bye"); setTimeout(() => veil.remove(), 180);
        try { prev && prev.focus && prev.focus(); } catch {}
        resolve(v);
      };
      const onKey = (e) => {
        if (e.key === "Escape" && dismiss) close(undefined);
        if (e.key === "Tab") { // bẫy focus
          const f = $$("button,input,select,textarea,[tabindex]:not([tabindex='-1'])", box);
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
          else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
        }
      };
      document.addEventListener("keydown", onKey);
      veil.addEventListener("click", (e) => {
        if (e.target === veil && dismiss) return close(undefined);
        const b = e.target.closest("[data-i]"); if (b) close(actions[+b.dataset.i].value);
      });
      onMount && onMount(box, close);
      sfx("pop");
      const first = actions.findIndex((a) => a.focus); // mặc định focus nút an toàn
      ($(`[data-i="${first >= 0 ? first : 0}"]`, box) || box).focus();
    });
  }
  // Xác nhận thao tác không hoàn tác. Nút đỏ gọi ĐÚNG tên hành động.
  function confirm({ title, text = "", ok, cancel = "Ở lại" }) {
    if (!ok) throw new Error("GameUI.confirm: cần 'ok' là tên hành động, ví dụ 'Loại!'");
    return sheet({
      title: `<span class="ol h2">${title}</span>`,
      body: text ? `<p class="center" style="margin:0;text-align:center">${text}</p>` : "",
      actions: [{ label: cancel, cls: "blue", value: false, focus: true }, { label: ok, cls: "red", value: true }],
    }).then((v) => v === true);
  }

  /* ---------- Màn ---------- */
  let current = null;
  function show(id) {
    const next = document.getElementById(id); if (!next || next === current) return;
    $$(".screen.on").forEach((s) => s.classList.remove("on"));
    next.classList.add("on"); current = next;
    const h = $("h1,h2", next); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    scrollTo({ top: 0 });
    next.dispatchEvent(new CustomEvent("screen:show", { bubbles: true }));
  }

  /* ---------- Bí mật: chỉ có trong DOM khi đang xem ---------- */
  function peek(el, html) {
    el.innerHTML = html;
    const hide = () => { el.innerHTML = ""; document.removeEventListener("visibilitychange", onVis); };
    const onVis = () => { if (document.hidden) hide(); };
    document.addEventListener("visibilitychange", onVis);
    return hide;
  }

  /* ---------- Khoảnh khắc lớn: hồi hộp → lật → kết quả ---------- */
  // flipEl: phần tử .flip có .in > .front + .back. back là nơi điền kết quả (qua fill()).
  async function reveal(flipEl, { fill, suspense = 1500, onDone } = {}) {
    const fast = reduced();
    flipEl.classList.remove("open");
    if (!fast) {
      flipEl.classList.add("suspense");
      const beats = Math.round(suspense / 220);
      for (let i = 0; i < beats; i++) {
        if (i === Math.floor(beats * 0.6)) flipEl.classList.add("hard");
        sfx("drum"); if (i % 2) buzz(15);
        await wait(Math.max(110, 260 - i * 14));
      }
      flipEl.classList.remove("suspense", "hard");
    }
    fill && fill($(".back", flipEl));
    flipEl.classList.add("open"); sfx("flip"); buzz([30, 40, 60]);
    await wait(fast ? 50 : 650);
    onDone && onDone();
  }

  /* ---------- Pháo giấy ---------- */
  function confetti(colors = ["var(--yellow)", "var(--green)", "var(--red)", "var(--blue)"], n = 60) {
    if (reduced()) return;
    const host = document.createElement("div"); host.className = "confetti"; host.setAttribute("aria-hidden", "true");
    let html = "";
    for (let i = 0; i < n; i++) {
      html += `<i style="left:${Math.random() * 100}%;background:${colors[i % colors.length]};--x:${(Math.random() * 160 - 80) | 0}px;--r:${(Math.random() * 900 + 200) | 0}deg;--d:${(1.4 + Math.random() * 1.4).toFixed(2)}s;animation-delay:${(Math.random() * 0.4).toFixed(2)}s;${settings.hq ? "" : "border-radius:2px"}"></i>`;
    }
    host.innerHTML = html; document.body.append(host);
    setTimeout(() => host.remove(), 3400);
  }
  function celebrate({ colors, avatars = [] } = {}) {
    sfx("win"); buzz([60, 40, 60, 40, 120]); confetti(colors);
    avatars.forEach((a) => { a.classList.remove("jump"); void a.offsetWidth; a.classList.add("jump"); });
  }

  /* ---------- Chữ bật (combo, +điểm) ---------- */
  function burst(text, x, y, { cls = "ol", host = document.body } = {}) {
    const b = document.createElement("div");
    b.className = "burst " + cls; b.textContent = text;
    b.style.left = x + "px"; b.style.top = y + "px"; b.style.position = host === document.body ? "fixed" : "absolute";
    host.append(b); setTimeout(() => b.remove(), 1200);
  }

  /* ---------- Bầu trời ---------- */
  function sky(clouds = 4) {
    if ($(".sky")) return;
    const s = document.createElement("div"); s.className = "sky"; s.setAttribute("aria-hidden", "true");
    for (let i = 0; i < clouds; i++) {
      s.insertAdjacentHTML("beforeend", `<i class="cloud" style="--y:${6 + i * 13}%;--w:${110 + (i * 47) % 90}px;--d:${60 + i * 17}s;--dl:-${i * 19}s;--x0:${10 + i * 22}%"></i>`);
    }
    document.body.prepend(s);
  }

  /* ---------- Màu thương hiệu: sinh -d / -l từ một mã màu ---------- */
  // Cùng thuật toán với scripts/palette.py (đổi một nơi thì đổi cả hai).
  const SHADE = { darkDrop: 0.115, satTarget: 0.55, satPull: 0.65, lightL: 0.91, minDarkL: 0.18 };
  function hexToHsl(hex) {
    const h = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.length === 3 ? h[i / 2] + h[i / 2] : h.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    if (!d) return [0, 0, l];
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [hue / 6, s, l];
  }
  function hslToHex(h, s, l) {
    const f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const rgb = s ? [f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)] : [l, l, l];
    return "#" + rgb.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
  }
  function shades(hex) {
    const [h, s, l] = hexToHsl(hex);
    return {
      base: hex.toLowerCase(),
      dark: hslToHex(h, s + (SHADE.satTarget - s) * SHADE.satPull, Math.max(l - SHADE.darkDrop, SHADE.minDarkL)),
      light: hslToHex(h, Math.min(s, 0.9), SHADE.lightL),
    };
  }
  // theme({ yellow: "#ff9f1c" }) -> đặt --yellow, --yellow-d, --yellow-l. Cặp luôn đổi cùng nhau.
  // Màu cảnh (sky/ground) không có cặp -d: đặt thẳng bằng CSS :root.
  function theme(colors = {}, scope = document.documentElement) {
    Object.entries(colors).forEach(([name, hex]) => {
      const c = shades(hex);
      scope.style.setProperty(`--${name}`, c.base);
      scope.style.setProperty(`--${name}-d`, c.dark);
      scope.style.setProperty(`--${name}-l`, c.light);
    });
    cssCache = null;
  }

  function style(name = "ink-candy") {
    const profile = String(name).toLowerCase().replace(/\s+/g, "-");
    const selected = STYLE_PROFILES[profile] ? profile : "ink-candy";
    features.style = selected;
    loadFonts(selected);
    document.documentElement.dataset.style = selected;
    cssCache = null;
    return selected;
  }

  /* ---------- Bố cục: mobile | landscape | desktop | auto ---------- */
  // Thêm class lên <html>: .desk (màn rộng: desktop hoặc ngang), .land (ngang, thấp)
  let mqDesk, mqLand;
  function applyLayout() {
    const L = features.layout, h = document.documentElement;
    const land = L === "landscape" || (L === "auto" && mqLand.matches);
    const desk = L === "desktop" || land || (L === "auto" && mqDesk.matches);
    h.classList.toggle("desk", desk); h.classList.toggle("land", land);
    h.dataset.layout = L;
  }

  /* ---------- Khởi tạo ---------- */
  // Mọi tuỳ chọn ở đây lấy từ CÂU TRẢ LỜI của người dùng (xem SKILL.md Bước 0), không tự đoán.
  let started = false;
  function init({ id = "game", clouds = 4, sound = true, haptics = sound, layout = "auto", style: visualStyle = "ink-candy", fonts = true, sky: useSky = true, colors } = {}) {
    NS = id;
    Object.assign(features, { sound: !!sound, haptics: !!haptics, layout, fonts });
    style(visualStyle);
    colors && theme(colors);
    // Gọi lại an toàn (React StrictMode, hot reload): chỉ cập nhật tuỳ chọn, không gắn trùng listener.
    if (started) { applyLayout(); Object.assign(settings, store.get("settings", {})); if (!features.sound) settings.sound = false; applySettings(); return; }
    started = true;
    mqDesk = matchMedia("(min-width: 900px)");
    mqLand = matchMedia("(orientation: landscape) and (max-height: 520px)");
    [mqDesk, mqLand].forEach((m) => m.addEventListener && m.addEventListener("change", applyLayout));
    applyLayout();
    Object.assign(settings, store.get("settings", {}));
    if (!features.sound) settings.sound = false;
    applySettings(); if (useSky) sky(clouds);
    const unlock = () => { unlockAudio(); removeEventListener("pointerdown", unlock); removeEventListener("keydown", unlock); };
    addEventListener("pointerdown", unlock); addEventListener("keydown", unlock);
    // Phím tắt: nút có data-key="Enter|Escape|Space|1…" trong màn đang mở được bấm bằng phím đó.
    // .btn có data-key tự hiện gợi ý <kbd> (CSS chỉ hiện khi có chuột).
    const KEYNAME = { Enter: "Enter", Escape: "Esc", " ": "Space", Space: "Space" };
    $$(".btn[data-key]").forEach((b) => { if (!$("kbd", b)) b.insertAdjacentHTML("beforeend", `<kbd>${esc(KEYNAME[b.dataset.key] || b.dataset.key)}</kbd>`); });
    document.addEventListener("keydown", (e) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || $(".veil")) return;
      const tag = (e.target.tagName || "").toLowerCase();
      if ((tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) && e.key !== "Escape") return;
      if (tag === "button" && (e.key === "Enter" || e.key === " ")) return; // để nút đang focus tự xử lý
      const k = e.key === " " ? "Space" : e.key;
      const b = $$(`.screen.on [data-key]`).find((x) => x.dataset.key === k && !x.disabled && x.offsetParent);
      if (b) { e.preventDefault(); b.click(); }
    });
    // Âm "tap" cho mọi nút; game có thể tắt bằng data-sfx="none" hoặc chọn âm khác: data-sfx="add"
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".btn,.rbtn,.choice,.seg button");
      if (!b || b.disabled) return;
      const s = b.dataset.sfx; if (s !== "none") sfx(s || "tap");
    });
  }

  root.GameUI = {
    init, theme, style, STYLE_PROFILES, shades, features, $, $$, wait, esc, store, buzz, sfx, SFX, tone, settings, setSetting, openSettings,
    setText, setAttr, setPressed, meter, icon, ICONS: PATHS, avatar, HATS, MOODS, PALETTE,
    toast, sheet, confirm, show, peek, reveal, confetti, celebrate, burst, sky,
  };
})(window);
