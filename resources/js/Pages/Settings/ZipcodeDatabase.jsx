import React, { useState } from "react";
import { CssBaseline, makeStyles } from "@material-ui/core";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";


const useStyles = makeStyles((theme) => ({
  topBtn: {
    display: "flex",
    gap: "10px",
    marginLeft: "10px",
  },
  button: {
    minWidth: "134px",
    textTransform: "capitalize",
    fontSize: "14px",
  },
}));

const CallLogsReport = () => {
  const { allCallLogs } = usePage().props;


  const newCallCallLogs = allCallLogs.map((item, indx) => {
    return {};
  });
  const [mainData, setMainData] = useState(newCallCallLogs);
  const columns = [
    {
      Header: "SN",
      accessor: "SN",
    },
    {
      Header: "Call Date",
      accessor: "Call_Date",
    },
    {
      Header: "Has Annotation",
      accessor: "Has_Annotation",
    },
    {
      Header: "Annotation Tag",
      accessor: "Annotation_Tag",
    },
    {
      Header: "Call Status",
      accessor: "Call_Status",
    },
    {
      Header: "Recording Url",
      accessor: "Recording_Url",
    },
    {
      Header: "Time",
      accessor: "Time",
    },
    {
      Header: "Inbound Id",
      accessor: "Inbound_Id",
    },
    {
      Header: "Affiliate",
      accessor: "Affiliate",
    },
    {
      Header: "Market",
      accessor: "Market",
    },
    {
      Header: "Campaign",
      accessor: "Campaign",
    },
    {
      Header: "Inbound",
      accessor: "Inbound",
    },
    {
      Header: "Dialed",
      accessor: "Dialed",
    },
    {
      Header: "Type",
      accessor: "Type",
    },
    {
      Header: "Customer",
      accessor: "Customer",
    },
    {
      Header: "Target",
      accessor: "Target",
    },
    {
      Header: "Target Description",
      accessor: "Target_Description",
    },
    {
      Header: "Source/Hangup",
      accessor: "Source_Hangup",
    },
    {
      Header: "Conn. Duration",
      accessor: "Conn_Duration",
    },
    {
      Header: "Time To Call",
      accessor: "Time_To_Call",
    },
    {
      Header: "Call Length In Seconds",
      accessor: "Call_Length_In_Seconds",
    },
    {
      Header: "Revenue",
      accessor: "Revenue",
    },
    {
      Header: "Payout",
      accessor: "Payout",
    },
    {
      Header: "Total Cost",
      accessor: "Total_Cost",
    },
    {
      Header: "Profit",
      accessor: "Profit",
    },
    {
      Header: "City",
      accessor: "City",
    },
    {
      Header: "State",
      accessor: "State",
    },
    {
      Header: "Zipcode",
      accessor: "Zipcode",
    },
  ];

  const [skipPageReset, setSkipPageReset] = React.useState(false);
  const updateMyData = (rowIndex, columnId, value) => {
    setSkipPageReset(true);
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };
      const TableTitle = () => {
    return (
      <div>

      </div>
    );
  };

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
      ></EnhancedTable>
    </div>
  );
};

CallLogsReport.layout = (page) => (
  <Layout title="Call Logs Report">{page}</Layout>
);
export default CallLogsReport;
