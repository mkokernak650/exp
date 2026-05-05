import { textFilterOperators } from '@/Helpers/textFilterOperators'

const operators = textFilterOperators

export const fields = [
  {
    caption: 'Recipients',
    name: 'to',
    operators,
  },
  {
    caption: 'Subject',
    name: 'subject',
    operators,
  },
  {
    caption: 'Status',
    name: 'status',
    operators,
  },
  {
    caption: 'Type',
    name: 'type',
    operators,
  },
  {
    caption: 'Error',
    name: 'error',
    operators,
  },
  {
    caption: 'Sent At (EST)',
    name: 'sent_at',
    dataType: 'date',
    operators: [
      { caption: 'Between', name: 'dateBetween' },
      { caption: 'Not Between', name: 'dateNotBetween' },
      { caption: 'Is Empty', name: 'isEmpty' },
      { caption: 'Is Not Empty', name: 'isNotEmpty' },
    ],
  },
  {
    caption: 'Logged At (EST)',
    name: 'created_at',
    dataType: 'date',
    operators: [
      { caption: 'Between', name: 'dateBetween' },
      { caption: 'Not Between', name: 'dateNotBetween' },
      { caption: 'Is Empty', name: 'isEmpty' },
      { caption: 'Is Not Empty', name: 'isNotEmpty' },
    ],
  },
]

export const groups = [
  { caption: 'And', name: 'and' },
  { caption: 'Or', name: 'or' },
]

export const filter = {
  groupName: 'and',
  items: [],
}

export const columns = [
  {
    key: 'user_name',
    title: 'User',
    dataType: 'string',
    style: { width: '160px' },
    visible: true,
  },
  {
    key: 'to',
    title: 'Recipients',
    dataType: 'string',
    style: { width: '220px' },
    visible: true,
  },
  {
    key: 'subject',
    title: 'Subject',
    dataType: 'string',
    style: { width: '220px' },
    visible: true,
  },
  {
    key: 'status',
    title: 'Status',
    dataType: 'string',
    style: { width: '100px' },
    visible: true,
  },
  {
    key: 'type',
    title: 'Type',
    dataType: 'string',
    style: { width: '200px' },
    visible: true,
  },
  {
    key: 'attachment_names',
    title: 'Attachments',
    dataType: 'string',
    style: { width: '180px' },
    visible: false,
  },
  {
    key: 'error',
    title: 'Error',
    dataType: 'string',
    style: { width: '260px' },
    visible: true,
  },
  {
    key: 'sent_at',
    title: 'Sent At (EST)',
    dataType: 'date',
    style: { width: '160px' },
    visible: true,
  },
  {
    key: 'created_at',
    title: 'Logged At (EST)',
    dataType: 'date',
    style: { width: '160px' },
    visible: true,
  },
]
