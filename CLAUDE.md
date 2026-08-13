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

Vite 7 requires Node `^20.19.0 || >=22.12.0`. This machine's nvm default is `v14.17.6`, which fails with `SyntaxError: Unexpected token '??='` before Vite even starts. Run `nvm use 22.20.0` (installed) first, or prefix commands with that version's bin directory.

## Architecture

A Vite + React 19 single-page app, JSX only (no TypeScript), scaffolded from the Vite React template. `index.html` → `src/main.jsx` (mounts `<App />` in `StrictMode`) → `src/App.jsx`.

**Everything lives in `src/App.jsx`.** One `App` component holds all state, all derived values, and all markup — there are no child components, no router, no context, and no state library. State is six `useState` hooks: the `transactions` array plus the controlled inputs for the add-transaction form (`description`, `amount`, `type`, `category`) and the two list filters (`filterType`, `filterCategory`).

Data flow is fully derived-on-render: `totalIncome` / `totalExpenses` / `balance` and `filteredTransactions` are recomputed from `transactions` on every render rather than stored. The `categories` array in `App.jsx` is the single source of truth — it populates both the form's category `<select>` and the filter `<select>`, so adding a category means editing that one array.

Transactions are seeded inline in the `useState` initializer and exist only in memory: there is no backend, no `localStorage`, and no persistence of any kind. A reload resets to the seed data. The only mutation is `handleSubmit`, which appends a new transaction with `Date.now()` as the id.

### Known quirks in the starter

- **`amount` must stay a number.** The starter shipped it as a string in both the seed data and `handleSubmit`, which made `reduce((sum, t) => sum + t.amount, 0)` concatenate instead of add. That is fixed — seed amounts are numeric literals and `handleSubmit` wraps the input with `Number(amount)`, since `<input type="number">` still yields a string. Keep that coercion when touching the form.
- Totals are unformatted, so a decimal amount renders as e.g. `$10.5`, and float addition can surface `$1234.5600000000001`. Wrap the summary values in `toFixed(2)` if that starts to matter.
- Seed row 4 ("Freelance Work", category `salary`) is typed `expense`, so it counts against Expenses. Left as-is — change it only if you mean to.
- `.delete-btn` is styled in `src/App.css` but nothing in `App.jsx` renders it, and the transactions table has a trailing empty `<th>`/`<td>` — placeholders for a delete-row feature that isn't built.

### Styling

Plain CSS, no framework or CSS modules. `src/index.css` is a minimal global reset; `src/App.css` carries all component styling, keyed to the semantic class names used in `App.jsx` (`.app`, `.summary-card`, `.income-amount`, `.expense-amount`, `.balance-amount`, `.filters`, …). Income/expense coloring is driven by swapping `.income-amount` / `.expense-amount` on the amount cell.
