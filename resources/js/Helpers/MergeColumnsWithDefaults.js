/**
 * Merge saved column layout with current defaults: keep saved order/widths/visibility,
 * append any default columns whose `key` is missing from the saved list.
 */

const mergeColumnsWithDefaults = (saved, defaults) => {
  if (!Array.isArray(saved) || saved.length === 0) {
    return defaults
  }
  const savedKeys = new Set(saved.map((c) => c.key))
  const missing = defaults.filter((c) => !savedKeys.has(c.key))
  return [...saved, ...missing]
}

export default mergeColumnsWithDefaults
