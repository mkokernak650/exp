import React, { useState } from "react";
import { CssBaseline, Button, makeStyles, Snackbar } from "@material-ui/core";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import axios from "axios";
import MuiAlert from "@material-ui/lab/Alert";

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
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const CallLogsReport = () => {
  const classes = useStyles();
  const { allCallLogs } = usePage().props;
  const [inboundIds, setInbounIds] = useState([]);
  const [success, setSuccess] = useState();
  const [open, setOpen] = useState(false);

  const newCallCallLogs = allCallLogs.map((item, indx) => {
    return {
      SN: item.SN,
      Call_Date: item.Call_Date_Time,
      Has_Annotation: item.Has_Annotation,
      Annotation_Tag: item.Annotation_Tag,
      Call_Status: item.call_Logs_status,
      Recording_Url: item.Recording_Url,
      Time: item.Call_Date_Time,
      Inbound_Id: item.Inbound_Id,
      Affiliate: item.Affiliate,
      Market: item.Market,
      Campaign: item.Campaign,
      Inbound: item.Inbound,
      Dialed: item.Dialed,
      Type: item.Type,
      Customer: item.Customer,
      Target: item.Target,
      Target_Description: item.Target_Description,
      Source_Hangup: item.Source_Hangup,
      Conn_Duration: item.Conn_Duration,
      Time_To_Call: item.Time_To_Call,
      Call_Length_In_Seconds: item.call_Length_In_Seconds,
      Revenue: item.Revenue,
      Payout: item.payoutAmount,
      Total_Cost: item.Total_Cost,
      Profit: item.Profit,
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

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  const handlePending = () => {
    axios
      .post(route("add.pending.bill.call"), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setSuccess(res.data.msg);
          setOpen(true);
          const a = [...mainData];
          console.log(a);

          for (let i = 0; i < Object.keys(a).length; i++) {
            if (Object.values(Object.values(a)[i]).includes(inboundIds[0])) {
              delete a[i];
              inboundIds.splice(0, 1);
              console.log(inboundIds);
            }
          }
          console.log(a);
          setMainData(a);
        } else {
          setSuccess(res.data.msg);
          setOpen(true);
        }
      })
      .catch((err) => {});
  };

  const handleArchived = () => {
    Inertia.post(route("add.arichived.bill.call"), { inboundIds });
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
        inboundIds={inboundIds}
      >
        <div className={classes.topBtn}>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
            onClick={handlePending}
          >
            Pending
          </Button>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
            onClick={handleArchived}
          >
            Archived
          </Button>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
            onClick={handleArchived}
          >
            Update
          </Button>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
            onClick={handleArchived}
          >
            Get Annotation
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
