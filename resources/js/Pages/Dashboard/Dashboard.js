import React from 'react'
import Layout from '../Layout/Layout'

const Dashboard = () => {
    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    )
}
Dashboard.layout = page => <Layout title="Dashboard">{page}</Layout>
export default Dashboard
