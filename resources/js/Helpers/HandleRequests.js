import axios from 'axios';
import emptyCheckbox from './EmptyCheckbox';
import toast from 'react-hot-toast';

export function deleteHandler(
  uri,
  selectedRowIds,
  setselectedRowIds,
  tableProps,
  changeTableProps,
  setDeleteLoading,
  setInbounIds,
  setTableToolbar,
  setShowDeleteModal,
  optionKey
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
        setselectedRowIds([]);
        setInbounIds([]);
        setTableToolbar(false);
        toast.success(res.data.msg);
        setShowDeleteModal({ open: false });
        emptyCheckbox(optionKey, tableProps, changeTableProps);
      } else {
        setDeleteLoading(false);
        toast.error(res.data.msg);
        setselectedRowIds([]);
        setInbounIds([]);
        setShowDeleteModal({ open: false });
        emptyCheckbox(optionKey, tableProps, changeTableProps);
      }
    })
    .catch((err) => {
      setDeleteLoading(false);
      setTableToolbar(false);
      setselectedRowIds([]);
      setInbounIds([]);
      setShowDeleteModal({ open: false });
      emptyCheckbox(optionKey, tableProps, changeTableProps);
    });
}

