export const isEmpty = (value) => value == null || value.length === 0

const contains = (data, item) => {
  if (!item.value) {
    return true
  }
  return data[item.field]?.toLowerCase().includes(item.value.toLowerCase())
}

const isEmptyCheck = (data, item) => {
  if (data[item.field] === '') {
    return data
  }
}
const isNotEmptyCheck = (data, item) => {
  if (data[item.field] !== '') {
    return data
  }
}

const startWith = (data, item) => {
  if (!item.value) {
    return true
  }
  const valueLength = item.value.length
  const subStr = data[item.field]?.substring(0, valueLength)
  if (data[item.field] !== '') {
    if (subStr?.toLowerCase() === item.value?.toLowerCase()) {
      return data
    }
  }
}
const endsWith = (data, item) => {
  if (!item.value) {
    return true
  }
  const valueLength = item.value.length
  const fieldLength = data[item.field]?.length
  const subStr = data[item.field]?.substring(fieldLength - valueLength, fieldLength)
  if (data[item.field] !== '') {
    if (subStr?.toLowerCase() === item.value?.toLowerCase()) {
      return data
    }
  }
}

const isCheck = (data, item) => {
  if (!item.value) {
    return true
  }
  if (data[item.field] !== '') {
    if (data[item.field]?.toLowerCase() === item.value?.toLowerCase()) {
      return data
    }
  }
}
const isNotCheck = (data, item) => {
  if (!item.value) {
    return true
  }
  if (data[item.field] !== '') {
    if (data[item.field]?.toLowerCase() !== item.value?.toLowerCase()) {
      return data
    }
  }
}

const doesNotContain = (data, item) => {
  if (!item.value) {
    return true
  }
  return !data[item.field]?.toLowerCase().includes(item.value?.toLowerCase())
}
const equals = (data, item) => {
  let value
  if (item.value != '' || item.value != null) {
    value = data[item.field]
  } else {
    value = 0
  }
  if (!item.value) {
    return true
  }
  return value?.toString().toLowerCase() === item.value?.toString().toLowerCase()
}
const isNotEqual = (data, item) => {
  let value
  if (item.value != '' || item.value != null) {
    value = data[item.field]
  } else {
    value = 0
  }
  if (!item.value) {
    return true
  }
  return value?.toString().toLowerCase() !== item.value?.toString().toLowerCase()
}
const more = (data, item) => data[item.field] > item.value
const less = (data, item) => data[item.field] < item.value
const between = (data, item) => {
  const sourceValue = data[item.field]
  const from = item?.value?.from
  const to = item?.value?.to
  const hasFrom = from !== '' && from !== null && from !== undefined
  const hasTo = to !== '' && to !== null && to !== undefined

  if (!hasFrom && !hasTo) {
    return true
  }

  const numericValue = Number(sourceValue)
  const numericFrom = Number(from)
  const numericTo = Number(to)

  if (!Number.isFinite(numericValue)) {
    return false
  }

  if (hasFrom && Number.isFinite(numericFrom) && numericValue < numericFrom) {
    return false
  }

  if (hasTo && Number.isFinite(numericTo) && numericValue > numericTo) {
    return false
  }

  return true
}

const dateBetween = (data, item) => {
  const sourceValue = data[item.field]
  const from = item?.value?.from
  const to = item?.value?.to
  const hasFrom = Boolean(from)
  const hasTo = Boolean(to)

  if (!hasFrom && !hasTo) {
    return true
  }

  const sourceDate = new Date(sourceValue)
  if (Number.isNaN(sourceDate.getTime())) {
    return false
  }

  if (hasFrom) {
    const fromDate = new Date(from)
    if (!Number.isNaN(fromDate.getTime()) && sourceDate < fromDate) {
      return false
    }
  }

  if (hasTo) {
    const toDate = new Date(to)
    if (!Number.isNaN(toDate.getTime()) && sourceDate > toDate) {
      return false
    }
  }

  return true
}

const dateNotBetween = (data, item) => {
  const sourceValue = data[item.field]
  const from = item?.value?.from
  const to = item?.value?.to
  const hasFrom = Boolean(from)
  const hasTo = Boolean(to)

  if (!hasFrom && !hasTo) {
    return true
  }

  const sourceDate = new Date(sourceValue)
  if (Number.isNaN(sourceDate.getTime())) {
    return true
  }

  if (hasFrom && hasTo) {
    const fromDate = new Date(from)
    const toDate = new Date(to)
    return sourceDate < fromDate || sourceDate > toDate
  }

  if (hasFrom) {
    return sourceDate < new Date(from)
  }

  if (hasTo) {
    return sourceDate > new Date(to)
  }

  return true
}

export const filterItem = (data, filter) => {
  switch (filter.operator) {
    case 'contains':
      return contains(data, filter)
    case 'doesNotContain':
      return doesNotContain(data, filter)
    case 'isEmpty':
      return isEmptyCheck(data, filter)
    case 'isNotEmpty':
      return isNotEmptyCheck(data, filter)
    case 'startswith':
      return startWith(data, filter)
    case 'endsWith':
      return endsWith(data, filter)
    case 'is':
      return isCheck(data, filter)
    case 'isnot':
      return isNotCheck(data, filter)
    case '=':
      return equals(data, filter)
    case '<>':
      return isNotEqual(data, filter)
    case '>':
      return more(data, filter)
    case '<':
      return less(data, filter)
    case 'between':
      return between(data, filter)
    case 'dateBetween':
      return dateBetween(data, filter)
    case 'dateNotBetween':
      return dateNotBetween(data, filter)
    default:
      throw Error('unknown operator')
  }
}

export const filterGroup = (data, groupName, items) =>
  groupName.toLowerCase() === 'or' ? filterGroupOr(data, items) : filterGroupAnd(data, items)

export const filterGroupOr = (data, items) => {
  const filteredData = items.reduce((initialData, item) => {
    if (item.items) {
      const grouped = filterGroup(data, item.groupName, item.items)
      return initialData.concat(grouped.filter((d) => initialData.indexOf(d) < 0))
    }
    return initialData.concat(data.filter((d) => initialData.indexOf(d) < 0 && filterItem(d, item)))
  }, [])
  return data.filter((d) => filteredData.includes(d))
}

export const filterGroupAnd = (data, items) => {
  return items.reduce((initialData, item) => {
    if (item.items) {
      return filterGroup(initialData, item.groupName, item.items)
    }
    return initialData.filter((d) => filterItem(d, item))
  }, data)
}

export const filterData = (data, filterValue) => {
  return filterGroup(data, filterValue.groupName, filterValue.items)
}
