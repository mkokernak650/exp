import Layout from "../Layout/Layout"
import React, { useEffect, useState, useRef } from "react"
import { kaReducer, Table } from "ka-table"
import {
  DataType,
  SortingMode,
  EditingMode,
  ActionType,
} from "ka-table/enums"
import { kaPropsUtils } from "ka-table/utils"
import { usePage } from "@inertiajs/inertia-react"
import {
  deselectAllFilteredRows,
  deselectRow,
  selectAllFilteredRows,
  selectRow,
  selectRowsRange,
} from "ka-table/actionCreators"
import FilterControl from "react-filter-control"
import "ka-table/style.scss"
import search from "../../../images/search.svg"
import eyeIcon from "../../../images/eyeIcon.svg"
import closeNav from "../../../images/closeNav.svg"
import { hideColumn, showColumn, hideLoading, showLoading } from "ka-table/actionCreators"
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean"
import Checkbox from "@material-ui/core/Checkbox"
import {
  makeStyles,
  Button,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
} from "@material-ui/core"
import NormalModal from "../../Shared/NormalModal"
import axios from "axios"
import { Helmet } from "react-helmet"
import { Pagination } from 'react-laravel-paginex'
import toast from "react-hot-toast"



const useStyles = makeStyles(() => ({
  button: {
    width: "auto",
    textTransform: "capitalize",
    fontSize: "14px",
  },
}))


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
    name: "Zip_Code",
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
]

export const groups = [
  {
    caption: "And",
    name: "and",
  },
  {
    caption: "Or",
    name: "or",
  },
]
export const filter = {
  groupName: "and",
  items: [
    {
      field: "Market",
      operator: "contains",
      value: ""
    },
  ],
}

