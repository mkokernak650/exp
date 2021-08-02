import React, { useState } from "react";
import {
  CssBaseline,
  makeStyles,
  Button,
  Snackbar,
  CircularProgress,
  TextField,
} from "@material-ui/core";
import EnhancedTable from "../../components/EnhancedTable";
import Layout from "../Layout/Layout";
import { usePage } from "@inertiajs/inertia-react";
import NormalModal from "../../Shared/NormalModal";
import { Helmet } from "react-helmet";
import MuiAlert from "@material-ui/lab/Alert";
import axios from "axios";

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
  import: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ZipcodeByTelevisionMarketNew = () => {
  const classes = useStyles();
  const { allZipcodesByTelevisionMarket } = usePage().props;
  const [inboundIds, setInbounIds] = useState([]);
  const [importModal, setImportModal] = useState({ open: false });
  const [exportModal, setExportModal] = useState({ open: false });
  const [response, setResponse] = useState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(null);
  const [type, setType] = useState(null);

  const openImportModal = () => {
    setImportModal({ open: true });
  };
  const openExportModal = () => {
    setExportModal({ open: true });
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
  const [skipPageReset, setSkipPageReset] = useState(false);

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
    return (
      <div className={classes.topBtn}>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={openImportModal}
        >
          Import
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={openExportModal}
        >
          Export
        </Button>
      </div>
    );
  };

  const handleImportChange = (e) => {
    setValue(e.target.files[0]);
  };

  const handleExportChange = (e) => {
    setType(e.target.value);
  };

  const importHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("importfile", value);
    axios
      .post(route("zipcode.television.market.import"), formData)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setImportModal({ open: false });
          setResponse("Imported Successfully");
          setOpen(true);
        } else {
          setResponse("Import failed");
        }
      })
      .catch((err) => {});
  };

  const exportHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(route("zipcode.television.market.export"), { type })
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setImportModal({ open: false });
          setResponse("Exported Successfully");
          setOpen(true);
        } else {
          setResponse("Export failed");
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Helmet title="Zipcode Television Market" />
      <CssBaseline />
      <EnhancedTable
        columns={columns}
        data={mainData}
        setData={setMainData}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
        TableTitle={TableTitle}
        inboundIds={inboundIds}
        setInbounIds={setInbounIds}
      ></EnhancedTable>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        className={classes.snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success">{response}</Alert>
      </Snackbar>

      <NormalModal
        open={importModal.open}
        setOpen={setImportModal}
        width={"500px"}
        title={""}
      >
        <div className={classes.import}>
          <input
            id="importfile"
            type="file"
            name="importfile"
            onChange={handleImportChange}
          />
          <Button variant="contained" color="primary" onClick={importHandler}>
            {loading ? (
              <CircularProgress color="secondary" thickness="3" size="2rem" />
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </NormalModal>

      <NormalModal
        open={exportModal.open}
        setOpen={setExportModal}
        width={"500px"}
        title={""}
      >
        <div className={classes.import}>
          <TextField
            id="standard-select-currency-native"
            select
            name="market"
            onChange={handleExportChange}
            SelectProps={{
              native: true,
            }}
            fullWidth
            required="true"
          >
            <option value="">Select Type</option>
            <option value="xlsx">XLSX</option>
            <option value="csv">CSV</option>
            <option value="xlx">XLX</option>
            <option value="tsv">TSV</option>
          </TextField>
          <Button variant="contained" color="primary" onClick={exportHandler}>
            {loading ? (
              <CircularProgress color="secondary" thickness="3" size="2rem" />
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </NormalModal>
    </div>
  );
};

ZipcodeByTelevisionMarketNew.layout = (page) => (
  <Layout title="Zipcode Database">{page}</Layout>
);
export default ZipcodeByTelevisionMarketNew;
