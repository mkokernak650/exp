import { makeStyles } from '@material-ui/core'
import { DataType } from 'ka-table/enums'

export const useStyles = makeStyles(() => ({
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
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
      field: 'Event',
      operator: 'isNotEmpty',
      value: '',
    },
  ],
}

export const columns = [
  {
    key: 'properties.name',
    title: 'User Name',
    dataType: DataType.String,
    style: { width: '10%' },
    visible: true,
  },
  {
    key: 'properties.email',
    title: 'User Email',
    dataType: DataType.String,
    style: { width: '10%' },
    visible: true,
  },
  {
    key: 'event',
    title: 'Event',
    dataType: DataType.String,
    style: { width: '5%' },
    visible: true,
  },
  {
    key: 'log_name',
    title: 'Module',
    dataType: DataType.String,
    style: { width: '10%' },
    visible: true,
  },
  {
    key: 'description',
    title: 'Description',
    dataType: DataType.String,
    style: { width: '15%' },
    visible: true,
  }, 
  {
    key: 'properties.ids',
    title: 'Effected Ids',
    dataType: DataType.String,
    style: { width: '15%' },
    visible: true,
  }, 
  {
    key: 'created_at',
    title: 'Activity Time (EST)',
    dataType: DataType.Date,
    style: { width: '10%' },
    visible: true,
  },

]
