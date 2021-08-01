import React, { useState } from "react";
import { CssBaseline, Button, makeStyles, Snackbar } from "@material-ui/core";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import MuiAlert from "@material-ui/lab/Alert";
import { Helmet } from "react-helmet";
import axios from "axios";
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

const ArchivedCallLogReports = () => {
  const classes = useStyles();
  const { archivedCallLogs } = usePage().props;
  const [inboundIds, setInbounIds] = useState([]);
  const [success, setSuccess] = useState();
  const [open, setOpen] = useState(false);

  const newCallCallLogs = archivedCallLogs.map((item, indx) => {
    return {
      SN: item.SN,
      Campaign: item.Campaign,
      Call_Date: item.Call_Date_Time,
      Call_Date_Time: item.Call_Date_Time,
      Conn_Duration: item.Conn_Duration,
      Call_Length_In_Seconds: item.call_Length_In_Seconds,
      Customer: item.Customer,
      Target: item.Target,
      Target_Description: item.Target_Description,
      Affiliate: item.Affiliate,
      Market: item.Market,
      Revenue: item.Revenue,
      Payout: item.payoutAmount,
      Total_Cost: item.Total_Cost,
      Profit: item.Profit,
      Inbound_Id: item.Inbound_Id,
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
      accessor: "Call_Date",
    },
    {
      Header: "Call Date Time",
      accessor: "Call_Date_Time",
    },
    {
      Header: "Conn. Duration",
      accessor: "Conn_Duration",
    },
    {
      Header: "Call Length In Seconds",
      accessor: "Call_Length_In_Seconds",
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
      accessor: "Total_Cost",
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
  const TableTitle = () => {
    return <div></div>;
  };
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
  const importHandler = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    Inertia.post(route("zipcode.data.import"), form);
  };
  const MoveCallLog = () => {
    axios
      .post(route("archived.to.call.log"), { inboundIds })
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

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  return (
    <div>
      <Helmet title="Archive Call Logs" />
      <CssBaseline />
      <EnhancedTable
        columns={columns}
        data={mainData}
        setData={setMainData}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
        TableTitle={TableTitle}
        inboundIds={inboundIds}
      >
        {" "}
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

ArchivedCallLogReports.layout = (page) => (
  <Layout title="Archived Call Log Reports">{page}</Layout>
);
export default ArchivedCallLogReports;
