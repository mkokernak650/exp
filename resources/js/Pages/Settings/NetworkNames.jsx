import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Table, Switch, Tooltip, Button, Input } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import NormalModal from '../../Shared/NormalModal'
import ConfirmModal from '@/Shared/ConfirmModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { countActiveFilters } from '@/Helpers/ActiveFilterCount'
import { filterData } from '@/Helpers/filterData'
import { fields, filter, columns as defaultColumns } from './Helpers/NetworkNamesProps'

const NetworkNames = () => {
  const { allNetworkNames, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)

  const dataArray = allNetworkNames.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    network_name: item.network_name,
    status: [item.status, item.id],
    id: item.id,
    key: item.id,
  }))

  const optionKey = 'network-names-report'
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

  const [data, setData] = useState(dataArray)

  const handleStatus = (value, rowId) => {
    axios
      .post(route('network_names.status.update'), { value: value, rowId: rowId })
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
  const filteredData = filterData(data, filterValue)

  const handleFilter = () => {
    setSearchSidebar((prevState) => !prevState)
    setShowColumns(false)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }

  const deleteHandler = () => {
    axios
      .post(route('network_names.delete'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
          setSelectedRowKeys([])
          setTableToolbar(false)
          setShowDeleteModal({ open: false })
          toast.success(res.data.msg)
        } else {
          setSelectedRowKeys([])
          setTableToolbar(false)
          setShowDeleteModal({ open: false })
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        setSelectedRowKeys([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
      })
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
      .post(route('network_name.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) =>
            prev.map((item) => {
              if (item.id === editData.id) {
                return { ...item, network_name: editData.network_name }
              }
              return item
            })
          )
          setEditData()
          handleCloseModal(setShowEditModal)
          toast.success(res.data.msg)
          setSelectedRowKeys([])
        } else {
          setEditData()
          handleCloseModal(setShowEditModal)
          toast.error(res.data.msg)
          setSelectedRowKeys([])
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
  }, [serachSidebar, data.length])

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
      <Helmet title="Network Names Report" />
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
              dataSource={filteredData}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={{
                pageSize: 10,
                pageSizeOptions: [10, 20, 50, 100],
                showSizeChanger: true,
              }}
              scroll={{ y: 'calc(100vh - 217px)' }}
              size="small"
            />
          </div>
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit Network Name'}
        onClose={() => handleCloseModal(setShowEditModal)}
      >
        <div className="edit_target">
          <form>
            <span>Network Name:</span>
            <Input
              value={editData ? editData.network_name : ''}
              name="network_name"
              type="text"
              onChange={handleEditChange}
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

NetworkNames.layout = (page) => <Layout title="Network Names">{page}</Layout>
export default NetworkNames
