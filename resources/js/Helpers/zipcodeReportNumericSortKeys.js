export const ZIPCODE_DATABASE_NUMERIC_SORT_KEYS = new Set([
  'NPA',
  'NXX',
  'NPANXX',
  'ZipCode',
  'CountyPop',
  'ZipCodeCount',
  'ZipCodeFreq',
  'Latitude',
  'Longitude',
  'WeightedLat',
  'WeightedLon',
  'FIPS',
  'LATA',
  'MSA_CBSA_CODE',
  'Overlay',
])

export const ZIPCODE_BY_TV_MARKET_NUMERIC_SORT_KEYS = new Set([
  'population',
  'zip_code',
  'fips',
  'median_household_income_2007_2011',
  'race_americanindian',
  'race_asian',
  'race_white',
  'race_black',
  'race_hawaiian',
  'race_hispanic',
  'race_other',
])

export const MARKET_EXCEPTION_NUMERIC_SORT_KEYS = new Set(['market_id', 'ranks', 'nielsen_households'])

export const BROADCAST_DAYS_COUNT_SORT_KEYS = new Set(['days_count'])
