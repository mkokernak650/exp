import Layout from '../../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { InertiaLink, usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import { Table, Tooltip, Button, Input, Switch, DatePicker } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import { columns as defaultColumns, styles, fields, groups, filter } from './Helpers/CampaignSettingReportProps'

const CampaignSettingReport = () => {
  const { allCampaigns, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [showDescriptionModal, setShowDescriptionModal] = useState({ open: false })
  const [loading, setLoading] = useState({ description: false })
  const [descriptionModalData, setDescriptionModalData] = useState({})
  const showColumnRef = useRef()

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }
  const handleEditSubmit = () => {
    axios
      .post(route('campaign.edit'), editData)
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

  const dataArray = allCampaigns.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    campaign: item.campaign_name,
    duration: item.connection_duration,
    status: [item.status, item.id, index],
    actions: item.id,
    id: item.id,
    key: item.id,
  }))

  const optionKey = 'campaign-setting-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
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

  const headers = {
    headers: { Accept: 'application/json' },
  }

  const handleStatus = (value, rowId, index) => {
    let status = parseInt(value) === 1 ? 0 : 1
    axios
      .post(route('campaigns.status.update', rowId), { status }, headers)
      .then((res) => {
        setData((prev) =>
          prev.map((item) => {
            if (item.id === rowId) {
              return { ...item, status: [status, rowId, index] }
            }
            return item
          })
        )
        toast.success(res.data.msg)
      })
      .catch((err) => {
        Object.values(err.response.data?.errors).map((error) => {
          toast.error(error[0])
        })
      })
  }

  const deleteHandler = () => {
    axios
      .post(route('campaign.delete'), { selectedRowIds: selectedRowKeys })
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
          <Button type="text" icon={<DeleteOutlined style={{ color: '#031b4e' }} />} onClick={() => handleOpenModal(setShowDeleteModal)} />
        </Tooltip>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  const handleDescriptionModal = (id) => {
    setDescriptionModalData({})
    axios.get(route('campaign.get.description', id))
      .then(response => {
        if (response.data.success) {
          setDescriptionModalData(response.data.data)
          setShowDescriptionModal({ open: true })
        } else if (!response.data.success) {
          toast.error('Something went wrong!')
        }
      })
      .catch(err => {
        console.log(err)
        toast.error('Something went wrong!')
      })
  }

  const handleDescriptionChange = (e) => {
    setDescriptionModalData((values) => ({ ...values, description: e.target.value }))
  }

  const handleLengthUrlChange = (e) => {
    setDescriptionModalData((values) => ({ ...values, length_url: e.target.value }))
  }

  const updateDescription = () => {
    setLoading((oldValues) => ({ ...oldValues, description: true }))

    axios.post(route('campaign.update.description'), { data: descriptionModalData })
      .then(response => {
        if (response.data.success) {
          setShowDescriptionModal({ open: false })
          setDescriptionModalData({})
          toast.success(response.data.msg)
        } else {
          toast.error(response.data.msg)
        }
        setLoading((oldValues) => ({ ...oldValues, description: false }))
      })
      .catch(err => {
        console.log(err)
        toast.error('Something went wrong!')
        setLoading((oldValues) => ({ ...oldValues, description: false }))
      })
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

      if (col.key === 'status') {
        base.render = (value) => {
          if (typeof value === 'string') {
            value = value.split(',')
          }
          return (
            <Switch
              checked={parseInt(value[0]) === 1}
              onChange={() => handleStatus(value[0], value[1], value[2])}
            />
          )
        }
      }
      if (col.key === 'actions') {
        base.render = (value) => (
          <div style={{ display: 'flex' }}>
            <InertiaLink href={route('campaign.annotations', value)}>
              <Button type="primary">
                Annotations
              </Button>
            </InertiaLink>
            <InertiaLink href={route('campaign.exceptions', value)} style={{ paddingLeft: '4px' }}>
              <Button type="primary">
                Exceptions
              </Button>
            </InertiaLink>
            <div style={{ paddingLeft: '4px' }}>
              <Button type="primary" onClick={() => handleDescriptionModal(value)}>
                Description and URLs
              </Button>
            </div>
          </div>
        )
      }

      return base
    })

  return (
    <>
      <Helmet title="Campaign Setting Report" />

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
        title={'Edit Campaign Setting'}
      >
        <div className="edit_target">
          <form>
            <span>Customer:</span>
            <Input
              value={editData ? editData.customer_id : ''}
              name="customer_id"
              type="text"
              onChange={handleEditChange}
              style={{ width: '100%', marginBottom: '16px', marginTop: '8px' }}
            />
            <span>Market:</span>
            <Input
              value={editData ? editData.market_id : ''}
              name="market_id"
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

      <NormalModal
        open={showDescriptionModal.open}
        setOpen={setShowDescriptionModal}
        width={'650px'}
        title={'Campaign Description'}
      >
        <div>
          <div>
            <p style={{ textAlign: "center", marginBottom: "20px", marginTop: "-5px" }}>
              Description, Length & URLs for <strong>{descriptionModalData?.campaign_name}</strong>
            </p>
            <div style={{ marginBottom: '4px' }}><label>Description</label></div>
            <Input.TextArea
              name="description"
              onChange={handleDescriptionChange}
              value={descriptionModalData.description === null ? '' : descriptionModalData?.description}
              spellCheck
              rows={4}
              style={{ width: '100%' }}
            />
            <div style={{ marginBottom: '4px', marginTop: '30px' }}><label>Length and URL</label></div>
            <Input.TextArea
              name="length_url"
              onChange={handleLengthUrlChange}
              value={descriptionModalData.length_url === null ? '' : descriptionModalData?.length_url}
              spellCheck
              rows={3}
              style={{ width: '100%' }}
            />
            <div style={{ display: "flex", marginTop: "20px", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                onClick={updateDescription}
                disabled={!descriptionModalData?.description}
                loading={loading.description}
              >
                Update
              </Button>
            </div>
          </div>
          <div onClick={() => { setShowDescriptionModal({ open: false }); setDescriptionModalData({}) }} className="close-modal-icon">
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

CampaignSettingReport.layout = (page) => <Layout title="CampaignSettingReport">{page}</Layout>
export default CampaignSettingReport
