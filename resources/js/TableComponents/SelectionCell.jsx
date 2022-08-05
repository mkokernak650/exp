import Checkbox from "@material-ui/core/Checkbox"
import {
    deselectRow,
    selectRow,
    selectRowsRange,
} from "ka-table/actionCreators"


export default function SelectionCell({
    rowKeyValue,
    dispatch,
    isSelectedRow,
    selectedRows,
    selectedRowIds, setTableToolbar
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
                    setTableToolbar(true)
                    const id = parseInt(rowKeyValue)
                    if (!selectedRowIds.includes(id)) {
                        selectedRowIds.push(id)
                    }
                } else {
                    dispatch(deselectRow(rowKeyValue))
                    const id = parseInt(rowKeyValue)
                    const itemIndx = selectedRowIds.indexOf(id)
                    selectedRowIds.splice(itemIndx, 1)
                    if (selectedRowIds.length < 1) {
                        setTableToolbar(false)
                    }
                }
            }}
        />
    )
}