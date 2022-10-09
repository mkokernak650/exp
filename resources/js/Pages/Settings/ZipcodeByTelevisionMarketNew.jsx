import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { DataType, SortingMode } from 'ka-table/enums'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import { showColumn, hideLoading, showLoading } from 'ka-table/actionCreators'
import { makeStyles, Button, CircularProgress } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { Pagination } from 'react-laravel-paginex'
import toast from 'react-hot-toast'
import CheckOutsideClick from '@/Helpers/CheckOutsideClick'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import handleSelects from '@/Helpers/HandleSelects'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'

const useStyles = makeStyles(() => ({
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
}))

const operators = [
  {
    caption: 'Contains',
    name: 'contains',
  },
  {
    caption: 'Not Contains',
    name: 'doesNotContain',
  },
  {
    caption: 'Is Empty',
    name: 'isEmpty',
  },
  {
    caption: 'Is Not Empty',
    name: 'isNotEmpty',
  },
  {
    caption: 'Starts With',
    name: 'startswith',
  },
  {
    caption: 'Ends With',
    name: 'endsWith',
  },
  {
    caption: 'Is',
    name: 'is',
  },
  {
    caption: 'Is Not',
    name: 'isnot',
  },
]

export const fields = [
  {
    caption: 'Market',
    name: 'Market',
    operators,
  },
  {
    caption: 'State',
    name: 'State',
    operators,
  },
  {
    caption: 'County',
    name: 'County',
    operators,
  },
  {
    caption: 'City',
    name: 'City',
    operators,
  },
  {
    caption: 'Population',
    name: 'Population',
    operators,
  },
  {
    caption: 'ZipCode',
    name: 'Zip_Code',
    operators,
  },
  {
    caption: 'Fips',
    name: 'Fips',
    operators,
  },
  {
    caption: 'Median_household_income_2007_2011',
    name: 'Median_household_income_2007_2011',
    operators,
  },
  {
    caption: 'Race_americanindian',
    name: 'Race_americanindian',
    operators,
  },
  {
    caption: 'Race_asian',
    name: 'Race_asian',
    operators,
  },
  {
    caption: 'Race_white',
    name: 'Race_white',
    operators,
  },
  {
    caption: 'Race_black',
    name: 'Race_black',
    operators,
  },
  {
    caption: 'Race_hawaiian',
    name: 'Race_hawaiian',
    operators,
  },
  {
    caption: 'Race_hispanic',
    name: 'Race_hispanic',
    operators,
  },
  {
    caption: 'Race_other',
    name: 'Race_other',
    operators,
  },
]
export const groups = [
  {
    caption: 'And',
    name: 'and',
  },
  {
    caption: 'Or',
    name: 'or',
  },
]
export const filter = {
  groupName: 'and',
  items: [
    {
      field: 'Market',
      operator: 'isNotEmpty',
      value: '',
    },
  ],
}

