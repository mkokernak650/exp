import React, { useState, useRef } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import EnhancedTable from '../../components/EnhancedTable'
import Layout from '../Layout/Layout'
import { usePage, InertiaLink } from '@inertiajs/inertia-react';
import { Inertia } from '@inertiajs/inertia'

// const fileupload = useRef(null)

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


const Zipcode = () => {
    const { allCustomers } = usePage().props

    const newCustomer = allCustomers.map((item, indx) => {
        return {
            SL: indx + 1,
            Customer: item.customer_name,
            'Customer Id': item.customer_ID
        }
    })
    const [mainData, setMainData] = useState(newCustomer)
    const columns = [
        {
            Header: 'SL',
            accessor: 'SL',
        },
        {
            Header: 'Customer',
            accessor: 'Customer',
        },
        {
            Header: 'Customer Id',
            accessor: 'Customer Id',
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

    const importHendler = (e) => {
        e.preventDefault();

        const form = new FormData(e.target)

        // console.log(form.entries)

        // post(route('zipcode.data'), form)
        Inertia.post(route('zipcode.data.import'), form)
    }

    return (
        <div>
           
           <form method='post' encType='multipart/form-data' onSubmit={importHendler}>
                <input id='importfile' type="file" name='importfile' />
                <button type='submit'>Import</button>
           </form>

           <InertiaLink href={route('zipcode.data.export', 'xlsx')}>Export</InertiaLink>

           {/* <a href={route('zipcode.data.export', 'xlsx')}> Export </a> */}

        </div>
    )
}

Zipcode.layout = page => <Layout title="Zipcode database">{page}</Layout>
export default Zipcode
