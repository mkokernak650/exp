/**
 * Combines the default table columns with the user's saved preferences:
 * - Columns the user has customized (order, visibility, width, etc.) are kept in their saved order.
 * - Any columns that no longer exist in the default setup are removed.
 * - Newly added columns (present in defaults but not saved) are added to the end.
 * This function ensures the table always reflects the current available columns,while respecting user choices for order and appearance.
 */
const mergeColumns = (defaultColumns, savedColumns) => {
  if (!savedColumns || !Array.isArray(savedColumns) || savedColumns.length === 0) {
    return defaultColumns
  }

  const defaultColumnsMap = new Map()
  defaultColumns.forEach((column) => {
    defaultColumnsMap.set(column.key, column)
  })

  const savedColumnKeys = new Set()
  savedColumns.forEach((column) => {
    savedColumnKeys.add(column.key)
  })

  const mergedColumns = savedColumns
    .filter((savedColumn) => defaultColumnsMap.has(savedColumn.key))
    .map((savedColumn) => ({
      ...defaultColumnsMap.get(savedColumn.key),
      ...savedColumn,
    }))

  defaultColumns.forEach((defaultColumn) => {
    if (!savedColumnKeys.has(defaultColumn.key)) {
      mergedColumns.push(defaultColumn)
    }
  })

  return mergedColumns
}

export default mergeColumns
