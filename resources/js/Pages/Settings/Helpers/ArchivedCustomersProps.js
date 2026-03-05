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
    caption: 'customer',
    name: 'customer',
    operators,
  },
  {
    caption: 'email',
    name: 'email',
    operators,
  },
  {
    caption: 'telephone',
    name: 'telephone',
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
      field: 'customer',
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
    style: { width: 80 },
    visible: true,
  },
  {
    key: 'sl',
    title: 'SL',
    dataType: 'number',
    style: { width: 20 },
    visible: false,
  },
  {
    key: 'customer',
    title: 'Customer',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'email',
    title: 'Email',
    dataType: 'string',
    style: { width: 300 },
    visible: true,
  },
  {
    key: 'telephone',
    title: 'Telephone',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'address',
    title: 'Address',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'contact_name',
    title: 'Contact Name',
    dataType: 'string',
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'contact_telephone',
    title: 'Contact Telephone',
    dataType: 'string',
    style: { width: 200 },
    visible: true,
  },
]
