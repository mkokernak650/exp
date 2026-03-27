import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Table, Tooltip, Button, Input, Switch, Select, DatePicker } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import CheckOutsideClick from '@/Helpers/CheckOutsideClick'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import toast from 'react-hot-toast'
import { fields, filter, columns as defaultColumns } from './Helpers/BroadcastMonthReportProps'
import mergeColumns from '@/Helpers/MergeColumns'
import { Pagination } from 'react-laravel-paginex'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { countActiveFilters } from '@/Helpers/ActiveFilterCount'

const BroadcastMonthReport = () => {
  const { allBroadCastMonths, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)
  const [broadCastMonths, setBroadCastMonths] = useState(allBroadCastMonths)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const optionKey = 'broadcast-month-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [columns, setColumns] = useState(
    mergeColumns(
      defaultColumns,
      columnsData.length ? JSON.parse(columnsData[0])?.[optionKey] : null
    )
  )
  const { ResizableTitle, withResizableColumns } = useResizableTableColumns({
    columns,
    setColumns,
    columnDetails,
    setColumnDetails,
    optionKey,
  })

  const mapDataArr = (data) => {
    return data.map((item, index) => ({
      edit: item.id,
      sl: index + 1,
      broad_cast_month: item.broad_cast_month,
      start_date: item.start_date,
      end_date: item.end_date,
      days_count: item.days_count,
      status: [item.status, item.id],
      id: item.id,
      key: item.id,
    }))
  }

  const [data, setData] = useState(mapDataArr(allBroadCastMonths.data))

  const handleStatus = (value, rowId) => {
    axios
      .post(route('broadcast.month.status.update'), { value: value, rowId: rowId })
      .then((res) => {
        setData((prev) =>
          prev.map((item) => {
            if (item.id === rowId) {
              return { ...item, status: [item.status[0] === 1 ? 0 : 1, rowId] }
            }
            return item
          })
        )
        toast.success(res.data.msg)
      })
      .catch((err) => {
        console.log(err)
      })
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
  const handleEdit = (itemId) => {
    const item = data.find((item) => item.id === itemId)
    if (item) {
      setEditData(item)
      setShowEditModal({ open: true })
    }
  }

  const handleToolbarEdit = () => {
    if (selectedRowKeys.length !== 1) {
      toast.error('Please select exactly one row to edit')
      return
    }
    handleEdit(selectedRowKeys[0])
  }

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = () => {
    axios
      .post(route('broadcast.month.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) =>
            prev.map((item) => {
              if (item.id === editData.id) {
                return {
                  ...item,
                  broad_cast_month: editData.broad_cast_month,
                  start_date: editData.start_date,
                  end_date: editData.end_date,
                  days_count: res.data.days_count,
                }
              }
              return item
            })
          )
          setEditData(undefined)
          handleCloseModal(setShowEditModal)
          toast.success(res.data.msg)
        } else {
          setEditData(undefined)
          handleCloseModal(setShowEditModal)
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowKeys([])
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  const deleteHandler = () => {
    axios
      .post(route('broadcast.month.delete'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
          setSelectedRowKeys([])
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          setSelectedRowKeys([])
          setTableToolbar(false)
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        console.log(err)
      })
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
        'broadcast-month-report?page=' +
          pageData.page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        setData(mapDataArr(res.data.data))
        setBroadCastMonths(res.data)
        setLoading(false)
      })
  }

  const TableToolbar = () => {
    const toolbarIconStyle = { color: '#031b4e', fontSize: 20 }

    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button
            type="text"
            icon={<DeleteOutlined style={toolbarIconStyle} />}
            onClick={() => handleOpenModal(setShowDeleteModal)}
          />
        </Tooltip>
        {selectedRowKeys.length === 1 && (
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined style={toolbarIconStyle} />}
              onClick={handleToolbarEdit}
            />
          </Tooltip>
        )}
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  const itemPerPageHandleChange = (e) => {
    setItemPerPage(e.target.value)
  }

  useEffect(() => {
    getSearchingData(curerentPage)
  }, [itemPerPage, filterValue])

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

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys)
      setTableToolbar(newSelectedRowKeys.length > 0)
    },
  }

  const antdColumns = withResizableColumns(
    columns
      .filter((c) => c.visible !== false && c.key !== 'selection-cell' && c.key !== 'edit')
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

        if (col.key === 'status') {
          base.render = (value) => (
            <Switch checked={value[0] === 1} onChange={() => handleStatus(value[0], value[1])} />
          )
        }

        return base
      })
  )

  return (
    <>
      <Helmet title="Broadcast Month Report" />

      <div className="selection-demo">
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
              rowSelection={rowSelection}
              loading={loading}
              pagination={false}
              scroll={{ y: 'calc(100vh - 217px)' }}
              size="small"
            />
            <div className="table-bottom">
              <Select
                value={itemPerPage}
                onChange={(value) => setItemPerPage(value)}
                options={[
                  { value: 10, label: '10' },
                  { value: 20, label: '20' },
                  { value: 100, label: '100' },
                  { value: 200, label: '200' },
                ]}
              />
              <Pagination changePage={getSearchingData} data={broadCastMonths} />
            </div>
          </div>
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit BroadCast Month'}
        onClose={() => handleCloseModal(setShowEditModal)}
      >
        <div className="edit-broadcast-month">
          <form>
            <span>BroadCast Month:</span>
            <Input
              value={editData ? editData.broad_cast_month : ''}
              name="broad_cast_month"
              type="text"
              onChange={handleEditChange}
              className="w-full mb-4 mt-2"
            />
            <span>Start Date:</span>
            <DatePicker
              value={editData?.start_date ? dayjs(editData.start_date) : null}
              onChange={(date, dateString) =>
                handleEditChange({ target: { name: 'start_date', value: dateString } })
              }
              className="w-full mb-4 mt-2"
            />
            <span>End Date:</span>
            <DatePicker
              value={editData?.end_date ? dayjs(editData.end_date) : null}
              onChange={(date, dateString) =>
                handleEditChange({ target: { name: 'end_date', value: dateString } })
              }
              className="w-full mb-4 mt-2"
            />

            <Button type="primary" onClick={handleEditSubmit} className="mt-[15px]">
              Edit
            </Button>
          </form>
        </div>
      </NormalModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${
          selectedRowKeys.length > 1
            ? 'Do you want to delete these records?'
            : 'Do you want to delete this record?'
        }`}
      ></ConfirmModal>
    </>
  )
}

BroadcastMonthReport.layout = (page) => <Layout title="BroadcastMonthReport">{page}</Layout>
export default BroadcastMonthReport
