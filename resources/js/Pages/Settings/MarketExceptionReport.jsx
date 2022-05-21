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
import {
  Button,
  CircularProgress,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
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
    caption: " campaign",
    name: "campaign",
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
  },
  {
    caption: "market",
    name: "market",
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
  },
  {
    caption: "state",
    name: "state",
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
  },
  {
    caption: "call_type",
    name: "call_type",
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
      field: "campaign",
      operator: "isNotEmpty",
    },
  ],
};

const MarketExceptionReport = () => {
  const classes = useStyles();
  const { marketExceptions, campaignId, allCampaigns, allStates, allMarkets } = usePage().props;
  const [showColumns, setShowColumns] = useState(false);
  const [tableToolbar, setTableToolbar] = useState(false);
  const [selectedRowIds, setselectedRowIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [showEditModal, setShowEditModal] = useState({ open: false });
  const [editData, setEditData] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false });
  const showColumnRef = useRef();
  const [exportModal, setExportModal] = useState({ open: false });
  const [type, setType] = useState("xlsx");
  const [loading, setLoading] = useState(false);

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = () => {

    axios
      .post(route("market.exception.edit"), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = { ...tableProps };
          filteredData.data.filter((item, indx) => {
            if (item.id === editData.id) {
              filteredData.data[indx].campaign = editData.campaign;
              filteredData.data[indx].market_id = editData.market_id;
              filteredData.data[indx].state = editData.state;
              filteredData.data[indx].ranks = editData.ranks;
              filteredData.data[indx].nielsen_households = editData.nielsen_households;
              filteredData.data[indx].call_type = editData.call_type;
              filteredData.data[indx].start_date = editData.start_date;
            }
          });
          setEditData();
          setShowEditModal({ open: false });
          setOpen(true);
          setResponse(res.data.msg);
        } else {
          setEditData();
          setShowEditModal({ open: false });
          setOpen(true);
          setResponse(res.data.msg);
        }
      })
      .catch((err) => {
        setEditData();
        setShowEditModal({ open: false });
      });
  };
  const dataArray = marketExceptions.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    campaign: item.campaign.campaign_name,
    market_id: item.market_id,
    state: item.state,
    call_type: item.call_type,
    start_date: item.start_date,
    ranks: item.ranks,
    nielsen_households: item.nielsen_households,
    id: item.id,
    key: index,
    campaign_id: item.campaign_id
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
        key: "campaign",
        title: "Campaign",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "market_id",
        title: "Market",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "state",
        title: "State",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "call_type",
        title: "Call Type",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "ranks",
        title: "Rank",
        dataType: DataType.String,
        style: { width: 100 },
      },
      {
        key: "nielsen_households",
        title: "Nielsen Households",
        dataType: DataType.String,
        style: { width: 240 },
      },

      {
        key: "start_date",
        title: "Start Date",
        dataType: DataType.String,
        style: { width: 200 },
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

  const OPTION_KEY = "market-exception-report";
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
      .post(route("market.exception.delete"), { selectedRowIds })
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
          setShowDeleteModal({ open: false });
          emptyCheckbox();
        } else {
          setOpen(true);
          setResponse(res.data.msg);
          setShowDeleteModal({ open: false });
          emptyCheckbox();
        }
      })
      .catch((err) => {
        setShowDeleteModal({ open: false });
        emptyCheckbox();
      });
  };

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
      if (item.id === itemId) {
        setEditData(item);
      }
    });
    setShowEditModal({ open: true });
  };

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false });
    setTableToolbar(false);
    setselectedRowIds([]);
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
    const storedData = JSON.parse(
      localStorage.getItem("market-exception-report")
    );
    if (storedData?.selectedRows) storedData.selectedRows = [];
    localStorage.setItem("market-exception-report", JSON.stringify(storedData));
    let filteredData = { ...tableProps };
    if (filteredData.selectedRows) filteredData.selectedRows = [];
    changeTableProps(filteredData);
  };

  useEffect(() => {
    window.onload = function () {
      const storedData = JSON.parse(
        localStorage.getItem("market-exception-report")
      );
      if (storedData != null) {
        emptyCheckbox();
      }
    };
  }, []);

  const handleExportTypeChange = (e) => {
    setType(e.target.value);
  };

  const openExportModal = () => {
    setExportModal({ open: true });
  };

  const triggerExportLink = (link) => {
    return window.open(link);
  };

  const baseUrl = window.location.origin;
  const exportHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .get(`${baseUrl}/market-exception-export/${type}/${campaignId}`)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setExportModal({ open: false });
          triggerExportLink(res.request.responseURL);
          setResponse("Exported Successfully");
          setOpen(true);
        } else {
          setResponse("Exporting failed");
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };



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
      <Helmet title="Market Exception Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <img src={eyeIcon} alt="search"></img>
              </div>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                className={classes.button}
                onClick={openExportModal}
                disabled={marketExceptions == ""}
              >
                Export
              </Button>
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
        title={"Edit Market Exception"}
      >
        <div className="edit_target">
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="campaign_id"
                  select
                  name="campaign_id"
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  value={editData?.campaign_id ? editData.campaign_id : ""}
                // required={true}
                >
                  <option value="">Select Campaign</option>
                  {allCampaigns.map((option, indx) => (
                    <option key={indx} value={option.id}>
                      {option.campaign_name}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="state"
                  select
                  name="state"
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  value={editData?.state ? editData.state : ""}

                // required={true}

                >
                  <option value="">Select State</option>
                  {allStates.map((option, indx) => (
                    <option key={indx} value={option.state}>
                      {option.state}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="market_id"
                  select
                  name="market_id"
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  value={editData?.market_id}

                // required={true}

                >
                  <option value="">Select Market</option>
                  {allMarkets.map((option, indx) => (
                    <option key={indx} value={option.market_id}>
                      {option.market}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  id="call_type"
                  select
                  name="call_type"
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  value={editData?.call_type ? editData.call_type : ""}

                // required={true}
                >
                  <option value="">Call Type</option>
                  <option value="L">Landline (L)</option>
                  <option value="W">Wireless (W)</option>
                  <option value="B">Both L & W</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="date"
                  name="start_date"
                  onChange={handleEditChange}
                  defaultValue={editData?.start_date ? editData.start_date : ""}
                  // defaultValue='2022-02-10'
                  margin="normal"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <span>Rank:</span>
                <TextField
                  value={editData?.ranks ? editData.ranks : ""}
                  fullWidth
                  margin="normal"
                  name="ranks"
                  type="text"
                  variant="outlined"
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <span>Nielsen Households:</span>

                <TextField
                  value={editData?.nielsen_households ? editData.nielsen_households : ""}
                  fullWidth
                  margin="normal"
                  name="nielsen_households"
                  type="text"
                  variant="outlined"
                  onChange={handleEditChange}
                />


              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEditSubmit}
                  className={classes.editButton}
                >
                  Edit
                </Button>
              </Grid>
            </Grid>
          </form>

          <div
            onClick={() => handleCloseModal(setShowEditModal)}
            className="close-modal-icon"
          >
            <img src={Cancel} alt="close-modal-icon"></img>
          </div>
        </div>
      </NormalModal>

      <SnackBar open={open} setOpen={setOpen} response={response} />
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

      <NormalModal
        open={exportModal.open}
        setOpen={setExportModal}
        width={"500px"}
        title={""}
      >
        <div className={classes.import}>
          <FormLabel component="legend">Select Type</FormLabel>
          <RadioGroup
            aria-label="type"
            name="type"
            value={type}
            onChange={handleExportTypeChange}
          >
            <FormControlLabel value="xlsx" control={<Radio />} label="XLSX" />
            <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            <FormControlLabel value="xls" control={<Radio />} label="XLS" />
            <FormControlLabel value="tsv" control={<Radio />} label="TSV" />
          </RadioGroup>
          <Button variant="contained" color="primary" onClick={exportHandler}>
            {loading ? (
              <CircularProgress color="inherit" thickness={3} size="1.5rem" />
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </NormalModal>
    </>
  );
};

MarketExceptionReport.layout = (page) => (
  <Layout title="MarketExceptionReport">{page}</Layout>
);
export default MarketExceptionReport;
