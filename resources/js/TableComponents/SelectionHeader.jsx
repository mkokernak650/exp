import {
    deselectAllFilteredRows,
    selectAllFilteredRows,
} from "ka-table/actionCreators"
import Checkbox from "@material-ui/core/Checkbox"
export default function SelectionHeader({ dispatch, areAllRowsSelected, selectedRowIds, setTableToolbar, searchedData }) {
    return (
        <Checkbox
            checked={areAllRowsSelected}
            color="primary"
            onChange={(event) => {
                if (event.currentTarget.checked) {
                    dispatch(selectAllFilteredRows())
                    setTableToolbar(true)
                    let i = 0
                    if (searchedData?.data) {
                        console.log(searchedData)

                        while (i < searchedData.data.length) {
                            if (!selectedRowIds.includes(searchedData.data[i].id)) {
                                selectedRowIds.push(searchedData.data[i].id)
                                continue
                            }
                            i++
                        }
                    } else {
                        while (i < searchedData.length) {
                            if (!selectedRowIds.includes(searchedData[i].id)) {
                                selectedRowIds.push(searchedData[i].id)
                                continue
                            }
                            i++
                        }
                    }
                } else {
                    dispatch(deselectAllFilteredRows())
                    selectedRowIds.splice(0, selectedRowIds.length)
                    if (selectedRowIds.length < 1) {
                        setTableToolbar(false)
                    }
                }
            }}
        />
    )
}