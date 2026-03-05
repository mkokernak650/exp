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
    caption: 'firstname',
    name: 'firstname',
    operators,
  },
  {
    caption: 'lastname',
    name: 'lastname',
    operators,
  },
  {
    caption: 'email',
    name: 'email',
    operators,
  }
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
      field: 'email',
      operator: 'isNotEmpty',
    },
  ],
}

export const columns = [
  // {
  //   key: 'edit',
  //   style: { width: 20 },
  //   visible: true,
  // },
  {
    key: 'selection-cell',
    style: { width: 80 },
    visible: true,
  },
  {
    key: 'firstname',
    title: 'First Name',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'lastname',
    title: 'Last Name',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'email',
    title: 'Email',
    dataType: 'string',
    style: { width: 350 },
    visible: true,
  }
]
