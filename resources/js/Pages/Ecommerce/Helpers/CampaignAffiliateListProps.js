export const styles = {
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
}

export const columns = [
  {
    key: 'affiliate_name',
    title: 'Affiliate Name',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'affiliate_fee_type',
    title: 'Affiliate Fee Type',
    dataType: 'number',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'market',
    title: 'Market',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'tv_households',
    title: 'TV Households',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'coupon_code',
    title: 'Coupon Code',
    dataType: 'string',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'dialed',
    title: 'Dialed',
    dataType: 'string',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'created_at',
    title: 'Created At',
    dataType: 'string',
    style: { width: 100 },
    visible: true,
  },
]
