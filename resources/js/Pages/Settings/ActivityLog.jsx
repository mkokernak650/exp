import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import { Table, Button, Select } from 'antd'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { Pagination } from 'react-laravel-paginex'
import toast from 'react-hot-toast'
import CheckOutsideClick from '@/Helpers/CheckOutsideClick'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import { fields, groups, filter, columns as defaultColumns } from './Helpers/ActivityLogProps'
import { DateTimeFormat } from '../../Helpers/DateTimeFormat'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'

const ActivityLog = () => {
  const { allActivityLog, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [loading, setLoading] = useState(false)
  const showColumnRef = useRef()
  const [activityLog, setActivityLog] = useState(allActivityLog)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)

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
      key: item.id,
    }))
  }

  const optionKey = 'activity-log'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
  )
  const { ResizableTitle, withResizableColumns } = useResizableTableColumns({
    columns,
    setColumns,
    columnDetails,
    setColumnDetails,
    optionKey,
  })

  const [data, setData] = useState(mapDataArr(allActivityLog))

  const handleToggleColumn = (key) => {
    setColumns((prev) => {
      const updated = prev.map((c) =>
        c.key === key ? { ...c, visible: c.visible === false ? true : false } : c
      )
      addTableDetails(columnDetails, setColumnDetails, updated, optionKey)
      return updated
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
    const filterdData = data.map((item) => {
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
    const xlsData = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(xlsData, 'ActivityLog' + '.xlsx')
    toast.success('Report Exported Successfully')
  }

  useEffect(() => {
    const closeColumnSetting = (e) => {
      CheckOutsideClick(e, showColumns, setShowColumns, showColumnRef)
    }
    document.addEventListener('mousedown', closeColumnSetting)
    return () => {
      document.removeEventListener('mousedown', closeColumnSetting)
    }
  }, [showColumns])

  const getSearchingData = async (pageData) => {
    setCurerentPage(pageData)
    setLoading(true)
    await axios
      .get(
        'activity-log?page=' +
          pageData.page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        setData(res.data.data.map((item, index) => ({
          event: item.event,
          log_name: item.log_name,
          description: item.description,
          created_at: item.created_at,
          properties: item.properties,
          name: item.properties?.name,
          email: item.properties?.email,
          ids: item.properties?.ids,
          id: item.id,
          key: item.id,
        })))
        setActivityLog(res.data)
        setLoading(false)
      })
  }

  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue)
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
  }

  useEffect(() => {
    getSearchingData(curerentPage)
  }, [itemPerPage, filterValue])

  const antdColumns = withResizableColumns(
    columns
    .filter((c) => c.visible !== false && c.key !== 'selection-cell')
    .map((col) => {
      const base = {
        key: col.key,
        dataIndex: col.key,
        title: col.title || '',
        width: col.style?.width || col.width,
        sorter: col.dataType === 'number'
          ? (a, b) => (a[col.key] ?? 0) - (b[col.key] ?? 0)
          : col.dataType === 'string'
            ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
            : undefined,
      }

      if (col.key === 'created_at' || col.key === 'updated_at') {
        base.render = (value) => DateTimeFormat(value)
      }
      if (col.key === 'properties.ids') {
        base.dataIndex = 'ids'
        base.render = (value) => value ? value.toString().replace(/,/g, ', ') : ''
      }

      return base
    })
  )

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
              <Button
                type="primary"
                onClick={viewExport}
                disabled={data.length < 1}
                className="w-auto capitalize text-sm"
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
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} />
              </div>
            )}
          </div>
        }
        <Table
          columns={antdColumns}
          components={{ header: { cell: ResizableTitle } }}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
        />

        <div className="table-bottom">
          <Select
            value={itemPerPage}
            onChange={(value) => itemPerPageHandleChange(value)}
            options={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 100, label: '100' },
              { value: 200, label: '200' },
            ]}
          />
          <Pagination changePage={getSearchingData} data={activityLog} />
        </div>
      </div>
    </>
  )
}

ActivityLog.layout = (page) => <Layout title="Zipcode Database">{page}</Layout>
export default ActivityLog
