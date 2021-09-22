import { Helmet } from "react-helmet";
import { Typography } from "@material-ui/core";
import Layout from "../Layout/Layout";
const Dashboard = () => (
  <>
    <Helmet>
      <title>Consumer EXP</title>
    </Helmet>
    <Typography variant="h5">Dashboard</Typography>
  </>
);

Dashboard.layout = (page) => <Layout title="Dashboard">{page}</Layout>;
export default Dashboard;
