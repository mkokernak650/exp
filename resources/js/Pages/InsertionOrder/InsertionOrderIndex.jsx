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
import { Button, CircularProgress } from '@material-ui/core'

const InsertionOrderIndex = () => {
    const classes = useStyles()
    const { insertionOrders, columnsData } = usePage().props
    const [showColumns, setShowColumns] = useState(false)
    const [loading, setLoading] = useState(false)
    const showColumnRef = useRef()
    const [insertionOrderList, setInsertionOrderList] = useState(insertionOrders)
    const [itemPerPage, setItemPerPage] = useState(10)
    const [curerentPage, setCurerentPage] = useState(1)
    const baseUrl = window.location.origin

    const mapDataArr = (data) => {
        return data.data.map((item) => ({
            id: item.id,
            customer: item?.customer?.customer_name,
            affiliate: item?.affiliate?.affiliate_name,
            status: item.status,
            io_link: item.io_link,
            created_at: item.formatted_created_at,
        }))
    }

    const dataArray = mapDataArr(insertionOrders)

    const optionKey = 'insertion-order-index'
    const [columnDetails, setColumnDetails] = useState(
        columnsData.length ? JSON.parse(columnsData[0]) : {}
    )

    const tablePropsInit = {
        columns: columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
            ? JSON.parse(columnsData[0])?.[optionKey]
            : columns,
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
                return `${baseUrl}/insertion-order/public${value}`
            }
        }
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
                itemPerPage
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
    }, [itemPerPage])

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

    return (
        <>
            <Helmet title="Insertion Order - Index" />
            <div className="selection-demo">
                <div className="table-top-flex-start">
                    <div className="top-left">
                        <div className="columns-show-hide" onClick={handleColumns}>
                            <Eye />
                        </div>
                        <Button
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
                        </Button>
                    </div>
                    {showColumns ? (
                        <div className="column-settings" ref={showColumnRef}>
                            <ColumnSettings {...tableProps} dispatch={dispatch} />
                        </div>
                    ) : (
                        ''
                    )}
                </div>
                <Table
                    {...tableProps}
                    childComponents={{
                        noDataRow: {
                            content: () => 'No Data Found',
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
        </>
    )
}

InsertionOrderIndex.layout = (page) => <Layout title="Insertion Order - Index">{page}</Layout>
export default InsertionOrderIndex
