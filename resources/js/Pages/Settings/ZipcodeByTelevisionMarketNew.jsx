import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Table, Tooltip, Button, Select, Pagination } from 'antd'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import toast from 'react-hot-toast'
import CheckOutsideClick from '@/Helpers/CheckOutsideClick'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import {
  fields,
  filter,
  columns as defaultColumns,
} from './Helpers/ZipcodeByTelevisionMarketNewProps'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { countActiveFilters } from '@/Helpers/ActiveFilterCount'

const ZipcodeByTelevisionMarketNew = () => {
  const { allZipcodesByTelevisionMarket, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)
  const [totalRecords, setTotalRecords] = useState(allZipcodesByTelevisionMarket.total || 0)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)

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
      key: item.id,
    }))
  }

  const optionKey = 'zipcode-television-by-market'
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

  const [data, setData] = useState(mapDataArr(allZipcodesByTelevisionMarket))

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
  const activeFilterCount = countActiveFilters(filterValue)

  const handleFilter = () => {
    setSearchSidebar((prevState) => !prevState)
    setShowColumns(false)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const exportHandler = (e) => {
    e.preventDefault()
    setExportLoading(true)
    axios
      .get('zipcode-television-market-export?filterValue=' + JSON.stringify(filterValue))
      .then((res) => {
        setExportLoading(false)
        if (res.status === 200) {
          triggerExportLink(res.request.responseURL)
        } else {
          toast.error('Error while importing file')
        }
      })
      .catch(() => {
        setExportLoading(false)
      })
  }

  const viewExport = () => {
    const filterdData = data.map((item) => {
      delete item.id
      delete item.key
      return item
    })
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const ws = XLSX.utils.json_to_sheet(filterdData, 'ZipCodeTelevisionByMarketView')
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const xlsData = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(xlsData, 'ZipCodeTelevisionByMarketView' + '.xlsx')
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

  useEffect(() => {
    const syncTablePanelHeight = () => {
      if (tablePanelRef.current) {
        setTablePanelHeight(tablePanelRef.current.offsetHeight)
      }
    }

    syncTablePanelHeight()
    if (!tablePanelRef.current || typeof ResizeObserver === 'undefined') {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      syncTablePanelHeight()
    })
    resizeObserver.observe(tablePanelRef.current)
    window.addEventListener('resize', syncTablePanelHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncTablePanelHeight)
    }
  }, [serachSidebar, data.length, tableLoading, itemPerPage])

  const getSearchingData = async (page = 1) => {
    setCurerentPage(page)
    setTableLoading(true)
    await axios
      .get(
        'tv-markets-by-zip-codes?page=' +
          page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        setData(
          res.data.data.map((item, index) => ({
            ...item,
            key: item.id,
          }))
        )
        setTotalRecords(res.data.total)
        setTableLoading(false)
      })
      .catch(() => {
        setTableLoading(false)
      })
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
          sorter:
            col.dataType === 'number'
              ? (a, b) => (a[col.key] ?? 0) - (b[col.key] ?? 0)
              : col.dataType === 'date'
                ? (a, b) => new Date(a[col.key] || 0) - new Date(b[col.key] || 0)
                : col.dataType === 'string'
                  ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
                  : undefined,
        }

        return base
      })
  )

  return (
    <>
      <Helmet title="Zipcode By Television Market Report" />
      <div className="selection-demo">
        {
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
              {data.length > 0 && (
                <button
                  type="button"
                  className={`filter-trigger ${activeFilterCount ? 'active' : ''}`}
                  onClick={handleFilter}
                  aria-label="Open filters"
                >
                  <Filter />
                  {activeFilterCount ? <span className="filter-count">{activeFilterCount}</span> : ''}
                </button>
              )}

              <Tooltip
                title={
                  !activeFilterCount
                    ? 'Please select at least one filter condition before exporting'
                    : data.length === 0
                      ? 'No records available to export'
                      : ''
                }
              >
                <Button
                  type="primary"
                  onClick={exportHandler}
                  disabled={!activeFilterCount || data.length === 0}
                  loading={exportLoading}
                  className="w-auto capitalize text-sm"
                >
                  Searched Export
                </Button>
              </Tooltip>
              <Button
                type="primary"
                onClick={viewExport}
                disabled={data.length < 1}
                className="w-auto capitalize text-sm"
              >
                View Export
              </Button>
            </div>
            {showColumns && (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} />
              </div>
            )}
          </div>
        }
        <div className={`report-content-layout ${serachSidebar ? 'with-filter' : ''}`}>
          <div
            className={`search-sidebar report-filter-sidebar ${serachSidebar ? 'filter-open' : 'filter-closed'}`}
            style={
              tablePanelHeight
                ? { height: `${tablePanelHeight}px`, maxHeight: `${tablePanelHeight}px` }
                : undefined
            }
          >
            <div className="top-element">
              <CustomFilter
                fields={fields}
                filterValue={filterValue}
                setFilterValue={changeFilter}
              />
            </div>
          </div>
          <div className="report-table-panel" ref={tablePanelRef}>
            <Table
              columns={antdColumns}
              components={{ header: { cell: ResizableTitle } }}
              dataSource={data}
              rowKey="id"
              loading={tableLoading}
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
              <Pagination
                current={curerentPage}
                total={totalRecords}
                pageSize={itemPerPage}
                onChange={(page) => getSearchingData(page)}
                showSizeChanger={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

ZipcodeByTelevisionMarketNew.layout = (page) => <Layout title="Zipcode Database">{page}</Layout>
export default ZipcodeByTelevisionMarketNew
