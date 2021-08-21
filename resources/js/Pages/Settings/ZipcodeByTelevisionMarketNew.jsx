import Layout from "../Layout/Layout";
import M from "materialize-css";
import React, { useEffect, useState } from "react";
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
import { hideColumn, showColumn } from "ka-table/actionCreators";
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import {
  CssBaseline,
  makeStyles,
  Button,
  Snackbar,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import NormalModal from "../../Shared/NormalModal";
import axios from "axios";
import { Helmet } from "react-helmet";

const useStyles = makeStyles(() => ({
  button: {
    width: "auto",
    textTransform: "capitalize",
    fontSize: "14px",
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
export const fields = [
  {
    caption: "Market",
    name: "Market",
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
    caption: "State",
    name: "State",
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
    caption: "County",
    name: "County",
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
    caption: "City",
    name: "City",
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
    caption: "Population",
    name: "Population",
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
    caption: "ZipCode",
    name: "ZipCode",
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
    caption: "Fips",
    name: "Fips",
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
    caption: "Median_household_income_2007_2011",
    name: "Median_household_income_2007_2011",
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
    caption: "Race_americanindian",
    name: "Race_americanindian",
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
    caption: "Race_asian",
    name: "Race_asian",
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
    caption: "Race_white",
    name: "Race_white",
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
    caption: "Race_black",
    name: "Race_black",
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
    caption: "Race_hawaiian",
    name: "Race_hawaiian",
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
    caption: "Race_hispanic",
    name: "Race_hispanic",
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
    caption: "Race_other",
    name: "Race_other",
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
      field: "Market",
      operator: "isNotEmpty",
    },
  ],
};

const ZipcodeByTelevisionMarketNew = () => {
  const classes = useStyles();
  const { allZipcodesByTelevisionMarket } = usePage().props;
  const [showColumns, setShowColumns] = useState(false);
  const [tableToolbar, setTableToolbar] = useState(false);
  const [selectedRowIds, setselectedRowIds] = useState([]);
  const [response, setResponse] = useState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importModal, setImportModal] = useState({ open: false });
  const [exportModal, setExportModal] = useState({ open: false });
  const [selectedFile, setSelectedFile] = useState(null);
  const [type, setType] = useState("xlsx");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  const dataArray = allZipcodesByTelevisionMarket.map((item, index) => ({
    sl: index + 1,
    Market: item.market,
    State: item.state,
    County: item.county,
    City: item.city,
    Population: item.population,
    ZipCode: item.zip_code,
    Fips: item.fips,
    Median_household_income_2007_2011: item.median_household_income_2007_2011,
    Race_americanindian: item.race_americanindian,
    Race_asian: item.race_asian,
    Race_white: item.race_white,
    Race_black: item.race_black,
    Race_hawaiian: item.race_hawaiian,
    Race_hispanic: item.race_hispanic,
    Race_other: item.race_other,
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
        key: "Market",
        title: "Market",
        dataType: DataType.String,
        style: { width: 250 },
      },
      {
        key: "State",
        title: "State",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "County",
        title: "County",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "City",
        title: "City",
        dataType: DataType.String,
        style: { width: 230 },
      },
      {
        key: "Population",
        title: "Population",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "ZipCode",
        title: "ZipCode",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "Fips",
        title: "Fips",
        dataType: DataType.String,
        style: { width: 190 },
      },
      {
        key: "Median_household_income_2007_2011",
        title: "Median_household_income_2007_2011",
        dataType: DataType.String,
        style: { width: 310 },
      },
      {
        key: "Race_americanindian",
        title: "Race_americanindian",
        dataType: DataType.String,
        style: { width: 220 },
      },
      {
        key: "Race_asian",
        title: "Race_asian",
        dataType: DataType.String,
        style: { width: 170 },
      },
      {
        key: "Race_white",
        title: "Race_white",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Race_black",
        title: "Race_black",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Race_hawaiian",
        title: "Race_hawaiian",
        dataType: DataType.String,
        style: { width: 180 },
      },
      {
        key: "Race_hispanic",
        title: "Race_hispanic",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "Race_other",
        title: "Race_other",
        dataType: DataType.String,
        style: { width: 240 },
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
    // rowReordering: true,
  };

  const [tableProps, changeTableProps] = useState(tablePropsInit);

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
            while (i < allZipcodesByTelevisionMarket.length) {
              selectedRowIds.push(allZipcodesByTelevisionMarket[i].id);
              i++;
            }
          } else {
            dispatch(deselectAllFilteredRows()); // also available: deselectAllVisibleRows(), deselectAllRows()
            // if (selectedRowIds) {
            selectedRowIds.splice(0, selectedRowIds.length);
            // }
            if (selectedRowIds.length < 1) {
              setTableToolbar(false);
            }
          }
        }}
      />
    );
  };
  const dispatch = (action) => {
    changeTableProps((prevState) => kaReducer(prevState, action));
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
    setShowColumns((prevState) => !prevState);
  };
  const hideCoumnSettings = () => {
    console.log("hiding");
    setShowColumns(false);
  };
  const closeSidebar = () => {
    setSearchSidebar(false);
  };

  const openImportModal = () => {
    setImportModal({ open: true });
  };
  const openExportModal = () => {
    setExportModal({ open: true });
  };
  const deleteHandler = () => {
    axios
      .post(route("zipcode.television.market.delete"), { selectedRowIds })
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
        } else {
          setOpen(true);
          setResponse(res.data.msg);
          setselectedRowIds([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setTableToolbar(false);
        setselectedRowIds([]);
      });
  };

  const handleImportChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleExportChange = (e) => {
    setType(e.target.value);
  };

  const importHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("importfile", selectedFile);
    axios
      .post(route("zipcode.television.market.import"), formData)
      .then((res) => {
        setSelectedFile(null);
        setLoading(false);
        if (res.status === 200) {
          setMainData(res.data);
          setImportModal({ open: false });
          setResponse("Imported Successfully");
          setOpen(true);
        } else {
          setResponse("Import failed");
        }
      })
      .catch((err) => {});
  };

  const triggerExportLink = (link) => {
    return window.open(link);
  };

  const baseUrl = window.location.origin;
  const exportHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .get(`${baseUrl}/zipcode-television-market/${type}`)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setExportModal({ open: false });
          triggerExportLink(res.request.responseURL);
          setResponse("Exported Successfully");
          setOpen(true);
        } else {
          setResponse("Export failed");
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
          <IconButton aria-label="delete" onClick={deleteHandler}>
            <DeleteIcon style={{ color: "#031b4e" }} />
          </IconButton>
        </Tooltip>
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
         <Helmet title="Zipcode By Television Market Report" />

    <div className="selection-demo">
      {tableToolbar ? (
        <TableToolbar />
      ) : (
        <div className="table-top">
          <div className="top-left">
            <div className="columns-show-hide" onClick={handleColumns}>
              <img src={eyeIcon} alt="search" onBlur={hideCoumnSettings}></img>
            </div>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              className={classes.button}
              onClick={openImportModal}
              disabled={allZipcodesByTelevisionMarket == ""}
            >
              Import
            </Button>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              className={classes.button}
              onClick={openExportModal}
              disabled={allZipcodesByTelevisionMarket == ""}
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
            <div className="column-settings">
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

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        className={classes.snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success">{response}</Alert>
      </Snackbar>

      <NormalModal
        open={importModal.open}
        setOpen={setImportModal}
        width={"500px"}
        title={""}
      >
        <div className={classes.import}>
          <input
            id="importfile"
            type="file"
            name="importfile"
            onChange={handleImportChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={importHandler}
            disabled={!selectedFile}
          >
            {loading ? (
              <CircularProgress color="secondary" thickness="3" size="2rem" />
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </NormalModal>

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
            onChange={handleExportChange}
          >
            <FormControlLabel value="xlsx" control={<Radio />} label="XLSX" />
            <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            <FormControlLabel value="xls" control={<Radio />} label="XLS" />
            <FormControlLabel value="tsv" control={<Radio />} label="TSV" />
          </RadioGroup>
          <Button variant="contained" color="primary" onClick={exportHandler}>
            {loading ? (
              <CircularProgress color="secondary" thickness="3" size="2rem" />
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </NormalModal>
    </div>
  </>
  );
};

ZipcodeByTelevisionMarketNew.layout = (page) => (
  <Layout title="Zipcode Database">{page}</Layout>
);
export default ZipcodeByTelevisionMarketNew;
