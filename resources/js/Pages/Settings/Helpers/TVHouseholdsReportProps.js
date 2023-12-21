import { makeStyles } from '@material-ui/core'
import { DataType } from 'ka-table/enums'

export const useStyles = makeStyles(() => ({
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
}))

export const fields = [
  {
    caption: 'market',
    name: 'market',
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
  },
  {
    caption: 'state',
    name: 'state',
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
  items: [
    {
      field: 'market',
      operator: 'isNotEmpty',
      value: '',
    },
  ],
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
    dataType: DataType.Number,
    style: { width: 20 },
    visible: false,
  },
  {
    key: 'market',
    title: 'Market',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'state',
    title: 'State',
    dataType: DataType.String,
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'tv_households',
    title: 'TV Households',
    dataType: DataType.String,
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'created_at',
    title: 'Created At',
    dataType: DataType.String,
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'updated_at',
    title: 'Last Updated',
    dataType: DataType.Date,
    style: { width: 100 },
    visible: true,
  },
]
