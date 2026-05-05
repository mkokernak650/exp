import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Table, Button, Select, Pagination, Tag, Tooltip } from 'antd'
import ConfirmModal from '@/Shared/ConfirmModal'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import toast from 'react-hot-toast'
import CheckOutsideClick from '@/Helpers/CheckOutsideClick'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import { fields, filter, columns as defaultColumns } from './Helpers/EmailLogProps'
import { DateTimeFormat } from '../../Helpers/DateTimeFormat'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { reportTableSorterProps } from '@/Helpers/reportTableSort'
import { countActiveFilters, sanitizeFilterValue } from '@/Helpers/ActiveFilterCount'

const formatList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  if (value === null || value === undefined) return ''
  return String(value)
}

const buildUserName = (user) => {
  if (!user) return ''
  const first = user.firstname || ''
  const last = user.lastname || ''
  const fullName = `${first} ${last}`.trim()
  return fullName || user.email || ''
}

const mapDataArr = (data) => {
  return data.data.map((item) => {
    return {
      id: item.id,
      key: item.id,
      user_name: buildUserName(item.user),
      user_email: item.user?.email || '',
      to: formatList(item.to),
      from: item.from || '',
      subject: item.subject || '',
      status: item.status,
      type: item.type || '',
      attachment_names: formatList(item.attachment_names),
      error: item.error || '',
      sent_at: item.sent_at,
      created_at: item.created_at,
    }
  })
}

