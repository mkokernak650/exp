import Layout from '../Layout/Layout'
import { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import { Tooltip, Button, Table, Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import ColumnSettings from '@/Components/ColumnSettings'
import CustomFilter from '@/Components/CustomFilter'
import { defaultFilter } from '@/Helpers/Filter'
import { SearchedFields } from '@/Helpers/SearchedFields'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import toast from 'react-hot-toast'
import addTableDetails from '@/Helpers/AddTableDetails'
import { Pagination } from 'react-laravel-paginex'
import { columns as defaultColumns, buttonStyle } from './Helpers/ArchivedCallLogReportsProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const ArchivedCallLogReports = () => {
  const { archivedCallLogs, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [inboundIds, setInbounIds] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [showCallLogModal, setShowCallLogModal] = useState({
    open: false,
  })
  const showColumnRef = useRef()
  const [orderByValue, setOrderByValue] = useState('')

  const [filterValue, setFilterValue] = useState(
    defaultFilter('and', 'SN', 'isNotEmpty', 'string', 0, '')
  )
  const [archivedData, setArchivedDataData] = useState(archivedCallLogs)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setcurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState({
    archive: false,
    delete: false,
  })

  const mapDataArr = (data) => {
    return data.map((item, index) => {
      return {
        sl: index + 1,
        SN: item.SN,
        Campaign: item.Campaign,
        Call_Date: item.Call_Date,
        Call_Date_Time: item.Call_Date_Time,
        Conn_Duration: item.Conn_Duration,
        Call_Length_In_Seconds: item.call_Length_In_Seconds,
        Customer: item.Customer,
        Target: item.Target,
        Target_Number: item.Target_Number,
        Target_Description: item.Target_Description,
        Affiliate: item.Affiliate,
        Market: item.Market,
        Revenue: item.Revenue,
        Payout: item.payoutAmount,
        Total_Cost: item.Total_Cost,
        Profit: item.Profit,
        Inbound_Id: item.Inbound_Id,
        Inbound: item.Inbound,
        Time: item.Call_Date_Time,
        Dialed: item.Dialed,
        Type: item.Type,
        City: item.City,
        State: item.State,
        Zipcode: item.Zipcode,
        id: item.id,
        key: item.id,
      }
    })
  }

  const dataArray = mapDataArr(archivedCallLogs.data)

  const optionKey = 'archived-call-logs'
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

  const antdColumns = columns
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

      return base
    })

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
    setIsLoading({ ...isLoading, delete: true })
    axios
      .post('archive-delete', { selectedRowIds: selectedRowKeys })
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
          toast.error(res.data.msg)
          setInbounIds([])
          setSelectedRowKeys([])
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, delete: false })
        setInbounIds([])
        setSelectedRowKeys([])
        setShowDeleteModal({ open: false })
      })
  }

  const handleMoveCallLog = (inboundIds) => {
    setIsLoading({ ...isLoading, archive: true })
    axios
      .post(route('archived.to.call.log'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setIsLoading({ ...isLoading, archive: false })
          toast.success(res.data.msg)
          setData((prev) => prev.filter((item) => !inboundIds.includes(item.Inbound_Id)))
          setTableToolbar(false)
          setInbounIds([])
          setSelectedRowKeys([])
          getSearchingData(currentPage)
          setInbounIds([])
          setShowCallLogModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, archive: false })
          toast.error(res.data.msg)
          setTableToolbar(false)
          setInbounIds([])
          setSelectedRowKeys([])
          setInbounIds([])
          setShowCallLogModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, archive: false })
        setTableToolbar(false)
        setInbounIds([])
        setSelectedRowKeys([])
        setInbounIds([])
        setShowCallLogModal({ open: false })
      })
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowKeys([])
  }

  const getSearchingData = async (pageData) => {
    setcurrentPage(pageData)
    setLoading(true)
    await axios
      .get(
        'archived-call-log-report?page=' +
        pageData.page +
        '&itemPerPage=' +
        itemPerPage +
        '&filteredValue=' +
        JSON.stringify(filterValue) + '&orderBy=' + orderByValue
      )
      .then((res) => {
        setData(mapDataArr(res.data.data))
        setArchivedDataData(res.data)
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

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button type="text" icon={<DeleteOutlined style={{ color: '#031b4e' }} />} onClick={() => handleOpenModal(setShowDeleteModal)} />
        </Tooltip>

        <Button
          type="primary"
          style={buttonStyle}
          onClick={() => handleOpenModal(setShowCallLogModal)}
        >
          Move Call Log
        </Button>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="Archived CallLogs Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className='top-left'>
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
              <div>
                <MultiSelect
                  options={[{ label: 'Created At (Ascending)', value: 'ASC' }, { label: 'Created At (Descending)', value: 'DESC' }]}
                  onChange={(value) => setOrderByValue(value)}
                  placeholder="Order By"
                  singleSelect
                />
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
                    mainData={data}
                    fields={fields}
                    filterValue={filterValue}
                    setFilterValue={setFilterValue}
                    currentPage={currentPage}
                    getSearchingData={getSearchingData}
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
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content', y: 'calc(100vh - 217px)' }}
          size="small"
        />
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
          <Pagination changePage={getSearchingData} data={archivedData} />
        </div>
      </div>
      <ConfirmModal
        open={showCallLogModal.open}
        setOpen={setShowCallLogModal}
        btnAction={() => handleMoveCallLog(inboundIds)}
        closeAction={() => handleCloseModal(setShowCallLogModal)}
        width={'450px'}
        title={`${inboundIds.length > 1
          ? 'Do you want to move these records to Call Log?'
          : 'Do you want to move this record to Call Log?'
          }`}
        loading={isLoading.archive}
      ></ConfirmModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${inboundIds.length > 1
          ? 'Do you want to delete these records?'
          : 'Do you want to delete this record?'
          }`}
        loading={isLoading.delete}
      ></ConfirmModal>
    </>
  )
}

ArchivedCallLogReports.layout = (page) => <Layout title="Archived Call Log Reports">{page}</Layout>
export default ArchivedCallLogReports
