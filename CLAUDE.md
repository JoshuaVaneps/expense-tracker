# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commits

Do not add `Co-Authored-By: Claude` / `Co-Authored-By: ... Anthropic ...` trailers, or any other Claude or Anthropic attribution, to commit messages in this repository. Write the message as the author's own.

## Commands

```bash
npm install
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the built dist/
npm run lint     # ESLint over the repo
```

There is no test framework or test script in this project.

### Node version

Vite 7 requires Node `^20.19.0 || >=22.12.0`. **The machine does not currently meet that.** The only Node on it is `v20.9.0` at `C:\Program Files\nodejs` — a hair below the floor — and nvm is not installed (no `nvm.exe` in any standard location, `NVM_HOME` unset). So `nvm use` is not available; an earlier version of this file claimed otherwise.

The symptom is `TypeError: crypto.hash is not a function` out of Vite's dependency optimizer. It only kills `npm run dev` — `npm run build`, `npm run preview`, and `npm run lint` all still work on v20.9.0, so a change can be built and served even when the dev server won't start.

Until Node is upgraded system-wide, the way to get `npm run dev` running is a portable Node 22: download `node-v22.x.x-win-x64.zip` from `https://nodejs.org/dist/`, extract it (use `tar -xf` — `Expand-Archive` fails here), then prepend that folder to `PATH` for the one command:

```powershell
$env:PATH = "<extracted>\node-v22.x.x-win-x64;" + $env:PATH; npm run dev
```

Keep the npm that ships with Node 20/22 (npm 10+), which writes `package-lock.json` at lockfileVersion 3. An npm 6 would rewrite the lockfile down to version 1; if that shows up in a diff, revert it and reinstall on a modern Node.

### Dev server staleness

Vite's file watcher on this OneDrive-synced folder **misses whole-file overwrites** — editing a component by replacing the file can leave a long-running dev server serving the previous version indefinitely, with no HMR event and no error. If a change is not showing up in the browser, confirm what is actually being served before re-editing the code:

```powershell
Invoke-WebRequest -Uri "http://localhost:5173/src/components/CategoryChart.jsx" -UseBasicParsing
```

Vite serves the transformed source at that path. If it does not contain the edit, restart the dev server rather than debugging the component. Note that a second `npm run dev` does not replace the stale one — it takes port 5174 and leaves 5173 serving the old code.

## Architecture

A Vite + React 19 single-page app, JSX only (no TypeScript), scaffolded from the Vite React template. `index.html` → `src/main.jsx` (mounts `<App />` in `StrictMode`) → `src/App.jsx`. No router, no context, no state library. Recharts is the only runtime dependency beyond React.

```
App                                            transactions + period state, add/delete
├── Summary          transactions              balance, meter, running-balance sparkline
├── CategoryChart    transactions              derives expense totals per category
├── TransactionForm  onAdd                     owns the 4 form fields
└── TransactionList  transactions, onDelete    owns the 2 filters
```

The three data children receive the **period-filtered** list, not the raw one, so the month selector in the masthead moves the whole page at once.

**`App` is the only component that owns shared data.** It holds the `transactions` array, `addTransaction` / `deleteTransaction`, and the selected `period` — and nothing else. Every other piece of state is local to the component that reads it. The period earns its place up here because all three siblings render the same window of time; the list's own type and category filters do not, so they stay in the list.

Two guards on the period that are easy to delete by accident:

- **`activePeriod` falls back to `"all"` when the selected month is no longer in the data.** Deleting the last entry of a month would otherwise leave the select pointing at a month that does not exist.
- **Adding a transaction resets the period to `"all"`.** New entries are stamped with today; if an older month were on screen the row would land outside the window and the add would look like it silently failed. The form's four fields live in `TransactionForm`; the two filters live in `TransactionList`. Don't lift state back to `App` unless a sibling genuinely needs it.

The split of responsibility on add: `TransactionForm` collects the user-entered fields and calls `onAdd({ description, amount, type, category })`; `App` stamps `id` (`Date.now()`) and `date`. Keep record-shape concerns in `App` — the form should not invent ids or timestamps.

`deleteTransaction` filters by `id`, never by index. `TransactionList` renders a filtered subset, so a row's position there does not correspond to its position in the source array — an index-based delete removes the wrong record whenever a filter is active.

Everything is derived-on-render rather than stored. `Summary` recomputes the three totals from the transactions prop on each render, and `TransactionList` recomputes `filteredTransactions`. Note that `Summary` receives the **unfiltered** list on purpose: the totals reflect all transactions regardless of what the list is filtered to.

### The hero

`Summary` is the page's thesis, not a row of equal cards: the balance is the headline figure, captioned *in the black* / *in the red* (the figure itself switches to `--debit` when negative), over a meter showing what share of income has been spent. `spentShare` is clamped with `Math.min(…, 1)` so the fill never overruns its track when spending outruns income, and the three zero-income cases are branched explicitly — dividing by a zero income otherwise puts `Infinity%` or `NaN%` on screen.

Beneath it sits a hand-rolled SVG sparkline of the running balance in date order (Recharts is not involved — a polyline needs no chart engine). Two decisions there:

- **It scales to the data's own min/max, not to zero.** Anchoring to zero is more honest about absolute magnitude, but when the balance is large relative to its swings it flattens the curve into a featureless line, and shape is the only thing a 56px-tall sparkline can convey.
- **The stroke uses `vectorEffect="non-scaling-stroke"`.** The viewBox is squashed by `preserveAspectRatio="none"`, which would otherwise stretch the line weight along with it.

It renders only with two or more entries; one point is not a trend.

### The chart

