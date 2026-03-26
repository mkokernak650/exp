export const SearchedFields = (fields) => {
  const filteredData = fields.filter(
    (field) =>
      field.key != 'edit' &&
      field.key != 'selection-cell' &&
      field.key != 'sl' &&
      field.key != 'Recording_Url'
  )
  return filteredData
    .map((item) => {
      if (item.dataType === 'string') {
        return {
          caption: item.title,
          name: item.key,
          dataType: item.dataType,
          operators: [
            { caption: 'is', name: 'is' },
            { caption: "isn't", name: 'isnot' },
            { caption: 'contains', name: 'contains' },
            { caption: "doesn't contain", name: 'doesNotContain' },
            { caption: 'starts with', name: 'startswith' },
            { caption: 'ends with', name: 'endsWith' },
            { caption: 'is empty', name: 'isEmpty' },
            { caption: 'is not empty', name: 'isNotEmpty' },
          ],
        }
      } else if (item.dataType === 'boolean') {
        return {
          caption: item.title,
          name: item.key,
          dataType: item.dataType,
          operators: [
            { caption: 'is', name: 'is' },
            { caption: "isn't", name: 'isnot' },
            { caption: 'contains', name: 'contains' },
            { caption: "doesn't contain", name: 'doesNotContain' },
            { caption: 'starts with', name: 'startswith' },
            { caption: 'ends with', name: 'endsWith' },
            { caption: 'is empty', name: 'isEmpty' },
            { caption: 'is not empty', name: 'isNotEmpty' },
          ],
        }
      } else if (item.dataType === 'number') {
        return {
          caption: item.title,
          name: item.key,
          dataType: item.dataType,
          operators: [
            { caption: 'is', name: '=' },
            { caption: "isn't", name: '<>' },
            { caption: 'greater than', name: '>' },
            { caption: 'less than', name: '<' },
            { caption: 'between', name: 'between' },
            { caption: 'is empty', name: 'isEmpty' },
            { caption: 'is not empty', name: 'isNotEmpty' },
          ],
        }
      } else if (item.dataType === 'date') {
        return {
          caption: item.title,
          name: item.key,
          dataType: item.dataType,
          operators: [
            { caption: 'between', name: 'dateBetween' },
            { caption: 'not between', name: 'dateNotBetween' },
            { caption: 'is empty', name: 'isEmpty' },
            { caption: 'is not empty', name: 'isNotEmpty' },
          ],
        }
      }
      return null
    })
    .filter(Boolean)
}
