import React, { useState } from "react";
import { CssBaseline, Button, makeStyles, Snackbar } from "@material-ui/core";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import MuiAlert from "@material-ui/lab/Alert";
import { Helmet } from "react-helmet";
import axios from "axios";
const useStyles = makeStyles(() => ({
  topBtn: {
    display: "flex",
    gap: "10px",
    marginLeft: "10px",
  },
  button: {
    width: 130,
    textTransform: "capitalize",
    fontSize: "14px",
  },
}));
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const CallLogsReport = () => {
  const classes = useStyles();
  const { results } = usePage().props;
  const [inboundIds, setInbounIds] = useState([]);
  const [success, setSuccess] = useState();
  const [open, setOpen] = useState(false);

  const newCallCallLogs = results.map((item, indx) => {
    return {
      SN: item.SN,
      Call_Date: item.Call_Date,
      Call_Date_Time: item.Call_Date_Time,
      Duplicate_Call: item.Duplicate_Call,
      Call_Status: item.call_Logs_status,
      Inbound_Id: item.Inbound_Id,
      Affiliate: item.Affiliate,
      Campaign: item.Campaign,
      Inbound: item.Inbound,
      Dialed: item.Dialed,
      Type: item.Type,
      Target: item.Target,
      Customer: item.Customer,
      Source_Hangup: item.Source_Hangup,
      Conn_Duration: item.Conn_Duration,
      Time_To_Call: item.Time_To_Call,
      Call_Length_In_Seconds: item.call_Length_In_Seconds,
      Revenue: item.Revenue,
      Payout: item.payoutAmount,
      Total_Cost: item.Total_Cost,
      Profit: item.Profit,
    };
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
      Header: "Call Date Time",
      accessor: "Call_Date_Time",
    },
    {
      Header: "Duplicate Call",
      accessor: "Duplicate_Call",
    },
    {
      Header: "Affiliate",
      accessor: "Affiliate",
    },
    {
      Header: "Campaign",
      accessor: "Campaign",
    },
    {
      Header: "Inbound Id",
      accessor: "Inbound_Id",
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
      Header: "Target",
      accessor: "Target",
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
      Header: "Call Status",
      accessor: "Call_Status",
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
    return <div></div>;
  };

  const MoveCallLog = () => {
    axios
      .post(route("move.from.pending.bill.to.ringba.call.log"), { inboundIds })
      .then((res) => {
        console.log(res);
        if (res.data.status_code === 200) {
          setSuccess(res.data.msg);
          setOpen(true);
          setMainData((oldData) =>
            oldData.filter((item) => !inboundIds.includes(item.Inbound_Id))
          );
          setInbounIds([]);
        } else {
          setSuccess(res.data.msg);
          setOpen(true);
        }
      })
      .catch((err) => {});
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleBilled = () => {
    axios
      .post(route("store.bill.call.logs"), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setSuccess(res.data.msg);
          setOpen(true);
          setMainData((oldData) =>
            oldData.filter((item) => !inboundIds.includes(item.Inbound_Id))
          );
          setInbounIds([]);
        } else {
          setSuccess(res.data.msg);
          setOpen(true);
        }
      })
      .catch((err) => {});
  };

  return (
    <div>
      <Helmet title="Pending Call Logs" />
      <CssBaseline />
      <EnhancedTable
        columns={columns}
        data={mainData}
        setData={setMainData}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
        inboundIds={inboundIds}
        TableTitle={TableTitle}
      >
        <div className={classes.topBtn}>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
            onClick={MoveCallLog}
          >
            Move Call Log
          </Button>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
            onClick={handleBilled}
          >
            Billed
          </Button>
        </div>
      </EnhancedTable>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        className={classes.snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </div>
  );
};

CallLogsReport.layout = (page) => (
  <Layout title="Call Logs Report">{page}</Layout>
);
export default CallLogsReport;
