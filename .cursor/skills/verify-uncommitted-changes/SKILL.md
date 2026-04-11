---
name: verify-uncommitted-changes
description: >-
  Checks unstaged and staged git changes for breakages before commit: PHP syntax, Laravel routes,
  PHPUnit, Vite build, and a targeted review (Inertia props, Ziggy routes, query scoping). Use when
  the user asks to verify local changes, check for regressions, sanity-check before commit, or
  confirm nothing is broken.
---

# Verify uncommitted changes

Confirm that **unstaged and staged** edits have not broken the app. Run this workflow **before committing** so problems show up locally, not in production.

## Example prompts (best practice)

Ask for the full verification workflow (automated checks + targeted review), and point the agent at what you care about most.

- **Pre-commit gate**: “Run the verify-uncommitted-changes skill on my working tree. Run the scripted checks from `.cursor/skills/verify-uncommitted-changes/scripts/run-checks.sh` when applicable, then give me the verdict table (SAFE TO COMMIT vs ISSUES FOUND).”
- **Scoped to files you touched**: “I only changed `app/Http/Controllers/CampaignController.php` and `resources/js/Pages/Campaign/CampaignIndex.jsx` — verify uncommitted changes and call out any Inertia prop or Ziggy route mismatches.”
- **After a big merge/rebase**: “Sanity-check all unstaged and staged changes: PHP lint, `route:list`, PHPUnit, `npx vite build`, and ReadLints on changed JSX. Summarize regressions vs warnings.”
- **CI failed locally**: “Vite build failed after my edits — run verify-uncommitted-changes and tell me the first concrete fix.”

## Step 1: Identify what changed

```bash
git diff --name-only
git diff --name-only --cached
git status --short
```

Classify changed files into buckets:

| Bucket | Glob patterns |
|--------|---------------|
| PHP controllers | `app/Http/Controllers/**` |
| PHP models | `app/Models/**` |
| PHP routes | `routes/**` |
| PHP middleware / requests | `app/Http/Middleware/**`, `app/Http/Requests/**` |
| PHP other | `app/**/*.php` not covered above |
| JS/JSX pages | `resources/js/Pages/**` |
| JS/JSX components | `resources/js/Components/**`, `resources/js/Shared/**` |
| JS helpers | `resources/js/Helpers/**` |
| Migrations | `database/migrations/**` |
| Config / env | `config/**`, `.env*` |

If **no** uncommitted changes exist, inform the user and stop.

## Step 2: Automated checks

Run each check; collect pass/fail and output. Skip a check if no files in its bucket changed.

Optional shortcut from the repo root (runs PHP lint, `route:list`, tests, and Vite build when relevant):

```bash
.cursor/skills/verify-uncommitted-changes/scripts/run-checks.sh
```

### 2a. PHP syntax

Lint every changed `.php` file:

```bash
for f in $(git diff --name-only --diff-filter=ACMR | grep '\.php$'); do
  php -l "$f"
done
```

Fail = any file reports a parse error.

### 2b. PHP route registration

```bash
php artisan route:list --columns=method,uri,name 2>&1 | tail -20
```

Fail = command exits non-zero (e.g. a controller reference that does not resolve).

### 2c. PHPUnit tests

```bash
php artisan test --stop-on-failure 2>&1
```

Fail = any test fails. If the suite does not run (missing DB, etc.), note the reason but do not block — report it as a warning.

### 2d. Vite / JS build

```bash
npx vite build 2>&1
```

Fail = non-zero exit or error output. This catches broken imports, JSX syntax errors, and missing modules.

### 2e. Linter diagnostics

Use the `ReadLints` tool on every changed JS/JSX file to check for IDE-reported errors.

## Step 3: Targeted code review

For every changed file, read both the **current** version and the **original** (`git show HEAD:<path>`) and check for the regressions below. Use `git diff` output to focus on changed hunks only — do not re-review unchanged code.

### 3a. PHP controller / model regressions

- **Removed or renamed** public methods that are referenced in routes or other controllers.
- **Changed method signature** (new required params) without updating callers.
- **Broken Eloquent scopes**: removed `where` clauses that previously filtered data (tenant scoping, soft-delete, status filter).
- **Changed return type**: method previously returned `Inertia::render(...)` now returns raw JSON, or vice-versa, without frontend alignment.
- **Removed or reordered** `orderBy` / `paginate` calls that the frontend depends on.
- **SQL injection surface**: new `DB::raw()`/`whereRaw()` using unsanitized request input.
- **Missing validation**: new request inputs consumed without `$request->validate()` or Form Request.

### 3b. Route regressions

- **Deleted or renamed** route names that JS calls via `route('name')` (Ziggy).
- **Changed HTTP verb** (`GET` → `POST` or vice-versa) without updating frontend callers.
- **Middleware removed** from a route that previously required `auth`.

### 3c. JS / JSX page regressions

- **Prop mismatch**: page reads `usePage().props.X` but the controller no longer passes `X`, or the key was renamed.
- **Broken imports**: import path changed or target file deleted/moved.
- **Removed event handlers** or state that other components depend on (e.g. callback props).
- **Ant Design API misuse**: passing removed or renamed props to `<Table>`, `<Select>`, etc.
- **Lost loading / error states**: previously had `loading` state or `try/catch`, now removed.

### 3d. Migration regressions

- **Column rename / drop** without a matching model `$fillable` or `$casts` update.
- **Non-reversible** migration (`down()` is empty or missing) — warn only.
- **Data loss risk**: `dropColumn` or `dropTable` on a table with existing production data.

## Step 4: Cross-cutting checks

These apply regardless of file bucket:

1. **Prop contract**: for every `Inertia::render` call in changed controllers, confirm the JS page still destructures the same prop names.
2. **Ziggy route names**: for every `route('...')` call in changed JS files, confirm the name still exists in `routes/web.php`.
3. **Shared helper changes**: if a file in `resources/js/Helpers/` changed, identify all importers and verify they still call the helper with the correct arguments.
4. **Environment / config**: if `.env.example` or `config/*.php` added new keys, confirm they have sensible defaults or are documented.

## Step 5: Report

Present a structured summary. Use the template below:

```
## Uncommitted changes — verification results

### Automated checks
| Check              | Result | Details |
|--------------------|--------|---------|
| PHP syntax         | PASS / FAIL / SKIP | ... |
| Route registration | PASS / FAIL / SKIP | ... |
| PHPUnit tests      | PASS / FAIL / WARN | ... |
| Vite build         | PASS / FAIL / SKIP | ... |
| Linter diagnostics | PASS / FAIL / SKIP | ... |

### Code review findings
- **Regressions found**: (count)
- **Warnings**: (count)

#### Regressions (must fix)
1. [file:line] Description of the breaking change

#### Warnings (should review)
1. [file:line] Description of the concern

### Verdict
**SAFE TO COMMIT** / **ISSUES FOUND — fix before committing**
```

## Decision rules

- If **any** automated check fails → verdict is **ISSUES FOUND**.
- If code review finds a confirmed breaking change → verdict is **ISSUES FOUND**.
- If only warnings exist (non-breaking concerns) → verdict is **SAFE TO COMMIT** with warnings listed.
- If everything passes → verdict is **SAFE TO COMMIT**.
