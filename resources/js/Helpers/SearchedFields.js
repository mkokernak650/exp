export const SearchedFields = (fields) => {
  const filteredData = fields.filter(
    (field) =>
      field.key != 'edit' &&
      field.key != 'selection-cell' &&
      field.key != 'sl' &&
      field.key != 'Recording_Url'
  )
  return filteredData.map((item) => {
    if (item.dataType === 'string') {
      return {
        caption: item.title,
        name: item.key,
        dataType: item.dataType,
        operators: [
          {
            caption: 'Contains',
            name: 'contains',
          },
          {
            caption: 'Not Contains',
            name: 'doesNotContain',
          },
          {
            caption: 'Is Empty',
            name: 'isEmpty',
          },
          {
            caption: 'Is Not Empty',
            name: 'isNotEmpty',
          },
          {
            caption: 'Starts With',
            name: 'startswith',
          },
          {
            caption: 'Ends With',
            name: 'endsWith',
          },
          {
            caption: 'Is',
            name: 'is',
          },
          {
            caption: 'Is Not',
            name: 'isnot',
          },
        ],
      }
    } else if (item.dataType === 'boolean') {
      return {
        caption: item.title,
        name: item.key,
        dataType: item.dataType,
        operators: [
          {
            caption: 'Contains',
            name: 'contains',
          },
          {
            caption: 'Not Contains',
            name: 'doesNotContain',
          },
          {
            caption: 'Is Empty',
            name: 'isEmpty',
          },
          {
            caption: 'Is Not Empty',
            name: 'isNotEmpty',
          },
          {
            caption: 'Starts With',
            name: 'startswith',
          },
          {
            caption: 'Ends With',
            name: 'endsWith',
          },
          {
            caption: 'Is',
            name: 'is',
          },
          {
            caption: 'Is Not',
            name: 'isnot',
          },
        ],
      }
    } else if (item.dataType === 'number') {
      return {
        caption: item.title,
        name: item.key,
        dataType: item.dataType,

        operators: [
          {
            caption: 'Equals',
            name: '=',
          },
          {
            caption: 'Does not Equal',
            name: '<>',
          },
          {
            caption: 'More than',
            name: '>',
          },
          {
            caption: 'Less than',
            name: '<',
          },
          {
            caption: 'Is Empty',
            name: 'isEmpty',
          },
          {
            caption: 'Is Not Empty',
            name: 'isNotEmpty',
          },
          {
            caption: 'Between',
            name: 'between',
          },
        ],
      }
    } else if (item.dataType === 'date') {
      return {
        caption: item.title,
        name: item.key,
        dataType: item.dataType,
        operators: [
          {
            caption: 'Is Empty',
            name: 'isEmpty',
          },
          {
            caption: 'Is Not Empty',
            name: 'isNotEmpty',
          },
          {
            caption: 'Between',
            name: 'dateBetween',
          },
        ],
      }
    }
  })
}