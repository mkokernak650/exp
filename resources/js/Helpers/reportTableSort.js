/**
 * Numeric sorting for report tables (VARCHAR amounts, Ant Design default string sort).
 */

export function parseSortableNumber(value) {
  if (value == null || value === '') return null
  const n = parseFloat(
    String(value)
      .replace(/,/g, '')
      .replace(/[^0-9.-]/g, '')
  )
  return Number.isFinite(n) ? n : null
}

/** Ant Design Table column sorter for one numeric dataIndex. */
export function numericColumnSorter(key) {
  return (a, b) => {
    const na = parseSortableNumber(a[key])
    const nb = parseSortableNumber(b[key])
    if (na == null && nb == null) return 0
    if (na == null) return 1
    if (nb == null) return -1
    return na - nb
  }
}

export function antdSortOrderFromServer(sortField, sortOrder, colKey) {
  if (sortField !== colKey) return undefined
  if (sortOrder === 'asc') return 'ascend'
  if (sortOrder === 'desc') return 'descend'
  return undefined
}

/**
 * @param {object} col - { key, dataType }
 * @param {object} opts
 * @param {Set<string>|string[]} [opts.numericSortColumnKeys]
 * @param {string} opts.sortField
 * @param {string} opts.sortOrder
 * @param {boolean} opts.hasSorter
 */
export function reportTableSorterProps(col, opts) {
  const { numericSortColumnKeys = new Set(), sortField, sortOrder, hasSorter } = opts
  const keys =
    numericSortColumnKeys instanceof Set ? numericSortColumnKeys : new Set(numericSortColumnKeys)
  const useNumeric = col.dataType === 'number' || keys.has(col.key)
  const colSortOrder = antdSortOrderFromServer(sortField, sortOrder, col.key)

  const activeServerSort = sortField === col.key && (sortOrder === 'asc' || sortOrder === 'desc')

  if (!hasSorter) {
    return { sorter: undefined, sortOrder: colSortOrder }
  }

  // Ant Design Table always runs the column sorter on dataSource. Pagination is sorted on the
  // server; re-sorting here can scramble rows (e.g. formatted numbers, key mismatches). Stable
  // sort with an always-zero compare preserves the API order for the active column.
  if (activeServerSort) {
    return {
      sorter: () => 0,
      sortOrder: colSortOrder,
    }
  }

  return {
    sorter: useNumeric ? numericColumnSorter(col.key) : true,
    sortOrder: colSortOrder,
  }
}

export function createAntdColumnBase(col, overrides = {}) {
  return {
    key: col.key,
    dataIndex: col.key,
    title: col.title || '',
    width: col.style?.width || col.width,
    ...overrides,
  }
}

export function clientColumnSorter(col, numericSortColumnKeys = new Set()) {
  const keys =
    numericSortColumnKeys instanceof Set ? numericSortColumnKeys : new Set(numericSortColumnKeys)
  const useNumeric = col.dataType === 'number' || keys.has(col.key)
  if (useNumeric) return numericColumnSorter(col.key)
  if (col.dataType === 'date') return (a, b) => new Date(a[col.key] || 0) - new Date(b[col.key] || 0)
  if (col.dataType === 'string') {
    return (a, b) =>
      String(a[col.key] ?? '').localeCompare(String(b[col.key] ?? ''), undefined, {
        numeric: true,
        sensitivity: 'base',
      })
  }

  return undefined
}

export function serverSortColumnBase(col, opts) {
  const { sortField, sortOrder, numericSortColumnKeys = new Set() } = opts
  const hasSorter =
    opts.hasSorter ??
    (col.dataType === 'number' || col.dataType === 'date' || col.dataType === 'string')
  const { sorter, sortOrder: colSortOrder } = reportTableSorterProps(col, {
    sortField,
    sortOrder,
    hasSorter,
    numericSortColumnKeys,
  })

  return createAntdColumnBase(col, {
    sorter,
    sortOrder: colSortOrder,
  })
}
