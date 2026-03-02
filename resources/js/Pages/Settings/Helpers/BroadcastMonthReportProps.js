import { makeStyles } from '@material-ui/core'
import { DataType } from 'ka-table/enums'

export const useStyles = makeStyles(() => ({
  topBtn: {
    display: 'flex',
    gap: '10px',
    marginLeft: '10px',
  },
  button: {
    width: 130,
    textTransform: 'capitalize',
    fontSize: '14px',
  },
  editButton: {
    marginTop: '15px',
  },
}))

export const fields = [
  {
    caption: 'Broadcast Month',
    name: 'broad_cast_month',
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
      field: 'broad_cast_month',
      operator: 'isNotEmpty',
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
    style: { width: 100 },
    visible: false,
  },
  {
    key: 'broad_cast_month',
    title: 'Broadcast Month',
    dataType: DataType.String,
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'start_date',
    title: 'Start Date',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'end_date',
    title: 'End Date',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'days_count',
    title: 'Days Count',
    dataType: DataType.Number,
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'status',
    title: 'Status',
    style: { width: 100 },
    visible: true,
  },
]
