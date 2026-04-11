---
name: ant-design-table-page
description: Builds or extends Ant Design table screens in Inertia React pages. Use when adding tables, filters, pagination, column settings, drag-and-drop headers, bulk actions, or axios/Inertia data reloads on index pages.
---

# Ant Design table / list page

## Reference implementation

Start from a working index page and copy structure: `resources/js/Pages/InsertionOrder/InsertionOrderIndex.jsx` plus its helpers under `resources/js/Pages/InsertionOrder/Helpers/` (e.g. `InsertionOrderIndexProps` for `styles`, default columns).

For a second example with the same patterns, see `resources/js/Pages/RingbaInsertionOrder/RingbaInsertionOrderIndex.jsx`.

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
- `@/Helpers/AddTableDetails` and `TableDetails` / `columnsData` props when the feature persists column layout (see insertion order flow).

## Pagination and filters

- Follow the controller contract: e.g. `itemPerPage`, `page`, `filterByStatus` query params if the backend expects them (`InsertionOrderController@index`).
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
