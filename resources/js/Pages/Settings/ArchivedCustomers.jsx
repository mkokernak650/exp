
import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Table, Button, Input } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import NormalModal from '@/Shared/NormalModal'
import ConfirmModal from '@/Shared/ConfirmModal'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { countActiveFilters } from '@/Helpers/ActiveFilterCount'
import toast from 'react-hot-toast'
import { fields, filter, columns as defaultColumns } from './Helpers/ArchivedCustomersProps'
import TextInput from '../../Components/Global/TextInput'

const ArchivedCustomers = () => {
  const { allCustomers, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showActiveModal, setShowActiveModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)
  const [errors, setErrors] = useState({})

  const dataArray = allCustomers.map((item, index) => ({
    edit: item.id, sl: index + 1, customer: item.customer_name, email: item.email, telephone: item.telephone, address: item.address, contact_name: item.contact_name, contact_telephone: item.contact_telephone, id: item.id, key: item.id,
  }))

  const optionKey = 'customer-archived'
  const [columnDetails, setColumnDetails] = useState(columnsData.length ? JSON.parse(columnsData[0]) : {})
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
  const handleFilter = () => { setSearchSidebar((prevState) => !prevState); setShowColumns(false) }
  const handleColumns = () => { setShowColumns(true) }

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

  const handleActive = () => {
    axios.post(route('active.customer'), { selectedRowIds: selectedRowKeys }).then((res) => {
      if (res.data.status_code === 200) {
        toast.success(res.data.msg)
        setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
        setTableToolbar(false)
        setSelectedRowKeys([])
        setShowActiveModal({ open: false })
      } else {
        toast.error(res.data.msg)
        setSelectedRowKeys([])
        setShowActiveModal({ open: false })
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
        setErrors({})
        toast.error(res.data.msg)
      }
    }).catch((err) => { setErrors(err.response.data.errors) })
  }

  const handleCloseModal = (setOpenModal) => { setOpenModal({ open: false }); setTableToolbar(false); setSelectedRowKeys([]) }
  const handleOpenModal = (setOpenModal) => { setOpenModal({ open: true }) }

  useEffect(() => {
    const checkIfClickedOutside = (e) => { if (showColumns && showColumnRef.current && !showColumnRef.current.contains(e.target)) { setShowColumns(false) } }
    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => { document.removeEventListener('mousedown', checkIfClickedOutside) }
  }, [showColumns])

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
  }, [serachSidebar, data.length])

  const TableToolbar = () => {
    const toolbarIconStyle = { color: '#031b4e', fontSize: 20 }

    return (
      <div className="table-toolbar">
        <Button type="text" icon={<EditOutlined style={toolbarIconStyle} />} onClick={handleToolbarEdit} />
        <Button type="primary" className="w-[130px] capitalize text-sm" onClick={() => handleOpenModal(setShowActiveModal)}>Active</Button>
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

  const antdColumns = withResizableColumns(columns
    .filter((c) => c.visible !== false && c.key !== 'selection-cell' && c.key !== 'edit')
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
    }))

  return (
    <>
      <Helmet title="Archived Customers" />
      <div className="selection-demo">
        {tableToolbar ? (<TableToolbar />) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}><Eye /></div>
              <button
                type="button"
                className={`filter-trigger ${activeFilterCount ? 'active' : ''}`}
                onClick={handleFilter}
                aria-label="Open filters"
              >
                <Filter />
                {activeFilterCount ? <span className="filter-count">{activeFilterCount}</span> : ''}
              </button>
            </div>
            {showColumns ? (<div className="column-settings" ref={showColumnRef}><ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} /></div>) : ''}
          </div>
        )}
        <div className={`report-content-layout ${serachSidebar ? 'with-filter' : ''}`}>
          <div
            className={`search-sidebar report-filter-sidebar ${serachSidebar ? 'filter-open' : 'filter-closed'}`}
            style={tablePanelHeight ? { height: `${tablePanelHeight}px`, maxHeight: `${tablePanelHeight}px` } : undefined}
          >
            <div className="top-element"><CustomFilter fields={fields} filterValue={filterValue} setFilterValue={changeFilter} /></div>
          </div>
          <div className="report-table-panel" ref={tablePanelRef}>
            <Table
              columns={antdColumns}
              components={{ header: { cell: ResizableTitle } }}
              dataSource={data}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 50, 100], showSizeChanger: true }}
              scroll={{ y: 'calc(100vh - 217px)' }}
              size="small"
            />
          </div>
        </div>
      </div>

      <NormalModal open={showEditModal.open} setOpen={setShowEditModal} width={'600px'} title={'Edit Customer'}>
        <div className="edit_target">
          <form>
            <div className="mb-4"><label>Customer Name</label><Input value={editData ? editData.customer : ''} name="customer" onChange={handleEditChange} className="w-full" required />{errors?.customer && <div className="text-red-500 text-xs">{errors?.customer?.[0]}</div>}</div>
            <div className="mb-4"><label>Email</label><Input value={editData ? editData.email : ''} name="email" type="email" onChange={handleEditChange} className="w-full" /></div>
            <div className="mb-4"><label>Telephone</label><Input value={editData ? editData.telephone : ''} name="telephone" onChange={handleEditChange} className="w-full" /></div>
            <div className="mb-4"><label>Address</label><Input value={editData ? editData.address : ''} name="address" onChange={handleEditChange} className="w-full" /></div>
            <TextInput label="Contact Name" name="contact_name" handleChange={handleEditChange} value={editData ? editData.contact_name : ''} />
            <TextInput label="Contact Telephone" name="contact_telephone" handleChange={handleEditChange} value={editData ? editData.contact_telephone : ''} />
            <Button type="primary" onClick={handleEditSubmit} className="mt-[15px]">Edit</Button>
          </form>
        </div>
      </NormalModal>

      <ConfirmModal open={showActiveModal.open} setOpen={setShowActiveModal} btnAction={handleActive} closeAction={() => handleCloseModal(setShowActiveModal)} width={'450px'} title={`${selectedRowKeys.length > 1 ? 'Do you want to active these customers?' : 'Do you want to active this customer?'}`} />
    </>
  )
}

ArchivedCustomers.layout = (page) => <Layout title="Archived Customers">{page}</Layout>
export default ArchivedCustomers
