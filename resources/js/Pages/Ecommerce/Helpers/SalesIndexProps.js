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
    caption: 'campaign',
    name: 'campaign',
    operators,
  },
  {
    caption: 'customer',
    name: 'customer',
    operators,
  },
  {
    caption: 'order_type',
    name: 'order_type',
    operators,
  },
  {
    caption: 'order_no',
    name: 'order_no',
    operators,
  },
  {
    caption: 'coupon_code',
    name: 'coupon_code',
    operators,
  },
  {
    caption: 'dialed',
    name: 'dialed',
    operators,
  },
  {
    caption: 'user_ip',
    name: 'user_ip',
    operators,
  },
  {
    caption: 'inbound',
    name: 'inbound',
    operators,
  },
  {
    caption: 'shipping_city',
    name: 'shipping_city',
    operators,
  },
  {
    caption: 'shipping_state',
    name: 'shipping_state',
    operators,
  },
  {
    caption: 'shipping_zip',
    name: 'shipping_zip',
    operators,
  },
  {
    caption: 'billing_zip',
    name: 'billing_zip',
    operators,
  },
  {
    caption: 'quantity',
    name: 'quantity',
    operators,
  },
  {
    caption: 'subtotal',
    name: 'subtotal',
    operators,
  },
  {
    caption: 'shipping_cost',
    name: 'shipping_cost',
    operators,
  },
  {
    caption: 'total',
    name: 'total',
    operators,
  },
  {
    caption: 'order_at',
    name: 'order_at',
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
      field: 'order_at',
      operator: 'isNotEmpty',
      value: '',
    },
  ],
}

export const columns = [
  {
    key: 'edit',
    style: { width: 40 },
    visible: true,
  },
  {
    key: 'selection-cell',
    style: { width: 80 },
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
    key: 'affiliate_name',
    title: 'Affiliate Name',
    dataType: DataType.String,
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'order_at',
    title: 'Order AT',
    dataType: DataType.Date,
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'order_type',
    title: 'Order Type',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'order_no',
    title: 'Order No',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'coupon_code',
    title: 'Coupon Code',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'dialed',
    title: 'Dialed',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'user_ip',
    title: 'User IP',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'inbound',
    title: 'Inbound',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'shipping_city',
    title: 'Shipping City',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'shipping_state',
    title: 'Shipping State',
    dataType: DataType.String,
    style: { width: 140 },
    visible: true,
  },
  {
    key: 'shipping_zip',
    title: 'Shipping Zip',
    dataType: DataType.String,
    style: { width: 140 },
    visible: true,
  },
  {
    key: 'billing_zip',
    title: 'Billing Zip',
    dataType: DataType.String,
    style: { width: 120 },
    visible: true,
  },
  {
    key: 'quantity',
    title: 'Quantity',
    dataType: DataType.String,
    style: { width: 120 },
    visible: true,
  },
  {
    key: 'subtotal',
    title: 'Subtotal',
    dataType: DataType.String,
    style: { width: 140 },
    visible: true,
  },
  {
    key: 'shipping_cost',
    title: 'Shipping Cost',
    dataType: DataType.String,
    style: { width: 140 },
    visible: true,
  },
  {
    key: 'total',
    title: 'Total',
    dataType: DataType.String,
    style: { width: 140 },
    visible: true,
  },
  {
    key: 'created_at',
    title: 'Created At',
    dataType: DataType.String,
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'updated_at',
    title: 'Last Updated',
    dataType: DataType.Date,
    style: { width: 200 },
    visible: true,
  },
]