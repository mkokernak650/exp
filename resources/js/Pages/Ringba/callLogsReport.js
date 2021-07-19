import React, { useState, useEffect } from 'react'
import { CssBaseline, Button, makeStyles } from '@material-ui/core'
import EnhancedTable from '../../components/EnhancedTable'
import Layout from '../Layout/Layout'
import { usePage } from '@inertiajs/inertia-react';
import { Inertia } from '@inertiajs/inertia'

const useStyles = makeStyles((theme) => ({
    topBtn: {
        display: 'flex',
        gap: '10px',
        marginLeft: '10px'
    },
    button: {
        width: 130,
    }

}));

// const range = len => {
//     const arr = []
//     for (let i = 0; i < len; i++) {
//         arr.push(i)
//     }
//     return arr
// }

// function makeData(...lens) {
//     const makeDataLevel = (depth = 0) => {
//         const len = lens[depth]
//         return range(len).map(d => {
//             return {
//                 subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
//             }
//         })
//     }
//     return makeDataLevel()
// }


const CallLogsReport = () => {
    const classes = useStyles();
    const { allCallLogs } = usePage().props
    const { success } = usePage().props
    const [inboundIds] = useState([])
    const [loading, setLoading] = useState(false);

    const newCallCallLogs = allCallLogs.map((item, indx) => {
        return {
            'SL': indx + 1,
            'Call_Date': item.Call_Date_Time,
            'Has_Annotation': item.Has_Annotation,
            'Annotation': item.Annotation_Tag,
            'Call_Status': item.call_Logs_status,
            'Recording_Url': item.Recording_Url,
            'Time': item.Call_Date_Time,
            'Inbound_Id': item.Inbound_Id,
            'Affiliate': item.Affiliate,
            'Market': item.Market,
            'Campaign': item.Campaign,
            'Inbound': item.Inbound,
            'Dialed': item.Dialed,
            'Type': item.Type,
            'Customer': item.Customer,
            'Target': item.Target,
            'Target_Description': item.Target_Description,
            'Source_Hangup': item.Source_Hangup,
            'Conn_Duration': item.Conn_Duration,
            'Time_To_Call': item.Time_To_Call,
            'Call_Length_In_Seconds': item.call_Length_In_Seconds,
            'Revenue': item.Revenue,
            'Payout': item.payoutAmount,
            'Total_Cost': item.Total_Cost,
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
            accessor: 'Call_Date',
        },
        {
            Header: 'Has Annotation',
            accessor: 'Has_Annotation',
        },
        {
            Header: 'Annotation Tag',
            accessor: 'Annotation_Tag',
        },
        {
            Header: 'Call Status',
            accessor: 'Call_Status',
        },
        {
            Header: 'Recording Url',
            accessor: 'Recording_Url',
        },
        {
            Header: 'Time',
            accessor: 'Time',
        },
        {
            Header: 'Inbound Id',
            accessor: 'Inbound_Id',
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
            accessor: 'Target_Description',
        },
        {
            Header: 'Source/Hangup',
            accessor: 'Source_Hangup',
        },
        {
            Header: 'Conn. Duration',
            accessor: 'Conn_Duration',
        },
        {
            Header: 'Time To Call',
            accessor: 'Time_To_Call',
        },
        {
            Header: 'Call Length In Seconds',
            accessor: 'Call_Length_In_Seconds',
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
            accessor: 'Total_Cost',
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


    const handlePending = () => {
        setLoading(true)
        Inertia.post(route('add.pending.bill.call'), { inboundIds }, {
            onFinish: () => {
                setLoading(false)
            }
        })
    }
    const handleArchived = () => {
        Inertia.post(route('add.arichived.bill.call'), { inboundIds })
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
                inboundIds={inboundIds}
            >
                <div className={classes.topBtn}>
                    {/* <Button variant="contained" type="submit" color="primary" className={classes.button} onClick={handleUpdate}>
                        Update
                    </Button> */}
                    <Button variant="contained" type="submit" color="primary" className={classes.button} onClick={handlePending}>
                        Pending
                    </Button>
                    <Button variant="contained" type="submit" color="primary" className={classes.button} onClick={handleArchived}>
                        Archived
                    </Button>

                </div>
            </EnhancedTable>
        </div>
    )
}

CallLogsReport.layout = page => <Layout title="Call Logs Report">{page}</Layout>
export default CallLogsReport