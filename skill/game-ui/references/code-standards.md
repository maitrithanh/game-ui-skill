# Code writing standards

Applies to **every language and technology** selected by the user. The goal is for anyone opening a file to understand it immediately, for a change in one place not to break another, and for no two places to do the same job.

When a project has its own conventions (linting, formatting, naming, and directory structure), **follow the project conventions**. The standards below are the baseline when it does not.

## 1. Use what exists; do not rewrite it (the most important rule)

Before writing **any** new function, class, component, or style, check whether it already exists. Priority order:

1. **The skill kit** (`GameUI`, classes in `kit.css`, tokens): toasts, confirmations, modals, sound, storage, reveals, confetti, characters, icons, DOM updates…
2. **Existing project code**: search shared directories (`utils`, `shared`, `common`, `services`, `components`).
3. **Standard libraries / built-in technology features** (`Intl`, `structuredClone`, `Array` methods, `dart:math`, `Foundation`, …).
4. **Write new code**, following sections 2 and 6 below.

Search tool:

```bash
python3 scripts/find_existing.py toast confirm storage --project .
```

The script searches the kit API (`GameUI`, CSS classes) and the project source, including Vietnamese keywords (notification, confirmation, haptics, storage…). If the script is unavailable, use `grep -rn` by function name and behavior.

When you find a similar function that is missing only a small piece:

- **Add a parameter or option** to that function; do not copy it into a second version.
- Do not modify a kit function directly in vendor code; wrap it with a project function, or tell the user if the original behavior must change.

When new code is truly necessary and may be reused elsewhere, put it in a **shared directory** instead of burying it in the first screen that needs it.

**Rule of three**: leave a repeated snippet alone the second time and remember it; extract it into a function the third time. Exception: extract business logic (game rules, scoring) the first time.

## 2. Functions and names

- **One function, one job.** It should be describable in one sentence without the word “and”. Split functions longer than about 30 lines or nested more than three levels.
- **Names should state the action**: verb + object (`addPlayer`, `pickSpy`, `formatScore`). Boolean values start with `is/has/can` (`isGameOver`). Avoid cryptic abbreviations (`tmp`, `d2`, `cb`) and generic names (`data`, `handle`, `process`).
- **At most 3 parameters**; group more into an object with named fields. Avoid confusing boolean flags at the call site: `show(true, false)` is bad, `show({ animated: true })` is clear.
- **Prefer pure functions**: the same input produces the same output, without touching the DOM, network, time, or randomness. Pass external dependencies (clock, `Math.random`) as parameters so they can be tested.
- **Return early** instead of deeply nesting `if` blocks. Handle errors and edge cases first, then write the main path straight through.
- **No hidden side effects.** A function named `getX` must not change state.

## 3. Separate layers

Each file belongs to exactly one layer; upper layers call lower layers, **never the reverse**.

| Layer | Contains | Must not contain |
| --- | --- | --- |
| **data** | game content (words, questions, levels), display strings, configuration | logic, UI |
| **game** (logic) | game rules, scoring, turn selection, state machine | DOM, widgets, sound, storage |
| **services** | sound, storage, networking, haptics | game rules, UI |
| **ui** | screens: `build…` (build once), `update…` (update properties), event wiring | game rules, business calculations |

Why: pure game logic can be tested in a few lines, changing the UI does not affect the rules, and changing the rules does not affect the UI.

## 4. No magic numbers or repeated strings

- Meaningful numbers (`12` maximum players, `1500` ms suspense) become **named constants** at the top of the file or in `config`.
- Colors, sizes, radii, and durations are **always tokens** (`var(--green)`, `tokens.json`); do not hard-code color values or pixel numbers in components.
- Repeated or translatable display strings belong in a content/i18n file, not scattered through logic.

## 5. State and data flow

- **One source of truth** for each piece of data. Do not store the same thing in two places and synchronize it manually; derive secondary values from the source value.
- State changes through **one gateway** (a function or reducer); screens must not each mutate a shared object.
- Use a clear state machine for screen and round flow (`setup → playing → reveal → result`); do not use a chain of unrelated boolean flags (`isPlaying && !isReveal && …`).
- Persist only what must survive (players, settings), through a `store` wrapped in `try/catch`.

## 6. Errors, edge cases, and safety

