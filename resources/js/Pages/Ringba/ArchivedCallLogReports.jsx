import Layout from "../Layout/Layout";
import M from "materialize-css";
import { useEffect, useState, useRef } from "react";
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
import "ka-table/style.scss";
import search from "../../../images/search.svg";
import eyeIcon from "../../../images/eyeIcon.svg";
import closeNav from "../../../images/closeNav.svg";
import Edit from "../../../images/three-dots.svg";
import { hideColumn, showColumn } from "ka-table/actionCreators";
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import { Button, makeStyles } from "@material-ui/core";
import axios from "axios";
import { Helmet } from "react-helmet";
import SnackBar from "../../Shared/SnackBar";
import ConfirmModal from "../../Shared/ConfirmModal";
import CustomFilter from "../../Components/CustomFilter";
import { filterData } from '../../Helpers/filterData';
import { defaultFilter } from "../../Helpers/Filter";
import { SearchedFields } from "../../Helpers/SearchedFields";

const useStyles = makeStyles(() => ({
  button: {
    width: "auto",
    textTransform: "capitalize",
    fontSize: "14px",
  },
}));




const ArchivedCallLogReports = () => {
  const classes = useStyles();
  const { archivedCallLogs } = usePage().props;
  const [showColumns, setShowColumns] = useState(false);
  const [tableToolbar, setTableToolbar] = useState(false);
  const [selectedRowIds, setselectedRowIds] = useState([]);
  const [inboundIds, setInbounIds] = useState([]);
  const [response, setResponse] = useState();
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false });
  const [showCallLogModal, setShowCallLogModal] = useState({
    open: false,
  });
  const [openRowFunctionalities, setOpenRowFunctionalities] = useState(false);
  const rowFunctionalitiesRef = useRef();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const showColumnRef = useRef();
  const [editData, setEditData] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterValue, setFilterValue] = useState(defaultFilter('and', 'SN', 'isNotEmpty', 'string', 0, ''));


  const style = {
    top: position.y < 650 ? position.y - 79 : position.y - 275,
  };

  const rowFunctionalitiesPosition = (e) => {
    if (!openRowFunctionalities) {
      setPosition({ x: e.screenX, y: e.screenY });
    }
  };
  const [filteredData, setFilteredData] = useState(
    filterData(archivedCallLogs, filterValue)
  );
  const dataArray = filteredData.map((item, index) => ({
    // edit: item.id,
    sl: index + 1,
    SN: item.SN,
    Campaign: item.Campaign,
    Call_Date: item.Call_Date,
    Call_Date_Time: item.Call_Date_Time,
    Call_Date_Time: item.Call_Date_Time,
    Conn_Duration: item.Conn_Duration,
    Call_Length_In_Seconds: item.call_Length_In_Seconds,
    Customer: item.Customer,
    Target: item.Target,
    Target_Number: item.Target_Number,
    Target_Description: item.Target_Description,
    Affiliate: item.Affiliate,
    Market: item.Market,
    Revenue: item.Revenue,
    Payout: item.payoutAmount,
    Total_Cost: item.Total_Cost,
    Profit: item.Profit,
    Inbound_Id: item.Inbound_Id,
    Inbound: item.Inbound,
    Time: item.Call_Date_Time,
    Dialed: item.Dialed,
    Type: item.Type,
    City: item.City,
    State: item.State,
    Zipcode: item.Zipcode,
    id: item.id,
    key: index,
  }));

  const tablePropsInit = {
    columns: [
      // {
      //   key: "edit",
      //   style: { width: 10 },
      // },
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
        key: "SN",
        title: "SN",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "Call_Date_Time",
        title: "Call Time (EST)",
        dataType: DataType.string,
        style: { width: 230 },
      },
      // {
      //   key: "Call_Date",
      //   title: "Call Date",
      //   dataType: DataType.Date,
      //   style: { width: 200 },
      // },

      {
        key: "Inbound_Id",
        title: "Inbound Id",
        dataType: DataType.String,
        style: { width: 600 },
      },
      {
        key: "Affiliate",
        title: "Affiliate",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Market",
        title: "Market",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "Campaign",
        title: "Campaign",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Inbound",
        title: "Inbound",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Dialed",
        title: "Dialed",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Type",
        title: "Type",
        dataType: DataType.String,
        style: { width: 100 },
      },
      {
        key: "Customer",
        title: "Customer",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Target",
        title: "Target",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "Target_Number",
        title: "Target Number",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Target_Description",
        title: "Target Description",
        dataType: DataType.String,
        style: { width: 400 },
      },
      {
        key: "Call_Length_In_Seconds",
        title: "Call Length In Seconds",
        dataType: DataType.Number,
        style: { width: 240 },
      },
      {
        key: "Revenue",
        title: "Revenue",
        dataType: DataType.Number,
        style: { width: 120 },
      },
      {
        key: "Conn_Duration",
        title: "Conn.Duration",
        dataType: DataType.Number,
        style: { width: 240 },
      },
      // {
      //   key: "Time",
      //   title: "Time",
      //   dataType: DataType.String,
      //   style: { width: 220 },
      // },
      {
        key: "Payout",
        title: "Payout",
        dataType: DataType.Number,
        style: { width: 100 },
      },
      {
        key: "Total_Cost",
        title: "Total Cost",
        dataType: DataType.Number,
        style: { width: 120 },
      },
      {
        key: "Profit",
        title: "Profit",
        dataType: DataType.Number,
        style: { width: 120 },
      },
      {
        key: "City",
        title: "City",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "State",
        title: "State",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Zipcode",
        title: "Zipcode",
        dataType: DataType.String,
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
          <div
            className="edit-icon"
            onClick={() => handleRowFunctionalities(value)}
          >
            <img src={Edit} alt="edit-icon"></img>
          </div>
        );
      }
      if (column.key === "Call_Date") {
        if(value !==undefined){
        let shortMonth = value.toLocaleString('en-us', { month: 'short' });
        let format_date = value
        let dd = String(format_date.getDate()).padStart(2, "0");
        let yyyy = format_date.getFullYear();
        format_date = dd + "-" + shortMonth + "-" + yyyy;
        return format_date;
      }
    }
      if (column.key === "Call_Date_Time") {
        if(value !==undefined){

        let d = new Date(value);
        let hours = d.getHours();
        let minutes = d.getMinutes();
        let ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour "0" should be "12"
        minutes = minutes < 10 ? "0" + minutes : minutes;
        let strTime = hours + ":" + minutes + " " + ampm;
        return d.getDate() + "-" + new Intl.DateTimeFormat('en', { month: 'short' }).format(d) + "-" + d.getFullYear().toString().substr(-2) + " " + strTime;
        }
      }
    },
  };
  const fields = SearchedFields(tablePropsInit.columns)

  const OPTION_KEY = "archived-call-logs";
  const stateStore = {
    ...tablePropsInit,
    ...JSON.parse(localStorage.getItem(OPTION_KEY) || "0"),
  };
  const [tableProps, changeTableProps] = useState(stateStore);

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
            const selectedRowData = tableProps.data.filter(
              (item) => item.id == id
            );
            inboundIds.push(selectedRowData[0].Inbound_Id);
          } else {
            dispatch(deselectRow(rowKeyValue));
            const id = parseInt(rowKeyValue);
            const itemIndx = selectedRowIds.indexOf(id);
            selectedRowIds.splice(itemIndx, 1);
            if (selectedRowIds.length < 1) {
              setTableToolbar(false);
            }
            const selectedRowData = tableProps.data.filter(
              (item) => item.id == id
            );
            const inboundIndx = selectedRowData.indexOf(
              selectedRowData.Inbound_Id
            );
            inboundIds.splice(inboundIndx, 1);
          }
        }}
      />
    );
  };

  const allSelect = (event, dispatch) => {
    if (event.currentTarget.checked) {
      dispatch(selectAllFilteredRows());
      setTableToolbar(true);
      setInbounIds(tableProps.data.map(item => item.Inbound_Id))
      setselectedRowIds(tableProps.data.map(item => item.id))
    } else {
      dispatch(deselectAllFilteredRows());
      selectedRowIds.splice(0, selectedRowIds.length);
      inboundIds.splice(0, inboundIds.length);
      if (selectedRowIds.length < 1) {
        setTableToolbar(false);
      }
    }

  }
  const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
    return (
      <Checkbox
        checked={areAllRowsSelected}
        color="primary"
        onChange={(event) => allSelect(event, dispatch)}
      />
    );
  };
  const dispatch = (action) => {
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action);
      const { data, ...settingsWithoutData } = newState;
      localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData));
      return newState;
    });
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
    setDeleteLoading(true)

    axios
      .post("archive-delete", { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps;
          const newData = filteredData.data.filter(
            (item) => !selectedRowIds.includes(item.id)
          );
          filteredData.data = newData;
          setDeleteLoading(false)

          changeTableProps(filteredData);
          setInbounIds([]);
          setselectedRowIds([]);
          setTableToolbar(false);
          setOpen(true);
          setResponse(res.data.msg);
          setShowDeleteModal({ open: false });
          emptyCheckbox();

        } else {
          setDeleteLoading(false)
          setOpen(true);
          setResponse(res.data.msg);
          setInbounIds([]);
          setselectedRowIds([]);
          setShowDeleteModal({ open: false });
          emptyCheckbox();

        }
      })
      .catch((err) => {
        setDeleteLoading(false)
        setInbounIds([]);
        setselectedRowIds([]);
        setShowDeleteModal({ open: false });
        emptyCheckbox();
      });
  };

  const handleMoveCallLog = (inboundIds) => {
    setArchiveLoading(true)

    axios
      .post(route("archived.to.call.log"), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setArchiveLoading(false)
          setResponse(res.data.msg);
          setOpen(true);
          let filteredData = tableProps;
          const newData = filteredData.data.filter(
            (item) => !inboundIds.includes(item.Inbound_Id)
          );
          filteredData.data = newData;
          changeTableProps(filteredData);
          setTableToolbar(false);
          setInbounIds([]);
          setselectedRowIds([]);
          setInbounIds([]);
          setShowCallLogModal({ open: false })
        } else {
          setArchiveLoading(false)
          setOpen(true);
          setResponse(res.data.msg);
          setTableToolbar(false);
          setInbounIds([]);
          setselectedRowIds([]);
          setInbounIds([]);
          setShowCallLogModal({ open: false })

        }
      })
      .catch((err) => {
        setArchiveLoading(false)
        setTableToolbar(false);
        setInbounIds([]);
        setselectedRowIds([]);
        setInbounIds([]);
        setShowCallLogModal({ open: false })
      });
  };

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }
  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false });
    setTableToolbar(false);
    setselectedRowIds([]);
    emptyCheckbox();
  }
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
    const storedData = JSON.parse(localStorage.getItem("archived-call-logs"));
    if(storedData?.selectedRows)  storedData.selectedRows= [];
    localStorage.setItem("archived-call-logs", JSON.stringify(storedData));
    let filteredData = { ...tableProps };
    if(filteredData?.selectedRows) filteredData.selectedRows = [];
    changeTableProps(filteredData);
  };

  useEffect(() => {
    window.onload = function () {
      const storedData = JSON.parse(localStorage.getItem("archived-call-logs"));
      if (storedData != null) {
        emptyCheckbox();
      }
    };
  }, []);

  // useEffect(() => M.AutoInit());
  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        openRowFunctionalities &&
        rowFunctionalitiesRef.current &&
        !rowFunctionalitiesRef.current.contains(e.target)
      ) {
        setOpenRowFunctionalities(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [openRowFunctionalities]);

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
  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={() => handleOpenModal(setShowDeleteModal)}>
            <DeleteIcon style={{ color: "#031b4e" }} />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleOpenModal(setShowCallLogModal)}
        >
          Move Call Log
        </Button>
        <div className="selection-rows">
          {selectedRowIds.length} Row Selected
        </div>
      </div>
    );
  };

  const RowFunctionalities = () => {
    return (
      <div
        className="row-functionalities"
        ref={rowFunctionalitiesRef}
        style={style}
      >
        <div>
          <span onClick={() => handleMoveCallLog}>Move CallLog</span>
        </div>
      </div>
    );
  };

  const handleRowFunctionalities = (id) => {
    setOpenRowFunctionalities(true);
    setShowColumns(false);
    if (editData.length > 0) {
      const itemIndx = editData.indexOf(id);
      editData.splice(itemIndx, 1);
    }
    const tempData = tableProps.data.filter((item) => item.id == id);
    editData.push(tempData[0].Inbound_Id);
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
      <Helmet title="Archived CallLogs Report" />
      <div className="selection-demo" onClick={rowFunctionalitiesPosition}>
        {openRowFunctionalities ? <RowFunctionalities /> : ""}
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
                  <CustomFilter mainData={tableProps.data} fields={fields} filterValue={filterValue} setFilterValue={setFilterValue} filteredData={filteredData} setFilteredData={setFilteredData} filterData={filterData} />

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

        <SnackBar open={open} setOpen={setOpen} response={response} />

        <ConfirmModal
          open={showCallLogModal.open}
          setOpen={setShowCallLogModal}
          btnAction={() => handleMoveCallLog(inboundIds)}
          closeAction={() => handleCloseModal(setShowCallLogModal)}
          width={"450px"}
          title={`${inboundIds.length > 1
            ? "Do you want to move these records to Call Log?"
            : "Do you want to move this record to Call Log?"
            }`}
          loading={archiveLoading}

        ></ConfirmModal>

        <ConfirmModal
          open={showDeleteModal.open}
          setOpen={setShowDeleteModal}
          btnAction={deleteHandler}
          closeAction={() => handleCloseModal(setShowDeleteModal)}
          width={"400px"}
          title={`${inboundIds.length > 1
            ? "Do you want to delete these records?"
            : "Do you want to delete this record?"
            }`}
          loading={deleteLoading}
        ></ConfirmModal>
      </div>
    </>
  );
};

ArchivedCallLogReports.layout = (page) => (
  <Layout title="Archived Call Log Reports">{page}</Layout>
);
export default ArchivedCallLogReports;
