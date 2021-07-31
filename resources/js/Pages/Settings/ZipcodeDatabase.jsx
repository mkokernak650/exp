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

const ZipcodeDatabase = () => {
  const { allZipcodes } = usePage().props;
  const [inboundIds, setInbounIds] = useState([]);
  const classes = useStyles();
  const [showModal, setShowModal] = React.useState({ open: false });
  const openModal = () => {
    setShowModal({ open: true });
  };
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

  const importHandler = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    // post(route('zipcode.data'), form)
    Inertia.post(route("zipcode.data.import"), form);
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

ZipcodeDatabase.layout = (page) => (
  <Layout title="Zipcode Database">{page}</Layout>
);
export default ZipcodeDatabase;
