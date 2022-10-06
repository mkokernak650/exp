import Layout from './Layout/Layout'
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
import { filterData } from './filterData'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core'
import axios from 'axios'
import ConfirmModal from '../Shared/ConfirmModal'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import toast from 'react-hot-toast'

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
}))

export const fields = [
  {
    caption: 'Company',
    name: 'Company',
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
    caption: 'Last Name',
    name: 'Last_Name',
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
    caption: 'Email',
    name: 'Email',
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
    caption: 'Phone',
    name: 'Phone',
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
    caption: 'Skype',
    name: 'Skype',
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
    caption: 'Street',
    name: 'Street',
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
    caption: 'City',
    name: 'City',
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
    caption: 'State',
    name: 'State',
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
    caption: 'ZipCode',
    name: 'ZipCode',
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
    caption: 'Country',
    name: 'Country',
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
    caption: 'Website',
    name: 'Website',
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
    caption: 'Comment',
    name: 'Comment',
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
    caption: 'Created Time',
    name: 'Created_Time',
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
      field: 'Last_Name',
      operator: 'isNotEmpty',
    },
  ],
}

const WebFormReport = () => {
  const { allReports, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const dataArray = allReports.map((item, index) => ({
    sl: index + 1,
    Company: item.company,
    Last_Name: item.lname,
    Email: item.email,
    Phone: item.phone,
    Skype: item.skype,
    Street: item.street,
    City: item.city,
    State: item.state,
    ZipCode: item.zipcode,
    Country: item.country,
    Website: item.website,
    Comment: item.comment,
    Created_Time: item.created_at,
    id: item.id,
    key: index,
  }))

  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()

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
            dispatch(selectAllFilteredRows()) // also available: selectAllVisibleRows(), selectAllRows()
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
            dispatch(deselectAllFilteredRows()) // also available: deselectAllVisibleRows(), deselectAllRows()
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
      key: 'Company',
      title: 'Company',
      dataType: DataType.String,
      style: { width: 280 },
      visible: true,
    },
    {
      key: 'Last_Name',
      title: 'Last Name',
      dataType: DataType.String,
      style: { width: 320 },
      visible: true,
    },
    {
      key: 'Email',
      title: 'Email',
      dataType: DataType.String,
      style: { width: 320 },
      visible: true,
    },
    {
      key: 'Phone',
      title: 'Phone',
      dataType: DataType.String,
      style: { width: 160 },
      visible: true,
    },
    {
      key: 'Skype',
      title: 'Skype',
      dataType: DataType.String,
      style: { width: 370 },
      visible: true,
    },
    {
      key: 'Street',
      title: 'Street',
      dataType: DataType.String,
      style: { width: 280 },
      visible: true,
    },
    {
      key: 'City',
      title: 'City',
      dataType: DataType.String,
      style: { width: 270 },
      visible: true,
    },
    {
      key: 'State',
      title: 'State',
      dataType: DataType.String,
      style: { width: 310 },
      visible: true,
    },
    {
      key: 'ZipCode',
      title: 'ZipCode',
      dataType: DataType.String,
      style: { width: 230 },
      visible: true,
    },
    {
      key: 'Country',
      title: 'Country',
      dataType: DataType.String,
      style: { width: 300 },
      visible: true,
    },
    {
      key: 'Website',
      title: 'Website',
      dataType: DataType.String,
      style: { width: 280 },
      visible: true,
    },
    {
      key: 'Comment',
      title: 'Comment',
      dataType: DataType.String,
      style: { width: 230 },
      visible: true,
    },
    {
      key: 'Created_Time',
      title: 'Created Time',
      dataType: DataType.String,
      style: { width: 280 },
      visible: true,
    },
  ]

  const optionKey = 'webform-report'
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
      pageSizes: [5, 10, 15],
      position: PagingPosition.Bottom,
    },
    data: dataArray,
    rowKeyField: 'id',
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
    format: ({ column, value }) => {
      if (column.key === 'Website') {
        return (
          <a target="_blank" href={value}>
            {value}
          </a>
        )
      }
    },
  }

  const [tableProps, changeTableProps] = useState(tablePropsInit)

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
      .post(route('webform.reports.delete'), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          setSelectedRowIds([])
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          setSelectedRowIds([])
          setTableToolbar(false)
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowIds([])
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

  return (
    <>
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

WebFormReport.layout = (page) => <Layout title="WebForm Report">{page}</Layout>
export default WebFormReport
