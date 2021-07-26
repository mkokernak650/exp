import React, { useState } from "react";
import { CssBaseline, Button, makeStyles } from "@material-ui/core";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import { Helmet } from 'react-helmet'

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
const range = (len) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth];
    return range(len).map((d) => {
      return {
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };
  return makeDataLevel();
}

const ArchivedCallLogReports = () => {
  const classes = useStyles();
  const { archivedCallLogs } = usePage().props;

  const newCallCallLogs = archivedCallLogs.map((item, indx) => {
    return {
      SN: item.SN,
      Campaign: item.Campaign,
      "Call Date": item.Call_Date_Time,
      "Call Date Time": item.Call_Date_Time,
      "Conn. Duration": item.Conn_Duration,
      "Call Length In Seconds": item.call_Length_In_Seconds,
      Customer: item.Customer,
      Target: item.Target,
      "Target Description": item.Target_Description,
      Affiliate: item.Affiliate,
      Market: item.Market,
      Revenue: item.Revenue,
      Payout: item.payoutAmount,
      "Total Cost": item.Total_Cost,
      Profit: item.Profit,
      "Inbound Id": item.Inbound_Id,
      Inbound: item.Inbound,
      Time: item.Call_Date_Time,
      Dialed: item.Dialed,
      Type: item.Type,
      City: item.City,
      State: item.State,
      Zipcode: item.Zipcode,
    };
  });
  const [mainData, setMainData] = useState(newCallCallLogs);
  const columns = [
    {
      Header: "SN",
      accessor: "SN",
    },
    {
      Header: "Campaign",
      accessor: "Campaign",
    },
    {
      Header: "Call Date",
      accessor: "Call Date",
    },
    {
      Header: "Call Date Time",
      accessor: "Call Date Time",
    },
    {
      Header: "Conn. Duration",
      accessor: "Conn. Duration",
    },
    {
      Header: "Call Length In Seconds",
      accessor: "Call Length In Seconds",
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
      accessor: "Target Description",
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
      Header: "Revenue",
      accessor: "Revenue",
    },
    {
      Header: "Payout",
      accessor: "Payout",
    },
    {
      Header: "Total Cost",
      accessor: "Total Cost",
    },
    {
      Header: "Profit",
      accessor: "Profit",
    },
    {
      Header: "Inbound",
      accessor: "Inbound",
    },
    {
      Header: "Inbound Id",
      accessor: "Inbound Id",
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

  const [data, setData] = React.useState(React.useMemo(() => makeData(20), []));

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

  return (
    <div>
       <Helmet title="Archive Call Logs"/>

      <CssBaseline />
      <EnhancedTable
        columns={columns}
        data={mainData}
        setData={setMainData}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
      >
        {" "}
        <div className={classes.topBtn}>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
          >
            Move Call Log
          </Button>
        </div>
      </EnhancedTable>
    </div>
  );
};

ArchivedCallLogReports.layout = (page) => (
  <Layout title="Archived Call Log Reports">{page}</Layout>
);
export default ArchivedCallLogReports;
