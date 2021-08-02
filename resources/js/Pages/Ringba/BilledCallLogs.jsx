import React, { useState } from "react";
import { CssBaseline, Button, makeStyles, Snackbar } from "@material-ui/core";
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

const BilledCallLogs = () => {
  const classes = useStyles();
  const { billedCallLogs } = usePage().props;
  const [inboundIds, setInbounIds] = useState([]);
  const [success, setSuccess] = useState();
  const [open, setOpen] = useState(false);

  const newBilledCallLogs = billedCallLogs.map((item, indx) => {
    return {
      SN: item.SN,
      Recording_Url: (
        <a target="_blank" href={item.Recording_Url}>
          Recording URL
        </a>
      ),
      Added_Time: item.created_at,
      Call_Date_Time: item.Call_Date_Time,
      Call_Date: item.Call_Date,
      Duplicate_Call: item.Duplicate_Call,
      Customer: item.Customer,
      Affiliate: item.Affiliate,
      Market: item.Market,
      Campaign: item.Campaign,
      Inbound: item.Inbound,
      Inbound_Id: item.Inbound_Id,
      Dialed: item.Dialed,
      Type: item.Type,
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
      Call_Status: item.call_Logs_status,
      City: item.City,
      State: item.State,
      Zipcode: item.Zipcode,
      Annotation_Tag: item.Annotation_Tag,
      Has_Annotation: item.Has_Annotation,
    };
  });
  const [mainData, setMainData] = useState(newBilledCallLogs);
  const columns = [
    {
      Header: "SN",
      accessor: "SN",
    },
    {
      Header: "Added Time",
      accessor: "Added_Time",
    },
    {
      Header: "Recording Url",
      accessor: "Recording_Url",
    },
    {
      Header: "Call Date Time",
      accessor: "Call_Date_Time",
    },
    {
      Header: "Call Date ",
      accessor: "Call_Date",
    },
    {
      Header: "Duplicate Call",
      accessor: "Duplicate_Call",
    },
    {
      Header: "Customer",
      accessor: "Customer",
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
      Header: "Inbound Id",
      accessor: "Inbound_Id",
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
      Header: "Call Status",
      accessor: "Call_Status",
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
    {
      Header: "Has Annotation",
      accessor: "Has_Annotation",
    },
    {
      Header: "Annotation Tag",
      accessor: "Annotation_Tag",
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

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const TableTitle = () => {
    return <div></div>;
  };

  const handleAnnotation = () => {
    
    axios
      .post(route("billed.get.annotation"), { inboundIds })
      .then((res) => {
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
      <Helmet title="Billed Call Logs" />
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
            onClick={handleAnnotation}
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

BilledCallLogs.layout = (page) => (
  <Layout title="Billed Call Logs">{page}</Layout>
);
export default BilledCallLogs;
