import Layout from '../../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode, PagingPosition } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { InertiaLink, usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import { filterData } from '../../filterData'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import { Button, CircularProgress } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import handleSelects from '@/Helpers/HandleSelects'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import { Switch } from '@material-ui/core'
import { columns, useStyles, fields, groups, filter } from './Helpers/CampaignSettingReportProps'

const CampaignSettingReport = () => {
  const classes = useStyles()
  const { allCampaigns, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
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
    key: index,
  }))

  const optionKey = 'campaign-setting-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const tablePropsInit = {
    columns:
      columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
        ? JSON.parse(columnsData[0])?.[optionKey]
        : columns,
    paging: {
      enabled: true,
      pageIndex: 0,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      position: PagingPosition.Bottom,
    },
    data: dataArray,
    rowKeyField: 'id',
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
    format: ({ column, value }) => {
      if (column.key === 'status') {
        if (typeof value === 'string') {
          value = value.split(',')
        }
        return (
          <Switch
            checked={parseInt(value[0]) === 1 && true}
            color="primary"
            onChange={() => handleStatus(value[0], value[1], value[2])}
          />
        )
      }
      if (column.key === 'actions') {
        return (
          <div style={{ display: 'flex' }}>
            <InertiaLink href={route('campaign.annotations', value)}>
              <Button variant="contained" color="primary">
                Annotations
              </Button>
            </InertiaLink>
            <InertiaLink href={route('campaign.exceptions', value)} style={{ paddingLeft: '4px' }}>
              <Button variant="contained" color="primary">
                Exceptions
              </Button>
            </InertiaLink>
            <div style={{ paddingLeft: '4px' }}>
              <Button variant="contained" color="primary" onClick={() => handleDescriptionModal(value)}>
                Description & DRTV LINK
              </Button>
            </div>
          </div>
        )
      }
    },
  }

  const [tableProps, changeTableProps] = useState(tablePropsInit)

  const dispatch = (action) => {
    handleSelects({
      action,
      selectedRowIds,
      setSelectedRowIds,
      tableProps,
      setTableToolbar,
    })
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action)
      const { data, ...settingsWithoutData } = newState
      if (action?.type === 'ReorderColumns') {
        addTableDetails(columnDetails, setColumnDetails, settingsWithoutData, optionKey)
      }
      return newState
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
        let tmpData = { ...tableProps }
        tmpData.data[index].status = [status, rowId, index]
        changeTableProps({ ...tmpData })
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
      .post(route('campaign.delete'), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          changeTableProps(filteredData)
          setSelectedRowIds([])
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
    setSelectedRowIds([])
    emptyCheckbox()
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
      // Cleanup the event listener
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [showColumns])

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={() => handleOpenModal(setShowDeleteModal)}>
            <DeleteIcon style={{ color: '#031b4e' }} />
          </IconButton>
        </Tooltip>
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
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

  const handleVideoURLChange = (e) => {
    setDescriptionModalData((values) => ({ ...values, video_url: e.target.value }))
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
                <ColumnSettings {...tableProps} dispatch={dispatch} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        <Table
          {...tableProps}
          childComponents={{
            cellText: {
              content: (props) => {
                if (props.column.key === 'selection-cell') {
                  return <SelectionCell {...props} />
                }
              },
            },
            headCell: {
              content: (props) => {
                if (props.column.key === 'selection-cell') {
                  return (
                    <SelectionHeader
                      {...props}
                      areAllRowsSelected={kaPropsUtils.areAllFilteredRowsSelected(tableProps)}
                    />
                  )
                }
              },
            },
          }}
          dispatch={dispatch}
          extendedFilter={(data) => filterData(data, filterValue)}
        />
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit Campaign Setting'}
      >
        <div className="edit_target">
          <form className={classes.form}>
            <span>Customer:</span>
            <TextField
              value={editData ? editData.customer_id : ''}
              fullWidth
              margin="normal"
              name="customer_id"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Market:</span>
            <TextField
              value={editData ? editData.market_id : ''}
              fullWidth
              margin="normal"
              name="market_id"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Start Date:</span>

            <TextField
              type="date"
              name="start_date"
              onChange={handleEditChange}
              defaultValue={editData ? editData.start_date : ''}
              margin="normal"
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditSubmit}
              className={classes.editButton}
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
        title={'Campaign Details'}
      >
        <div>
          <div>
            <p style={{ textAlign: "center", marginBottom: "20px", marginTop: "-5px" }}>
              Description and DRTV link for <strong>{descriptionModalData?.campaign_name}</strong>
            </p>
            <TextField
              name="description"
              label="Description"
              variant="outlined"
              onChange={handleDescriptionChange}
              value={descriptionModalData.description === null ? '' : descriptionModalData?.description}
              spellCheck
              fullWidth
              multiline
              minRows="4"
              maxRows="6"
            />
            <TextField
              name="video_url"
              label="DRTV Download Link"
              variant="outlined"
              onChange={handleVideoURLChange}
              value={descriptionModalData.video_url === null ? '' : descriptionModalData?.video_url}
              fullWidth
              style={{ marginTop: '20px' }}
            />
            <div style={{ display: "flex", marginTop: "20px", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                type="button"
                onClick={updateDescription}
                disabled={(!descriptionModalData?.description && !descriptionModalData?.video_url) || loading.description}
              >
                {loading.description && (<span style={{ marginRight: '8px', marginBottom: '-5px' }}>
                  <CircularProgress size={15} color="inherit" />
                </span>)}
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
        title={`${selectedRowIds.length > 1
          ? 'Do you want to delete these records?'
          : 'Do you want to delete this record?'
          }`}
      ></ConfirmModal>
    </>
  )
}

CampaignSettingReport.layout = (page) => <Layout title="CampaignSettingReport">{page}</Layout>
export default CampaignSettingReport
