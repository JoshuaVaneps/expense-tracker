---
name: deploy
description: Deploy this app to staging - run the verification gate, build the production bundle, then push to the staging branch on origin. Use when asked to deploy, ship, release, or push to staging.
---

# Deploy to staging

Four steps, in order: **preflight → gate → build → push**. Each step must pass
before the next one runs. If a step fails, stop and report the actual output —
never continue past a failure, and never work around one by skipping the step.

## 1. Preflight

Check all of these before running anything:

- **Working tree is clean.** `git status --short`. Uncommitted changes do not
  reach staging, because the push sends committed history, not the working tree.
  If the tree is dirty, stop and ask whether to commit first — do not stash or
  commit on your own initiative.
- **Note the branch.** `git rev-parse --abbrev-ref HEAD`. Deploying from a
  feature branch is allowed; just say which branch is going out.
- **`node_modules` exists.** If not, run `npm install` first.

## 2. Gate

If `package.json` has a `test` script, that is the gate:

```bash
npm test
```

**There is currently no test script in this project** — no test framework is
installed at all. Until one is added, the gate is:

```bash
npm run lint
```

When you fall back to lint, **say so explicitly in your report**: the build was
verified by ESLint only and no test suite exists. Do not describe a lint pass as
"tests passed." If someone later adds a `test` script, this skill picks it up
with no edit.

## 3. Build

```bash
npm run build
```

This must produce `dist/` with no errors. Vite prints a chunk-size warning about
the bundle exceeding 500 kB — that warning is expected (Recharts is large) and is
not a failure. A non-zero exit code is a failure.

Note on Node: this machine's Node is v20.9.0, just below Vite 7's floor, so it
prints an engine warning. `npm run build` and `npm run lint` still work on it;
only `npm run dev` is broken. See the Node section of CLAUDE.md. The engine
warning is not a deploy failure.

## 4. Push to staging

**Confirm with the user before this step.** It is the only step that leaves the
machine, and it overwrites whatever is on the staging branch. State what is about
to happen — source branch, target, and the commit going out — and wait for a
clear yes:

> Ready to deploy `add-category-chart` (cff140c "Add spending-by-category
> bar chart") to `origin/staging`, overwriting what's there. Confirm?

Then:

```bash
git push origin HEAD:staging --force-with-lease
```

`--force-with-lease`, not `--force`: staging is a redeployable target so it gets
overwritten each time, but the lease still aborts the push if the remote moved in
a way you have not seen. If the lease is rejected, **stop and report it** — a
rejection means someone else pushed to staging. Do not re-run with `--force`.

Do not push to `main` as part of a deploy. Do not create tags or GitHub releases
unless separately asked.

## Reporting

Close with what actually happened, in one short block:

- which branch and commit went out
- what the gate was (`npm test`, or lint with the no-suite caveat)
- build result, including the `dist/` sizes Vite printed
- the push result

If you stopped early, say which step failed and paste its real output. A deploy
that did not finish is reported as not finished.
