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
    caption: 'market',
    name: 'market_id',
    operators: textFilterOperators,
  },
  {
    caption: 'state',
    name: 'state',
    operators: textFilterOperators,
  },
  {
    caption: 'call_type',
    name: 'call_type',
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
    key: 'campaign',
    title: 'Campaign',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'market_id',
    title: 'Market',
    dataType: 'string',
    style: { width: 350 },
    visible: true,
  },
  {
    key: 'state',
    title: 'State',
    dataType: 'string',
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'call_type',
    title: 'Call Type',
    dataType: 'string',
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'ranks',
    title: 'Rank',
    dataType: 'string',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'nielsen_households',
    title: 'Nielsen Households',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },

  {
    key: 'start_date',
    title: 'Start Date',
    dataType: 'date',
    style: { width: 200 },
    visible: true,
  },
]
