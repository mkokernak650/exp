---
name: build-antd-table-list-pages
description: >-
  Builds or extends Ant Design table and list screens in Inertia React pages. Use when adding
  tables, filters, pagination, column settings, drag-and-drop headers, bulk actions, or axios/Inertia
  data reloads on index pages.
---

# Build Ant Design table and list pages

## Example prompts (best practice)

Name the reference page, the backend query params, and any behaviors (sort, filters, bulk actions) so the agent stays aligned with controller contracts.

- **New table from scratch**: “On `resources/js/Pages/Reports/WidgetReport.jsx`, build an Ant Design table like `Settings/AffiliateReport.jsx`: `usePage().props` for initial rows, `axios` reloads with params the controller expects (match `AffiliateController@affiliateReport` / `WidgetReportController@index`). Include loading state, empty state, and `Pagination`.”
- **Server sort / filters**: “Add `sorter: true` on columns X and Y and send `sortField` / `sortOrder` on reload; update `WidgetReportController@index` to whitelist those columns and `orderBy` safely. Do not add npm packages.”
- **Column settings / DnD**: “Reuse `useReportTableColumns` and `ReportTableDndShell` like `Settings/AffiliateReport.jsx` so users can reorder and resize columns; persist layout if the reference feature does.”
- **Bulk action**: “Add row selection and a bulk delete that matches how `AffiliateReport.jsx` confirms in `ConfirmModal` and posts via `route('...')` to the endpoints the backend already exposes.”

## Reference implementation

Start from a working table page and copy structure: `resources/js/Pages/Settings/AffiliateReport.jsx` plus its helpers under `resources/js/Pages/Settings/Helpers/` (e.g. `AffiliateReportProps` for `fields`, `filter`, default `columns`).

For a second example with similar table patterns, see `resources/js/Pages/RingbaInsertionOrder/RingbaInsertionOrderIndex.jsx`.

## Conventions in this repo

- **Layout and title**: `Layout` from `../Layout/Layout` (or correct relative path); `react-helmet` `Helmet` where already used; `Component.layout = (page) => <Layout title="...">{page}</Layout>`.
- **Table UI**: `antd` — `Table`, `Button`, `Select`, `Pagination`, `Tooltip`, icons from `@ant-design/icons`.
- **Data from server**: `const { ... } = usePage().props` — never assume prop names; align with the controller’s `Inertia::render` array.
- **Loading**: local `useState` for `loading` / `tableLoading` following neighboring lines in the reference page.
- **Feedback**: `react-hot-toast` for success/error when that page already uses it.
- **Modals**: reuse `@/Shared/ConfirmModal` or the same modal pattern as the reference feature.

## Column customization / DnD tables

If the report needs resizable or reorderable columns, reuse existing helpers instead of inventing new ones:

- `@/Helpers/useReportTableColumns`
- `@/Helpers/ReportTableDndShell`
- `@/Components/ColumnSettings`
- `@/Helpers/AddTableDetails` and `TableDetails` / `columnsData` props when the feature persists column layout (see `Settings/AffiliateReport.jsx`).

## Pagination and filters

- Follow the controller contract: e.g. `itemPerPage`, `page`, `filteredValue`, `sortField`, `sortOrder`, `orderBy` if the backend expects them (see `AffiliateController@affiliateReport` and the `axios.get` params in `AffiliateReport.jsx`).
- If the page refetches via `axios.get` with query params, keep the same param names the controller reads.

## Inertia vs axios

- **Initial page load**: data comes from `Inertia::render` props.
- **Subsequent fetches**: this codebase often uses `axios` to the same route with `page` or filters; match the existing page (see reference) for URL building (`window.location.origin` + path or named `route()`).

## Done checklist

- [ ] Imports use `@/` alias consistently with sibling files in the same feature folder
- [ ] Table `columns` and `dataSource` match mapped prop shapes from the backend
- [ ] Loading, empty states, and error feedback match patterns on the reference page
- [ ] Bulk actions / deletes use the same confirmation modal + API style as similar pages
- [ ] No new UI library; stay on Ant Design + existing shared components
