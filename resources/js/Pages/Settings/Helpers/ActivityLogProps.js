export const styles = {
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
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
    caption: 'Event',
    name: 'Event',
    operators,
  },
  {
    caption: 'Module',
    name: 'log_name',
    operators,
  },
  {
    caption: 'Description',
    name: 'Description',
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
  items: [],
}

export const columns = [
  {
    key: 'properties.name',
    title: 'User Name',
    dataType: 'string',
    style: { width: '120px' },
    visible: true,
  },
  {
    key: 'properties.email',
    title: 'User Email',
    dataType: 'string',
    style: { width: '200px' },
    visible: true,
  },
  {
    key: 'event',
    title: 'Event',
    dataType: 'string',
    style: { width: '100px' },
    visible: true,
  },
  {
    key: 'log_name',
    title: 'Module',
    dataType: 'string',
    style: { width: '120px' },
    visible: true,
  },
  {
    key: 'description',
    title: 'Description',
    dataType: 'string',
    style: { width: '200px' },
    visible: true,
  },
  {
    key: 'properties.ids',
    title: 'Effected Ids',
    dataType: 'string',
    style: { width: '100px' },
    visible: true,
  },
  {
    key: 'created_at',
    title: 'Activity Time (EST)',
    dataType: 'date',
    style: { width: '120px' },
    visible: true,
  },
]
