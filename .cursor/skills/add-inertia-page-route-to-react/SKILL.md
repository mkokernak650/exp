---
name: add-inertia-page-route-to-react
description: >-
  Adds or extends an Inertia page end-to-end: Laravel route, controller, React page, and props.
  Use when creating a new authenticated page, wiring a GET index/show/create form, or connecting
  `Inertia::render` to `resources/js/Pages`.
---

# Add an Inertia page (route → controller → React)

## Example prompts (best practice)

Use prompts that name the feature, URL shape, and data you need so the agent mirrors an existing flow end-to-end.

- **New index page**: “Add an authenticated GET index at `/settings/widget-inventory` named `settings.widget-inventory` that lists widgets from `WidgetController@index`. Create `resources/js/Pages/Settings/WidgetInventory.jsx`, follow `Settings/AffiliateReport.jsx` for layout and props, and pass only `widgets` + pagination meta from `Inertia::render`.”
- **Show/detail**: “Add `GET /campaigns/{campaign}/summary` with route name `campaigns.summary`, `CampaignController@summary`, and `resources/js/Pages/Campaign/CampaignSummary.jsx`. The page needs the campaign, its annotations (eager loaded), and Ziggy-safe links back to the campaign edit page.”
- **Create form (GET + POST)**: “Wire `GET/POST /foo-bars/create` and `foo-bars.store` like the existing create pattern in this app: Form Request validation on store, policy check, `Inertia::render` for the form with dropdown options as props, and on success redirect with flash.”
- **Extend existing page**: “The Affiliate Report page already exists; add a new prop `regions` from `AffiliateController@affiliateReport` and render a filter `<Select>` without changing route names or breaking `route('affiliate.report')`.”

## Reference implementation

Mirror an existing flow end-to-end: `AffiliateController@affiliateReport` → `routes/web.php` (route name `affiliate.report`, path `/affiliate-report`) → `resources/js/Pages/Settings/AffiliateReport.jsx`.

## Workflow

1. **Route** (`routes/web.php`)
   - Add routes inside `Route::middleware('auth')->group(...)` unless the feature must be public (then follow existing `*PublicController` patterns).
   - Use `->name('...')` on every route that the front end or Ziggy will call.
   - Match HTTP verb and URL style used by neighboring routes (kebab paths, `Route::post` for actions that mutate).

2. **Controller** (`app/Http/Controllers/`)
   - Add or extend a controller method; `use Inertia\Inertia;` and return `Inertia::render('Folder/PageName', $props)`.
   - The first argument is the path under `resources/js/Pages/` without extension (e.g. `Settings/AffiliateReport`).
   - Pass only props the page needs; eager load relationships to avoid N+1 (see `AffiliateController@affiliateReport`).
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
