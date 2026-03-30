import { textFilterOperators } from '@/Helpers/textFilterOperators'
export const fields = [
  {
    caption: 'Company',
    name: 'Company',
    operators: textFilterOperators,
  },
  {
    caption: 'Last Name',
    name: 'Last_Name',
    operators: textFilterOperators,
  },
  {
    caption: 'Email',
    name: 'Email',
    operators: textFilterOperators,
  },
  {
    caption: 'Phone',
    name: 'Phone',
    operators: textFilterOperators,
  },
  {
    caption: 'Skype',
    name: 'Skype',
    operators: textFilterOperators,
  },
  {
    caption: 'Street',
    name: 'Street',
    operators: textFilterOperators,
  },
  {
    caption: 'City',
    name: 'City',
    operators: textFilterOperators,
  },
  {
    caption: 'State',
    name: 'State',
    operators: textFilterOperators,
  },
  {
    caption: 'ZipCode',
    name: 'ZipCode',
    operators: textFilterOperators,
  },
  {
    caption: 'Country',
    name: 'Country',
    operators: textFilterOperators,
  },
  {
    caption: 'Website',
    name: 'Website',
    operators: textFilterOperators,
  },
  {
    caption: 'Comment',
    name: 'Comment',
    operators: textFilterOperators,
  },
  {
    caption: 'Created Time',
    name: 'Created_Time',
    dataType: 'date',
    operators: [
      {
        caption: 'Between',
        name: 'dateBetween',
      },
      {
        caption: 'Not Between',
        name: 'dateNotBetween',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
    ],
  },
]

export const groups = [
  {
    caption: 'And',
    name: 'and',
  },
  {
    caption: 'Or',
    name: 'or',
  },
]

export const filter = {
  groupName: 'and',
  items: [],
}

export const columns = [
  {
    key: 'selection-cell',
    style: { width: 80 },
    visible: true,
  },
  {
    key: 'sl',
    title: 'SL',
    dataType: 'number',
    style: { width: 100 },
    visible: false,
  },
  {
    key: 'Company',
    title: 'Company',
    dataType: 'string',
    style: { width: 280 },
    visible: true,
  },
  {
    key: 'Last_Name',
    title: 'Last Name',
    dataType: 'string',
    style: { width: 320 },
    visible: true,
  },
  {
    key: 'Email',
    title: 'Email',
    dataType: 'string',
    style: { width: 320 },
    visible: true,
  },
  {
    key: 'Phone',
    title: 'Phone',
    dataType: 'string',
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'Skype',
    title: 'Skype',
    dataType: 'string',
    style: { width: 370 },
    visible: true,
  },
  {
    key: 'Street',
    title: 'Street',
    dataType: 'string',
    style: { width: 280 },
    visible: true,
  },
  {
    key: 'City',
    title: 'City',
    dataType: 'string',
    style: { width: 270 },
    visible: true,
  },
  {
    key: 'State',
    title: 'State',
    dataType: 'string',
    style: { width: 310 },
    visible: true,
  },
  {
    key: 'ZipCode',
    title: 'ZipCode',
    dataType: 'string',
    style: { width: 230 },
    visible: true,
  },
  {
    key: 'Country',
    title: 'Country',
    dataType: 'string',
    style: { width: 300 },
    visible: true,
  },
  {
    key: 'Website',
    title: 'Website',
    dataType: 'string',
    style: { width: 280 },
    visible: true,
  },
  {
    key: 'Comment',
    title: 'Comment',
    dataType: 'string',
    style: { width: 230 },
    visible: true,
  },
  {
    key: 'Created_Time',
    title: 'Created Time',
    dataType: 'date',
    style: { width: 280 },
    visible: true,
  },
]
