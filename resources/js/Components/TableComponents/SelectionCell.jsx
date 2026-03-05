import { Checkbox } from 'antd'

export default function SelectionCell({
  rowKeyValue,
  isSelectedRow,
  onChange,
}) {
  return (
    <Checkbox
      checked={isSelectedRow}
      onChange={(e) => onChange(rowKeyValue, e.target.checked)}
    />
  )
}
