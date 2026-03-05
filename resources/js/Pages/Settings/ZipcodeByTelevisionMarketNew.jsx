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
import { fields, groups, filter, columns as defaultColumns } from './Helpers/ZipcodeByTelevisionMarketNewProps'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'

const ZipcodeByTelevisionMarketNew = () => {
  const { allZipcodesByTelevisionMarket, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [loading, setLoading] = useState(false)
  const showColumnRef = useRef()
  const [zipcodeTelMarket, setZipcodeTelMarket] = useState(allZipcodesByTelevisionMarket)
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

  const getSearchingData = async (pageData) => {
    setCurerentPage(pageData)
    setLoading(true)
    await axios
      .get(
        'tv-markets-by-zip-codes?page=' +
          pageData.page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        setData(res.data.data.map((item, index) => ({
          ...item,
          key: item.id,
        })))
        setZipcodeTelMarket(res.data)
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

              <Button
                type="primary"
                onClick={exportHandler}
                disabled={allZipcodesByTelevisionMarket == ''}
                loading={loading}
                className="w-auto capitalize text-sm"
              >
                Searched Export
              </Button>
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
          <Pagination changePage={getSearchingData} data={zipcodeTelMarket} />
        </div>
      </div>
    </>
  )
}

ZipcodeByTelevisionMarketNew.layout = (page) => <Layout title="Zipcode Database">{page}</Layout>
export default ZipcodeByTelevisionMarketNew
