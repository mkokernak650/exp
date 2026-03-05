import { Checkbox } from 'antd'

export default function SelectionHeader({
  areAllRowsSelected,
  onChange,
}) {
  return (
    <Checkbox
      checked={areAllRowsSelected}
      onChange={(e) => onChange(e.target.checked)}
    />
  )
}
