export const styles = {
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
}

export const columns = [
  {
    key: 'selection-cell',
    style: { width: 60 },
    visible: true,
  },
  {
    key: 'formatted_created_at',
    title: 'Created At',
    dataType: 'date',
    style: { width: 180 },
    visible: true,
  },
  {
    key: 'id',
    title: 'IO No',
    dataType: 'string',
    style: { width: 80 },
    visible: true,
  },
  {
    key: 'customer',
    title: 'Customer',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'affiliate',
    title: 'Affiliate',
    dataType: 'string',
    style: { width: 150 },
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
    key: 'io_link',
    title: 'IO Public Link',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'resend_io_doc',
    title: 'Resend IO DOC',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'cancel_io',
    title: 'Cancel IO',
    style: { width: 80 },
    visible: true,
  },
]
