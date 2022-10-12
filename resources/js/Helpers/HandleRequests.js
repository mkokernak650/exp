import axios from 'axios'
import toast from 'react-hot-toast'

export function deleteHandler(
  uri,
  selectedRowIds,
  setSelectedRowIds,
  tableProps,
  changeTableProps,
  isLoading,
  setIsLoading,
  setInbounIds,
  setTableToolbar,
  setShowDeleteModal,
  itemPerPage,
  getSearchingData
) {
  setIsLoading({ ...isLoading, delete: true })
  axios
    .post(route(uri), { selectedRowIds: selectedRowIds })
    .then((res) => {
      if (res.data.status_code === 200) {
        let filteredData = tableProps
        const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
        filteredData.data = newData
        setIsLoading({ ...isLoading, delete: false })
        changeTableProps(filteredData)
        setSelectedRowIds([])
        setInbounIds([])
        getSearchingData(itemPerPage)
        setTableToolbar(false)
        toast.success(res.data.msg)
        setShowDeleteModal({ open: false })
      } else {
        setIsLoading({ ...isLoading, delete: false })
        toast.error(res.data.msg)
        setSelectedRowIds([])
        setInbounIds([])
        setShowDeleteModal({ open: false })
      }
    })
    .catch((err) => {
      setIsLoading({ ...isLoading, delete: false })
      setTableToolbar(false)
      setSelectedRowIds([])
      setInbounIds([])
      setShowDeleteModal({ open: false })
    })
}
