import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Tooltip, Button, Table, Select, Pagination } from 'antd'
import Edit from '../../../images/three-dots.svg'
import { DeleteOutlined } from '@ant-design/icons'
import produce from 'immer'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import CustomFilter from '@/Components/CustomFilter'
import { SearchedFields } from '@/Helpers/SearchedFields'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import toast from 'react-hot-toast'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { countActiveFilters } from '@/Helpers/ActiveFilterCount'
import { columns as defaultColumns } from './Helpers/BilledCallLogsProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const BilledCallLogs = () => {
  const { billedCallLogs, campaignsWithAnnotations, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [inboundIds, setInbounIds] = useState([])
  const [showRevenueClearModal, setShowRevenueClearModal] = useState({
    open: false,
  })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [isLoading, setIsLoading] = useState({
    revenue: false,
    delete: false,
  })
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)
  const editData = []
  const [filterValue, setFilterValue] = useState({ groupName: 'and', items: [] })
  const [sn, setSn] = useState('')
  const [openRowFunctionalities, setOpenRowFunctionalities] = useState(false)
  const rowFunctionalitiesRef = useRef()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [totalRecords, setTotalRecords] = useState(billedCallLogs.total || 0)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setcurrentPage] = useState(1)
  const style = {
    top: position.y < 650 ? position.y - 137 : position.y - 298,
    left: 350,
  }
  const [orderByValue, setOrderByValue] = useState('')

  const updateAnnotation = (value, tableIndex, index) => {
    const annotationId = value === '' ? '' : Number(value)
    axios
      .post(route('change.annotation', 'BilledCallLogs'), {
        indexId: tableIndex,
        annotation_id: annotationId,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success(res.data.msg)
          setData((prev) =>
            prev.map((item) =>
              item.id == tableIndex ? { ...item, Has_Annotation: res.data.has_annotation } : item
            )
          )
        }
      })
      .catch((err) => {})
  }

  const rowFunctionalitiesPosition = (e) => {
    if (!openRowFunctionalities) {
      setPosition({ x: e.screenX, y: e.screenY })
    }
  }

  const mapDataArr = (data) => {
    return data.map((item, index) => {
      return {
        edit: item.id,
        sl: index + 1,
        SN: item.SN,
        Recording_Url: item.Recording_Url,
        Call_Date_Time: item.Call_Date_Time,
        Call_Date: item.Call_Date,
        Duplicate_Call: item.Duplicate_Call,
        Customer: item.Customer,
        Affiliate: item.Affiliate,
        Market: item.Market,
        Campaign: item.Campaign,
        Inbound: item.Inbound,
        Inbound_Id: item.Inbound_Id,
        Dialed: item.Dialed,
        Type: item.Type,
        Target: item.Target,
        Target_Number: item.Target_Number,
        Target_Description: item.Target_Description,
        Source_Hangup: item.Source_Hangup,
        Conn_Duration: item.Conn_Duration,
        Time_To_Call: item.Time_To_Call,
        call_Length_In_Seconds: item.call_Length_In_Seconds,
        Revenue: item.Revenue,
        payoutAmount: item.payoutAmount,
        Total_Cost: item.Total_Cost,
        Profit: item.Profit,
        Call_Status: item.call_Logs_status,
        City: item.City,
        State: item.State,
        Zipcode: item.Zipcode,
        Annotation_Tag: [item.Annotation_Tag, item.Campaign, item.id, index],
        Has_Annotation: item.Has_Annotation,
        id: item.id,
        key: item.id,
      }
    })
  }

  const dataArray = mapDataArr(billedCallLogs.data)

  const optionKey = 'billed-call-logs'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const initialColumns =
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns

  const fields = SearchedFields(initialColumns)
  const [columns, setColumns] = useState(initialColumns)
  const [data, setData] = useState(dataArray)
  const [loading, setLoading] = useState(false)
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

  const handleToggleColumn = (key) => {
    setColumns((prev) => {
      const updated = prev.map((c) =>
        c.key === key ? { ...c, visible: c.visible === false ? true : false } : c
      )
      addTableDetails(columnDetails, setColumnDetails, updated, optionKey)
      return updated
    })
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys)
      setTableToolbar(newSelectedRowKeys.length > 0)
      setInbounIds(selectedRows.map((row) => row.Inbound_Id))
    },
  }

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

        if (col.key === 'edit') {
          base.fixed = 'left'
          base.render = (value) => (
            <div className="edit-icon" onClick={() => handleRowFunctionalities(value)}>
              <img src={Edit} alt="edit-icon"></img>
            </div>
          )
        }

        if (col.key === 'Recording_Url') {
          base.render = (value) => (
            <audio className="audio-data w-full" controls>
              <source src={value} type="audio/mp3" />
              Your browser does not support the <code>audio</code> element.
            </audio>
          )
        }

        if (col.key === 'Call_Date') {
          base.render = (value) => {
            if (value !== undefined) {
              let shortMonth = value.toLocaleString('en-us', { month: 'short' })
              let format_date = value
              let dd = String(format_date.getDate()).padStart(2, '0')
              let yyyy = format_date.getFullYear()
              return dd + '-' + shortMonth + '-' + yyyy
            }
          }
        }

        if (col.key === 'Call_Date_Time') {
          base.render = (value) => {
            if (value !== undefined) {
              return DateTimeFormat(value)
            }
          }
        }

        if (col.key === 'Annotation_Tag') {
          base.render = (value) => {
            let arrayValue = Array.isArray(value) ? value : String(value).split(',')
            const selectedAnnotation = arrayValue[0] ? String(arrayValue[0]) : undefined
            return (
              <Select
                defaultValue={selectedAnnotation}
                onChange={(value) => updateAnnotation(value, arrayValue[2], arrayValue[3])}
                size="small"
                className="w-full"
              >
                <Select.Option value="">Select Annotation</Select.Option>
                {campaignsWithAnnotations
                  .filter((campaign) => campaign.campaign_name == arrayValue[1])[0]
                  ?.annotations.map((annotation) => (
                    <Select.Option key={annotation.id} value={String(annotation.id)}>
                      {annotation.annotation_name}
                    </Select.Option>
                  ))}
              </Select>
            )
          }
        }

        return base
      })
  )

  const [serachSidebar, setSearchSidebar] = useState(false)
  const activeFilterCount = countActiveFilters(filterValue)

  const handleFilter = () => {
    setSearchSidebar((prevState) => !prevState)
    setShowColumns(false)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }

  const deleteHandler = () => {
    setIsLoading({ ...isLoading, delete: true })
    axios
      .post(route('billed.delete'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
          setIsLoading({ ...isLoading, delete: false })
          setInbounIds([])
          setSelectedRowKeys([])
          getSearchingData(currentPage)
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, delete: false })
          setInbounIds([])
          setSelectedRowKeys([])
          setTableToolbar(false)
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, delete: false })
        setInbounIds([])
        setSelectedRowKeys([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
      })
  }

  const handleClear = (inboundIds) => {
    setIsLoading({ ...isLoading, revenue: true })
    axios
      .post(route('bill.calllogs.revenue.update'), { inboundIds })
      .then((res) => {
        if (res.status === 200) {
          setIsLoading({ ...isLoading, revenue: false })
          toast.success('Successfully Updated')
          setData((prev) =>
            prev.map((item) =>
              item.Inbound_Id === editData[0] ? { ...item, Revenue: '', payoutAmount: '' } : item
            )
          )
          setShowRevenueClearModal({ open: false })
          setOpenRowFunctionalities(false)
          setInbounIds([])
          setSelectedRowKeys([])
        } else {
          setIsLoading({ ...isLoading, revenue: false })
          toast.success(res.data.msg)
          setShowRevenueClearModal({ open: false })
          setOpenRowFunctionalities(false)
          setInbounIds([])
          setSelectedRowKeys([])
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, revenue: false })
        setShowRevenueClearModal({ open: false })
        setOpenRowFunctionalities(false)
        setInbounIds([])
        setSelectedRowKeys([])
      })
  }

  const handleOpenModal = (setOpenModal, tableData) => {
    setOpenModal({ open: true })
    if (tableData) {
      data.forEach((item) => {
        if (item.Inbound_Id === editData[0]) {
          setSn(item.SN)
        }
      })
      setShowRevenueClearModal({ open: true })
    }
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowKeys([])
  }

  const handleDeleteOpenModal = () => {
    setShowDeleteModal({ open: true })
  }

  const getSearchingData = async (page = 1) => {
    setcurrentPage(page)
    setLoading(true)
    await axios
      .get(
        'billed-call-log-report?page=' +
          page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue) +
          '&orderBy=' +
          orderByValue
      )
      .then((res) => {
        setData(mapDataArr(res.data.data))
        setTotalRecords(res.data.total)
        setLoading(false)
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
  }

  useEffect(() => {
    getSearchingData(currentPage)
  }, [itemPerPage, filterValue, orderByValue])

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
  }, [serachSidebar, data.length, loading, itemPerPage])

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        openRowFunctionalities &&
        rowFunctionalitiesRef.current &&
        !rowFunctionalitiesRef.current.contains(e.target)
      ) {
        setOpenRowFunctionalities(false)
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [openRowFunctionalities])

  const RowFunctionalities = () => {
    return (
      <div className="row-functionalities" ref={rowFunctionalitiesRef} style={style}>
        <div>
          <span onClick={() => handleOpenModal(setShowRevenueClearModal, true)}>Clear</span>
        </div>
      </div>
    )
  }

  const handleRowFunctionalities = (id) => {
    setOpenRowFunctionalities(true)
    setShowColumns(false)
    if (editData.length > 0) {
      const itemIndx = editData.indexOf(id)
      editData.splice(itemIndx, 1)
    }
    const tempData = data.filter((item) => item.id == id)
    editData.push(tempData[0].Inbound_Id)
  }

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: '#031b4e' }} />}
            onClick={handleDeleteOpenModal}
          />
        </Tooltip>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="Billed Call Logs Report" />
      <div className="selection-demo" onClick={rowFunctionalitiesPosition}>
        {openRowFunctionalities ? <RowFunctionalities /> : ''}
        {tableToolbar ? (
          <TableToolbar />
        ) : (
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
              <div>
                <MultiSelect
                  options={[
                    { label: 'Created At (Ascending)', value: 'ASC' },
                    { label: 'Created At (Descending)', value: 'DESC' },
                  ]}
                  onChange={(value) => setOrderByValue(value)}
                  placeholder="Order By"
                  singleSelect
                />
              </div>
            </div>
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}

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
                mainData={data}
                fields={fields}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
                currentPage={currentPage}
                getSearchingData={getSearchingData}
              />
            </div>
          </div>
          <div className="report-table-panel" ref={tablePanelRef}>
            <ReportTableDndShell dndContextProps={dndContextProps} sortableContextProps={sortableContextProps}>
            <Table
              columns={antdColumns}
              dataSource={data}
              rowKey="id"
              rowSelection={rowSelection}
              loading={loading}
              pagination={false}
              components={{
                header: {
                  cell: DraggableResizableHeader,
                },
              }}
              scroll={{ x: 'max-content', y: 'calc(100vh - 217px)' }}
              size="small"
            />
            </ReportTableDndShell>
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
                current={currentPage}
                total={totalRecords}
                pageSize={itemPerPage}
                onChange={(page) => getSearchingData(page)}
                showSizeChanger={false}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showRevenueClearModal.open}
        setOpen={setShowRevenueClearModal}
        btnAction={handleClear}
        closeAction={() => handleCloseModal(setShowRevenueClearModal)}
        editData={editData}
        width={'450px'}
        title={
          <>
            Do you want clear <b>revenue</b> and <b>payout</b> for - <b>{sn}</b>
          </>
        }
        loading={isLoading.revenue}
      ></ConfirmModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${
          inboundIds.length > 1
            ? 'Do you want to delete these records?'
            : 'Do you want to delete this record?'
        }`}
        loading={isLoading.delete}
      ></ConfirmModal>
    </>
  )
}

BilledCallLogs.layout = (page) => <Layout title="Billed Call Logs">{page}</Layout>
export default BilledCallLogs
