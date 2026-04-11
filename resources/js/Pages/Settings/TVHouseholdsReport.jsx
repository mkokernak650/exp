import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Table, Tooltip, Button, Input } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import EditModalFooter from '@/Shared/EditModalFooter'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { countActiveFilters } from '@/Helpers/ActiveFilterCount'
import toast from 'react-hot-toast'
import { fields, filter, columns as defaultColumns } from './Helpers/TVHouseholdsReportProps'
import { filterData } from '../filterData'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const CustomerReport = () => {
  const { allTVHouseholds, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [importModal, setImportModal] = useState({ open: false })
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [orderByValue, setOrderByValue] = useState('tv_households@DESC')
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)

  const mapDataArr = (data) =>
    data.map((item, index) => ({
      edit: item.id,
      sl: index + 1,
      market: item.market,
      state: item.state,
      tv_households: item.tv_households,
      created_at: item.created_at,
      updated_at: item.updated_at,
      id: item.id,
      key: item.id,
    }))

  const optionKey = 'tv-household-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
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

  const [data, setData] = useState(mapDataArr(allTVHouseholds))

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
  const orderByOptions = [
    { label: 'TV Households (Ascending)', value: 'tv_households@ASC' },
    { label: 'TV Households (Descending)', value: 'tv_households@DESC' },
    { label: 'Created At (Ascending)', value: 'created_at@ASC' },
    { label: 'Created At (Descending)', value: 'created_at@DESC' },
  ]

  const deleteHandler = () => {
    axios
      .post(route('tv.households.delete'), { selectedRowIds: selectedRowKeys })
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

  const handleEdit = (itemId) => {
    const item = data.find((item) => item.id === itemId)
    if (item) {
      const editItem = { ...item, tv_households: item.tv_households?.toString().replace(/,/g, '') }
      setEditData(editItem)
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
      .post(route('tv.households.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) =>
            prev.map((item) => {
              if (item.id === editData.id) {
                return {
                  ...item,
                  market: editData.market,
                  state: editData.state,
                  tv_households: res.data.data.tv_households,
                  updated_at: new Date(),
                }
              }
              return item
            })
          )
          setEditData()
          handleCloseModal(setShowEditModal)
          toast.success(res.data.msg)
        } else {
          setEditData()
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
  const handleImportChange = (e) => {
    setSelectedFile(e.target.files[0])
  }
  const openImportModal = () => {
    setImportModal({ open: true })
  }
  const importHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('importfile', selectedFile)
    axios
      .post(route('tv.households.import'), formData)
      .then((res) => {
        setSelectedFile(null)
        setLoading(false)
        if (res.status === 200) {
          setImportModal({ open: false })
          toast.success('Imported Successfully')
        } else {
          toast.error('Import failed')
        }
      })
      .catch((err) => {})
  }
  const triggerExportLink = (link) => {
    return window.open(link)
  }
  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get('tv-households-export?filterValue=' + JSON.stringify(filterValue))
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          triggerExportLink(res.request.responseURL)
        } else {
          toast.error('Error while importing file')
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  const getSearchingData = async () => {
    setLoading(true)
    await axios
      .get(`/tv-households-report?orderBy=` + orderByValue + '&type=orderBy')
      .then((res) => {
        setData(mapDataArr(res.data))
        setLoading(false)
      })
  }

  useEffect(() => {
    getSearchingData()
  }, [orderByValue])
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
    if (!tablePanelRef.current || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => syncTablePanelHeight())
    resizeObserver.observe(tablePanelRef.current)
    window.addEventListener('resize', syncTablePanelHeight)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncTablePanelHeight)
    }
  }, [serachSidebar, data.length, loading])

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

  const filteredData = filterData(data, filterValue)

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

        if (col.key === 'created_at' || col.key === 'updated_at') {
          base.render = (value) => DateTimeFormat(value)
        }

        return base
      })
  )

  return (
    <>
      <Helmet title="TV Households Report" />
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
              <Button type="primary" className="capitalize text-sm" onClick={openImportModal}>
                Import
              </Button>
              <Tooltip
                title={
                  !activeFilterCount
                    ? 'Please select at least one filter condition before exporting'
                    : filteredData.length === 0
                      ? 'No records available to export'
                      : ''
                }
              >
                <Button
                  type="primary"
                  className="capitalize text-sm"
                  onClick={exportHandler}
                  disabled={!activeFilterCount || filteredData.length === 0}
                  loading={loading}
                >
                  Searched Export
                </Button>
              </Tooltip>
              <div className="top-left">
                <MultiSelect
                  options={orderByOptions}
                  onChange={(value) => setOrderByValue(value)}
                  placeholder="Order By"
                  className="w-[280px]"
                  defaultValue={orderByValue}
                  singleSelect
                />
              </div>
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
            <ReportTableDndShell dndContextProps={dndContextProps} sortableContextProps={sortableContextProps}>
            <Table
              columns={antdColumns}
              components={{ header: { cell: DraggableResizableHeader } }}
              dataSource={filteredData}
              rowKey="id"
              rowSelection={rowSelection}
              loading={loading}
              pagination={false}
              scroll={{ y: 'calc(100vh - 217px)' }}
              size="small"
            />
            </ReportTableDndShell>
          </div>
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit TV Households'}
        onClose={() => handleCloseModal(setShowEditModal)}
        footer={
          <EditModalFooter
            onCancel={() => handleCloseModal(setShowEditModal)}
            onSubmit={handleEditSubmit}
          />
        }
      >
        <div className="mt-4">
          <form>
            <div className="mb-4">
              <span>Market:</span>
              <Input
                value={editData ? editData.market : ''}
                name="market"
                onChange={handleEditChange}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <span>State:</span>
              <Input
                value={editData ? editData.state : ''}
                name="state"
                onChange={handleEditChange}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <span>TV Households:</span>
              <Input
                value={editData ? editData.tv_households : ''}
                name="tv_households"
                onChange={handleEditChange}
                className="w-full"
              />
            </div>
          </form>
        </div>
      </NormalModal>

      <NormalModal open={importModal.open} setOpen={setImportModal} width={'500px'} title={''}>
        <div>
          <input id="importfile" type="file" name="importfile" onChange={handleImportChange} />
          <Button type="primary" onClick={importHandler} disabled={!selectedFile} loading={loading}>
            Next
          </Button>
        </div>
      </NormalModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${selectedRowKeys.length > 1 ? 'Do you want to delete these records?' : 'Do you want to delete this record?'}`}
      />
    </>
  )
}

CustomerReport.layout = (page) => <Layout title="Customer Report">{page}</Layout>
export default CustomerReport
