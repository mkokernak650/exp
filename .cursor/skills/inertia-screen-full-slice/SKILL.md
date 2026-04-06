---
name: inertia-screen-full-slice
description: Adds or extends a full Inertia screen (Laravel route, controller, React page, props). Use when creating a new authenticated page, wiring a GET index/show/create form, or connecting `Inertia::render` to `resources/js/Pages`.
---

# New Inertia screen (full slice)

## Reference implementation

Mirror an existing flow end-to-end: `InsertionOrderController@index` → `routes/web.php` (`insertion.order` routes) → `resources/js/Pages/InsertionOrder/InsertionOrderIndex.jsx`.

## Workflow

1. **Route** (`routes/web.php`)
   - Add routes inside `Route::middleware('auth')->group(...)` unless the feature must be public (then follow existing `*PublicController` patterns).
   - Use `->name('...')` on every route that the front end or Ziggy will call.
   - Match HTTP verb and URL style used by neighboring routes (kebab paths, `Route::post` for actions that mutate).

2. **Controller** (`app/Http/Controllers/`)
   - Add or extend a controller method; `use Inertia\Inertia;` and return `Inertia::render('Folder/PageName', $props)`.
   - The first argument is the path under `resources/js/Pages/` without extension (e.g. `InsertionOrder/InsertionOrderIndex`).
   - Pass only props the page needs; eager load relationships to avoid N+1 (see `InsertionOrderController@index`).
   - For list pages that support AJAX pagination/filtering, follow the existing pattern: if `request('page')` (or equivalent) is set, return JSON/data only; otherwise return `Inertia::render` with the first load payload.

3. **React page** (`resources/js/Pages/`)
   - Create `PageName.jsx` in the appropriate folder; import `Layout` from `../Layout/Layout` or the path used by sibling pages.
   - Read server props with `usePage().props` from `@inertiajs/inertia-react`.
   - Attach layout: `PageName.layout = (page) => <Layout title="...">{page}</Layout>` (match sibling pages).

4. **Navigation and mutations**
   - Same-document navigation: `@inertiajs/inertia` (`Inertia.get`, `Inertia.post`, etc.) or `<Link>` where the codebase already does.
   - Named routes in JS: `route('name')` / `route('name', id)` (Ziggy) — see `resources/js/Pages/Ecommerce/SalesIndex.jsx` or `GenerateReport/GenerateReportAffiliate.jsx`.

5. **Validation and authorization**
   - For mutating `POST`/`PUT`/`DELETE` actions: validate input (`$request->validate` or Form Requests) and enforce authorization (policies/middleware) on the server.

6. **Shared Inertia props**
   - Global shared props live in `app/Http/Middleware/HandleInertiaRequests.php` (`share` method). Only add keys that truly belong on every response.

## Done checklist

- [ ] Route registered with correct `auth` (or intentional public) middleware and `name()`
- [ ] `Inertia::render` component path matches a file under `resources/js/Pages/`
- [ ] Page uses `usePage().props` keys that the controller actually passes
- [ ] Mutating routes validate input and check permissions
- [ ] No new Composer/npm packages without explicit approval (see project rules)
