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
    const TableTitle = () => {
    return (
      <div>

      </div>
    );
  };


const MarketReport = () => {
    const { allMarkets } = usePage().props

    const newMarket = allMarkets.map((item, indx) => {
        return {
            SL: indx + 1,
            Market: item.market_name,
        }
    })
    const [mainData, setMainData] = useState(newMarket)
    const columns = [
        {
            Header: 'SL',
            accessor: 'SL',
        },
        {
            Header: 'Market',
            accessor: 'Market',
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
                TableTitle={TableTitle}
            />

        </div>
    )
}

MarketReport.layout = page => <Layout title="Market Report">{page}</Layout>
export default MarketReport
