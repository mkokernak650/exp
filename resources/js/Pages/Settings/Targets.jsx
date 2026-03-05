import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import { Table, Switch, Tooltip, Button, Input } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import NormalModal from '@/Shared/NormalModal'
import ConfirmModal from '@/Shared/ConfirmModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import { styles, fields, groups, filter, columns as defaultColumns } from './Helpers/TargetsProps'

const Targets = () => {
  const { allTargets, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()

  const dataArray = allTargets.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    customer: item.Customer,
    Ringba_Target_Name: item.Ringba_Targets_Name,
    Description: item.Description,
    status: [item.status, item.id],
    id: item.id,
    key: item.id,
  }))

  const optionKey = 'target-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
  )

  const [data, setData] = useState(dataArray)

  const handleStatus = (value, rowId) => {
    axios
      .post(route('target.status.update'), { value: value, rowId: rowId })
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
  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue)
  }

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

  const deleteHandler = () => {
    axios
      .post(route('target.delete'), { selectedRowIds: selectedRowKeys })
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

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = () => {
    axios
      .post(route('target.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) =>
            prev.map((item) => {
              if (item.id === editData.id) {
                return {
                  ...item,
                  customer: editData.customer,
                  Ringba_Target_Name: editData.Ringba_Target_Name,
                  Description: editData.Description,
                }
              }
              return item
            })
          )
          setEditData()
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
          setSelectedRowKeys([])
        } else {
          setEditData()
          setShowEditModal({ open: false })
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

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button type="text" icon={<DeleteOutlined style={{ color: '#031b4e' }} />} onClick={() => handleOpenModal(setShowDeleteModal)} />
        </Tooltip>
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

  const antdColumns = columns
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

      if (col.key === 'edit') {
        base.render = (value) => (
          <div className="edit-icon" onClick={() => handleEdit(value)}>
            <Edit />
          </div>
        )
      }
      if (col.key === 'status') {
        base.render = (value) => (
          <Switch
            checked={value[0] === 1}
            onChange={() => handleStatus(value[0], value[1])}
          />
        )
      }

      return base
    })

  return (
    <>
      <Helmet title="Targets Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="columns-show-hide" onClick={handleColumns}>
              <Eye />
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
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        <Table
          columns={antdColumns}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 50, 100], showSizeChanger: true }}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
        />
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit Targets'}
      >
        <div className="edit_target">
          <form>
            <span>Customer:</span>
            <Input
              value={editData ? editData.customer : ''}
              name="customer"
              type="text"
              onChange={handleEditChange}
              style={{ width: '100%', marginBottom: '16px', marginTop: '8px' }}
            />
            <span>Description:</span>
            <Input
              value={editData ? editData.Description : ''}
              name="Description"
              type="text"
              onChange={handleEditChange}
              style={{ width: '100%', marginBottom: '16px', marginTop: '8px' }}
            />
            <span>Ringba Target Name:</span>
            <Input
              value={editData ? editData.Ringba_Target_Name : ''}
              name="Ringba_Target_Name"
              type="text"
              onChange={handleEditChange}
              style={{ width: '100%', marginBottom: '16px', marginTop: '8px' }}
            />
            <Button
              type="primary"
              onClick={handleEditSubmit}
              style={styles.editButton}
            >
              Edit
            </Button>
          </form>

          <div onClick={() => handleCloseModal(setShowEditModal)} className="close-modal-icon">
            <Cancel />
          </div>
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

Targets.layout = (page) => <Layout title="Targets">{page}</Layout>
export default Targets
