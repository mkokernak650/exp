import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Eye from '@/Components/Icons/Eye.jsx'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { Pagination } from 'react-laravel-paginex'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { styles, columns as defaultColumns } from './Helpers/InsertionOrderIndexProps'
import { Button, Tooltip, Table, Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import IOPublicLink from '../../Components/IOComponents/IOPublicLink'
import ConfirmModal from '@/Shared/ConfirmModal'
import toast from 'react-hot-toast'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import ResendIODoc from '../../Components/IOComponents/ResendIODoc'
import CancelIO from '../../Components/IOComponents/CancelIO'

const InsertionOrderIndex = () => {
  const { insertionOrders, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const showColumnRef = useRef()
  const [insertionOrderList, setInsertionOrderList] = useState(insertionOrders)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [tableToolbar, setTableToolbar] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [filterByStatus, setFilterByStatus] = useState('')
  const baseUrl = window.location.origin

  const mapDataArr = (data) => {
    return data.data.map((item) => ({
      id: item.id,
      customer: item?.customer?.customer_name,
      affiliate: item?.affiliate?.affiliate_name,
      status: item.status,
      io_link: item.io_link,
      formatted_created_at: item.formatted_created_at,
      resend_io_doc: item.status + ',' + item.io_no,
      cancel_io: item.status + ',' + item.io_no,
      key: item.id,
    }))
  }

  const dataArray = mapDataArr(insertionOrders)

  const [data, setData] = useState(dataArray)

  const status = ['pending', 'accepted', 'declined']

  const statusOptions = status.map((item) => ({
    label: item,
    value: item,
  }))

  const optionKey = 'insertion-order-index'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const [columns, setColumns] = useState(defaultColumns)
  const { ResizableTitle, withResizableColumns } = useResizableTableColumns({
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

  const handleColumns = () => {
    setShowColumns(true)
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

  const getSearchingData = async (data) => {
    setCurerentPage(data)
    setTableLoading(true)
    await axios
      .get(
        'insertion-order?page=' +
          data.page +
          '&itemPerPage=' +
          itemPerPage +
          '&filterByStatus=' +
          filterByStatus
      )
      .then((res) => {
        setData(mapDataArr(res.data))
        setInsertionOrderList(res.data)
        setTableLoading(false)
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
  }

  useEffect(() => {
    getSearchingData(curerentPage)
  }, [itemPerPage, filterByStatus])

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get(`insertion-order/export`)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          triggerExportLink(res.request.responseURL)
        } else {
          toast.error('Error while exporting file')
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button
            type="text"
            onClick={() => setShowDeleteModal({ open: true })}
            icon={<DeleteOutlined style={{ color: '#031b4e' }} />}
          />
        </Tooltip>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  const deleteHandler = () => {
    axios
      .post(route('insertion.order.delete'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.success === true) {
          setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
          setSelectedRowKeys([])
          getSearchingData(curerentPage)
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
              : col.dataType === 'string'
                ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
                : undefined,
        }
        if (col.key === 'id') {
          base.render = (value) => 'IO-' + String(value).padStart(3, '0')
        }
        if (col.key === 'io_link') {
          base.render = (value) => (
            <IOPublicLink link={`${baseUrl}/insertion-order/public${value}`} />
          )
        }
        if (col.key === 'resend_io_doc') {
          base.render = (value) => (
            <ResendIODoc data={value} routeName="insertion.order.resend.io.document" />
          )
        }
        if (col.key === 'cancel_io') {
          base.render = (value) => (
            <CancelIO data={value} routeName="insertion.order.resend.io.document" />
          )
        }
        return base
      })
  )

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys)
      setTableToolbar(newSelectedRowKeys.length > 0)
    },
  }

  return (
    <>
      <Helmet title="Insertion Order - Index" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top-flex-start">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
            </div>
            <div className="top-left">
              <MultiSelect
                placeholder="Status"
                options={statusOptions}
                onChange={(value) => setFilterByStatus(value)}
                defaultValue={filterByStatus}
              />
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
        <Table
          columns={antdColumns}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection}
          loading={tableLoading}
          pagination={false}
          components={{
            header: {
              cell: ResizableTitle,
            },
          }}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
          locale={{ emptyText: 'No Data Found' }}
        />
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
          <Pagination changePage={getSearchingData} data={insertionOrderList} />
        </div>
      </div>
      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => setShowDeleteModal({ open: false })}
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

InsertionOrderIndex.layout = (page) => <Layout title="Insertion Order - Index">{page}</Layout>
export default InsertionOrderIndex