- Handle **bad input at the edge**: empty, duplicate, too long, too many, or the wrong type. Tell the player how to fix it with a toast instead of continuing until something breaks.
- **Do not swallow errors silently.** Intentional exceptions are storage and haptics (already wrapped in the kit). Every other `catch` must handle or record the error.
- **Escape** user data before putting it into HTML. Do not concatenate strings into commands.
- Do not expose information intended for one player (secret words…) to the DOM or logs before that player’s turn.

## 7. Directory structure (by technology)

Keep the four layers from section 3 and only rename them to match the convention. If the project already has a structure, **place code in the corresponding locations** instead of creating a new structure.

```
Plain Web                    React / Vue / Svelte / Angular        Flutter
├─ index.html                ├─ src/                               ├─ lib/
├─ vendor/ (kit.css, kit.js) │  ├─ game/       (pure logic)         │  ├─ game/
├─ src/                      │  ├─ data/       (content)            │  ├─ data/
│  ├─ game/                  │  ├─ services/   (audio, storage)     │  ├─ services/
│  ├─ data/                  │  ├─ components/ (kit-class wrappers)│  ├─ ui/
│  ├─ services/              │  ├─ screens/ or features/            │  │  ├─ theme/  (tokens)
│  ├─ ui/ (build/update)     │  ├─ hooks/ or composables/            │  │  ├─ widgets/
│  └─ main.js                │  ├─ styles/theme.css (override token)│  │  └─ screens/
└─ styles/theme.css          │  └─ vendor/ (kit.css, kit.js)        │  └─ main.dart

SwiftUI                      Kotlin / Compose                      Unity / C#
├─ Game/                     ├─ game/                              ├─ Scripts/
├─ Data/                     ├─ data/                              │  ├─ Game/
├─ Services/                 ├─ services/                          │  ├─ Data/
├─ UI/Theme, UI/Components   ├─ ui/theme, ui/components            │  ├─ Services/
└─ UI/Screens                └─ ui/screens                         │  └─ UI/
```

General conventions: **one responsibility per file**, filename = its primary output, directories by role (not by file type such as `js/` or `css/` as the project grows), and UI files no longer than about 300 lines (split child screens or components).

## 8. Comments and documentation

- Comments explain **why**, not **what** the code already says. If code needs a comment to explain “what”, rename or split the function instead.
- At the top of each shared file, add one line stating what the file does. Public functions have clear signatures; non-obvious functions get a one-line description and an example.
- Use the project’s existing comment language; for a new project, ask the user (along with the UI language).
- Include a **Design brief** (see `SKILL.md` Step 0) at the top of the main file or README.

## 9. Formatting and tooling

- Run the project formatter/linter (Prettier, ESLint, `dart format`, SwiftFormat, ktlint…) when available. Otherwise keep indentation and semicolon style consistent, use one statement per line, and keep lines ≤ 100 characters.
- Do not leave dead code, debugging `console.log`, unassigned `TODO`s, or unused imports.
- Do not add a library for something the kit or language already handles. Every new library must have a reason explainable in one sentence.

## 10. Example: bad and good

```js
// BAD: duplication, magic numbers, mixed rules and UI, vague names
btn.onclick = () => {
  if (n.length > 12) { document.querySelector('.err').innerText = 'max'; return; }
  const d = JSON.parse(localStorage.getItem('p') || '[]');
  d.push({ n, c: Math.floor(Math.random() * 8) });
  localStorage.setItem('p', JSON.stringify(d));
  list.innerHTML = d.map(x => `<li>${x.n}</li>`).join('');
};

// GOOD: one job per place, reuse the kit, clear names
const MAX_PLAYERS = 12;                                     // data/config

function validateNewPlayer(players, name) {                 // game/players.js (pure)
  if (!name.trim()) return "Nhập tên trước đã nhé!";
  if (players.some((p) => sameName(p.name, name))) return "Tên này đã có rồi!";
  if (players.length >= MAX_PLAYERS) return "Tối đa 12 người thôi nha!";
  return null;
}

function onAddPlayer(name) {                                // ui/setup.js
  const error = validateNewPlayer(state.players, name);
  if (error) return GameUI.toast(error, { type: "err" });   // use the kit toast
  const player = addPlayer(name);                           // game/players.js
  GameUI.store.set("players", state.players);               // use the kit store
  list.insertAdjacentHTML("beforeend", playerRow(player));  // update exactly one row
}
```
