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
import { usePage } from "@inertiajs/inertia-react";
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
import Edit from "../../../images/edit1.svg";

import Cancel from "../../../images/cancel.svg";
import { hideColumn, showColumn } from "ka-table/actionCreators";
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import { Button, makeStyles } from "@material-ui/core";
import Switch from "@material-ui/core/Switch";

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
export const fields = [
  {
    caption: "Broadcast Week",
    name: "broadcast_week",
    operators: [
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
    ],
  }

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
      field: "broadcast_week",
      operator: "isNotEmpty",
    },
  ],
};

const BroadcastWeekReport = () => {
  const classes = useStyles();
  const { BroadCastWeeks } = usePage().props;
  const [showColumns, setShowColumns] = useState(false);
  const [tableToolbar, setTableToolbar] = useState(false);
  const [selectedRowIds, setselectedRowIds] = useState([]);
  const [showEditModal, setShowEditModal] = useState({ open: false });
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false });
  const [editData, setEditData] = useState();
  const [response, setResponse] = useState();
  const [open, setOpen] = useState(false);
  const showColumnRef = useRef();



  const dataArray = BroadCastWeeks.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    broad_cast_week: item.broad_cast_week,
    start_date: item.start_date,
    end_date: item.end_date,
    status: [item.status, item.id],

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

  const tablePropsInit = {
    columns: [
      {
        key: "edit",
        style: { width: 20 },
      },
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
        key: "broad_cast_week",
        title: "Broadcast Week",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "start_date",
        title: "Start Date",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "end_date",
        title: "End Date",
        dataType: DataType.String,
        style: { minWidth: 100 },
      },
      {
        key: "status",
        title: "Status",
        style: { width: 240 },
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
      if (column.key === "status") {
        return (
          <Switch
            checked={value[0] === 1 && true}
            color="primary"
            onChange={() => handleStatus(event, value[0], value[1])}
          />
        );
      }
    },
  };

  const OPTION_KEY = "broadcast-week-report";
  const stateStore = {
    ...tablePropsInit,
    ...JSON.parse(localStorage.getItem(OPTION_KEY) || "0"),
  };
  const [tableProps, changeTableProps] = useState(stateStore);
  const handleStatus = (e, value, rowId) => {
    axios.post(route('broadcast.week.status.update'), { value: value, rowId: rowId })
      .then((res) => {
        let tmpData = { ...tableProps }
        tmpData.data.filter((item, indx) => {
          if (item.id === rowId) {
            if (tmpData.data[indx].status[0] == 1) {
              tmpData.data[indx].status = [0, rowId];
            } else {
              tmpData.data[indx].status = [1, rowId];
            }
          }
        });
        changeTableProps(tmpData)
      })
      .catch((err) => {
        console.log(err);
      })
  }
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

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
      if (item.id === itemId) {
        setEditData(item);
      }
    });
    setShowEditModal({ open: true });
  };
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = () => {
    axios
      .post(route("broadcast.week.edit"), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps;
          filteredData.data.filter((item, indx) => {
            if (item.id === editData.id) {
              filteredData.data[indx].broad_cast_week = editData.broad_cast_week;
              filteredData.data[indx].start_date = editData.start_date;
              filteredData.data[indx].end_date = editData.end_date;
            }
          });
          setEditData([]);
          setShowEditModal({ open: false });
          setOpen(true);
          setResponse(res.data.msg);
        } else {
          setEditData([]);
          setShowEditModal({ open: false });
          setOpen(true);
          setResponse(res.data.msg);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false });
    setTableToolbar(false);
    setselectedRowIds([]);
    emptyCheckbox();
  }


  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true });
  };
  const deleteHandler = () => {
    axios
      .post(route("broadcast.week.delete"), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps;
          const newData = filteredData.data.filter(
            (item) => !selectedRowIds.includes(item.id)
          );
          filteredData.data = newData;
          changeTableProps(filteredData);
          setselectedRowIds([]);
          setTableToolbar(false);
          setOpen(true);
          setResponse(res.data.msg);
          setShowDeleteModal({ open: false })
        } else {
          setselectedRowIds([]);
          setTableToolbar(false);
          setOpen(true);
          setResponse(res.data.msg);
          setShowDeleteModal({ open: false })

        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const emptyCheckbox = () => {
    const storedData = JSON.parse(localStorage.getItem("broadcast-week-report"));
    if(storedData?.selectedRows)  storedData.selectedRows= [];
    localStorage.setItem("broadcast-week-report", JSON.stringify(storedData));
    let filteredData = { ...tableProps };
    if(filteredData?.selectedRows) filteredData.selectedRows = [];
    changeTableProps(filteredData);
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
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [showColumns]);
  useEffect(() => {
    window.onload = function () {
      const storedData = JSON.parse(localStorage.getItem("broadcast-week-report"));
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
          <IconButton aria-label="delete" onClick={() => handleOpenModal(setShowDeleteModal)}>
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
      <Helmet title="Broadcast Week Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
              <div className="columns-show-hide" onClick={handleColumns}>
              <img src={eyeIcon} alt="search"></img>
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
      <SnackBar open={open} setOpen={setOpen} response={response} />

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={"600px"}
        title={"Edit BroadCast Week"}
      >
        <div className="edit-broadcast-week">
          <form className={classes.form}>
            <span>BroadCast Week:</span>
            <TextField
              value={editData ? editData.broad_cast_week : ""}
              fullWidth
              margin="normal"
              name="broad_cast_week"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Start Date:</span>
            <TextField
              defaultValue={editData ? editData.start_date : ""}
              fullWidth
              margin="normal"
              name="start_date"
              type="date"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>End Date:</span>

            <TextField
              defaultValue={editData ? editData.end_date : ""}
              fullWidth
              margin="normal"
              name="end_date"
              type="date"
              variant="outlined"
              onChange={handleEditChange}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleEditSubmit}
              className={classes.editButton}
            >
              Edit
            </Button>
          </form>

          <div onClick={() => handleCloseModal(setShowEditModal)} className="close-modal-icon">
            <img src={Cancel} alt="close-modal-icon"></img>
          </div>
        </div>
      </NormalModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={"400px"}
        title={`${selectedRowIds.length > 1
          ? "Do you want to delete these records?"
          : "Do you want to delete this record?"
          }`}
      ></ConfirmModal>
    </>
  );
};

BroadcastWeekReport.layout = (page) => (
  <Layout title="BroadcastWeekReport">{page}</Layout>
);
export default BroadcastWeekReport;
