import Layout from "./Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import React, { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import {
    DataType,
    SortingMode,
    PagingPosition
} from "ka-table/enums";
import "ka-table/style.scss";
import axios from "axios";
import SnackBar from "../Shared/SnackBar";
import { SearchedFields } from "../Helpers/SearchedFields";
import MainTable from '../Components/MainTable'
import { defaultFilter } from "../Helpers/Filter";
import { useRecoilState } from 'recoil'
import { GlobalStates } from "../Helpers/GlobalStates"
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import ConfirmModal from "../Shared/ConfirmModal";
import { filterData } from '../Helpers/filterData';

const Test = () => {
    const { allReports, columns } = usePage().props
    const [columnDetails, setColumnDetails] = useRecoilState(GlobalStates)
    const [showColumns, setShowColumns] = useState(false);
    const [openTableToolbar, setOpenTableToolbar] = useState(false);
    const [response, setResponse] = useState();
    const [open, setOpen] = useState(false);
    const [filterValue, setFilterValue] = useState(defaultFilter('and', 'lname', 'isNotEmpty', 'string', 0, ''));
    const [showDeleteModal, setShowDeleteModal] = useState({ open: false });
    const showColumnRef = useRef();
    const tableDetailsData = JSON.parse(columns.length > 0 && columns?.[0]?.columns);
    const optionKey = "WebFormColumnDetails";
    const [filteredData, setFilteredData] = useState(
        filterData(allReports, filterValue)
    );

    const dataArray = filteredData.map((item, index) => ({
        sl: index + 1,
        company: item.company,
        lname: item.lname,
        email: item.email,
        phone: item.phone,
        skype: item.skype,
        street: item.street,
        city: item.city,
        state: item.state,
        zipCode: item.zipcode,
        country: item.country,
        website: item.website,
        comment: item.comment,
        created_at: item.created_at,
        id: item.id,
        key: index,
    }));

    const tablePropsInit = {
        columns: [
            {
                key: "selection-cell",
                style: { width: 80 },
            },
            {
                key: "sl",
                title: "SL",
                dataType: DataType.Number,
                style: { width: 100 },
            },
            {
                key: "company",
                title: "Company",
                dataType: DataType.String,
                style: { width: 280 },
            },
            {
                key: "lname",
                title: "Last Name",
                dataType: DataType.String,
                style: { width: 320 },
            },
            {
                key: "email",
                title: "Email",
                dataType: DataType.String,
                style: { width: 320 },
            },
            {
                key: "phone",
                title: "Phone",
                dataType: DataType.String,
                style: { width: 160 },
            },
            {
                key: "skype",
                title: "Skype",
                dataType: DataType.String,
                style: { width: 370 },
            },
            {
                key: "street",
                title: "Street",
                dataType: DataType.String,
                style: { width: 280 },
            },
            {
                key: "city",
                title: "City",
                dataType: DataType.String,
                style: { width: 270 },
            },
            {
                key: "state",
                title: "State",
                dataType: DataType.String,
                style: { width: 310 },
            },
            {
                key: "zipCode",
                title: "ZipCode",
                dataType: DataType.Number,
                style: { width: 230 },
            },
            {
                key: "country",
                title: "Country",
                dataType: DataType.String,
                style: { width: 300 },
            },
            {
                key: "website",
                title: "Website",
                dataType: DataType.String,
                style: { width: 280 },
            },
            {
                key: "comment",
                title: "Comment",
                dataType: DataType.String,
                style: { width: 230 },
            },
            {
                key: "created_at",
                title: "Created Time",
                dataType: DataType.Date,
                style: { width: 280 },
            },
        ],
        paging: {
            enabled: true,
            pageIndex: 0,
            pageSize: 10,
            pageSizes: [5, 10, 15],
            position: PagingPosition.Bottom,
        },
        data: dataArray,
        rowKeyField: "id",
        sortingMode: SortingMode.Single,
        columnResizing: true,
        columnReordering: true,
        format: ({ column, value }) => {
            if (column.key === "Website") {
                return (
                    <a target="_blank" href={value}>
                        {value}
                    </a>
                );
            }
        },
    };

    useEffect(() => {
        if (!columnDetails.WebFormColumnDetails) columnDetails.WebFormColumnDetails = {}
        if (!columnDetails.test) columnDetails.test = {}
    })

    const fields = SearchedFields(tablePropsInit.columns)
    let stateStore
    if (tableDetailsData?.WebFormColumnDetails !== null) {
        stateStore = {
            ...tablePropsInit,
            ...tableDetailsData.WebFormColumnDetails,
        };

    }
    const [tableProps, changeTableProps] = useState(stateStore);
    let selectedRowIds = tableProps?.selectedRows
    window.onload = function () {
        changeTableProps({ ...tableProps, selectedRows: [] })
    };

    const handleColumns = () => {
        setShowColumns(true);
    };

    const deleteHandler = () => {
        axios
            .post(route("webform.reports.delete"), { selectedRowIds })
            .then((res) => {
                if (res.data.status_code === 200) {
                    let filteredData = tableProps;
                    const newData = filteredData.data.filter(
                        (item) => !selectedRowIds.includes(item.id)
                    );
                    filteredData.data = newData;
                    setOpenTableToolbar(false);
                    setOpen(true);
                    setResponse(res.data.msg);
                    setShowDeleteModal({ open: false });
                    changeTableProps({ ...tableProps, selectedRows: [] })
                } else {
                    setOpenTableToolbar(false);
                    setOpen(true);
                    setResponse(res.data.msg);
                    setShowDeleteModal({ open: false });
                    changeTableProps({ ...tableProps, selectedRows: [] })
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleCloseModal = (setOpenModal) => {
        setOpenModal({ open: false });
        setOpenTableToolbar(false);
        changeTableProps({ ...tableProps, selectedRows: [] })
    }

    const TableToolbar = () => {
        return (
            <div className="table-toolbar">
                <Tooltip title="Delete">
                    <IconButton aria-label="delete" onClick={() => handleOpenModal(setShowDeleteModal)}>
                        <DeleteIcon style={{ color: "#031b4e" }} />
                    </IconButton>
                </Tooltip>
                <div className="selection-rows">
                    {selectedRowIds.length} Rows Selected
                </div>
            </div>
        );
    };

    const handleOpenModal = (setOpenModal) => {
        setOpenModal({ open: true });
    };

    return (
        <>
            <Helmet title="Test Table Report" />
            <MainTable
                TableToolbar={TableToolbar}
                openTableToolbar={openTableToolbar}
                setOpenTableToolbar={setOpenTableToolbar}
                selectedRowIds={selectedRowIds}
                handleColumns={handleColumns}
                showColumns={showColumns}
                setShowColumns={setShowColumns}
                showColumnRef={showColumnRef}
                tableProps={tableProps}
                changeTableProps={changeTableProps}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
                fields={fields}
                columnDetails={columnDetails}
                optionKey={optionKey}
                filteredData={filteredData}
                setFilteredData={setFilteredData}
                filterData={filterData}
            />
            <ConfirmModal
                open={showDeleteModal.open}
                setOpen={setShowDeleteModal}
                btnAction={deleteHandler}
                closeAction={() => handleCloseModal(setShowDeleteModal)}
                width={"400px"}
                title={`${selectedRowIds?.length > 1
                    ? "Do you want to delete these records?"
                    : "Do you want to delete this record?"
                    }`}
            ></ConfirmModal>
            <SnackBar open={open} setOpen={setOpen} response={response} />

        </>

    );
};

Test.layout = (page) => <Layout>{page}</Layout>;
export default Test;
