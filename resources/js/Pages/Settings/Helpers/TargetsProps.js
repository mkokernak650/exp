import { textFilterOperators } from '@/Helpers/textFilterOperators'
export const styles = {
  topBtn: {
    display: 'flex',
    gap: '10px',
    marginLeft: '10px',
  },
  button: {
    width: '130',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
  editButton: {
    marginTop: '15px',
  },
}

export const fields = [
  {
    caption: 'customer',
    name: 'customer',
    operators: textFilterOperators,
  },
  {
    caption: 'Ringba Target Name',
    name: 'Ringba_Target_Name',
    operators: textFilterOperators,
  },
  {
    caption: 'Description',
    name: 'Description',
    operators: textFilterOperators,
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
    style: { width: 100 },
    visible: false,
  },
  {
    key: 'customer',
    title: 'Customer',
    dataType: 'string',
    style: { width: 360 },
    visible: true,
  },

  {
    key: 'Description',
    title: 'Description',
    dataType: 'string',
    style: { width: 400 },
    visible: true,
  },
  {
    key: 'Ringba_Target_Name',
    title: 'Ringba Target Name',
    dataType: 'string',
    style: { width: 360 },
    visible: true,
  },
  {
    key: 'status',
    title: 'Status',
    style: { width: 240 },
    visible: true,
  },
]