`CategoryChart` is a Recharts vertical `BarChart` of expense totals per category — `type === "expense"` only, so it does not mirror `Summary`'s income figure. Like everything else it derives on render from the `transactions` prop and holds no state.

Two things there are deliberate and easy to break:

- **Color is keyed to the category, not to the bar's position.** Each `Cell` carries `categoryClass(category)` — `cat-food`, `cat-housing` — and CSS paints it. The bars are sorted by amount descending, so an index-into-the-sorted-data lookup (or a `% colors.length` cycle) would repaint every category whenever the amounts reorder.
- **The hues are a validated set, not arbitrary.** Both modes clear colorblind-separation, lightness and chroma checks against their own surface. In light mode three of them sit below 3:1 contrast, which is why every bar carries a visible x-axis name and a value label above it — don't drop those labels. The dark steps all clear 3:1.
- **The `fill` prop on `<Bar>` is a fallback, not the real color.** Presentation attributes lose to any stylesheet rule, so the `.cat-*` classes always win; the attribute only shows for a category with no CSS rule.
- **The tooltip carries each category's share of spending.** At an ~80:1 range between the largest and smallest category the short bars convey nothing on their own, so the percentage is what makes them legible.

`src/constants.js` holds `CATEGORIES` and the `categoryClass` helper. The hues themselves live in `src/index.css` as `--cat-*` tokens with a matching `.cat-*` rule each, **because they have to change between light and dark mode and a JS array cannot answer a media query**. Each `.cat-*` rule sets both `fill` and `background-color`, so the same class paints the chart's SVG bars and the list's dots; each element simply ignores the property that does not apply to it.

Adding a category therefore means three edits in two files: the name in `CATEGORIES`, the `--cat-<name>` pair (light and dark) in `index.css`, and the `.cat-<name>` rule beside them. It lives in its own module rather than being passed down from `App`, to avoid prop-drilling a static array to two siblings.

Transactions are seeded inline in `App`'s `useState` initializer and exist only in memory: no backend, no `localStorage`, no persistence. A reload resets to the seed data.

### Known quirks in the starter

- **`amount` must stay a number.** The starter shipped it as a string in both the seed data and the submit handler, which made `reduce((sum, t) => sum + t.amount, 0)` concatenate instead of add. That is fixed — seed amounts are numeric literals and `TransactionForm` wraps the input with `Number(amount)`, since `<input type="number">` still yields a string. Keep that coercion when touching the form.
- Amounts are no longer rendered raw. Every figure goes through `formatCurrency` in `src/format.js` (an `Intl.NumberFormat` currency formatter), which is what keeps float noise like `$1234.5600000000001` off the screen. `formatDate` lives there too, and deliberately splits the ISO string instead of using `new Date(iso)` — the latter parses as UTC midnight and renders as the previous day in any negative-offset timezone.
- Seed row 4 ("Freelance Work", category `salary`) used to be typed `expense`, which put an $800 `salary` bar inside a chart titled "Spending by category". It is now `income`, which is what it always should have been.
- Deleting a row goes through `window.confirm`. That blocks Chrome automation, so any browser-driven test must stub it first (`window.confirm = () => true`) rather than let the real dialog open.

### Styling

Plain CSS, no framework or CSS modules. `src/index.css` holds the reset **and the design tokens** — every color, font family and radius is a custom property on `:root` there, so nothing downstream hardcodes a hex. `src/App.css` carries the styling for **every** component, keyed to semantic class names (`.app`, `.hero`, `.income-amount`, `.filters`, …) and referencing those tokens.

The visual direction is a *ledger instrument*: cool paper (`--paper`), white cards, and income/expense rendered as printed **inks** (`--credit` deep forest, `--debit` deep brick) rather than bright signal green/red. Three typefaces do three jobs — Newsreader for the wordmark and card titles, Instrument Sans for UI, Roboto Mono for every currency figure via the `.figure` class, which also sets `tabular-nums` so columns align. They load from Google Fonts in `index.html`, with fallbacks. Roboto Mono is deliberate: IBM Plex Mono ships a slashed zero that reads as a strikethrough across a trailing `.00` at 14px.

**Dark mode is selected, not flipped.** It is a `prefers-color-scheme` media query that re-points the same tokens — there is no toggle and no persisted preference, so it follows the OS and adds no state. The category hues in it are the palette's own **dark steps**, re-validated against the dark card, not the light hues lightened. `color-scheme` is set on `:root` in both modes so native selects and inputs render to match.

**`--card` is the chart's surface, and its color is what the category hues are validated against** — `#ffffff` in light, `#161b24` in dark. Retinting either one invalidates that check; re-run the validator if you change them.

Amount cells carry a **magnitude rule**: a 3px bar under the figure, scaled to the largest amount currently visible so it rescales with the filters. It sits *under* the number rather than behind it because a wash behind the text is narrower than the text at small values and reads as a stray highlight on half a figure, and it has a `min-width` floor because the ~80:1 range would otherwise round the smallest rows to nothing.

Two CSS traps already hit here, both worth remembering:

- **Specificity.** `.ledger th` (0,1,1) beats a bare `.col-amount` (0,1,0), so column modifiers are written `.ledger th.col-amount, .ledger td.col-amount`. A bare class silently loses and the header drifts out of alignment with its column.
- **Grid tracks use `minmax(0, 1fr)`, never a bare `1fr`.** A bare track keeps `min-width: auto`, so a wide child (the chart) props the grid open and the page scrolls sideways on a phone.

The stylesheet was deliberately not split per component when the components were extracted: `.income-amount` / `.expense-amount` are shared between `Summary`'s totals and `TransactionList`'s amount cells (both use them to drive the credit/debit ink), so moving them into a per-component file would break one of the two. `App.css` is imported once by `App.jsx` and applies globally from there — child components import no CSS of their own.
