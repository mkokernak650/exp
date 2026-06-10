// Shared spot/length options used by Campaign Affiliate (coupon/phone) create+edit
// and the Ringba IO term create. Home Shopping uses "Block Programming" (a block
// can run 30 minutes to 12 hours) and "Various" for mixed-length schedules.
// NOTE: interim source of truth until the master Length field lives in the Database tab.
export const LENGTH_OPTIONS = [
  ':15',
  ':30',
  ':60',
  ':120',
  '28:30',
  '30:00',
  '57:00',
  '60:00',
  'Block Programming',
  'Various',
]

export const lengthSelectOptions = LENGTH_OPTIONS.map((length) => ({
  label: length,
  value: length,
}))
