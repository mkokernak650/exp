import React, { useState } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import EnhancedTable from '../../components/EnhancedTable'
import Layout from '../Layout/Layout'
import { usePage } from '@inertiajs/inertia-react';



const range = len => {
    const arr = []
    for (let i = 0; i < len; i++) {
        arr.push(i)
    }
    return arr
}

function makeData(...lens) {
    const makeDataLevel = (depth = 0) => {
        const len = lens[depth]
        return range(len).map(d => {
            return {
                subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
            }
        })
    }
    return makeDataLevel()
}


const CallLogsReport = () => {
    const { allCallLogs } = usePage().props

    const newCallCallLogs = allCallLogs.map((item, indx) => {
        return {

            'SL': indx + 1,
            'Call Date': item.Call_Date_Time,
            'Has Annotation': item.Has_Annotation,
            'Annotation': item.Annotation_Tag,
            'Call Status': item.call_Logs_status,
            'Recording Url': item.Recording_Url,
            'Time': item.Call_Date_Time,
            'Inbound Id': item.Inbound_Id,
            'Affiliate': item.Affiliate,
            'Market': item.Market,
            'Campaign': item.Campaign,
            'Inbound': item.Inbound,
            'Dialed': item.Dialed,
            'Type': item.Type,
            'Customer': item.Customer,
            'Target': item.Target,
            'Target Description': item.Target_Description,
            'Source/Hangup': item.Source_Hangup,
            'Conn. Duration': item.Conn_Duration,
            'Time To Call': item.Time_To_Call,
            'Call Length In Seconds': item.call_Length_In_Seconds,
            'Revenue': item.Revenue,
            'Payout': item.payoutAmount,
            'Total Cost': item.Total_Cost,
            'Profit': item.Profit,
            'City': item.City,
            'State': item.State,
            'Zipcode': item.Zipcode,

        }
    })
    const [mainData, setMainData] = useState(newCallCallLogs)
    const columns = [
        {
            Header: 'SL',
            accessor: 'SL',
        },
        {
            Header: 'Call Date',
            accessor: 'Call Date',
        },
        {
            Header: 'Has Annotation',
            accessor: 'Has Annotation',
        },
        {
            Header: 'Annotation Tag',
            accessor: 'Annotation Tag',
        },
        {
            Header: 'Call Status',
            accessor: 'Call Status',
        },
        {
            Header: 'Recording Url',
            accessor: 'Recording Url',
        },
        {
            Header: 'Time',
            accessor: 'Time',
        },
        {
            Header: 'Inbound Id',
            accessor: 'Inbound Id',
        },
        {
            Header: 'Affiliate',
            accessor: 'Affiliate',
        },
        {
            Header: 'Market',
            accessor: 'Market',
        },
        {
            Header: 'Campaign',
            accessor: 'Campaign',
        },
        {
            Header: 'Inbound',
            accessor: 'Inbound',
        },
        {
            Header: 'Dialed',
            accessor: 'Dialed',
        },
        {
            Header: 'Type',
            accessor: 'Type',
        },
        {
            Header: 'Customer',
            accessor: 'Customer',
        },
        {
            Header: 'Target',
            accessor: 'Target',
        },
        {
            Header: 'Target Description',
            accessor: 'Target Description',
        },
        {
            Header: 'Source/Hangup',
            accessor: 'Source/Hangup',
        },
        {
            Header: 'Conn. Duration',
            accessor: 'Conn. Duration',
        },
        {
            Header: 'Time To Call',
            accessor: 'Time To Call',
        },
        {
            Header: 'Call Length In Seconds',
            accessor: 'Call Length In Seconds',
        },
        {
            Header: 'Revenue',
            accessor: 'Revenue',
        },
        {
            Header: 'Payout',
            accessor: 'Payout',
        },
        {
            Header: 'Total Cost',
            accessor: 'Total Cost',
        }
        ,
        {
            Header: 'Profit',
            accessor: 'Profit',
        }
        ,
        {
            Header: 'City',
            accessor: 'City',
        },
        {
            Header: 'State',
            accessor: 'State',
        },
        {
            Header: 'Zipcode',
            accessor: 'Zipcode',
        }
    ]

    const [data, setData] = React.useState(React.useMemo(() => makeData(20), []))

    const [skipPageReset, setSkipPageReset] = React.useState(false)

    const updateMyData = (rowIndex, columnId, value) => {
        setSkipPageReset(true)
        setData(old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    return {
                        ...old[rowIndex],
                        [columnId]: value,
                    }
                }
                return row
            })
        )
    }

    return (
        <div>
            <CssBaseline />
            <EnhancedTable
                columns={columns}
                data={mainData}
                setData={setMainData}
                updateMyData={updateMyData}
                skipPageReset={skipPageReset}
            />
        </div>
    )
}

CallLogsReport.layout = page => <Layout title="Call Logs Report">{page}</Layout>
export default CallLogsReport