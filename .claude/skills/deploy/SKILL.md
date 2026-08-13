---
name: deploy
description: Deploy this app to GitHub Pages - run the verification gate, build the production bundle, then push main so the Pages workflow publishes it. Use when asked to deploy, ship, release, publish, or put the site live.
---

# Deploy to GitHub Pages

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

## 4. Publish

Deployment is handled by `.github/workflows/deploy.yml`, which runs on every
push to `main` (and can be re-run by hand from the Actions tab). So publishing
means getting the work onto `main` — there is no separate deploy command, and
nothing is uploaded from this machine.

**Confirm with the user before pushing.** It is the only step that leaves the
machine, and it puts the site in front of anyone with the URL. State the branch,
the commit, and the live URL, then wait for a clear yes:

> Ready to publish `main` (05da343 "Restyle the app as a ledger instrument") to
> https://joshuavaneps.github.io/expense-tracker/. Confirm?

If the work is on a feature branch, merge it first — say so rather than pushing
the branch and wondering why nothing deployed:

```bash
git checkout main && git merge --ff-only <branch>
git push origin main
```

Then watch the run. Without the `gh` CLI on this machine you cannot stream it,
so point the user at `https://github.com/JoshuaVaneps/expense-tracker/actions`
and say the deploy takes a minute or two. **Do not report the site as live
until the run has actually succeeded** — a green push is not a green deploy.

Two failure modes worth recognising rather than retrying blindly:

- **The workflow never starts.** Pages is not enabled, or its source is not set
  to GitHub Actions. That is a repository settings change only the owner can
  make: Settings → Pages → Source: GitHub Actions.
- **The page loads blank with 404s on `/assets/...`.** The `--base` flag in the
  workflow's build step does not match the repo name. It must be `/<repo>/` for
  a project site. It lives in the workflow rather than `vite.config.js` so that
  local dev and preview keep serving from the root.

Do not create tags or GitHub releases unless separately asked.

## Reporting

Close with what actually happened, in one short block:

- which branch and commit went out
- what the gate was (`npm test`, or lint with the no-suite caveat)
- build result, including the `dist/` sizes Vite printed
- the push result

If you stopped early, say which step failed and paste its real output. A deploy
that did not finish is reported as not finished.
