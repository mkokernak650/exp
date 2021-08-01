import React, { useState } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import { Helmet } from "react-helmet";

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

const TableTitle = () => {
  return <div></div>;
};

const Targets = () => {
  const { allTargets } = usePage().props;

  const newTargets = allTargets.map((item, indx) => {
    return {
      SL: indx + 1,
      Customer: item.Customer,
      Ringba_Target_Name: item.Ringba_Targets_Name,
      Description: item.Description,
    };
  });
  const [mainData, setMainData] = useState(newTargets);
  const columns = [
    {
      Header: "SL",
      accessor: "SL",
    },
    {
      Header: "Customer",
      accessor: "Customer",
    },
    {
      Header: "Ringba Target Name",
      accessor: "Ringba_Target_Name",
    },
    {
      Header: "Description",
      accessor: "Description",
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
      <Helmet title="Targets" />
      <CssBaseline />
      <EnhancedTable
        columns={columns}
        data={mainData}
        setData={setMainData}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
        TableTitle={TableTitle}
      />
    </div>
  );
};

Targets.layout = (page) => <Layout title="Targets">{page}</Layout>;
export default Targets;
