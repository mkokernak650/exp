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
    name: 'campaign',
    operators,
  },
  {
    caption: 'Customer',
    name: 'customer',
    operators,
  },
  {
    caption: 'Affiliate',
    name: 'affiliate',
    operators,
  },
  {
    caption: 'Order Type',
    name: 'order_type',
    operators,
  },
  {
    caption: 'Coupon Code',
    name: 'coupon_code',
    operators,
  },
  {
    caption: 'Dialed Phone',
    name: 'dialed',
    operators,
  },
  {
    caption: 'Commission',
    name: 'percentage',
    operators,
  },
  {
    caption: 'Cash Buy',
    name: 'cash_buy',
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
      field: 'order_type',
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
    style: { width: 60 },
    visible: true,
  },
  {
    key: 'campaign',
    title: 'Campaign',
    dataType: DataType.String,
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'customer',
    title: 'Customer',
    dataType: DataType.String,
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'affiliate',
    title: 'Affiliate',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'order_type',
    title: 'Order Type',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'affiliate_fee_type',
    title: 'Affiliate Fee Type',
    dataType: DataType.String,
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'product_code',
    title: 'ISCI Code',
    dataType: DataType.String,
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'coupon_code',
    title: 'Coupon Code',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'dialed',
    title: 'Dialed',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'pay_on_multiple_orders',
    title: 'Pay on multiple orders',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'lengths',
    title: 'Lengths',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'revenue',
    title: 'Payout',
    dataType: DataType.String,
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'affiliate_fee',
    title: 'Affiliate Fee',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'percentage',
    title: 'Commission',
    dataType: DataType.String,
    style: { width: 120 },
    visible: true,
  },
  {
    key: 'cash_buy',
    title: 'Cash Buy',
    dataType: DataType.String,
    style: { width: 120 },
    visible: true,
  },
  {
    key: 'description',
    title: 'Description',
    dataType: DataType.String,
    style: { width: 300 },
    visible: true,
  },
  {
    key: 'created_at',
    title: 'Created At',
    dataType: DataType.String,
    style: { width: 180 },
    visible: true,
  },
  {
    key: 'updated_at',
    title: 'Last Updated',
    dataType: DataType.Date,
    style: { width: 180 },
    visible: true,
  },
]
