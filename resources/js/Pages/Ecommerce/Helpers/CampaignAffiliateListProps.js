import { makeStyles } from '@material-ui/core'
import { DataType } from 'ka-table/enums'

export const useStyles = makeStyles(() => ({
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
}))

export const columns = [
  {
    key: 'affiliate_name',
    title: 'Affiliate Name',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'affiliate_fee_type',
    title: 'Affiliate Fee Type',
    dataType: DataType.Number,
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'market',
    title: 'Market',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'tv_households',
    title: 'TV Households',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'coupon_code',
    title: 'Coupon Code',
    dataType: DataType.String,
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'dialed',
    title: 'Dialed',
    dataType: DataType.String,
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'created_at',
    title: 'Created At',
    dataType: DataType.String,
    style: { width: 100 },
    visible: true,
  },
]
