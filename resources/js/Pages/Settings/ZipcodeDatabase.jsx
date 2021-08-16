import React, { useState } from "react";
import {
  CssBaseline,
  makeStyles,
  Button,
  Snackbar,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
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

const ZipcodeDatabase = () => {
  const classes = useStyles();
  const { allZipcodes } = usePage().props;
  const [inboundIds, setInbounIds] = useState([]);
  const [importModal, setImportModal] = useState({ open: false });
  const [exportModal, setExportModal] = useState({ open: false });
  const openImportModal = () => {
    setImportModal({ open: true });
  };
  const openExportModal = () => {
    setExportModal({ open: true });
  };
  const [response, setResponse] = useState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const newZipcodes = allZipcodes.map((item, indx) => {
    return {
      SL: indx + 1,
      NPA: item.NPA,
      NXX: item.NXX,
      NPANXX: item.NPANXX,
      ZipCode: item.ZipCode,
      State: item.State,
      City: item.City,
      County: item.County,
      CountyPop: item.CountyPop,
      ZipCodeCount: item.ZipCodeCount,
      ZipCodeFreq: item.ZipCodeFreq,
      Latitude: item.Latitude,
      Longitude: item.Longitude,
      TimeZone: item.TimeZone,
      ObservesDST: item.ObservesDST,
      NXXUseType: item.NXXUseType,
      NXXIntroVersion: item.NXXIntroVersion,
      NPANew: item.NPANew,
      FIPS: item.FIPS,
      Status: item.Status,
      LATA: item.LATA,
      Overlay: item.Overlay,
      RateCenter: item.RateCenter,
      SwitchCLLI: item.SwitchCLLI,
      MSA_CBSA: item.MSA_CBSA,
      MSA_CBSA_CODE: item.MSA_CBSA_CODE,
      OCN: item.OCN,
      Company: item.Company,
      CoverageAreaName: item.CoverageAreaName,
      Flags: item.Flags,
      WeightedLat: item.WeightedLat,
      WeightedLon: item.WeightedLon,
    };
  });
  const [mainData, setMainData] = useState(newZipcodes);
  const columns = [
    {
      Header: "SL",
      accessor: "SL",
    },
    {
      Header: "NPA",
      accessor: "NPA",
    },
    {
      Header: "NXX",
      accessor: "NXX",
    },
    {
      Header: "NPANXX",
      accessor: "NPANXX",
    },
    {
      Header: "ZipCode",
      accessor: "ZipCode",
    },
    {
      Header: "State",
      accessor: "State",
    },
    {
      Header: "City",
      accessor: "City",
    },
    {
      Header: "County",
      accessor: "County",
    },
    {
      Header: "CountyPop",
      accessor: "CountyPop",
    },
    {
      Header: "ZipCodeCount",
      accessor: "ZipCodeCount",
    },
    {
      Header: "ZipCodeFreq",
      accessor: "ZipCodeFreq",
    },
    {
      Header: "Latitude",
      accessor: "Latitude",
    },
    {
      Header: "Longitude",
      accessor: "Longitude",
    },
    {
      Header: "TimeZone",
      accessor: "TimeZone",
    },
    {
      Header: "ObservesDST",
      accessor: "ObservesDST",
    },
    {
      Header: "NXXUseType",
      accessor: "NXXUseType",
    },
    {
      Header: "NXXIntroVersion",
      accessor: "NXXIntroVersion",
    },
    {
      Header: "NPANew",
      accessor: "NPANew",
    },
    {
      Header: "FIPS",
      accessor: "FIPS",
    },
    {
      Header: "Status",
      accessor: "Status",
    },
    {
      Header: "LATA",
      accessor: "LATA",
    },
    {
      Header: "Overlay",
      accessor: "Overlay",
    },
    {
      Header: "RateCenter",
      accessor: "RateCenter",
    },
    {
      Header: "SwitchCLLI",
      accessor: "SwitchCLLI",
    },
    {
      Header: "MSA_CBSA",
      accessor: "MSA_CBSA",
    },
    {
      Header: "MSA_CBSA_CODE",
      accessor: "MSA_CBSA_CODE",
    },
    {
      Header: "OCN",
      accessor: "OCN",
    },
    {
      Header: "Company",
      accessor: "Company",
    },
    {
      Header: "CoverageAreaName",
      accessor: "CoverageAreaName",
    },
    {
      Header: "Flags",
      accessor: "Flags",
    },
    {
      Header: "WeightedLat",
      accessor: "WeightedLat",
    },
    {
      Header: "WeightedLon",
      accessor: "WeightedLon",
    },
  ];

  const [skipPageReset, setSkipPageReset] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [type, setType] = useState("xlsx");

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
          disabled={mainData == ""}
        >
          Import
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={openExportModal}
          disabled={mainData == ""}
        >
          Export
        </Button>
      </div>
    );
  };
  const handleImportChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleExportChange = (e) => {
    setType(e.target.value);
  };

  const importHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("importfile", selectedFile);
    axios
      .post(route("zipcode.data.import"), formData)
      .then((res) => {
        setSelectedFile(null);
        setLoading(false);
        if (res.status === 200) {
          setMainData(res.data);
          setImportModal({ open: false });
          setResponse("Imported Successfully");
          setOpen(true);
        } else {
          setResponse("Import failed");
        }
      })
      .catch((err) => {});
  };

  const triggerExportLink = (link) => {
    return window.open(link);
  };

  const baseUrl = window.location.origin;
  const exportHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .get(`${baseUrl}/zipcode-data-export/${type}`)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setExportModal({ open: false });
          triggerExportLink(res.request.responseURL);
          setResponse("Exported Successfully");
          setOpen(true);
        } else {
          setResponse("Exporting failed");
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Helmet title="Zipcode Database" />
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

          <Button
            variant="contained"
            color="primary"
            onClick={importHandler}
            disabled={!selectedFile}
          >
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
          <FormLabel component="legend">Select Type</FormLabel>
          <RadioGroup
            aria-label="type"
            name="type"
            value={type}
            onChange={handleExportChange}
          >
            <FormControlLabel value="xlsx" control={<Radio />} label="XLSX" />
            <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            <FormControlLabel value="xls" control={<Radio />} label="XLS" />
            <FormControlLabel value="tsv" control={<Radio />} label="TSV" />
          </RadioGroup>
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

ZipcodeDatabase.layout = (page) => (
  <Layout title="Zipcode Database">{page}</Layout>
);
export default ZipcodeDatabase;
