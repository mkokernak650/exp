import Layout from "../Layout/Layout";
import M from "materialize-css";
import React, { useEffect, useState, useRef } from "react";
import { kaReducer, Table } from "ka-table";
import {
  DataType,
  SortingMode,
  PagingPosition,
  EditingMode,
  ActionType,
} from "ka-table/enums";
import { kaPropsUtils } from "ka-table/utils";
import { InertiaLink, usePage } from "@inertiajs/inertia-react";
import {
  deselectAllFilteredRows,
  deselectRow,
  selectAllFilteredRows,
  selectRow,
  selectRowsRange,
} from "ka-table/actionCreators";
import FilterControl from "react-filter-control";
import { filterData } from "../filterData";
import "ka-table/style.scss";
import search from "../../../images/search.svg";
import eyeIcon from "../../../images/eyeIcon.svg";
import closeNav from "../../../images/closeNav.svg";
import Cancel from "../../../images/cancel.svg";
import { hideColumn, showColumn } from "ka-table/actionCreators";
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Edit from "../../../images/edit1.svg";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import { Button, makeStyles } from "@material-ui/core";
import axios from "axios";
import { Helmet } from "react-helmet";
import SnackBar from "../../Shared/SnackBar";
import ConfirmModal from "../../Shared/ConfirmModal";
import NormalModal from "../../Shared/NormalModal";

const useStyles = makeStyles(() => ({
  topBtn: {
    display: "flex",
    gap: "10px",
    marginLeft: "10px",
  },
  button: {
    width: 130,
    textTransform: "capitalize",
    fontSize: "14px",
  },
  editButton: {
    marginTop: "15px",
  },
}));

const operators = [
  {
    caption: "Contains",
    name: "contains",
  },
  {
    caption: "Not Contains",
    name: "doesNotContain",
  },
  {
    caption: "Is Empty",
    name: "isEmpty",
  },
  {
    caption: "Is Not Empty",
    name: "isNotEmpty",
  },
  {
    caption: "Starts With",
    name: "startswith",
  },
  {
    caption: "Ends With",
    name: "endsWith",
  },
  {
    caption: "Is",
    name: "is",
  },
  {
    caption: "Is Not",
    name: "isnot",
  },
];

export const fields = [
  {
    caption: "order_no",
    name: "order_no",
    operators,
  },
  {
    caption: "coupon_code",
    name: "coupon_code",
    operators,
  },
  {
    caption: "user_ip",
    name: "user_ip",
    operators,
  },
  {
    caption: "shipping_city",
    name: "shipping_city",
    operators,
  },
  {
    caption: "shipping_state",
    name: "shipping_state",
    operators,
  },
  {
    caption: "shipping_zip",
    name: "shipping_zip",
    operators,
  },
  {
    caption: "billing_zip",
    name: "billing_zip",
    operators,
  },
  {
    caption: "quantity",
    name: "quantity",
    operators,
  },
  {
    caption: "subtotal",
    name: "subtotal",
    operators,
  },
  {
    caption: "shipping_cost",
    name: "shipping_cost",
    operators,
  },
  {
    caption: "total",
    name: "total",
    operators,
  },
  {
    caption: "order_at",
    name: "order_at",
    operators,
  },
];

export const groups = [
  {
    caption: "And",
    name: "and",
  },
  {
    caption: "Or",
    name: "or",
  },
];

export const filter = {
  groupName: "and",
  items: [
    {
      field: "coupon_code",
      operator: "isNotEmpty",
    },
  ],
};

