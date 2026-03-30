import { textFilterOperators } from '@/Helpers/textFilterOperators'
export const styles = {
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
}

export const fields = [
  {
    caption: 'NPA',
    name: 'NPA',
    operators: textFilterOperators,
  },
  {
    caption: 'NXX',
    name: 'NXX',
    operators: textFilterOperators,
  },
  {
    caption: 'NPANXX',
    name: 'NPANXX',
    operators: textFilterOperators,
  },
  {
    caption: 'ZipCode',
    name: 'ZipCode',
    operators: textFilterOperators,
  },
  {
    caption: 'State',
    name: 'State',
    operators: textFilterOperators,
  },
  {
    caption: 'City',
    name: 'City',
    operators: textFilterOperators,
  },
  {
    caption: 'County',
    name: 'County',
    operators: textFilterOperators,
  },
  {
    caption: 'CountyPop',
    name: 'CountyPop',
    operators: textFilterOperators,
  },
  {
    caption: 'ZipCodeCount',
    name: 'ZipCodeCount',
    operators: textFilterOperators,
  },
  {
    caption: 'ZipCodeFreq',
    name: 'ZipCodeFreq',
    operators: textFilterOperators,
  },
  {
    caption: 'Latitude',
    name: 'Latitude',
    operators: textFilterOperators,
  },
  {
    caption: 'Longitude',
    name: 'Longitude',
    operators: textFilterOperators,
  },
  {
    caption: 'TimeZone',
    name: 'TimeZone',
    operators: textFilterOperators,
  },
  {
    caption: 'ObservesDST',
    name: 'ObservesDST',
    operators: textFilterOperators,
  },
  {
    caption: 'NXXUseType',
    name: 'NXXUseType',
    operators: textFilterOperators,
  },
  {
    caption: 'NXXIntroVersion',
    name: 'NXXIntroVersion',
    operators: textFilterOperators,
  },
  {
    caption: 'NPANew',
    name: 'NPANew',
    operators: textFilterOperators,
  },
  {
    caption: 'FIPS',
    name: 'FIPS',
    operators: textFilterOperators,
  },
  {
    caption: 'Status',
    name: 'Status',
    operators: textFilterOperators,
  },
  {
    caption: 'LATA',
    name: 'LATA',
    operators: textFilterOperators,
  },
  {
    caption: 'Overlay',
    name: 'Overlay',
    operators: textFilterOperators,
  },
  {
    caption: 'RateCenter',
    name: 'RateCenter',
    operators: textFilterOperators,
  },
  {
    caption: 'SwitchCLLI',
    name: 'SwitchCLLI',
    operators: textFilterOperators,
  },
  {
    caption: 'MSA_CBSA',
    name: 'MSA_CBSA',
    operators: textFilterOperators,
  },
  {
    caption: 'MSA_CBSA_CODE',
    name: 'MSA_CBSA_CODE',
    operators: textFilterOperators,
  },
  {
    caption: 'OCN',
    name: 'OCN',
    operators: textFilterOperators,
  },
  {
    caption: 'Company',
    name: 'Company',
    operators: textFilterOperators,
  },
  {
    caption: 'CoverageAreaName',
    name: 'CoverageAreaName',
    operators: textFilterOperators,
  },
  {
    caption: 'Flags',
    name: 'Flags',
    operators: textFilterOperators,
  },
  {
    caption: 'WeightedLat',
    name: 'WeightedLat',
    operators: textFilterOperators,
  },
  {
    caption: 'WeightedLon',
    name: 'WeightedLon',
    operators: textFilterOperators,
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
    key: 'NPA',
    title: 'NPA',
    dataType: 'number',
    style: { width: 100 },
    visible: true,
  },
  {
    key: 'NXX',
    title: 'NXX',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'NPANXX',
    title: 'NPANXX',
    dataType: 'string',
    style: { width: 130 },
    visible: true,
  },
  {
    key: 'ZipCode',
    title: 'ZipCode',
    dataType: 'string',
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'State',
    title: 'State',
    dataType: 'string',
    style: { width: 130 },
    visible: true,
  },
  {
    key: 'City',
    title: 'City',
    dataType: 'string',
    style: { width: 210 },
    visible: true,
  },
  {
    key: 'County',
    title: 'County',
    dataType: 'string',
    style: { width: 170 },
    visible: true,
  },
  {
    key: 'CountyPop',
    title: 'CountyPop',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'ZipCodeCount',
    title: 'ZipCodeCount',
    dataType: 'string',
    style: { width: 190 },
    visible: true,
  },
  {
    key: 'ZipCodeFreq',
    title: 'ZipCodeFreq',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'Latitude',
    title: 'Latitude',
    dataType: 'string',
    style: { width: 170 },
    visible: true,
  },
  {
    key: 'Longitude',
    title: 'Longitude',
    dataType: 'string',
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'TimeZone',
    title: 'TimeZone',
    dataType: 'string',
    style: { width: 140 },
    visible: true,
  },
  {
    key: 'ObservesDST',
    title: 'ObservesDST',
    dataType: 'string',
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'NXXUseType',
    title: 'NXXUseType',
    dataType: 'string',
    style: { width: 150 },
    visible: true,
  },
  {
    key: 'NXXIntroVersion',
    title: 'NXXIntroVersion',
    dataType: 'string',
    style: { width: 180 },
    visible: true,
  },
  {
    key: 'NPANew',
    title: 'NPANew',
    dataType: 'number',
    style: { width: 130 },
    visible: true,
  },
  {
    key: 'FIPS',
    title: 'FIPS',
    dataType: 'string',
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'LATA',
    title: 'LATA',
    dataType: 'string',
    style: { width: 130 },
    visible: true,
  },
  {
    key: 'Overlay',
    title: 'Overlay',
    dataType: 'string',
    style: { width: 160 },
    visible: true,
  },
  {
    key: 'RateCenter',
    title: 'RateCenter',
    dataType: 'string',
    style: { width: 180 },
    visible: true,
  },
  {
    key: 'SwitchCLLI',
    title: 'SwitchCLLI',
    dataType: 'string',
    style: { width: 130 },
    visible: true,
  },
  {
    key: 'MSA_CBSA',
    title: 'MSA_CBSA',
    dataType: 'string',
    style: { width: 400 },
    visible: true,
  },
  {
    key: 'MSA_CBSA_CODE',
    title: 'MSA_CBSA_CODE',
    dataType: 'string',
    style: { width: 190 },
    visible: true,
  },
  {
    key: 'OCN',
    title: 'OCN',
    dataType: 'string',
    style: { width: 180 },
    visible: true,
  },
  {
    key: 'Company',
    title: 'Company',
    dataType: 'string',
    style: { width: 360 },
    visible: true,
  },
  {
    key: 'CoverageAreaName',
    title: 'CoverageAreaName',
    dataType: 'string',
    style: { width: 240 },
    visible: true,
  },
  {
    key: 'Flags',
    title: 'Flags',
    dataType: 'string',
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'WeightedLat',
    title: 'WeightedLat',
    dataType: 'string',
    style: { width: 200 },
    visible: true,
  },
  {
    key: 'WeightedLon',
    title: 'WeightedLon',
    dataType: 'string',
    style: { width: 180 },
    visible: true,
  },
]
