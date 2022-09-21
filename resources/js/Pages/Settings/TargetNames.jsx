import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { DataType, SortingMode, PagingPosition } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { usePage } from '@inertiajs/inertia-react'
import {
  deselectAllFilteredRows,
  deselectRow,
  selectAllFilteredRows,
  selectRow,
  selectRowsRange,
} from 'ka-table/actionCreators'
import FilterControl from 'react-filter-control'
import { filterData } from '../filterData'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import Switch from '@material-ui/core/Switch'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import { Button, makeStyles } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import NormalModal from '../../Shared/NormalModal'
import ConfirmModal from '@/Shared/ConfirmModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'

const useStyles = makeStyles(() => ({
  topBtn: {
    display: 'flex',
    gap: '10px',
    marginLeft: '10px',
  },
  button: {
    width: '130',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
  editButton: {
    marginTop: '15px',
  },
}))

export const fields = [
  {
    caption: 'Target Name',
    name: 'target_name',
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
      field: 'target_name',
      operator: 'isNotEmpty',
    },
  ],
}

const Targets = () => {
  const classes = useStyles()
  const { allTargetNames,columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setselectedRowIds] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()

  const dataArray = allTargetNames.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    target_name: item.target_name,
    status: [item.status, item.id],
    id: item.id,
    key: index,
  }))

  const SelectionCell = ({ rowKeyValue, dispatch, isSelectedRow, selectedRows }) => {
    return (
      <Checkbox
        checked={isSelectedRow}
        color="primary"
        onChange={(event) => {
          if (event.nativeEvent.shiftKey) {
            dispatch(selectRowsRange(rowKeyValue, [...selectedRows].pop()))
          } else if (event.currentTarget.checked) {
            dispatch(selectRow(rowKeyValue))
            setTableToolbar(true)
            const id = parseInt(rowKeyValue)
            if (!selectedRowIds.includes(id)) {
              selectedRowIds.push(id)
            } 
          } else {
            dispatch(deselectRow(rowKeyValue))
            const id = parseInt(rowKeyValue)
            const itemIndx = selectedRowIds.indexOf(id)
            selectedRowIds.splice(itemIndx, 1)
            if (selectedRowIds.length < 1) {
              setTableToolbar(false)
            }
          }
        }}
      />
    )
  }
  const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
    return (
      <Checkbox
        checked={areAllRowsSelected}
        color="primary"
        onChange={(event) => {
          if (event.currentTarget.checked) {
            dispatch(selectAllFilteredRows())
            setTableToolbar(true)
            let i = 0
            while (i < tableProps.data.length) {
              if (!selectedRowIds.includes(tableProps.data[i].id)) {
                selectedRowIds.push(tableProps.data[i].id)
                continue
              }
              i++
            }
          } else {
            dispatch(deselectAllFilteredRows())
            if (selectedRowIds) {
              selectedRowIds.splice(0, selectedRowIds.length)
            }
            if (selectedRowIds.length < 1) {
              setTableToolbar(false)
            }
          }
        }}
      />
    )
  }

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
      key: 'target_name',
      title: 'Target Name',
      dataType: DataType.String,
      style: { width: 360 },
      visible: true,
    },

    {
      key: 'status',
      title: 'Status',
      style: { width: 240 },
      visible: true,
    },
  ]

  const optionKey = 'target-names-report'
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
      if (column.key === 'status') {
        return (
          <Switch
            checked={value[0] === 1 && true}
            color="primary"
            onChange={() => handleStatus(event, value[0], value[1])}
          />
        )
      }
    },
  }


  const [tableProps, changeTableProps] = useState(tablePropsInit)

  const handleStatus = (e, value, rowId) => {
    axios
      .post(route('target_names.status.update'), { value: value, rowId: rowId })
      .then((res) => {
        let tmpData = { ...tableProps }
        tmpData.data.filter((item, indx) => {
          if (item.id === rowId) {
            if (tmpData.data[indx].status[0] == 1) {
              tmpData.data[indx].status = [0, rowId]
            } else {
              tmpData.data[indx].status = [1, rowId]
            }
          }
        })
        changeTableProps(tmpData)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const dispatch = (action) => {
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
  const deleteHandler = () => {
    axios
      .post(route('target_names.delete'), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          setselectedRowIds([])
          changeTableProps(filteredData)
          setTableToolbar(false)
          setShowDeleteModal({ open: false })
          toast.success(res.data.msg)
        } else {
          setselectedRowIds([])
          setTableToolbar(false)
          setShowDeleteModal({ open: false })
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        setselectedRowIds([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
      })
  }

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
      if (item.id == itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
  }
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }
  const handleEditSubmit = () => {
    axios
      .post(route('target_name.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          filteredData.data.filter((item, indx) => {
            if (item.id === editData.id) {
              filteredData.data[indx].target_name = editData.target_name
            }
          })
          setEditData()
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
          setselectedRowIds([])
        } else {
          setEditData()
          setShowEditModal({ open: false })
          toast.error(res.data.msg)
          setselectedRowIds([])
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setselectedRowIds([])
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
      <Helmet title="Target Names Report" />
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
        title={'Edit Target Names'}
      >
        <div className="edit_target">
          <form className={classes.form}>
            <span>Target Name:</span>
            <TextField
              value={editData ? editData.target_name : ''}
              fullWidth
              margin="normal"
              name="target_name"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
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
    </>
  )
}

Targets.layout = (page) => <Layout title="Targets">{page}</Layout>
export default Targets
