import { React, useState } from "react";
import Layout from "../Layout/Layout";
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { usePage } from "@inertiajs/inertia-react";
import axios from "axios";
import { Helmet } from "react-helmet";
import SnackBar from "../../Shared/SnackBar";
import FileImportMap from "./FileImportMap";
import XLSX from "xlsx";
import { useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    width: "600px",
    margin: "auto",
    marginTop: "5rem",
    padding: "40px",
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  title: {
    textAlign: "center",
    marginBottom: "35px",
  },
  snackbar: {
    maxWidth: "500px",
  },
}));

const SalesImport = () => {
  const classes = useStyles();
  const [values, setValues] = useState();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [responseType, setResponseType] = useState();
  const [fieldMap, setFieldMap] = useState([]);
  const [reportFields, setReportFields] = useState([]);
  const [cols, setCols] = useState([]);

  console.log('fieldMap', fieldMap);
  console.log('value', values);


  /* generate an array of column objects */
  const make_cols = refstr => {
    let o = [],
      C = XLSX.utils.decode_range(refstr).e.c + 1;
    for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i };
    return o;
  };

  const handleFile = (file) => {
    // Boilerplate to set up FileReader
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = e => {
      // Parse data
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
      // Get first worksheet
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // Convert array of arrays
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Update state
      setReportFields(data);
      setCols(make_cols(ws["!ref"]));
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    let newFieldMap = [];

    reportFields[0] && reportFields[0].forEach((item) => {
      newFieldMap.push({ applicationField: '', reportField: item });
    });

    setFieldMap([...newFieldMap]);
  }, [reportFields])

  const handleChange = (e) => {
    handleFile(e.target.files[0]);

    const { name, files } = e.target;
    setValues((oldValues) => ({
      ...oldValues,
      [name]: files[0],
    }));
  };

  const headers = {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('file', values.file);
    formData.append('fieldMap', JSON.stringify(fieldMap))
    formData.append('reportFields', JSON.stringify(reportFields))

    axios
      .post(route("ecommerce-sales.importStore"), formData, headers)
      .then((res) => {
        setLoading(false);
        setResponse(res.data.msg);
        setResponseType('success');
        setOpen(true);
      })
      .catch((err) => {
        let errors = '';
        setLoading(false);
        Object.values(err.response.data?.errors).map(error => {
          errors += error[0] + '\n';
        })
        setResponse(errors);
        setResponseType('error');
        setOpen(true);
      });
  };

  const addFieldMap = (i) => {
    const newFieldMap = [...fieldMap]
    newFieldMap.splice(i, 0, {})
    setFieldMap([...newFieldMap])
  }

  return (
    <>
      <Helmet title="Import Sales Report" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Import Sales Report
        </Typography>
        <form validate="true" onSubmit={handleSubmit} enctype="multipart/form-data">
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <label htmlFor="file">Select Sales Report</label>
              <TextField
                id="file"
                type="file"
                name="file"
                onChange={handleChange}
                className={classes.textField}
                fullWidth
                variant="outlined"
                required={true}
              />
            </Grid>

            <Grid item xs={12}>
              <div className="flx flx-around mt-4 mb-2" style={{ marginRight: 40 }}>
                <b>Application Field</b>
                <b>Report Field</b>
              </div>
              {
                fieldMap && fieldMap.map((reminderItem, index) => (
                  <FileImportMap key={`r-fm-${index + 9}`} index={index} reminderField={reminderItem} fieldMap={fieldMap} setFieldMap={setFieldMap} reportFields={reportFields} />
                ))
              }
              <div className="txt-center w-full mt-2" style={{transform: "translateX(-16px)"}}>
                <button onClick={() => addFieldMap(fieldMap.length)} className="icn-btn sh-sm" type="button">+</button>
              </div>
            </Grid>


            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                {loading ? <CircularProgress color="secondary" /> : "Save"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <SnackBar
        open={open}
        setOpen={setOpen}
        severity={responseType}
        response={response}
      />
    </>
  );
};

SalesImport.layout = (page) => (
  <Layout title="Import Sales Report">{page}</Layout>
);
export default SalesImport;
