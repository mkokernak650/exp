import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import { Table, Tooltip, Button, Input, Switch, Select, DatePicker } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import CheckOutsideClick from '@/Helpers/CheckOutsideClick'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import mergeColumns from '@/Helpers/MergeColumns'
import toast from 'react-hot-toast'
import { styles, fields, groups, filter, columns as defaultColumns } from './Helpers/BroadcastWeekReportProps'
import { Pagination } from 'react-laravel-paginex'
import FilterControl from 'react-filter-control'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'

const BroadcastWeekReport = () => {
  const { allBroadCastWeeks, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const showColumnRef = useRef()
  const [broadCastWeeks, setBroadCastWeeks] = useState(allBroadCastWeeks)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const optionKey = 'broadcast-week-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [columns, setColumns] = useState(
    mergeColumns(
      defaultColumns,
      columnsData.length ? JSON.parse(columnsData[0])?.[optionKey] : null
    )
  )

  const mapDataArr = (data) => {
    return data.map((item, index) => ({
      edit: item.id,
      sl: index + 1,
      broad_cast_week: item.broad_cast_week,
      start_date: item.start_date,
      end_date: item.end_date,
      days_count: item.days_count,
      status: [item.status, item.id],
      id: item.id,
      key: item.id,
    }))
  }

  const [data, setData] = useState(mapDataArr(allBroadCastWeeks.data))

  const handleStatus = (value, rowId) => {
    axios
      .post(route('broadcast.week.status.update'), { value: value, rowId: rowId })
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
      .post(route('broadcast.week.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) =>
            prev.map((item) => {
              if (item.id === editData.id) {
                return {
                  ...item,
                  broad_cast_week: editData.broad_cast_week,
                  start_date: editData.start_date,
                  end_date: editData.end_date,
                  days_count: res.data.days_count,
                }
              }
              return item
            })
          )
          setEditData(undefined)
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
        } else {
          setEditData(undefined)
          setShowEditModal({ open: false })
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
      .post(route('broadcast.week.delete'), { selectedRowIds: selectedRowKeys })
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
        'broadcast-week-report?page=' +
        pageData.page +
        '&itemPerPage=' +
        itemPerPage +
        '&filteredValue=' +
        JSON.stringify(filterValue)
      )
      .then((res) => {
        setData(mapDataArr(res.data.data))
        setBroadCastWeeks(res.data)
        setLoading(false)
      })
  }

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

  const itemPerPageHandleChange = (e) => {
    setItemPerPage(e.target.value)
  }

  useEffect(() => {
    getSearchingData(curerentPage)
  }, [itemPerPage, filterValue])

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
            <Eye />
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
      <Helmet title="Broadcast Week Report" />
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
          <Pagination changePage={getSearchingData} data={broadCastWeeks} />
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit BroadCast Week'}
      >
        <div className="edit-broadcast-week">
          <form>
            <span>BroadCast Week:</span>
            <Input
              value={editData ? editData.broad_cast_week : ''}
              name="broad_cast_week"
              type="text"
              onChange={handleEditChange}
              style={{ width: '100%', marginBottom: '16px', marginTop: '8px' }}
            />
            <span>Start Date:</span>
            <DatePicker
              value={editData?.start_date ? dayjs(editData.start_date) : null}
              onChange={(date, dateString) => handleEditChange({ target: { name: 'start_date', value: dateString } })}
              style={{ width: '100%', marginBottom: '16px', marginTop: '8px' }}
            />
            <span>End Date:</span>
            <DatePicker
              value={editData?.end_date ? dayjs(editData.end_date) : null}
              onChange={(date, dateString) => handleEditChange({ target: { name: 'end_date', value: dateString } })}
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
        title={`${selectedRowKeys.length > 1
          ? 'Do you want to delete these records?'
          : 'Do you want to delete this record?'
          }`}
      ></ConfirmModal>
    </>
  )
}

BroadcastWeekReport.layout = (page) => <Layout title="BroadcastWeekReport">{page}</Layout>
export default BroadcastWeekReport
