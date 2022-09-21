import Checkbox from '@material-ui/core/Checkbox'
import { deselectRow, selectRow, selectRowsRange } from 'ka-table/actionCreators'

export default function SelectionCell({
  rowKeyValue,
  dispatch,
  isSelectedRow,
  selectedRows
}) {
  return (
    <Checkbox
      checked={isSelectedRow}
      color="primary"
      onChange={(event) => {
        if (event.nativeEvent.shiftKey) {
          dispatch(selectRowsRange(rowKeyValue, [...selectedRows].pop()))
        } else if (event.currentTarget.checked) {
          dispatch(selectRow(rowKeyValue))
        } else {
          dispatch(deselectRow(rowKeyValue))
        }
      }}
    />
  )
}
