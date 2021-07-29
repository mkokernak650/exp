import React, { useState } from "react";
import { CssBaseline, Button, makeStyles } from "@material-ui/core";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import { Helmet } from "react-helmet";

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

const TempRingbaData = () => {
  const classes = useStyles();
  const { ringbaData } = usePage().props;

  const newRingbadata = ringbaData.map((item, indx) => {
    return {
      SL: indx,
      CallLog_columns: JSON.stringify(item.columns),
      CallLog_events: JSON.stringify(item.events),
      CallLog_Tags: JSON.stringify(item.tags),
    };
  });
  const [mainData, setRingbadata] = useState(newRingbadata);
  const columns = [
    {
      Header: "SL",
      accessor: "SL",
    },
    {
      Header: "CallLog_columns",
      accessor: "CallLog_columns",
    },
    {
      Header: "CallLog_events",
      accessor: "CallLog_events",
    },
    {
      Header: "CallLog_Tags",
      accessor: "CallLog_Tags",
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

  const TableTitle = () => {
    return <div></div>;
  };

  return (
    <div>
      <Helmet title="Temp Ringba Data" />
      <CssBaseline />
      <EnhancedTable
        columns={columns}
        data={mainData}
        setData={setRingbadata}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
        TableTitle={TableTitle}
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

TempRingbaData.layout = (page) => (
  <Layout title="TempRingbaData">{page}</Layout>
);
export default TempRingbaData;
