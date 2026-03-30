import { textFilterOperators } from '@/Helpers/textFilterOperators'
export const styles = {
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
}

export const fields = [
  {
    caption: 'Broadcast Week',
    name: 'broad_cast_week',
    operators: textFilterOperators,
  },
  {
    caption: 'Start Date',
    name: 'start_date',
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
    caption: 'End Date',
    name: 'end_date',
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
  { caption: 'And', name: 'and' },
  { caption: 'Or', name: 'or' },
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
    style: { width: 100 },
    visible: false,
  },
  {
    key: 'broad_cast_week',
    title: 'Broadcast Week',
    dataType: 'string',
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'start_date',
    title: 'Start Date',
    dataType: 'date',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'end_date',
    title: 'End Date',
    dataType: 'date',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'days_count',
    title: 'Days Count',
    dataType: 'number',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'status',
    title: 'Status',
    style: { width: 240 },
    visible: true,
  },
]
