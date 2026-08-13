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

Vite 7 requires Node `^20.19.0 || >=22.12.0`. The nvm default here is set to `v22.20.0`, so a fresh shell works with no setup. If `npm run dev` dies with `SyntaxError: Unexpected token '??='`, the shell is on an older Node (the machine has v14 through v24 installed, and this used to default to v14.17.6) — run `nvm use default`. Note that npm 6 from the v14 install rewrites `package-lock.json` down to lockfileVersion 1; if that shows up in a diff, revert it and reinstall on Node 22.

## Architecture

A Vite + React 19 single-page app, JSX only (no TypeScript), scaffolded from the Vite React template. `index.html` → `src/main.jsx` (mounts `<App />` in `StrictMode`) → `src/App.jsx`. No router, no context, no state library.

```
App                                            transactions state + add/delete
├── Summary          transactions              derives income / expenses / balance
├── TransactionForm  onAdd                     owns the 4 form fields
└── TransactionList  transactions, onDelete    owns the 2 filters
```

**`App` is the only component that owns shared data.** It holds the `transactions` array plus `addTransaction` / `deleteTransaction`, and nothing else — every other piece of state is local to the component that reads it. The form's four fields live in `TransactionForm`; the two filters live in `TransactionList`. Don't lift state back to `App` unless a sibling genuinely needs it.

The split of responsibility on add: `TransactionForm` collects the user-entered fields and calls `onAdd({ description, amount, type, category })`; `App` stamps `id` (`Date.now()`) and `date`. Keep record-shape concerns in `App` — the form should not invent ids or timestamps.

`deleteTransaction` filters by `id`, never by index. `TransactionList` renders a filtered subset, so a row's position there does not correspond to its position in the source array — an index-based delete removes the wrong record whenever a filter is active.

Everything is derived-on-render rather than stored. `Summary` recomputes the three totals from the transactions prop on each render, and `TransactionList` recomputes `filteredTransactions`. Note that `Summary` receives the **unfiltered** list on purpose: the totals reflect all transactions regardless of what the list is filtered to.

`CATEGORIES` in `src/constants.js` is the single source of truth for categories — imported by both `TransactionForm` (the category picker) and `TransactionList` (the category filter), so adding one means editing that one array. It lives in its own module rather than being passed down from `App`, to avoid prop-drilling a static array to two siblings.

Transactions are seeded inline in `App`'s `useState` initializer and exist only in memory: no backend, no `localStorage`, no persistence. A reload resets to the seed data.

### Known quirks in the starter

- **`amount` must stay a number.** The starter shipped it as a string in both the seed data and the submit handler, which made `reduce((sum, t) => sum + t.amount, 0)` concatenate instead of add. That is fixed — seed amounts are numeric literals and `TransactionForm` wraps the input with `Number(amount)`, since `<input type="number">` still yields a string. Keep that coercion when touching the form.
- Totals are unformatted, so a decimal amount renders as e.g. `$10.5`, and float addition can surface `$1234.5600000000001`. Wrap the values in `Summary` with `toFixed(2)` if that starts to matter.
- Seed row 4 ("Freelance Work", category `salary`) is typed `expense`, so it counts against Expenses. Left as-is — change it only if you mean to.
- Deleting a row goes through `window.confirm`. That blocks Chrome automation, so any browser-driven test must stub it first (`window.confirm = () => true`) rather than let the real dialog open.

### Styling

Plain CSS, no framework or CSS modules. `src/index.css` is a minimal global reset; `src/App.css` carries the styling for **every** component, keyed to semantic class names (`.app`, `.summary-card`, `.income-amount`, `.filters`, …).

The stylesheet was deliberately not split per component when the components were extracted: `.income-amount` / `.expense-amount` are shared between `Summary`'s cards and `TransactionList`'s amount cells (both use them to drive the green/red coloring), so moving them into a per-component file would break one of the two. `App.css` is imported once by `App.jsx` and applies globally from there — child components import no CSS of their own.
