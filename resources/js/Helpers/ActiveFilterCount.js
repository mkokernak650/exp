const isFilterItemActive = (item) => {
  if (!item?.operator) {
    return false
  }

  if (item.operator === 'isEmpty' || item.operator === 'isNotEmpty') {
    return true
  }

  if (
    item.operator === 'between' ||
    item.operator === 'dateBetween' ||
    item.operator === 'dateNotBetween'
  ) {
    return Boolean(item.value?.from) || Boolean(item.value?.to)
  }

  if (Array.isArray(item.value)) {
    return item.value.some((value) => String(value ?? '').trim() !== '')
  }

  return String(item.value ?? '').trim() !== ''
}

export const countActiveFilters = (filterValue) => {
  if (!filterValue?.items?.length) {
    return 0
  }

  return filterValue.items.filter(isFilterItemActive).length
}

export const sanitizeFilterValue = (filterValue) => {
  if (!filterValue?.items?.length) {
    return filterValue
  }

  return {
    ...filterValue,
    items: filterValue.items.filter(isFilterItemActive),
  }
}
