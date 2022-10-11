import axios from 'axios';
import toast from 'react-hot-toast';

export function deleteHandler(
  uri,
  selectedRowIds,
  setSelectedRowIds,
  tableProps,
  changeTableProps,
  setDeleteLoading,
  setInbounIds,
  setTableToolbar,
  setShowDeleteModal,
  itemPerPage,
  getSearchingData
) {
  setDeleteLoading(true);
  axios
    .post(route(uri), { selectedRowIds: selectedRowIds })
    .then((res) => {
      if (res.data.status_code === 200) {
        let filteredData = tableProps;
        const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id));
        filteredData.data = newData;
        setDeleteLoading(false);
        changeTableProps(filteredData);
        setSelectedRowIds([]);
        setInbounIds([]);
        getSearchingData(itemPerPage)
        setTableToolbar(false);
        toast.success(res.data.msg);
        setShowDeleteModal({ open: false });
      } else {
        setDeleteLoading(false);
        toast.error(res.data.msg);
        setSelectedRowIds([]);
        setInbounIds([]);
        setShowDeleteModal({ open: false });
      }
    })
    .catch((err) => {
      setDeleteLoading(false);
      setTableToolbar(false);
      setSelectedRowIds([]);
      setInbounIds([]);
      setShowDeleteModal({ open: false });
    });
}

