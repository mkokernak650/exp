import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Eye from '@/Components/Icons/Eye.jsx'
import { Table, Tooltip, Button, Input, Radio, Spin, Select, Pagination } from 'antd'
import NormalModal from '@/Shared/NormalModal'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { columns as defaultColumns } from './Helpers/ZipcodeDatabaseProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import toast from 'react-hot-toast'

const ZipcodeDatabase = () => {
  const { allZipcodes, columnsData, states } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importModal, setImportModal] = useState({ open: false })
  const [exportModal, setExportModal] = useState({ open: false })
  const [selectedFile, setSelectedFile] = useState(null)
  const [type, setType] = useState('xlsx')
  const showColumnRef = useRef()
  const [totalRecords, setTotalRecords] = useState(allZipcodes?.total ?? 0)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [filterByState, setFilterByState] = useState('')
  const [filterByTimeZone, setFilterByTimeZone] = useState('')
  const [filterBySearchBoxValue, setFilterBySearchBoxValue] = useState({
    county: '',
    city: '',
    zipCode: '',
    npa: '',
    nxx: '',
  })

  const mapDataArr = (data) => {
    return data.data.map((item, index) => ({
      sl: index + 1,
      NPA: item.NPA,
      NXX: item.NXX,
      NPANXX: item.NPANXX,
      ZipCode: item.ZipCode,
      State: item.State,
      City: item.City,
      County: item.County,
      CountyPop: item.CountyPop,
      ZipCodeCount: item.ZipCodeCount,
      ZipCodeFreq: item.ZipCodeFreq,
      Latitude: item.Latitude,
      Longitude: item.Longitude,
      TimeZone: item.TimeZone,
      ObservesDST: item.ObservesDST,
      NXXUseType: item.NXXUseType,
      NXXIntroVersion: item.NXXIntroVersion,
      NPANew: item.NPANew,
      FIPS: item.FIPS,
      Status: item.Status,
      LATA: item.LATA,
      Overlay: item.Overlay,
      RateCenter: item.RateCenter,
      SwitchCLLI: item.SwitchCLLI,
      MSA_CBSA: item.MSA_CBSA,
      MSA_CBSA_CODE: item.MSA_CBSA_CODE,
      OCN: item.OCN,
      Company: item.Company,
      CoverageAreaName: item.CoverageAreaName,
      Flags: item.Flags,
      WeightedLat: item.WeightedLat,
      WeightedLon: item.WeightedLon,
      id: item.id,
      key: item.id,
    }))
  }

  const optionKey = 'zipcode-database'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
  )
  const {
    DraggableResizableHeader,
    withResizableColumns,
    dndContextProps,
    sortableContextProps,
  } = useReportTableColumns({
    columns,
    setColumns,
    columnDetails,
    setColumnDetails,
    optionKey,
  })

  const [data, setData] = useState(mapDataArr(allZipcodes))

  const statesOptions = states.map((state) => ({ label: state, value: state }))
  const timeZones = [4, 5, 6, 7, 8, 9, 10, 11, 14, 20]
  const TimeZoneOptions = timeZones.map((timeZone) => ({
    label: timeZone,
    value: timeZone.toString(),
  }))

  const handleSearchBoxChange = (event) => {
    setFilterBySearchBoxValue((oldValues) => ({
      ...oldValues,
      [event.target.name]: event.target.value,
    }))
  }

  const handleToggleColumn = (key) => {
    setColumns((prev) => {
      const updated = prev.map((c) =>
        c.key === key ? { ...c, visible: c.visible === false ? true : false } : c
      )
      addTableDetails(columnDetails, setColumnDetails, updated, optionKey)
      return updated
    })
  }

  const handleReorderColumns = (reordered) => {
    setColumns(reordered)
    addTableDetails(columnDetails, setColumnDetails, reordered, optionKey)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }

  const handleImportChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleExportChange = (e) => {
    setType(e.target.value)
  }

  const importHandler = (e) => {
    e.preventDefault()
    setImportLoading(true)
    const formData = new FormData()
    formData.append('importfile', selectedFile)
    axios
      .post(route('zipcode.data.import'), formData)
      .then((res) => {
        setSelectedFile(null)
        setImportLoading(false)
        if (res.status === 200) {
          setImportModal({ open: false })
          toast.success('Imported Successfully')
        } else {
          toast.error('Import failed')
        }
      })
      .catch(() => {
        setImportLoading(false)
      })
  }

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (showColumns && showColumnRef.current && !showColumnRef.current.contains(e.target)) {
        setShowColumns(false)
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [showColumns])

  const getSearchingData = async (page = 1) => {
    setCurerentPage(page)
    setTableLoading(true)
    await axios
      .get(
        'telephone-and-zip-codes?page=' +
          page +
          '&itemPerPage=' +
          itemPerPage +
          '&filterByState=' +
          filterByState +
          '&filterByTimeZone=' +
          filterByTimeZone +
          '&filterBySearchBoxValue=' +
          JSON.stringify(filterBySearchBoxValue) +
          '&sortField=' +
          sortField +
          '&sortOrder=' +
          sortOrder
      )
      .then((res) => {
        setTotalRecords(res.data.total)
        setData(
          res.data.data.map((item, index) => ({
            ...item,
            sl: index + 1,
            key: item.id,
          }))
        )
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
    getSearchingData(1)
  }, [itemPerPage, filterByState, filterByTimeZone, filterBySearchBoxValue, sortField, sortOrder])

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const exportHandler = (e) => {
    e.preventDefault()
    setExportLoading(true)
    axios
      .get(
        'zipcode-data-export?filterByState=' +
          filterByState +
          '&filterByTimeZone=' +
          filterByTimeZone +
          '&filterBySearchBoxValue=' +
          JSON.stringify(filterBySearchBoxValue)
      )
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

  const hasActiveFilter =
    filterByState !== '' ||
    filterByTimeZone !== '' ||
    Object.values(filterBySearchBoxValue).some((v) => v !== '')

  const handleTableChange = (_pagination, _filters, sorter) => {
    if (sorter.order) {
      setSortField(sorter.field)
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc')
    } else {
      setSortField('')
      setSortOrder('')
    }
  }

  const antdColumns = withResizableColumns(
    columns
      .filter((c) => c.visible !== false && c.key !== 'selection-cell')
      .map((col) => {
        const hasSorter = col.dataType === 'number' || col.dataType === 'date' || col.dataType === 'string'
        const base = {
          key: col.key,
          dataIndex: col.key,
          title: col.title || '',
          width: col.style?.width || col.width,
          sorter: hasSorter ? true : undefined,
        }

        return base
      })
  )

  return (
    <>
      <Helmet title="ZipCode Database" />
      <div className="selection-demo">
        <div className="table-top-flex-start">
          <div className="top-left">
            <div className="columns-show-hide" onClick={handleColumns}>
              <Eye />
            </div>
            <Tooltip
              title={
                !hasActiveFilter
                  ? 'Please select at least one filter condition before exporting'
                  : data.length === 0
                    ? 'No records available to export'
                    : ''
              }
            >
              <Button
                type="primary"
                onClick={exportHandler}
                disabled={!hasActiveFilter || data.length === 0}
                loading={exportLoading}
                className="w-auto capitalize text-sm"
              >
                Export
              </Button>
            </Tooltip>
          </div>
          <div className="top-left gap-[5px]">
            <MultiSelect
              options={statesOptions}
              placeholder="State"
              className="w-[180px]"
              onChange={(value) => setFilterByState(value)}
              defaultValue={filterByState}
            />
            <MultiSelect
              options={TimeZoneOptions}
              placeholder="Time Zone"
              className="w-[180px]"
              onChange={(value) => setFilterByTimeZone(value)}
              defaultValue={filterByTimeZone}
            />
            <Input
              id="county"
              name="county"
              placeholder="County"
              size="small"
              className="w-[180px]"
              value={filterBySearchBoxValue.county}
              onChange={handleSearchBoxChange}
            />
            <Input
              id="city"
              name="city"
              placeholder="City"
              size="small"
              className="w-[180px]"
              value={filterBySearchBoxValue.city}
              onChange={handleSearchBoxChange}
            />
            <Input
              id="zipCode"
              name="zipCode"
              placeholder="Zip Code"
              size="small"
              type="number"
              className="w-[180px]"
              value={filterBySearchBoxValue.zipCode}
              onChange={handleSearchBoxChange}
            />
            <Input
              id="npa"
              name="npa"
              placeholder="NPA"
              size="small"
              type="number"
              className="w-[180px]"
              value={filterBySearchBoxValue.npa}
              onChange={handleSearchBoxChange}
            />
            <Input
              id="nxx"
              name="nxx"
              placeholder="NXX"
              size="small"
              type="number"
              className="w-[180px]"
              value={filterBySearchBoxValue.nxx}
              onChange={handleSearchBoxChange}
            />
          </div>
          {showColumns ? (
            <div className="column-settings" ref={showColumnRef}>
              <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} onReorderColumns={handleReorderColumns} />
            </div>
          ) : (
            ''
          )}
        </div>
        <ReportTableDndShell dndContextProps={dndContextProps} sortableContextProps={sortableContextProps}>
        <Table
          columns={antdColumns}
          components={{ header: { cell: DraggableResizableHeader } }}
          dataSource={data}
          rowKey="id"
          loading={tableLoading}
          pagination={false}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
          onChange={handleTableChange}
        />
        </ReportTableDndShell>
        <div className="table-bottom">
          <Select
            value={itemPerPage}
            onChange={(value) => itemPerPageHandleChange(value)}
            options={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 50, label: '50' },
              { value: 100, label: '100' },
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

        <NormalModal open={importModal.open} setOpen={setImportModal} width={'500px'} title={''}>
          <div>
            <input id="importfile" type="file" name="importfile" onChange={handleImportChange} />
            <Button
              type="primary"
              onClick={importHandler}
              disabled={!selectedFile}
              loading={importLoading}
            >
              Next
            </Button>
          </div>
        </NormalModal>

        <NormalModal open={exportModal.open} setOpen={setExportModal} width={'500px'} title={''}>
          <div>
            <label>Select Type</label>
            <Radio.Group value={type} onChange={handleExportChange}>
              <Radio value="xlsx">XLSX</Radio>
              <Radio value="csv">CSV</Radio>
              <Radio value="xls">XLS</Radio>
              <Radio value="tsv">TSV</Radio>
            </Radio.Group>
            <Button type="primary" onClick={exportHandler} loading={exportLoading}>
              Next
            </Button>
          </div>
        </NormalModal>
      </div>
    </>
  )
}

ZipcodeDatabase.layout = (page) => <Layout title="Zipcode Database">{page}</Layout>
export default ZipcodeDatabase
