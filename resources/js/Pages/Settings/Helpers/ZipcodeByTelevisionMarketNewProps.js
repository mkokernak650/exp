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
    caption: 'Market',
    name: 'Market',
    operators,
  },
  {
    caption: 'State',
    name: 'State',
    operators,
  },
  {
    caption: 'County',
    name: 'County',
    operators,
  },
  {
    caption: 'City',
    name: 'City',
    operators,
  },
  {
    caption: 'Population',
    name: 'Population',
    operators,
  },
  {
    caption: 'ZipCode',
    name: 'Zip_Code',
    operators,
  },
  {
    caption: 'Fips',
    name: 'Fips',
    operators,
  },
  {
    caption: 'Median_household_income_2007_2011',
    name: 'Median_household_income_2007_2011',
    operators,
  },
  {
    caption: 'Race_americanindian',
    name: 'Race_americanindian',
    operators,
  },
  {
    caption: 'Race_asian',
    name: 'Race_asian',
    operators,
  },
  {
    caption: 'Race_white',
    name: 'Race_white',
    operators,
  },
  {
    caption: 'Race_black',
    name: 'Race_black',
    operators,
  },
  {
    caption: 'Race_hawaiian',
    name: 'Race_hawaiian',
    operators,
  },
  {
    caption: 'Race_hispanic',
    name: 'Race_hispanic',
    operators,
  },
  {
    caption: 'Race_other',
    name: 'Race_other',
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
      field: 'Market',
      operator: 'isNotEmpty',
      value: '',
    },
  ],
}

export const columns = [
  {
    key: 'market',
    title: 'Market',
    dataType: DataType.String,
    style: { width: 250 },
    visible: true,
  },
  {
    key: 'state',
    title: 'State',
    dataType: DataType.String,
    style: { width: 130 },
    visible: true,
  },
  {
    key: 'county',
    title: 'County',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'city',
    title: 'City',
    dataType: DataType.String,
    style: { width: 230 },
    visible: true,
  },
  {
    key: 'population',
    title: 'Population',
    dataType: DataType.String,
    style: { width: 130 },
    visible: true,
  },
  {
    key: 'zip_code',
    title: 'ZipCode',
    dataType: DataType.String,
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'fips',
    title: 'Fips',
    dataType: DataType.String,
    style: { width: 190 },
    visible: true,
  },
  {
    key: 'median_household_income_2007_2011',
    title: 'Median_household_income_2007_2011',
    dataType: DataType.String,
    style: { width: 310 },
    visible: true,
  },
  {
    key: 'race_americanindian',
    title: 'Race_americanindian',
    dataType: DataType.String,
    style: { width: 220 },
    visible: true,
  },
  {
    key: 'race_asian',
    title: 'Race_asian',
    dataType: DataType.String,
    style: { width: 170 },
    visible: true,
  },
  {
    key: 'race_white',
    title: 'Race_white',
    dataType: DataType.String,
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'race_black',
    title: 'Race_black',
    dataType: DataType.String,
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'race_hawaiian',
    title: 'Race_hawaiian',
    dataType: DataType.String,
    style: { width: 180 },
    visible: true,
  },
  {
    key: 'race_hispanic',
    title: 'Race_hispanic',
    dataType: DataType.String,
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'race_other',
    title: 'Race_other',
    dataType: DataType.String,
    style: { width: 240 },
    visible: true,
  },
]
