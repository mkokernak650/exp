export const countActiveFilters = (filterValue) => {
  if (!filterValue?.items?.length) {
    return 0
  }

  return filterValue.items.filter((item) => {
    if (!item?.operator) {
      return false
    }

    if (item.operator === 'isEmpty' || item.operator === 'isNotEmpty') {
      return true
    }

    if (item.operator === 'between' || item.operator === 'dateBetween') {
      return Boolean(item.value?.from) || Boolean(item.value?.to)
    }

    if (Array.isArray(item.value)) {
      return item.value.some((value) => String(value ?? '').trim() !== '')
    }

    return String(item.value ?? '').trim() !== ''
  }).length
}
