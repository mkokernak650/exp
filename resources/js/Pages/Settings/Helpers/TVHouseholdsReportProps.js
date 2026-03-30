import { textFilterOperators } from '@/Helpers/textFilterOperators'
export const styles = {
  topBtn: {
    display: 'flex',
    gap: '10px',
    marginLeft: '10px',
  },
  button: {
    textTransform: 'capitalize',
    fontSize: '14px',
  },
  editButton: {
    marginTop: '15px',
  },
}

export const fields = [
  {
    caption: 'market',
    name: 'market',
    operators: textFilterOperators,
  },
  {
    caption: 'state',
    name: 'state',
    operators: textFilterOperators,
  },
  {
    caption: 'TV Households',
    name: 'tv_households',
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
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'Created At',
    name: 'created_at',
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
  {
    caption: 'Last Updated',
    name: 'updated_at',
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
    key: 'edit',
    style: { width: 20 },
    visible: true,
  },
  {
    key: 'selection-cell',
    style: { width: 80 },
    visible: true,
  },
  {
    key: 'sl',
    title: 'SL',
    dataType: 'number',
    style: { width: 20 },
    visible: false,
  },
  {
    key: 'market',
    title: 'Market',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'state',
    title: 'State',
    dataType: 'string',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'tv_households',
    title: 'TV Households',
    dataType: 'string',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'created_at',
    title: 'Created At',
    dataType: 'date',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'updated_at',
    title: 'Last Updated',
    dataType: 'date',
    style: { width: 100 },
    visible: true,
  },
]
