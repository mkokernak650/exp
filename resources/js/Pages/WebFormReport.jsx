import React, { useState } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import EnhancedTable from "../components/EnhancedTable";
import Layout from "./Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";

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

const WebFormReport = () => {
  const { allReports } = usePage().props;

  const newReports = allReports.map((item, indx) => {
    return {
      SL: indx + 1,
      Company: item.company,
      Last_Name: item.lname,
      Email: item.email,
      Phone: item.phone,
      Skype: item.skype,
      Street: item.street,
      City: item.city,
      State: item.state,
      ZipCode: item.zipcode,
      Country: item.country,
      Website: item.website,
      Website: (
        <a target="_blank" href={item.website}>
          Website
        </a>
      ),
      Comment: item.comment,
      Created_Time: item.created_at,
    };
  });
  const [mainData, setMainData] = useState(newReports);
  const columns = [
    {
      Header: "SL",
      accessor: "SL",
    },
    {
      Header: "Company",
      accessor: "Company",
    },
    {
      Header: "Last Name",
      accessor: "Last_Name",
    },
    {
      Header: "Email",
      accessor: "Email",
    },
    {
      Header: "Phone",
      accessor: "Phone",
    },
    {
      Header: "Skype",
      accessor: "Skype",
    },
    {
      Header: "Street",
      accessor: "Street",
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
      Header: "ZipCode",
      accessor: "ZipCode",
    },
    {
      Header: "Country",
      accessor: "Country",
    },
    {
      Header: "Website",
      accessor: "Website",
    },
    {
      Header: "Comment",
      accessor: "Comment",
    },
    {
      Header: "Created Time",
      accessor: "Created_Time",
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

WebFormReport.layout = (page) => <Layout title="WebForm Report">{page}</Layout>;
export default WebFormReport;