const ZipcodeByTelevisionMarketNew = () => {
  const classes = useStyles()
  const { allZipcodesByTelevisionMarket } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setselectedRowIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [importModal, setImportModal] = useState({ open: false })
  const [exportModal, setExportModal] = useState({ open: false })
  const [selectedFile, setSelectedFile] = useState(null)
  const [type, setType] = useState("xlsx")
  const showColumnRef = useRef()
  const [zipcodeTelMarket, setZipcodeTelMarket] = useState(allZipcodesByTelevisionMarket)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [searchedData, setSearchData] = useState([])



  const mapDataArr = data => {
    return data.data.map((item, index) => ({
      sl: index + 1,
      market: item.market,
      state: item.state,
      county: item.county,
      city: item.city,
      population: item.population,
      zip_code: item.zip_code,
      fips: item.fips,
      median_household_income_2007_2011: item.median_household_income_2007_2011,
      race_americanindian: item.race_americanindian,
      race_asian: item.race_asian,
      race_white: item.race_white,
      race_black: item.race_black,
      race_hawaiian: item.race_hawaiian,
      race_hispanic: item.race_hispanic,
      race_other: item.race_other,
      id: item.id,
      key: index,
    }))
  }
  const dataArray = mapDataArr(allZipcodesByTelevisionMarket)

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
        key: "market",
        title: "Market",
        dataType: DataType.String,
        style: { width: 250 },
      },
      {
        key: "state",
        title: "State",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "county",
        title: "County",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "city",
        title: "City",
        dataType: DataType.String,
        style: { width: 230 },
      },
      {
        key: "population",
        title: "Population",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "zip_code",
        title: "ZipCode",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "fips",
        title: "Fips",
        dataType: DataType.String,
        style: { width: 190 },
      },
      {
        key: "median_household_income_2007_2011",
        title: "Median_household_income_2007_2011",
        dataType: DataType.String,
        style: { width: 310 },
      },
      {
        key: "race_americanindian",
        title: "Race_americanindian",
        dataType: DataType.String,
        style: { width: 220 },
      },
      {
        key: "race_asian",
        title: "Race_asian",
        dataType: DataType.String,
        style: { width: 170 },
      },
      {
        key: "race_white",
        title: "Race_white",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "race_black",
        title: "Race_black",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "race_hawaiian",
        title: "Race_hawaiian",
        dataType: DataType.String,
        style: { width: 180 },
      },
      {
        key: "race_hispanic",
        title: "Race_hispanic",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "race_other",
        title: "Race_other",
        dataType: DataType.String,
        style: { width: 240 },
      },
    ],
    loading: {
      enabled: false,
      text: 'Loading...'
    },
    data: dataArray,
    rowKeyField: "id",
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
  }

  const OPTION_KEY = "zipcode-television-by-market"
  const stateStore = {
    ...tablePropsInit,
    ...JSON.parse(localStorage.getItem(OPTION_KEY) || "0"),
  }
  const [tableProps, changeTableProps] = useState(stateStore)

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
            dispatch(selectRowsRange(rowKeyValue, [...selectedRows].pop()))
          } else if (event.currentTarget.checked) {
            dispatch(selectRow(rowKeyValue))
            setTableToolbar(true)
            const id = parseInt(rowKeyValue)
            if (!selectedRowIds.includes(id)) {
              selectedRowIds.push(id)
            }
          } else {
            dispatch(deselectRow(rowKeyValue))
            const id = parseInt(rowKeyValue)
            const itemIndx = selectedRowIds.indexOf(id)
            selectedRowIds.splice(itemIndx, 1)
            if (selectedRowIds.length < 1) {
              setTableToolbar(false)
            }
          }
        }}
      />
    )
  }
  const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
    return (
      <Checkbox
        checked={areAllRowsSelected}
        color="primary"
        onChange={(event) => {
          if (event.currentTarget.checked) {
            dispatch(selectAllFilteredRows()) // also available: selectAllVisibleRows(), selectAllRows()
            setTableToolbar(true)
            let i = 0
            while (i < tableProps.data.length) {
              if (!selectedRowIds.includes(tableProps.data[i].id)) {
                selectedRowIds.push(tableProps.data[i].id)
                continue
              }
              i++
            }
          } else {
            dispatch(deselectAllFilteredRows()) // also available: deselectAllVisibleRows(), deselectAllRows()
            selectedRowIds.splice(0, selectedRowIds.length)
            if (selectedRowIds.length < 1) {
              setTableToolbar(false)
            }
          }
        }}
      />
    )
  }
  const dispatch = (action) => {
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action)
      const { data, ...settingsWithoutData } = newState
      localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData))
      return newState
    })
  }
  const [filterValue, changeFilter] = useState(filter)


  const [serachSidebar, setSearchSidebar] = useState(false)

  const handleSearch = () => {
    setSearchSidebar((prevState) => !prevState)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }
  const hideCoumnSettings = () => {
    setShowColumns(false)
  }
  const closeSidebar = () => {
    setSearchSidebar(false)
  }

  const openImportModal = () => {
    setImportModal({ open: true })
  }
  const openExportModal = () => {
    setExportModal({ open: true })
  }

  const handleImportChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleExportChange = (e) => {
    setType(e.target.value)
  }

  const importHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append("importfile", selectedFile)
    axios
      .post(route("zipcode.television.market.import"), formData)
      .then((res) => {
        setSelectedFile(null)
        setLoading(false)
        if (res.status === 200) {
          setMainData(res.data)
          setImportModal({ open: false })
          toast.success("Imported Successfully")
        } else {
          toast.error("Import failed")

        }
      })
      .catch((err) => {
        setLoading(false)
        toast.error("Error while importing file")

      })
  }

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const baseUrl = window.location.origin
  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get(`${baseUrl}/zipcode-television-market/${type}`)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          setExportModal({ open: false })
          triggerExportLink(res.request.responseURL)
          toast.success("Imported Successfully")

        } else {
          toast.error("Import failed")
        }
      })
      .catch((err) => {
        setLoading(false)
        toast.error("Error while importing file")

      })
  }


  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        showColumns &&
        showColumnRef.current &&
        !showColumnRef.current.contains(e.target)
      ) {
        setShowColumns(false)
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [showColumns])

  // const TableToolbar = () => {
  //   return (
  //     <div className="table-toolbar">
  //       {/* <Tooltip title="Delete">
  //         <IconButton aria-label="delete" onClick={deleteHandler}>
  //           <DeleteIcon style={{ color: "#031b4e" }} />
  //         </IconButton>
  //       </Tooltip> */}
  //       <div className="selection-rows">
  //         {selectedRowIds.length} Row Selected
  //       </div>
  //     </div>
  //   );
  // };

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
    }
    const dispatchSettings = (action) => {
      if (action.type === ActionType.UpdateCellValue) {
        tableProps.dispatch(
          action.value
            ? showColumn(action.rowKeyValue)
            : hideColumn(action.rowKeyValue)
        )
      }
    }
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
                  return <CellEditorBoolean {...props} />
              }
            },
          },
        }}
        dispatch={dispatchSettings}
      />
    )
  }

  const getSearchingData = async (data) => {
    setCurerentPage(data)
    dispatch(showLoading())
    await axios.get('zipcode-television-market?page=' + data.page + '&itemPerPage=' + itemPerPage + '&filteredValue=' + JSON.stringify(filterValue)).then(res => {
      setZipcodeTelMarket(res.data)
      dispatch(hideLoading())
      setSearchData(res.data.data)
    })
  }

  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue)
  }


  const itemPerPageHandleChange = (e) => {
    setItemPerPage(e.target.value)
  }

  useEffect(() => {
    getSearchingData(curerentPage)

  }, [itemPerPage])

  useEffect(() => {
    getSearchingData(curerentPage)

  }, [filterValue])


  return (
    <>
      <Helmet title="Zipcode By Television Market Report" />
      <div className="selection-demo">
        <div className="table-top">
          <div className="top-left">
            <div className="columns-show-hide" onClick={handleColumns}>
              <img src={eyeIcon} alt="search" onBlur={hideCoumnSettings}></img>
            </div>
            {/* <Button
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
            </Button> */}
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

        <Table
          {...tableProps}
          childComponents={{
            cellText: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <SelectionCell {...props} />
                }
              },
            },
            filterRowCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <></>
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
                    />
                  )
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
                    )
                }
              },
            },
            noDataRow: {
              content: () => 'No Data Found'
            }

          }}

          dispatch={dispatch}
          extendedFilter={() => searchedData}

        />

        <div className="table-bottom">
          <select
            name="item-per-page"
            id="item-per-page"
            onChange={(e) => itemPerPageHandleChange(e)}
          >
            <option value="10" selected="">10</option>
            <option value="20" selected="">20</option>
            <option value="50" selected="">50</option>
            <option value="100" selected="">100</option>
          </select>
          <Pagination changePage={getSearchingData} data={zipcodeTelMarket} />
        </div>

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
                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
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
                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </NormalModal>
      </div>
    </>
  )
}

ZipcodeByTelevisionMarketNew.layout = (page) => (
  <Layout title="Zipcode Database">{page}</Layout>
)
export default ZipcodeByTelevisionMarketNew
