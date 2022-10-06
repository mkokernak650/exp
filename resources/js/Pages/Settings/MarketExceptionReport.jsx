import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { DataType, SortingMode, PagingPosition } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import { filterData } from '../filterData'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import {
  Button,
  CircularProgress,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
} from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import handleSelects from '@/Helpers/HandleSelects'

const useStyles = makeStyles(() => ({
  topBtn: {
    display: 'flex',
    gap: '10px',
    marginLeft: '10px',
  },
  button: {
    width: 130,
    textTransform: 'capitalize',
    fontSize: '14px',
  },
  editButton: {
    marginTop: '15px',
  },
}))

export const fields = [
  {
    caption: ' campaign',
    name: 'campaign',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'market',
    name: 'market',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'state',
    name: 'state',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'call_type',
    name: 'call_type',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
]

export const groups = [
  {
    caption: 'And',
    name: 'and',
  },
  {
    caption: 'Or',
    name: 'or',
  },
]
export const filter = {
  groupName: 'and',
  items: [
    {
      field: 'campaign',
      operator: 'isNotEmpty',
    },
  ],
}

const MarketExceptionReport = () => {
  const classes = useStyles()
  const { marketExceptions, campaignId, allCampaigns, allStates, allMarkets, columnsData } =
    usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [open, setOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [inboundIds, setInbounIds] = useState([])
  const showColumnRef = useRef()
  const [exportModal, setExportModal] = useState({ open: false })
  const [type, setType] = useState('xlsx')
  const [loading, setLoading] = useState(false)

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }
  const handleEditSubmit = () => {
    axios
      .post(route('market.exception.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = { ...tableProps }
          filteredData.data.filter((item, indx) => {
            if (item.id === editData.id) {
              filteredData.data[indx].campaign = editData.campaign
              filteredData.data[indx].market_id = editData.market_id
              filteredData.data[indx].state = editData.state
              filteredData.data[indx].ranks = editData.ranks
              filteredData.data[indx].nielsen_households = editData.nielsen_households
              filteredData.data[indx].call_type = editData.call_type
              filteredData.data[indx].start_date = editData.start_date
            }
          })
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
        setEditData()
        setShowEditModal({ open: false })
      })
  }

  const dataArray = marketExceptions.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    campaign: item.campaign.campaign_name,
    market_id: item.market_id,
    state: item.state,
    call_type: item.call_type,
    start_date: item.start_date,
    ranks: item.ranks,
    nielsen_households: item.nielsen_households,
    id: item.id,
    key: index,
    campaign_id: item.campaign_id,
  }))

  const columns = [
    {
      key: 'edit',
      style: { width: 20 },
      visible: true,
    },
    {
      key: 'selection-cell',
      style: { width: 80 },
      visible: true,
    },
    {
      key: 'sl',
      title: 'SL',
      dataType: DataType.Number,
      style: { width: 100 },
      visible: false,
    },
    {
      key: 'campaign',
      title: 'Campaign',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'market_id',
      title: 'Market',
      dataType: DataType.String,
      style: { width: 350 },
      visible: true,
    },
    {
      key: 'state',
      title: 'State',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'call_type',
      title: 'Call Type',
      dataType: DataType.String,
      style: { width: 160 },
      visible: true,
    },
    {
      key: 'ranks',
      title: 'Rank',
      dataType: DataType.String,
      style: { width: 100 },
      visible: true,
    },
    {
      key: 'nielsen_households',
      title: 'Nielsen Households',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },

    {
      key: 'start_date',
      title: 'Start Date',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
  ]

  const optionKey = 'market-exception-report'
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
      if (column.key === 'edit') {
        return (
          <div className="edit-icon" onClick={() => handleEdit(value)}>
            <Edit />
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
      inboundIds,
      setInbounIds,
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

  const [searchSidebar, setSearchSidebar] = useState(false)

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
      .post(route('market.exception.delete'), { selectedRowIds })
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

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
      if (item.id === itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
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

  const handleExportTypeChange = (e) => {
    setType(e.target.value)
  }

  const openExportModal = () => {
    setExportModal({ open: true })
  }

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const baseUrl = window.location.origin
  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get(`${baseUrl}/market-exception-export/${type}/${campaignId}`)
      .then((res) => {
        setLoading(false)
        if (res.status === 204) {
          toast.error('No data found for the selected criteria')
        }
        if (res.status === 200) {
          setExportModal({ open: false })
          triggerExportLink(res.request.responseURL)
          toast.success('Exported Successfully')
          setOpen(true)
        } else {
          toast.error('Exporting failed')
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
          <IconButton aria-label="delete" onClick={() => handleOpenModal(setShowDeleteModal)}>
            <DeleteIcon style={{ color: '#031b4e' }} />
          </IconButton>
        </Tooltip>
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="Market Exception Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                className={classes.button}
                onClick={openExportModal}
                disabled={marketExceptions == ''}
              >
                Export
              </Button>
            </div>
            <div className="search-icon" onClick={handleSearch}>
              <span>Search Here</span>
              <Search />
            </div>

            {searchSidebar ? (
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
            filterRowCell: {
              content: (props) => {
                if (props.column.key === 'selection-cell') {
                  return <></>
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
                      // areAllRowsSelected={kaPropsUtils.areAllVisibleRowsSelected(tableProps)}
                    />
                  )
                }
              },
            },
            cell: {
              content: (props) => {
                switch (props.column.key) {
                  case 'drag':
                    return (
                      <img
                        style={{ cursor: 'move' }}
                        src="https://komarovalexander.github.io/ka-table/static/icons/draggable.svg"
                        alt="draggable"
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
        title={'Edit Market Exception'}
      >
        <div className="edit_target">
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="campaign_id"
                  select
                  name="campaign_id"
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  value={editData?.campaign_id ? editData.campaign_id : ''}
                >
                  <option value="">Select Campaign</option>
                  {allCampaigns.map((option, indx) => (
                    <option key={indx} value={option.id}>
                      {option.campaign_name}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="state"
                  select
                  name="state"
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  value={editData?.state ? editData.state : ''}
                >
                  <option value="">Select State</option>
                  {allStates.map((option, indx) => (
                    <option key={indx} value={option.state}>
                      {option.state}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="market_id"
                  select
                  name="market_id"
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  value={editData?.market_id}
                >
                  <option value="">Select Market</option>
                  {allMarkets.map((option, indx) => (
                    <option key={indx} value={option.market_id}>
                      {option.market}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  id="call_type"
                  select
                  name="call_type"
                  onChange={handleEditChange}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  value={editData?.call_type ? editData.call_type : ''}
                >
                  <option value="">Call Type</option>
                  <option value="L">Landline (L)</option>
                  <option value="W">Wireless (W)</option>
                  <option value="B">Both L & W</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="date"
                  name="start_date"
                  onChange={handleEditChange}
                  defaultValue={editData?.start_date ? editData.start_date : ''}
                  margin="normal"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <span>Rank:</span>
                <TextField
                  value={editData?.ranks ? editData.ranks : ''}
                  fullWidth
                  margin="normal"
                  name="ranks"
                  type="text"
                  variant="outlined"
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <span>Nielsen Households:</span>

                <TextField
                  value={editData?.nielsen_households ? editData.nielsen_households : ''}
                  fullWidth
                  margin="normal"
                  name="nielsen_households"
                  type="text"
                  variant="outlined"
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEditSubmit}
                  className={classes.editButton}
                >
                  Edit
                </Button>
              </Grid>
            </Grid>
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
          selectedRowIds.length > 1
            ? 'Do you want to delete these records?'
            : 'Do you want to delete this record?'
        }`}
      ></ConfirmModal>

      <NormalModal open={exportModal.open} setOpen={setExportModal} width={'500px'} title={''}>
        <div className={classes.import}>
          <FormLabel component="legend">Select Type</FormLabel>
          <RadioGroup aria-label="type" name="type" value={type} onChange={handleExportTypeChange}>
            <FormControlLabel value="xlsx" control={<Radio />} label="XLSX" />
            <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            <FormControlLabel value="xls" control={<Radio />} label="XLS" />
            <FormControlLabel value="tsv" control={<Radio />} label="TSV" />
          </RadioGroup>
          <Button variant="contained" color="primary" onClick={exportHandler}>
            {loading ? <CircularProgress color="inherit" thickness={3} size="1.5rem" /> : 'Next'}
          </Button>
        </div>
      </NormalModal>
    </>
  )
}

MarketExceptionReport.layout = (page) => <Layout title="MarketExceptionReport">{page}</Layout>
export default MarketExceptionReport
