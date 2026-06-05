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
    caption: 'MSO Name',
    name: 'mso_name',
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
    style: { width: 50 },
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
    key: 'mso_name',
    title: 'MSO Name',
    dataType: 'string',
    style: { width: 360 },
    visible: true,
  },
  {
    key: 'affiliates_count',
    title: 'Affiliates',
    dataType: 'number',
    style: { width: 120 },
    visible: true,
  },
  {
    key: 'status',
    title: 'Status',
    style: { width: 220 },
    visible: true,
  },
]