const ZipcodeByTelevisionMarketNew = () => {
  const classes = useStyles()
  const { allZipcodesByTelevisionMarket, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [loading, setLoading] = useState(false)
  const showColumnRef = useRef()
  const [zipcodeTelMarket, setZipcodeTelMarket] = useState(allZipcodesByTelevisionMarket)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [searchedData, setSearchData] = useState([])

  const mapDataArr = (data) => {
    return data.data.map((item, index) => ({
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

  const optionKey = 'zipcode-television-by-market'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const columns = [
    {
      key: 'market',
      title: 'Market',
      dataType: DataType.String,
      style: { width: 250 },
      visible: true,
    },
    {
      key: 'state',
      title: 'State',
      dataType: DataType.String,
      style: { width: 130 },
      visible: true,
    },
    {
      key: 'county',
      title: 'County',
      dataType: DataType.String,
      style: { width: 160 },
      visible: true,
    },
    {
      key: 'city',
      title: 'City',
      dataType: DataType.String,
      style: { width: 230 },
      visible: true,
    },
    {
      key: 'population',
      title: 'Population',
      dataType: DataType.String,
      style: { width: 130 },
      visible: true,
    },
    {
      key: 'zip_code',
      title: 'ZipCode',
      dataType: DataType.String,
      style: { width: 150 },
      visible: true,
    },
    {
      key: 'fips',
      title: 'Fips',
      dataType: DataType.String,
      style: { width: 190 },
      visible: true,
    },
    {
      key: 'median_household_income_2007_2011',
      title: 'Median_household_income_2007_2011',
      dataType: DataType.String,
      style: { width: 310 },
      visible: true,
    },
    {
      key: 'race_americanindian',
      title: 'Race_americanindian',
      dataType: DataType.String,
      style: { width: 220 },
      visible: true,
    },
    {
      key: 'race_asian',
      title: 'Race_asian',
      dataType: DataType.String,
      style: { width: 170 },
      visible: true,
    },
    {
      key: 'race_white',
      title: 'Race_white',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'race_black',
      title: 'Race_black',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'race_hawaiian',
      title: 'Race_hawaiian',
      dataType: DataType.String,
      style: { width: 180 },
      visible: true,
    },
    {
      key: 'race_hispanic',
      title: 'Race_hispanic',
      dataType: DataType.String,
      style: { width: 160 },
      visible: true,
    },
    {
      key: 'race_other',
      title: 'Race_other',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
  ]

  const tablePropsInit = {
    columns:
      columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
        ? JSON.parse(columnsData[0])?.[optionKey]
        : columns,
    loading: {
      enabled: false,
      text: 'Loading...',
    },
    data: dataArray,
    rowKeyField: 'id',
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
  }

  const [tableProps, changeTableProps] = useState(tablePropsInit)

  const dispatch = (action) => {
    handleSelects({ action, selectedRowIds, setSelectedRowIds, tableProps, setTableToolbar })
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action)
      const { data, ...settingsWithoutData } = newState
      if (action?.type === 'ReorderColumns') {
        addTableDetails(columnDetails, setColumnDetails, settingsWithoutData, optionKey)
      }
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

  const closeSidebar = () => {
    setSearchSidebar(false)
  }

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get('zipcode-television-market-export?filterValue=' + JSON.stringify(filterValue))
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          triggerExportLink(res.request.responseURL)
          setOpen(true)
        } else {
          toast.error('Error while importing file')
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  const viewExport = () => {
    const filterdData = tableProps.data.map((item) => {
      delete item.id
      delete item.key
      return item
    })
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const ws = XLSX.utils.json_to_sheet(filterdData, 'ZipCodeTelevisionByMarketView')
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, 'ZipCodeTelevisionByMarketView' + '.xlsx')
    toast.success('Report Exported Successfully')
  }

  useEffect(() => {
    const closeColumnSetting = (e) => {
      CheckOutsideClick(e, showColumn, setShowColumns, showColumnRef)
    }
    document.addEventListener('mousedown', closeColumnSetting)
    return () => {
      document.removeEventListener('mousedown', closeColumnSetting)
    }
  }, [showColumns])

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

  const getSearchingData = async (data) => {
    setCurerentPage(data)
    dispatch(showLoading())
    await axios
      .get(
        'tv-markets-by-zip-codes?page=' +
          data.page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        const tmpTableProps = { ...tableProps }
        tmpTableProps.data = res.data.data
        changeTableProps(tmpTableProps)
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
  }, [itemPerPage, filterValue])

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
                <Eye />
              </div>

              <Button
                variant="contained"
                type="submit"
                color="primary"
                className={classes.button}
                onClick={exportHandler}
                disabled={allZipcodesByTelevisionMarket == ''}
              >
                {loading ? (
                  <CircularProgress color="inherit" thickness={3} size="1.5rem" />
                ) : (
                  'Searched Export'
                )}
              </Button>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                className={classes.button}
                onClick={viewExport}
                disabled={tableProps.data.length < 1}
              >
                View Export
              </Button>
            </div>

            <div className="search-icon" onClick={handleSearch}>
              <span>Search Here</span>
              <Search />
            </div>

            {serachSidebar ? (
              <div className="search-sidebar">
                <div className="search-top">
                  <div className="title">
                    <span>Search</span>
                  </div>
                  <a className="close-nav" onClick={closeSidebar}>
                    <Cancel />
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
              ''
            )}
            {showColumns && (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings {...tableProps} dispatch={dispatch} />
              </div>
            )}
          </div>
        )}
        <Table
          {...tableProps}
          childComponents={{
            cell: {
              content: (props) => {
                switch (props.column.key) {
                  case 'drag':
                    return (
                      <img
                        style={{ cursor: 'move' }}
                        src="https://komarovalexander.github.io/ka-table/static/icons/draggable.svg"
                        alt="draggable"
                      />
                    )
                }
              },
            },
            noDataRow: {
              content: () => 'No Data Found',
            },
          }}
          dispatch={dispatch}
          extendedFilter={() => searchedData}
        />

        <div className="table-bottom">
          <select
            name="item-per-page"
            id="item-per-page"
            value={itemPerPage}
            onChange={(e) => itemPerPageHandleChange(e)}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
          <Pagination changePage={getSearchingData} data={zipcodeTelMarket} />
        </div>
      </div>
    </>
  )
}

ZipcodeByTelevisionMarketNew.layout = (page) => <Layout title="Zipcode Database">{page}</Layout>
export default ZipcodeByTelevisionMarketNew
