import { deselectAllFilteredRows, selectAllFilteredRows } from 'ka-table/actionCreators'
import Checkbox from '@material-ui/core/Checkbox'
export default function SelectionHeader({
  dispatch,
  areAllRowsSelected,
  selectedRowIds,
  setTableToolbar,
  searchedData,
}) {
  return (
    <Checkbox
      checked={areAllRowsSelected}
      color="primary"
      onChange={(event) => {
        if (event.currentTarget.checked) {
          dispatch(selectAllFilteredRows())
        } else {
          dispatch(deselectAllFilteredRows())
        }
      }}
    />
  )
}
