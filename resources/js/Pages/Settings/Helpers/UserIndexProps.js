import { textFilterOperators } from '@/Helpers/textFilterOperators'
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

const operators = textFilterOperators
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
  },
]
