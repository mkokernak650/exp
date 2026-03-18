import Layout from '../../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import { Table, Tooltip, Button, Input, DatePicker } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'

export const fields = [
  {
    caption: 'annotation',
    name: 'annotation',
    operators: [
      { caption: 'Contains', name: 'contains' },
      { caption: 'Not Contains', name: 'doesNotContain' },
      { caption: 'Is Empty', name: 'isEmpty' },
      { caption: 'Is Not Empty', name: 'isNotEmpty' },
      { caption: 'Starts With', name: 'startswith' },
      { caption: 'Ends With', name: 'endsWith' },
      { caption: 'Is', name: 'is' },
      { caption: 'Is Not', name: 'isnot' },
    ],
  },
  {
    caption: 'status',
    name: 'status',
    operators: [
      { caption: 'Contains', name: 'contains' },
      { caption: 'Not Contains', name: 'doesNotContain' },
      { caption: 'Is Empty', name: 'isEmpty' },
      { caption: 'Is Not Empty', name: 'isNotEmpty' },
      { caption: 'Starts With', name: 'startswith' },
      { caption: 'Ends With', name: 'endsWith' },
      { caption: 'Is', name: 'is' },
      { caption: 'Is Not', name: 'isnot' },
    ],
  },
]

export const filter = {
  groupName: 'and',
  items: [
    {
      field: 'annotation',
      operator: 'isNotEmpty',
    },
  ],
}

const CampaignAnnotations = () => {
  const { annotation, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }
  const handleEditSubmit = () => {
    axios
      .post(route('market.exception.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          setEditData()
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
        } else {
          setEditData()
          setShowEditModal({ open: false })
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const dataArray = annotation.map((item, index) => ({
    edit: item.id,
    order: item.order,
    annotation: item.annotation_name,
    status: item.status,
    id: item.id,
    key: item.id,
  }))

  const defaultColumns = [
    {
      key: 'annotation',
      title: 'Annotation',
      dataType: 'string',
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'status',
      title: 'Status',
      dataType: 'string',
      style: { width: 100 },
      visible: true,
    },
  ]

  const optionKey = 'campaign-annotation-report'
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

  const deleteHandler = () => {
    axios
      .post(route('annotation.delete'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
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
      })
      .catch((err) => {
        setShowDeleteModal({ open: false })
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
          <Button type="text" icon={<DeleteOutlined className="text-[#031b4e]" />} onClick={() => handleOpenModal(setShowDeleteModal)} />
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

      if (col.key === 'edit') {
        base.render = (value) => (
          <div className="edit-icon" onClick={() => handleEdit(value)}>
            <Edit />
          </div>
        )
      }
      if (col.key === 'status') {
        base.render = (value) => value == 1 ? 'Active' : 'Pushed'
      }

      return base
    })
  )

  return (
    <>
      <Helmet title="Campaign Annotations" />

      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
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
                  <CustomFilter
                    fields={fields}
                    filterValue={filterValue}
                    setFilterValue={changeFilter}
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
          components={{ header: { cell: ResizableTitle } }}
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
        title={'Edit Campaign Annotations'}
      >
        <div className="edit_target">
          <form>
            <span>Customer:</span>
            <Input
              value={editData ? editData.customer_id : ''}
              name="customer_id"
              type="text"
              onChange={handleEditChange}
              className="w-full mb-4 mt-2"
            />
            <span>Market:</span>
            <Input
              value={editData ? editData.market_id : ''}
              name="market_id"
              type="text"
              onChange={handleEditChange}
              className="w-full mb-4 mt-2"
            />
            <span>Start Date:</span>
            <DatePicker
              value={editData?.start_date ? dayjs(editData.start_date) : null}
              onChange={(date, dateString) => handleEditChange({ target: { name: 'start_date', value: dateString } })}
              className="w-full mb-4 mt-2"
            />
            <Button
              type="primary"
              onClick={handleEditSubmit}
              className="mt-[15px]"
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

CampaignAnnotations.layout = (page) => <Layout title="CampaignAnnotationReport">{page}</Layout>
export default CampaignAnnotations