const SalesIndex = () => {
  const classes = useStyles();
  const { sales } = usePage().props;
  const [showColumns, setShowColumns] = useState(false);
  const [tableToolbar, setTableToolbar] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [responseType, setResponseType] = useState("success");
  const [showEditModal, setShowEditModal] = useState({ open: false });
  const [editData, setEditData] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false });
  const showColumnRef = useRef();

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const headers = {
    headers: {
      Accept: "application/json",
    },
  };

  const handleEditSubmit = () => {
    axios
      .put(route("ecommerce-sales.update", editData.id), editData, headers)
      .then((res) => {
        let filteredData = tableProps;
        filteredData.data[editData.sl - 1] = {...editData};

        setEditData();
        setShowEditModal({ open: false });
        setResponse(res.data.msg);
        setResponseType("success");
        setOpen(true);
      })
      .catch((err) => {
        let errors = "";
        Object.values(err.response.data?.errors).map((error) => {
          errors += error[0] + "\n";
        });
        setResponse(errors);
        setResponseType("error");
        setOpen(true);
      });
  };

  const dataArray = sales.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    order_no: item.order_no,
    coupon_code: item.coupon_code,
    user_ip: item.user_ip,
    shipping_city: item.shipping_city,
    shipping_state: item.shipping_state,
    shipping_zip: item.shipping_zip,
    billing_zip: item.billing_zip,
    quantity: item.quantity,
    subtotal: item.subtotal,
    shipping_cost: item.shipping_cost,
    total: item.total,
    order_at: item.formatted_order_at,
    id: item.id,
    key: index,
  }));

  const SelectionCell = ({
    rowKeyValue,
    dispatch,
    isSelectedRow,
    selectedRows,
  }) => {
    return (
      <Checkbox
        checked={isSelectedRow}
        color="primary"
        onChange={(event) => {
          if (event.nativeEvent.shiftKey) {
            dispatch(selectRowsRange(rowKeyValue, [...selectedRows].pop()));
          } else if (event.currentTarget.checked) {
            dispatch(selectRow(rowKeyValue));
            setTableToolbar(true);
            const id = parseInt(rowKeyValue);
            if (!selectedRowIds.includes(id)) {
              selectedRowIds.push(id);
            }
          } else {
            dispatch(deselectRow(rowKeyValue));
            const id = parseInt(rowKeyValue);
            const itemIndx = selectedRowIds.indexOf(id);
            selectedRowIds.splice(itemIndx, 1);
            if (selectedRowIds.length < 1) {
              setTableToolbar(false);
            }
          }
        }}
      />
    );
  };
  const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
    return (
      <Checkbox
        checked={areAllRowsSelected}
        color="primary"
        onChange={(event) => {
          if (event.currentTarget.checked) {
            dispatch(selectAllFilteredRows()); // also available: selectAllVisibleRows(), selectAllRows()
            setTableToolbar(true);
            let i = 0;
            while (i < tableProps.data.length) {
              if (!selectedRowIds.includes(tableProps.data[i].id)) {
                selectedRowIds.push(tableProps.data[i].id);
                continue;
              }
              i++;
            }
          } else {
            dispatch(deselectAllFilteredRows()); // also available: deselectAllVisibleRows(), deselectAllRows()
            if (selectedRowIds) {
              selectedRowIds.splice(0, selectedRowIds.length);
            }
            if (selectedRowIds.length < 1) {
              setTableToolbar(false);
            }
          }
        }}
      />
    );
  };

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
      if (item.id == itemId) {
        setEditData(item);
      }
    });
    setShowEditModal({ open: true });
  };

  const tablePropsInit = {
    columns: [
      {
        key: "edit",
        style: { width: 40 },
      },
      {
        key: "selection-cell",
        style: { width: 80 },
      },
      {
        key: "sl",
        title: "SL",
        dataType: DataType.Number,
        style: { width: 60 },
      },
      {
        key: "order_at",
        title: "Order AT",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "order_no",
        title: "Order No",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "coupon_code",
        title: "Coupon Code",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "user_ip",
        title: "User IP",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "shipping_city",
        title: "Shipping City",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "shipping_state",
        title: "Shipping State",
        dataType: DataType.String,
        style: { width: 140 },
      },
      {
        key: "shipping_zip",
        title: "Shipping Zip",
        dataType: DataType.String,
        style: { width: 140 },
      },
      {
        key: "billing_zip",
        title: "Billing Zip",
        dataType: DataType.String,
        style: { width: 120 },
      },
      {
        key: "quantity",
        title: "Quantity",
        dataType: DataType.String,
        style: { width: 120 },
      },
      {
        key: "subtotal",
        title: "Subtotal",
        dataType: DataType.String,
        style: { width: 140 },
      },
      {
        key: "shipping_cost",
        title: "Shipping Cost",
        dataType: DataType.String,
        style: { width: 140 },
      },
      {
        key: "total",
        title: "Total",
        dataType: DataType.String,
        style: { width: 140 },
      },
    ],
    paging: {
      enabled: true,
      pageIndex: 0,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      position: PagingPosition.Bottom,
    },
    data: dataArray,
    rowKeyField: "id",
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
    format: ({ column, value }) => {
      if (column.key === "edit") {
        return (
          <div className="edit-icon" onClick={() => handleEdit(value)}>
            <img src={Edit} alt="edit-icon"></img>
          </div>
        );
      }
    },
  };

  const OPTION_KEY = "sales-index";
  const stateStore = {
    ...tablePropsInit,
    ...JSON.parse(localStorage.getItem(OPTION_KEY) || "0"),
  };
  const [tableProps, changeTableProps] = useState(stateStore);
  const dispatch = (action) => {
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action);
      const { data, ...settingsWithoutData } = newState;
      localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData));
      return newState;
    });
  };
  const [filterValue, changeFilter] = useState(filter);
  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue);
  };

  const [serachSidebar, setSearchSidebar] = useState(false);

  const handleSearch = () => {
    setSearchSidebar((prevState) => !prevState);
  };

  const handleColumns = () => {
    setShowColumns(true);
  };
  const closeSidebar = () => {
    setSearchSidebar(false);
  };

  const deleteHandler = () => {
    axios
      .post(route("ecommerce-sales.deleteSelected"), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps;
          const newData = filteredData.data.filter(
            (item) => !selectedRowIds.includes(item.id)
          );
          filteredData.data = newData;
          changeTableProps(filteredData);
          setSelectedRowIds([]);
          setTableToolbar(false);
          setResponseType("success");
          setOpen(true);
          setResponse(res.data.msg);
          setShowDeleteModal({ open: false });
          emptyCheckbox();
        } else {
          setOpen(true);
          setResponseType("error");
          setResponse(res.data.msg);
          setShowDeleteModal({ open: false });
          emptyCheckbox();
        }
      })
      .catch((err) => {
        console.log(err);
        setShowDeleteModal({ open: false });
        emptyCheckbox();
      });
  };

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false });
    setTableToolbar(false);
    setSelectedRowIds([]);
    emptyCheckbox();
  };

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true });
  };

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        showColumns &&
        showColumnRef.current &&
        !showColumnRef.current.contains(e.target)
      ) {
        setShowColumns(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [showColumns]);

  const emptyCheckbox = () => {
    const storedData = JSON.parse(localStorage.getItem("sales-index"));
    storedData.selectedRows = [];
    localStorage.setItem("sales-index", JSON.stringify(storedData));
    let filteredData = { ...tableProps };
    filteredData.selectedRows = [];
    changeTableProps(filteredData);
  };

  useEffect(() => {
    window.onload = function () {
      const storedData = JSON.parse(localStorage.getItem("sales-index"));
      if (storedData != null) {
        emptyCheckbox();
      }
    };
  }, []);

  useEffect(() => M.AutoInit());

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton
            aria-label="delete"
            onClick={() => handleOpenModal(setShowDeleteModal)}
          >
            <DeleteIcon style={{ color: "#031b4e" }} />
          </IconButton>
        </Tooltip>
        <div className="selection-rows">
          {selectedRowIds.length} Row Selected
        </div>
      </div>
    );
  };

  const ColumnSettings = (tableProps) => {
    const columnsSettingsProps = {
      data: tableProps.columns.map((c) => ({
        ...c,
        visible: c.visible !== false,
      })),
      rowKeyField: "key",
      columns: [
        {
          key: "visible",
          title: "Visible",
          isEditable: false,
          style: { textAlign: "center" },
          width: 80,
          dataType: DataType.Boolean,
        },
        {
          key: "title",
          isEditable: false,
          title: "Fields",
          dataType: DataType.String,
        },
      ],
      editingMode: EditingMode.None,
    };
    const dispatchSettings = (action) => {
      if (action.type === ActionType.UpdateCellValue) {
        tableProps.dispatch(
          action.value
            ? showColumn(action.rowKeyValue)
            : hideColumn(action.rowKeyValue)
        );
      }
    };
    return (
      <Table
        {...columnsSettingsProps}
        childComponents={{
          rootDiv: {
            elementAttributes: () => ({
              style: { width: 400, marginBottom: 20 },
            }),
          },
          cell: {
            content: (props) => {
              switch (props.column.key) {
                case "visible":
                  return <CellEditorBoolean {...props} />;
              }
            },
          },
        }}
        dispatch={dispatchSettings}
      />
    );
  };

  return (
    <>
      <Helmet title="Sales Index" />

      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <img src={eyeIcon} alt="search"></img>
              </div>
            </div>
            <div className="search-icon" onClick={handleSearch}>
              <span>Search Here</span>
              <img src={search} alt="search"></img>
            </div>

            {serachSidebar ? (
              <div className="search-sidebar">
                <div className="search-top">
                  <div className="title">
                    <span>Search</span>
                  </div>
                  <a className="close-nav" onClick={closeSidebar}>
                    <img src={closeNav} alt="file not found"></img>
                  </a>
                </div>

                <div className="top-element">
                  <FilterControl
                    {...{
                      fields,
                      groups,
                      filterValue,
                      onFilterValueChanged: onFilterChanged,
                    }}
                  />
                </div>
              </div>
            ) : (
              ""
            )}
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings {...tableProps} dispatch={dispatch} />
              </div>
            ) : (
              ""
            )}
          </div>
        )}
        <Table
          {...tableProps}
          childComponents={{
            cellText: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <SelectionCell {...props} />;
                }
              },
            },
            filterRowCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <></>;
                }
              },
            },
            headCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return (
                    <SelectionHeader
                      {...props}
                      areAllRowsSelected={kaPropsUtils.areAllFilteredRowsSelected(
                        tableProps
                      )}
                      // areAllRowsSelected={kaPropsUtils.areAllVisibleRowsSelected(tableProps)}
                    />
                  );
                }
              },
            },
            cell: {
              content: (props) => {
                switch (props.column.key) {
                  case "drag":
                    return (
                      <img
                        style={{ cursor: "move" }}
                        src="https://komarovalexander.github.io/ka-table/static/icons/draggable.svg"
                        alt="draggable"
                      />
                    );
                }
              },
            },
          }}
          dispatch={dispatch}
          extendedFilter={(data) => filterData(data, filterValue)}
        />
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={"600px"}
        title={"Edit E-commerce Affiliate"}
      >
        <div className="edit_target">
          <form className={classes.form}>
            <TextField
              value={editData ? editData.order_no : ""}
              fullWidth
              type="text"
              margin="normal"
              name="order_no"
              label="Order No"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData.coupon_code : ""}
              fullWidth
              type="text"
              margin="normal"
              name="coupon_code"
              label="Coupon Code"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData.quantity : ""}
              fullWidth
              type="text"
              margin="normal"
              name="quantity"
              label="Quantity"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData.subtotal : ""}
              fullWidth
              type="text"
              margin="normal"
              name="subtotal"
              label="Subtotal"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData.shipping_cost : ""}
              fullWidth
              type="text"
              margin="normal"
              name="shipping_cost"
              label="Shipping Cost"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData.total : ""}
              fullWidth
              type="text"
              margin="normal"
              name="total"
              label="Total"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData.shipping_state : ""}
              fullWidth
              type="text"
              margin="normal"
              name="shipping_state"
              label="Shipping State"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData.shipping_city : ""}
              fullWidth
              type="text"
              margin="normal"
              name="shipping_city"
              label="Shipping City"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData.shipping_zip : ""}
              fullWidth
              type="text"
              margin="normal"
              name="shipping_zip"
              label="Shipping Zip"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData.billing_zip : ""}
              fullWidth
              type="text"
              margin="normal"
              name="billing_zip"
              label="Billing Zip"
              onChange={handleEditChange}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditSubmit}
              className={classes.editButton}
            >
              Update
            </Button>
          </form>

          <div
            onClick={() => handleCloseModal(setShowEditModal)}
            className="close-modal-icon"
          >
            <img src={Cancel} alt="close-modal-icon"></img>
          </div>
        </div>
      </NormalModal>

      <SnackBar
        open={open}
        setOpen={setOpen}
        severity={responseType}
        response={response}
      />
      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={"400px"}
        title={`${
          selectedRowIds.length > 1
            ? "Do you want to delete these records?"
            : "Do you want to delete this record?"
        }`}
      ></ConfirmModal>
    </>
  );
};

SalesIndex.layout = (page) => (
  <Layout title="Sales Index">{page}</Layout>
);
export default SalesIndex;
