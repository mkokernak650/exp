import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import { Table, Tooltip, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import toast from 'react-hot-toast'
import { fields, groups, filter, columns as defaultColumns } from './Helpers/CustomerReportProps'
import TextInput from '../../Components/Global/TextInput'

const CustomerReport = () => {
  const { allCustomers, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [showArchivedModal, setShowArchivedModal] = useState({ open: false })
  const showColumnRef = useRef()
  const [errors, setErrors] = useState({})

  const dataArray = allCustomers.map((item, index) => ({ edit: item.id, customer: item.customer_name, email: item.email, telephone: item.telephone, address: item.address, contact_name: item.contact_name, contact_telephone: item.contact_telephone, id: item.id, key: item.id }))
  const optionKey = 'customer-report'
  const [columnDetails, setColumnDetails] = useState(columnsData.length ? JSON.parse(columnsData[0]) : {})
  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
  )

  const [data, setData] = useState(dataArray)

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
  const onFilterChanged = (newFilterValue) => { changeFilter(newFilterValue) }
  const [serachSidebar, setSearchSidebar] = useState(false)
  const handleSearch = () => { setSearchSidebar((prevState) => !prevState) }
  const handleColumns = () => { setShowColumns(true) }
  const closeSidebar = () => { setSearchSidebar(false) }

  const deleteHandler = () => {
    axios.post(route('customer.delete'), { selectedRowIds: selectedRowKeys }).then((res) => {
      if (res.data.status_code === 200) {
        setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
        setSelectedRowKeys([])
        setTableToolbar(false)
        toast.success(res.data.msg)
        setShowDeleteModal({ open: false })
      } else {
        toast.error(res.data.msg)
        setShowDeleteModal({ open: false })
      }
    }).catch((err) => { setShowDeleteModal({ open: false }) })
  }

  const handleEdit = (itemId) => {
    const item = data.find((item) => item.id === itemId)
    if (item) {
      setEditData(item)
      setShowEditModal({ open: true })
    }
  }

  const handleArchived = () => {
    axios.post(route('move.customer.archive'), { selectedRowIds: selectedRowKeys }).then((res) => {
      if (res.data.status_code === 200) {
        toast.success(res.data.msg)
        setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
        setTableToolbar(false)
        setSelectedRowKeys([])
        setShowArchivedModal({ open: false })
      } else {
        toast.error(res.data.msg)
        setSelectedRowKeys([])
        setShowArchivedModal({ open: false })
      }
    }).catch((err) => { })
  }

  const handleEditChange = (e) => { setEditData({ ...editData, [e.target.name]: e.target.value }) }

  const handleEditSubmit = () => {
    axios.post(route('customer.edit'), editData).then((res) => {
      if (res.data.status_code === 200) {
        setData((prev) =>
          prev.map((item) => {
            if (item.id === editData.id) {
              return {
                ...item,
                customer: editData.customer,
                email: editData.email,
                telephone: editData.telephone,
                address: editData.address,
                contact_name: editData.contact_name,
                contact_telephone: editData.contact_telephone,
              }
            }
            return item
          })
        )
        setEditData()
        setErrors({})
        setShowEditModal({ open: false })
        toast.success(res.data.msg)
      } else {
        setEditData()
        setErrors({})
        setShowEditModal({ open: false })
        toast.error(res.data.msg)
      }
    }).catch((err) => { setErrors(err.response.data.errors) })
  }

  const handleCloseModal = (setOpenModal) => { setOpenModal({ open: false }); setTableToolbar(false); setSelectedRowKeys([]) }
  const handleOpenModal = (setOpenModal) => { setOpenModal({ open: true }) }

  useEffect(() => { const checkIfClickedOutside = (e) => { if (showColumns && showColumnRef.current && !showColumnRef.current.contains(e.target)) { setShowColumns(false) } }; document.addEventListener('mousedown', checkIfClickedOutside); return () => { document.removeEventListener('mousedown', checkIfClickedOutside) } }, [showColumns])

  const TableToolbar = () => (
    <div className="table-toolbar">
      <Tooltip title="Delete"><Button type="text" icon={<DeleteOutlined style={{ color: '#031b4e' }} />} onClick={() => handleOpenModal(setShowDeleteModal)} /></Tooltip>
      <Button type="primary" className="w-[130px] capitalize text-sm" onClick={() => handleOpenModal(setShowArchivedModal)}>Archived</Button>
      <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
    </div>
  )

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

      return base
    })

  return (
    <>
      <Helmet title="Customer Report" />
      <div className="selection-demo">
        {tableToolbar ? (<TableToolbar />) : (<div className="table-top"><div className="columns-show-hide" onClick={handleColumns}><Eye /></div><div className="search-icon" onClick={handleSearch}><span>Search Here</span><Search /></div>{serachSidebar ? (<div className="search-sidebar"><div className="search-top"><div className="title"><span>Search</span></div><a className="close-nav" onClick={closeSidebar}><Cancel /></a></div><div className="top-element"><FilterControl {...{ fields, groups, filterValue, onFilterValueChanged: onFilterChanged }} /></div></div>) : ''}{showColumns ? (<div className="column-settings" ref={showColumnRef}><ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} /></div>) : ''}</div>)}
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
      <NormalModal open={showEditModal.open} setOpen={setShowEditModal} width={'600px'} title={'Edit Customer'}>
        <div className="edit_target">
          <form>
            <TextInput label="Customer Name" name="customer" handleChange={handleEditChange} value={editData ? editData.customer : ''} required error={errors?.customer} helperText={errors?.customer?.[0]} />
            <TextInput label="Email" name="email" type="email" handleChange={handleEditChange} value={editData ? editData.email : ''} />
            <TextInput label="Telephone" name="telephone" handleChange={handleEditChange} value={editData ? editData.telephone : ''} />
            <TextInput label="Address" name="address" handleChange={handleEditChange} value={editData ? editData.address : ''} />
            <TextInput label="Contact Name" name="contact_name" handleChange={handleEditChange} value={editData ? editData.contact_name : ''} />
            <TextInput label="Contact Telephone" name="contact_telephone" handleChange={handleEditChange} value={editData ? editData.contact_telephone : ''} />
            <Button type="primary" onClick={handleEditSubmit} className="mt-[15px]">Edit</Button>
          </form>
          <div onClick={() => handleCloseModal(setShowEditModal)} className="close-modal-icon"><Cancel /></div>
        </div>
      </NormalModal>
      <ConfirmModal open={showDeleteModal.open} setOpen={setShowDeleteModal} btnAction={deleteHandler} closeAction={() => handleCloseModal(setShowDeleteModal)} width={'400px'} title={`${selectedRowKeys.length > 1 ? 'Do you want to delete these records?' : 'Do you want to delete this record?'}`} />
      <ConfirmModal open={showArchivedModal.open} setOpen={setShowArchivedModal} btnAction={handleArchived} closeAction={() => handleCloseModal(setShowArchivedModal)} width={'450px'} title={`${selectedRowKeys.length > 1 ? 'Do you want to move these records to archive?' : 'Do you want to move this record to archive?'}`} />
    </>
  )
}

CustomerReport.layout = (page) => <Layout title="Customer Report">{page}</Layout>
export default CustomerReport
