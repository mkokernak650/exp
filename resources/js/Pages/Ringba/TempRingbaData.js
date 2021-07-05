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

const newPerson = () => {
  return {
    Id: 1,
    CallLog_columns: "test1",
    CallLog_events: "test2",
    CallLog_Tags: "test1",
  }
}

function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth]
    return range(len).map(d => {
      console.log(d)

      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      }
    })
  }
  return makeDataLevel()
}


const TempRingbaData = () => {
  const { ringbaData } = usePage().props

  const newRingbadata = ringbaData.map((item, indx) => {
    return {
      Id: indx,
      CallLog_columns: JSON.stringify(item.columns),
      CallLog_events: JSON.stringify(item.events),
      CallLog_Tags: JSON.stringify(item.tags)
    }
  })
  const [mainData, setRingbadata] = useState(newRingbadata)
  const columns = [
    {
      Header: 'Id',
      accessor: 'Id',
    },
    {
      Header: 'CallLog_columns',
      accessor: 'CallLog_columns',
    },
    {
      Header: 'CallLog_events',
      accessor: 'CallLog_events',
    },
    {
      Header: 'CallLog_Tags',
      accessor: 'CallLog_Tags',
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
        setData={setRingbadata}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
      />

    </div>
  )
}

TempRingbaData.layout = page => <Layout title="TempRingbaData">{page}</Layout>
export default TempRingbaData
