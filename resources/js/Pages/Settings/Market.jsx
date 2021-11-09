import Layout from "../Layout/Layout";
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
import { Button, makeStyles } from "@material-ui/core";
import axios from "axios";

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
}));
export const fields = [
  {
    caption: "customer",
    name: "customer",
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
      field: "customer",
      operator: "isNotEmpty",
    },
    // {
    //   field: "market",
    //   key: "2",
    //   operator: "contains",
    //   value: "Columbia, SC",
    // },
  ],
};

const Market = () => {
  const classes = useStyles();
  const { test } = usePage().props;
  const [market, setMarket] = useState(test);
  const [showColumns, setShowColumns] = useState(false);
  const [tableToolbar, setTableToolbar] = useState(false);
  const [selectedRowIds, setselectedRowIds] = useState([]);
  const dataArray = market.map((item, index) => ({
    sl: index + 1,
    customer: item.customer_id,
    market: item.market_id,
    start_date: item.start_date,
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
        key: "customer",
        title: "Customer",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "market",
        title: "Market",
        dataType: DataType.String,
        style: { width: 350 },
      },
      // {
      //   key: "id",
      //   title: "id",
      //   dataType: DataType.String,
      //   style: { width: 230 },
      // },
      {
        key: "start_date",
        title: "Start Date",
        dataType: DataType.String,
        style: { minWidth: 100 },
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
    setShowColumns(true);
  };
  const closeSidebar = () => {
    setSearchSidebar(false);
  };
  const deleteHandler = () => {
    axios
      .post("market-exception-delete", { selectedRowIds })
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
        } else {
          console.log(res.data.msg);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };


  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={deleteHandler}>
            <DeleteIcon style={{ color: "#031b4e" }} />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
        >
          Move Call Log
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
        >
          Billed
        </Button>
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
  );
};

Market.layout = (page) => <Layout title="Market">{page}</Layout>;
export default Market;
