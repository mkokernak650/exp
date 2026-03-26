import { Helmet } from 'react-helmet'
import { Typography } from 'antd'
import Layout from '../Layout/Layout'
const Dashboard = () => (
  <>
    <Helmet>
      <title>Consumer EXP</title>
    </Helmet>
    <Typography.Title level={5}>Dashboard</Typography.Title>
  </>
)

Dashboard.layout = (page) => <Layout title="Dashboard">{page}</Layout>
export default Dashboard
