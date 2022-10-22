import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode } from 'ka-table/enums'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import { showColumn, hideLoading, showLoading } from 'ka-table/actionCreators'
import { Button, CircularProgress } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { Pagination } from 'react-laravel-paginex'
import toast from 'react-hot-toast'
import CheckOutsideClick from '@/Helpers/CheckOutsideClick'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import { useStyles, fields, groups, filter, columns } from './Helpers/ActivityLogProps'
import { DateTimeFormat } from '../../Helpers/DateTimeFormat'

const ActivityLog = () => {
  const classes = useStyles()
  const { allActivityLog, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [loading, setLoading] = useState(false)
  const showColumnRef = useRef()
  const [activityLog, setActivityLog] = useState(allActivityLog)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [searchedData, setSearchData] = useState([])

  const mapDataArr = (data) => {
    return data.data.map((item, index) => ({
      event: item.event,
      log_name: item.log_name,
      description: item.description,
      created_at: item.created_at,
      properties: item.properties,
      name: item.properties.name,
      email: item.properties.email,
      ids: item.properties.ids,
      id: item.id,
      key: index,
    }))
  }

  const dataArray = mapDataArr(allActivityLog)

  const optionKey = 'activity-log'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

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
    format: ({ column, value }) => {
      if (column.key === 'created_at' || column.key === 'updated_at') {
        return DateTimeFormat(value)
      }
      if (column.key === 'properties.ids') {
        return value.replace(/,/g, ', ')
      }
    },
  }

  const [tableProps, changeTableProps] = useState(tablePropsInit)

  const dispatch = (action) => {
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
      .get('activity-log?filterValue=' + JSON.stringify(filterValue))
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
      delete item.subject_type
      delete item.subject_id
      delete item.causer_id
      item.effected_ids = item.properties.ids.toString()
      item.module = item.log_name
      delete item.log_name
      item.user_name = item.properties.name
      item.user_email = item.properties.email
      item.activity_time = DateTimeFormat(item.created_at)
      delete item.created_at
      delete item.batch_uuid
      delete item.updated_at
      delete item.causer_type
      delete item.properties
      return item
    })
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const ws = XLSX.utils.json_to_sheet(filterdData, 'ActivityLog')
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, 'ActivityLog' + '.xlsx')
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

  const getSearchingData = async (data) => {
    setCurerentPage(data)
    dispatch(showLoading())
    await axios
      .get(
        'activity-log?page=' +
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
        setActivityLog(res.data)
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
      <Helmet title="Activity Log" />
      <div className="selection-demo">
        {
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
              {/* <Button
                variant="contained"
                type="submit"
                color="primary"
                className={classes.button}
                onClick={exportHandler}
                disabled={allActivityLog == ''}
              >
                {loading ? (
                  <CircularProgress color="inherit" thickness={3} size="1.5rem" />
                ) : (
                  'Searched Export'
                )}
              </Button> */}
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
        }
        <Table
          {...tableProps}
          childComponents={{
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
          <Pagination changePage={getSearchingData} data={activityLog} />
        </div>
      </div>
    </>
  )
}

ActivityLog.layout = (page) => <Layout title="Zipcode Database">{page}</Layout>
export default ActivityLog
