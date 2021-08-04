import React, { useState } from "react";
import {
  CssBaseline,
  Button,
  makeStyles,
  Snackbar,
  CircularProgress,
} from "@material-ui/core";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import axios from "axios";
import MuiAlert from "@material-ui/lab/Alert";
import { Helmet } from "react-helmet";

const useStyles = makeStyles((theme) => ({
  button: {
    minWidth: "134px",
    textTransform: "capitalize",
    fontSize: "14px",
  },
  topBtn: {
    display: "flex",
    gap: "10px",
    marginLeft: "10px",
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
  const [loading, setLoading] = useState(false);
  const [annotationLoading, setAnnotationLoading] = useState(false);


  const newCallCallLogs = allCallLogs.map((item, indx) => {
    return {
      SN: item.SN,
      Call_Date: item.Call_Date_Time,
      Has_Annotation: item.Has_Annotation,
      Annotation_Tag: item.Annotation_Tag,
      Call_Status: item.call_Logs_status,
      Duplicate_Call: item.Duplicate_Call,
      Recording_Url: (
        <a target="_blank" href={item.Recording_Url}>
          Recording URL
        </a>
      ),
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
      Header: "Duplicate Call",
      accessor: "Duplicate_Call",
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
    return <div></div>;
  };

  const deleteHandler = () => {};

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handlePending = () => {
    console.log(inboundIds);
    axios
      .post(route("add.pending.bill.call"), { inboundIds })
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

  const handleArchived = () => {
    console.log(inboundIds);
    axios
      .post(route("add.arichived.bill.call"), { inboundIds })
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

  const handleUpdate = () => {
    setLoading(true);
    axios
      .post(route("update-data"), { inboundIds })
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setSuccess("Successfully Updated");
          setOpen(true);
          setMainData(res.data);
          setInbounIds([]);
        } else {
          setSuccess(res.data.msg);
          setOpen(true);
        }
      })
      .catch((err) => {});
  };

  const handleAnnotation = () => {
    setAnnotationLoading(true);

    axios
      .post(route("update.annotation"), { inboundIds })
      .then((res) => {
        setAnnotationLoading(false);
        if (res.status === 200) {
          setSuccess("Successfully Updated");
          setOpen(true);
          setMainData(res.data);
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
      <Helmet title="Call Logs Report" />
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
            onClick={handleUpdate}
          >
            {loading ? (
              <CircularProgress
                color="secondary"
                size="1.5rem"
                thickness="2.6"
              />
            ) : (
              "Update"
            )}
          </Button>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
            onClick={handleAnnotation}
          >
            {annotationLoading ? (
              <CircularProgress
                color="secondary"
                size="1.5rem"
                thickness="2.6"
              />
            ) : (
              "   Get Annotation"
            )}
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
