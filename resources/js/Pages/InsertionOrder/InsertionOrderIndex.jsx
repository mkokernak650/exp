import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode } from 'ka-table/enums'
import { usePage } from '@inertiajs/inertia-react'
import 'ka-table/style.scss'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
import Eye from '@/Components/Icons/Eye.jsx'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { Pagination } from 'react-laravel-paginex'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import { useStyles, columns } from './Helpers/InsertionOrderIndexProps'
import { Button, CircularProgress, IconButton, Tooltip } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import IOPublicLink from '../../Components/IOComponents/IOPublicLink'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import ConfirmModal from '@/Shared/ConfirmModal'
import { kaPropsUtils } from 'ka-table/utils'
import handleSelects from '@/Helpers/HandleSelects'
import toast from 'react-hot-toast'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import ResendIODoc from '../../Components/IOComponents/ResendIODoc'
import CancelIO from '../../Components/IOComponents/CancelIO'

const InsertionOrderIndex = () => {
    const classes = useStyles()
    const { insertionOrders, columnsData } = usePage().props
    const [showColumns, setShowColumns] = useState(false)
    const [loading, setLoading] = useState(false)
    const showColumnRef = useRef()
    const [insertionOrderList, setInsertionOrderList] = useState(insertionOrders)
    const [itemPerPage, setItemPerPage] = useState(10)
    const [curerentPage, setCurerentPage] = useState(1)
    const [selectedRowIds, setSelectedRowIds] = useState([])
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
        }))
    }

    const dataArray = mapDataArr(insertionOrders)

    const status = ['pending', 'accepted', 'declined']

    const statusOptions = status.map(item => ({
        label: item,
        value: item,
    }))

    const optionKey = 'insertion-order-index'
    const [columnDetails, setColumnDetails] = useState(
        columnsData.length ? JSON.parse(columnsData[0]) : {}
    )

    const tablePropsInit = {
        columns:
            // columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
            //     ? JSON.parse(columnsData[0])?.[optionKey]
            //     : 
            columns,
        loading: {
            enabled: false,
            text: 'Loading...',
        },
        data: dataArray,
        rowKeyField: 'id',
        sortingMode: SortingMode.Single,
        columnResizing: true,
        columnReordering: true,
        format: ({ column, value }) => {
            if (column.key === 'id') {
                return 'IO-' + value.padStart(3, '0')
            }
            if (column.key === 'io_link') {
                return <IOPublicLink link={`${baseUrl}/insertion-order/public${value}`} />
            }
            if (column.key === 'resend_io_doc') {
                return <ResendIODoc data={value} routeName="insertion.order.resend.io.document" />
            }
            if (column.key === 'cancel_io') {
                return <CancelIO data={value} routeName="insertion.order.resend.io.document" />
            }
        }
    }

    const [tableProps, changeTableProps] = useState(tablePropsInit)

    const dispatch = (action) => {
        if (
            ['SelectRow', 'DeselectRow', 'SelectAllFilteredRows', 'DeselectAllFilteredRows'].includes(
                action?.type
            )
        ) {
            handleSelects({
                action,
                selectedRowIds,
                setSelectedRowIds,
                tableProps,
                setTableToolbar,
            })
        }
        changeTableProps((prevState) => {
            const newState = kaReducer(prevState, action)
            const { data, ...settingsWithoutData } = newState
            if (action?.type === 'ReorderColumns') {
                addTableDetails(columnDetails, setColumnDetails, settingsWithoutData, optionKey)
            }
            return newState
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
        dispatch(showLoading())
        await axios
            .get(
                'insertion-order?page=' +
                data.page +
                '&itemPerPage=' +
                itemPerPage +
                '&filterByStatus=' + filterByStatus
            )
            .then((res) => {
                const tmpTableProps = { ...tableProps }
                tmpTableProps.data = mapDataArr(res.data)
                changeTableProps(tmpTableProps)
                setInsertionOrderList(res.data)
                dispatch(hideLoading())
            })
    }

    const itemPerPageHandleChange = (e) => {
        setItemPerPage(e.target.value)
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
                    <IconButton aria-label="delete" onClick={() => setShowDeleteModal({ open: true })}>
                        <DeleteIcon style={{ color: '#031b4e' }} />
                    </IconButton>
                </Tooltip>
                <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
            </div>
        )
    }

    const deleteHandler = () => {
        axios
            .post(route('insertion.order.delete'), { selectedRowIds })
            .then((res) => {
                if (res.data.success === true) {
                    let filteredData = tableProps
                    const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
                    filteredData.data = newData
                    changeTableProps(filteredData)
                    setSelectedRowIds([])
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

    return (
        <>
            <Helmet title="Insertion Order - Index" />
            <div className="selection-demo">
                {tableToolbar ? (
                    <TableToolbar />
                ) : <div className="table-top-flex-start">
                    <div className="top-left">
                        <div className="columns-show-hide" onClick={handleColumns}>
                            <Eye />
                        </div>
                        {/* <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            className={classes.button}
                            onClick={exportHandler}
                            disabled={insertionOrderList == ''}
                        >
                            {loading ? (
                                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
                            ) : (
                                'Export'
                            )}
                        </Button> */}
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
                            <ColumnSettings {...tableProps} dispatch={dispatch} />
                        </div>
                    ) : (
                        ''
                    )}
                </div>}
                <Table
                    {...tableProps}
                    childComponents={{
                        noDataRow: {
                            content: () => 'No Data Found',
                        },
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
                    extendedFilter={(data) => tableProps.data}
                />
                <div className="table-bottom">
                    <select
                        name="item-per-page"
                        id="item-per-page"
                        value={itemPerPage}
                        onChange={(e) => itemPerPageHandleChange(e)}
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <Pagination changePage={getSearchingData} data={insertionOrderList} />
                </div>
            </div>
            <ConfirmModal
                open={showDeleteModal.open}
                setOpen={setShowDeleteModal}
                btnAction={deleteHandler}
                closeAction={() => setShowDeleteModal({ open: false })}
                width={'400px'}
                title={`${selectedRowIds.length > 1
                    ? 'Do you want to delete these records?'
                    : 'Do you want to delete this record?'
                    }`}
            ></ConfirmModal>
        </>
    )
}

InsertionOrderIndex.layout = (page) => <Layout title="Insertion Order - Index">{page}</Layout>
export default InsertionOrderIndex
