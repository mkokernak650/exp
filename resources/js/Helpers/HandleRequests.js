import axios from 'axios'
import emptyCheckbox from "./EmptyCheckbox";
export function deleteHandler(uri, selectedRowIds,setselectedRowIds, tableProps, changeTableProps, setDeleteLoading, setInbounIds,
    setTableToolbar, setOpen, setResponse, setShowDeleteModal, optionKey) {

    setDeleteLoading(true)
    axios.post(route(uri), { selectedRowIds: selectedRowIds })
        .then((res) => {
            if (res.data.status_code === 200) {
                let filteredData = tableProps;
                const newData = filteredData.data.filter(
                    (item) => !selectedRowIds.includes(item.id)
                );
                filteredData.data = newData;
                setDeleteLoading(false)
                changeTableProps(filteredData);
                setselectedRowIds([])
                setInbounIds([]);
                setTableToolbar(false);
                setOpen(true);
                setResponse(res.data.msg);
                setShowDeleteModal({ open: false });
                emptyCheckbox(optionKey, tableProps, changeTableProps);
            } else {
                setDeleteLoading(false)
                setOpen(true);
                setResponse(res.data.msg);
                setselectedRowIds([])
                setInbounIds([]);
                setShowDeleteModal({ open: false });
                emptyCheckbox(optionKey, tableProps, changeTableProps);
            }
        })
        .catch((err) => {
            setDeleteLoading(false)
            setTableToolbar(false);
            setselectedRowIds([])
            setInbounIds([]);
            setShowDeleteModal({ open: false });
            emptyCheckbox(optionKey, tableProps, changeTableProps);
        });
}


// export function handlePending(uri, inboundIds, setselectedRowIds, tableProps, changeTableProps, setPendingLoading, setInbounIds,
//     setTableToolbar, setOpen, setResponse, setShowPendingModal, optionKey, setOpenRowFunctionalities) {
//     setPendingLoading(true)
//     axios
//         .post(route(uri), { inboundIds })
//         .then((res) => {
//             if (res.data.status_code === 200) {
//                 setPendingLoading(false)
//                 setResponse(res.data.msg);
//                 setOpen(true);
//                 let columnsData = produce(tableProps, draft => {
//                     const filteredData = draft.data.filter(
//                         (item) => !inboundIds.includes(item.Inbound_Id)
//                     );
//                     draft.data = filteredData
//                 })
//                 changeTableProps(columnsData);
//                 setTableToolbar(false)
//                 setInbounIds([]);
//                 setselectedRowIds([]);
//                 setOpenRowFunctionalities(false);
//                 setShowPendingModal({ open: false });
//                 emptyCheckbox(optionKey, tableProps, changeTableProps);

//             } else {
//                 setPendingLoading(false)
//                 setResponse(res.data.msg);
//                 setOpen(true);
//                 setInbounIds([]);
//                 setselectedRowIds([]);
//                 setOpenRowFunctionalities(false);
//                 setShowPendingModal({ open: false });
//                 emptyCheckbox(optionKey, tableProps, changeTableProps);
//             }
//         })
//         .catch((err) => {
//             setPendingLoading(false)
//             setOpenRowFunctionalities(false);
//             setShowPendingModal({ open: false });
//             setselectedRowIds([]);
//             setInbounIds([]);
//             emptyCheckbox(optionKey, tableProps, changeTableProps);

//         });
// };
