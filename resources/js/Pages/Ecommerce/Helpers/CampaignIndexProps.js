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
}))

const operators = [
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
]

export const fields = [
  {
    caption: 'Campaign',
    name: 'campaign_name',
    operators,
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
      field: 'campaign_name',
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
    style: { width: 60 },
    visible: true,
  },
  {
    key: 'sl',
    title: 'SL',
    dataType: DataType.Number,
    style: { width: 40 },
    visible: false,
  },
  {
    key: 'campaign_name',
    title: 'Campaign',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'affiliates',
    title: 'Affiliates',
    style: { width: 80 },
    visible: true,
  },
  {
    key: 'customer_name',
    title: 'Customer',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'status',
    title: 'Status',
    dataType: DataType.String,
    style: { width: 50 },
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
