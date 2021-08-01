import React, { useState } from "react";
import { CssBaseline, makeStyles, Button } from "@material-ui/core";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import NormalModal from "../../Shared/NormalModal";
import { Inertia } from "@inertiajs/inertia";

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
  importForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
}));

const ZipcodeByTelevisionMarketNew = () => {
  const { allZipcodesByTelevisionMarket } = usePage().props;
  const [inboundIds, setInbounIds] = useState([]);
  const classes = useStyles();
  const [showModal, setShowModal] = React.useState({ open: false });
  const openModal = () => {
    setShowModal({ open: true });
  };
  const newAllZipcodesByTelevisionMarket = allZipcodesByTelevisionMarket.map(
    (item, indx) => {
      return {
        SL: indx + 1,
        market: item.market,
        state: item.state,
        county: item.county,
        city: item.city,
        population: item.population,
        zipcode: item.zip_code,
        fips: item.fips,
        median_household_income_2007_2011:
          item.median_household_income_2007_2011,
        race_americanindian: item.race_americanindian,
        race_asian: item.race_asian,
        race_white: item.race_white,
        race_black: item.race_black,
        race_hawaiian: item.race_hawaiian,
        race_hispanic: item.race_hispanic,
        race_other: item.race_other,
      };
    }
  );
  const [mainData, setMainData] = useState(newAllZipcodesByTelevisionMarket);
  const columns = [
    {
      Header: "SL",
      accessor: "SL",
    },
    {
      Header: "Market",
      accessor: "market",
    },
    {
      Header: "State",
      accessor: "state",
    },
    {
      Header: "County",
      accessor: "county",
    },
    {
      Header: "City",
      accessor: "city",
    },

    {
      Header: "Population",
      accessor: "population",
    },
    {
      Header: "ZipCode",
      accessor: "zipcode",
    },
    {
      Header: "Fips",
      accessor: "fips",
    },
    {
      Header: "Median_household_income_2007_2011",
      accessor: "median_household_income_2007_2011",
    },
    {
      Header: "Race_americanindian",
      accessor: "race_americanindian",
    },
    {
      Header: "Race_asian",
      accessor: "race_asian",
    },
    {
      Header: "Race_white",
      accessor: "race_white",
    },
    {
      Header: "Race_black",
      accessor: "race_black",
    },
    {
      Header: "Race_hawaiian",
      accessor: "race_hawaiian",
    },
    {
      Header: "Race_hispanic",
      accessor: "race_hispanic",
    },
    {
      Header: "Race_other",
      accessor: "race_other",
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

  const importHandler = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    Inertia.post(route("zipcode.television.market.import"), form);
  };
  const TableTitle = () => {
    return (
      <div className={classes.topBtn}>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={openModal}
        >
          Import
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
        >
          Export
        </Button>
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
        inboundIds={inboundIds}
      ></EnhancedTable>
      <NormalModal
        open={showModal.open}
        setOpen={setShowModal}
        width={"500px"}
        title={""}
      >
        <div className="myprofile">
          <form
            className={classes.importForm}
            method="post"
            encType="multipart/form-data"
            onSubmit={importHandler}
          >
            <input id="importfile" type="file" name="importfile" />
            <Button variant="contained" type="submit" color="primary">
              Next
            </Button>
          </form>
        </div>
      </NormalModal>
    </div>
  );
};

ZipcodeByTelevisionMarketNew.layout = (page) => (
  <Layout title="Zipcode Database">{page}</Layout>
);
export default ZipcodeByTelevisionMarketNew;
