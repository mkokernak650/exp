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
    caption: 'campaign',
    name: 'campaign',
    operators: textFilterOperators,
  },
  {
    caption: 'duration',
    name: 'duration',
    operators: textFilterOperators,
  },
  {
    caption: 'status',
    name: 'status',
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
    key: 'selection-cell',
    style: { width: 60 },
    visible: true,
  },
  {
    key: 'sl',
    title: 'SL',
    dataType: 'number',
    style: { width: 40 },
    visible: false,
  },
  {
    key: 'campaign',
    title: 'Campaign',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'duration',
    title: 'Connection Duration',
    dataType: 'string',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'status',
    title: 'Status',
    dataType: 'string',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'actions',
    title: 'Actions',
    style: { width: 250 },
    visible: true,
  },
]
