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
  import: {
    display: 'flex',
    alignItems: 'center',
  },
  importFile: {
    flex: '1',
    background: '#eee',
    padding: '7px',
    borderRadius: '5px',
    marginRight: '6px',
  },
}

const operators = textFilterOperators
export const fields = [
  {
    caption: 'Campaign',
    name: 'campaign_name',
    operators,
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
    key: 'campaign_name',
    title: 'Campaign',
    dataType: 'string',
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'affiliates',
    title: 'Affiliates',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'customer_name',
    title: 'Customer',
    dataType: 'string',
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'description',
    title: 'Description',
    dataType: 'string',
    style: { width: 300 },
    visible: true,
  },
  {
    key: 'length_url',
    title: 'Length and URLs',
    dataType: 'string',
    style: { width: 300 },
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
    key: 'created_at',
    title: 'Created At',
    dataType: 'date',
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'updated_at',
    title: 'Last Updated',
    dataType: 'date',
    style: { width: 200 },
    visible: true,
  },
]
