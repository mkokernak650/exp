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
  formControl: {
    marginTop: '15px',
    marginBottom: '10px',
  },
}

const operators = textFilterOperators
export const fields = [
  {
    caption: 'affiliate_id',
    name: 'affiliate_id',
    operators,
  },
  {
    caption: 'affiliate_name',
    name: 'affiliate_name',
    operators,
  },
  {
    caption: 'ownership',
    name: 'ownership',
    operators,
  },
  {
    caption: 'Corporate Name',
    name: 'ownership_name',
    operators,
  },
  {
    caption: 'zip_code',
    name: 'zip_code',
    operators,
  },
  {
    caption: 'website',
    name: 'website',
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
  {
    caption: 'address',
    name: 'address',
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
    key: 'affiliate_id',
    title: 'Affiliate Id',
    dataType: 'string',
    style: { width: 350 },
    visible: true,
  },
  {
    key: 'affiliate_name',
    title: 'Affiliate Name',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'ownership',
    title: 'Ownership',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'ownership_name',
    title: 'Corporate Name',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'zip_code',
    title: 'Zip Code',
    dataType: 'string',
    style: { width: 120 },
    visible: true,
  },
  {
    key: 'website',
    title: 'Website',
    dataType: 'string',
    style: { width: 280 },
    visible: true,
  },
  {
    key: 'tv_households',
    title: 'TV Households',
    dataType: 'number',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'market',
    title: 'Market',
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