const EmailLog = () => {
  const { allEmailLogs, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [loading, setLoading] = useState(false)
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)
  const [totalRecords, setTotalRecords] = useState(allEmailLogs?.total ?? 0)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [showClearModal, setShowClearModal] = useState({ open: false })
  const [actionLoading, setActionLoading] = useState(false)

  const optionKey = 'email-log'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
  )
  const { DraggableResizableHeader, withResizableColumns, dndContextProps, sortableContextProps } =
    useReportTableColumns({
      columns,
      setColumns,
      columnDetails,
      setColumnDetails,
      optionKey,
    })

  const [data, setData] = useState(mapDataArr(allEmailLogs))

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

  const [filterValue, changeFilter] = useState(filter)
  const activeFilterJSON = useMemo(
    () => JSON.stringify(sanitizeFilterValue(filterValue)),
    [filterValue]
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

  const viewExport = () => {
    const filteredData = data.map((item) => ({
      user_name: item.user_name,
      user_email: item.user_email,
      to: item.to,
      subject: item.subject,
      type: item.type,
      status: item.status,
      attachment_names: item.attachment_names,
      error: item.error,
      sent_at: item.sent_at ? DateTimeFormat(item.sent_at) : '',
      logged_at: item.created_at ? DateTimeFormat(item.created_at) : '',
    }))
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const ws = XLSX.utils.json_to_sheet(filteredData, 'EmailLog')
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const xlsData = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(xlsData, 'EmailLog' + '.xlsx')
    toast.success('Email Log Exported Successfully')
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

  const handleTableChange = (_pagination, _filters, sorter) => {
    if (sorter.order) {
      setSortField(sorter.field)
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc')
    } else {
      setSortField('')
      setSortOrder('')
    }
  }

  const getSearchingData = async (page = 1) => {
    setCurerentPage(page)
    setLoading(true)
    await axios
      .get(
        'email-logs?page=' +
          page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          activeFilterJSON +
          '&sortField=' +
          sortField +
          '&sortOrder=' +
          sortOrder
      )
      .then((res) => {
        setData(mapDataArr(res.data))
        setTotalRecords(res.data.total)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
  }

  const handleDeleteSelected = async () => {
    setActionLoading(true)
    await axios
      .post(route('email.log.deleteSelected'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        toast.success(res.data?.msg || 'Selected logs deleted')
        setSelectedRowKeys([])
        setShowDeleteModal({ open: false })
        getSearchingData(curerentPage)
      })
      .catch((err) => {
        toast.error(err?.response?.data?.msg || 'Failed to delete selected logs')
      })
      .finally(() => setActionLoading(false))
  }

  const handleClearLog = async () => {
    setActionLoading(true)
    await axios
      .post(route('email.log.clearAll'))
      .then((res) => {
        toast.success(res.data?.msg || 'All logs cleared')
        setSelectedRowKeys([])
        setShowClearModal({ open: false })
        getSearchingData(1)
      })
      .catch((err) => {
        toast.error(err?.response?.data?.msg || 'Failed to clear logs')
      })
      .finally(() => setActionLoading(false))
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
  }

  useEffect(() => {
    getSearchingData(1)
  }, [itemPerPage, activeFilterJSON, sortField, sortOrder])

  useEffect(() => {
    const syncTablePanelHeight = () => {
      if (tablePanelRef.current) {
        setTablePanelHeight(tablePanelRef.current.offsetHeight)
      }
    }
    syncTablePanelHeight()
    if (!tablePanelRef.current || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => syncTablePanelHeight())
    resizeObserver.observe(tablePanelRef.current)
    window.addEventListener('resize', syncTablePanelHeight)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncTablePanelHeight)
    }
  }, [serachSidebar, data.length, loading, itemPerPage])

  const renderStatus = (value) => {
    if (value === 'sent') return <Tag color="green">Sent</Tag>
    if (value === 'failed') return <Tag color="red">Failed</Tag>
    return <Tag>{value || '-'}</Tag>
  }

  const renderTruncated = (value) => {
    if (!value) return ''
    const text = String(value)
    if (text.length <= 80) return text
    return (
      <Tooltip title={text} placement="topLeft">
        <span>{text.slice(0, 80)}…</span>
      </Tooltip>
    )
  }

  const antdColumns = withResizableColumns(
    columns
      .filter((c) => c.visible !== false && c.key !== 'selection-cell')
      .map((col) => {
        const hasSorter =
          col.dataType === 'number' || col.dataType === 'date' || col.dataType === 'string'
        const { sorter, sortOrder: colSortOrder } = reportTableSorterProps(col, {
          sortField,
          sortOrder,
          hasSorter,
          numericSortColumnKeys: new Set(),
        })
        const base = {
          key: col.key,
          dataIndex: col.key,
          title: col.title || '',
          width: col.style?.width || col.width,
          sorter,
          sortOrder: colSortOrder,
        }

        if (col.key === 'created_at' || col.key === 'sent_at') {
          base.render = (value) => (value ? DateTimeFormat(value) : '')
        }
        if (col.key === 'status') {
          base.render = renderStatus
        }
        if (
          col.key === 'to' ||
          col.key === 'subject' ||
          col.key === 'type' ||
          col.key === 'error' ||
          col.key === 'attachment_names'
        ) {
          base.render = renderTruncated
        }

        return base
      })
  )

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  }

  return (
    <>
      <Helmet title="Email Logs" />
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
                  {activeFilterCount ? (
                    <span className="filter-count">{activeFilterCount}</span>
                  ) : (
                    ''
                  )}
                </button>
              )}
              <Button
                type="primary"
                onClick={viewExport}
                disabled={data.length < 1}
                className="w-auto capitalize text-sm"
              >
                Export
              </Button>
              <Button
                danger
                onClick={() => handleOpenModal(setShowDeleteModal)}
                disabled={!selectedRowKeys.length}
                className="w-auto capitalize text-sm"
              >
                Delete Selected
              </Button>
              <Button
                danger
                onClick={() => handleOpenModal(setShowClearModal)}
                disabled={!data.length}
                className="w-auto capitalize text-sm"
              >
                Clear Log
              </Button>
            </div>
            {showColumns && (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings
                  columns={columns}
                  onToggleColumn={handleToggleColumn}
                  onReorderColumns={handleReorderColumns}
                />
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
            <ReportTableDndShell
              dndContextProps={dndContextProps}
              sortableContextProps={sortableContextProps}
            >
              <Table
                columns={antdColumns}
                components={{ header: { cell: DraggableResizableHeader } }}
                dataSource={data}
                rowKey="id"
                rowSelection={rowSelection}
                loading={loading}
                onChange={handleTableChange}
                pagination={false}
                scroll={{ y: 'calc(100vh - 217px)' }}
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
      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={handleDeleteSelected}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        title={`Delete ${selectedRowKeys.length} selected log(s)?`}
        loading={actionLoading}
      />
      <ConfirmModal
        open={showClearModal.open}
        setOpen={setShowClearModal}
        btnAction={handleClearLog}
        closeAction={() => handleCloseModal(setShowClearModal)}
        title="Clear all email logs? This action cannot be undone."
        loading={actionLoading}
      />
    </>
  )
}

EmailLog.layout = (page) => <Layout title="Email Logs">{page}</Layout>
export default EmailLog
