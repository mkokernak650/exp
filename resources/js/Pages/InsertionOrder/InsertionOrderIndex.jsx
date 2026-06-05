import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Eye from '@/Components/Icons/Eye.jsx'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { reportTableSorterProps } from '@/Helpers/reportTableSort'
import { styles, columns as defaultColumns } from './Helpers/InsertionOrderIndexProps'
import { Button, Tooltip, Table, Select, Pagination } from 'antd'
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
  const [totalRecords, setTotalRecords] = useState(insertionOrders.total ?? 0)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [tableToolbar, setTableToolbar] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [filterByStatus, setFilterByStatus] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const baseUrl = window.location.origin

  const mapDataArr = (data) => {
    return data.data.map((item) => {
      const attached = item?.attached_affiliates || []
      const attachedNames = attached
        .map((a) => a.affiliate_name + (a.market ? ` (${a.market})` : ''))
        .join(', ')
      const single = item?.affiliate?.affiliate_name
      return {
        id: item.id,
        customer: item?.customer?.customer_name,
        affiliate: single,
        attached_affiliates: attachedNames || single || '',
        attached_affiliates_count: attached.length || (single ? 1 : 0),
        status: item.status,
        io_link: item.io_link,
        formatted_created_at: item.formatted_created_at,
        resend_io_doc: item.status + ',' + item.io_no,
        cancel_io: item.status + ',' + item.io_no,
        key: item.id,
      }
    })
  }

  const dataArray = mapDataArr(insertionOrders)

  const [data, setData] = useState(dataArray)

  const status = ['pending', 'accepted', 'declined']

  const statusOptions = status.map((item) => ({
    label: item,
    value: item,
  }))

  const optionKey = 'insertion-order-index'
  const savedTableDetails =
    columnsData.length > 0 ? JSON.parse(columnsData[0]) : null
  const [columnDetails, setColumnDetails] = useState(savedTableDetails || {})
  const [columns, setColumns] = useState(
    savedTableDetails?.[optionKey] || defaultColumns
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
        'insertion-order?page=' +
          page +
          '&itemPerPage=' +
          itemPerPage +
          '&filterByStatus=' +
          filterByStatus +
          '&sortField=' +
          sortField +
          '&sortOrder=' +
          sortOrder
      )
      .then((res) => {
        setData(mapDataArr(res.data))
        setTotalRecords(res.data.total)
        setTableLoading(false)
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
  }

  useEffect(() => {
    getSearchingData(1)
  }, [itemPerPage, filterByStatus, sortField, sortOrder])

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
        const insertionOrderNumericKeys = new Set(['id', 'status'])
        const { sorter, sortOrder: colSortOrder } = reportTableSorterProps(col, {
          sortField,
          sortOrder,
          hasSorter,
          numericSortColumnKeys: insertionOrderNumericKeys,
        })
        const base = {
          key: col.key,
          dataIndex: col.key,
          title: col.title || '',
          width: col.style?.width || col.width,
          sorter,
          sortOrder: colSortOrder,
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
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} onReorderColumns={handleReorderColumns} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        <ReportTableDndShell dndContextProps={dndContextProps} sortableContextProps={sortableContextProps}>
        <Table
          columns={antdColumns}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection}
          loading={tableLoading}
          pagination={false}
          onChange={handleTableChange}
          components={{
            header: {
              cell: DraggableResizableHeader,
            },
          }}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
          locale={{ emptyText: 'No Data Found' }}
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
