import { React, useState } from 'react';
import Layout from '../Layout/Layout';
import { CircularProgress, Paper, Typography, TextField, Button, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import FileImportMap from './FileImportMap';
import * as XLSX from 'xlsx';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/inertia-react';
import toast from 'react-hot-toast';
import { exportReportAlreadyExist } from '../../Helpers/ExportReport';
import Note from '../../Components/Note';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '600px',
    margin: 'auto',
    marginTop: '2rem',
    padding: '40px',
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  title: {
    textAlign: 'center',
    marginBottom: '35px',
  },
  snackbar: {
    maxWidth: '500px',
  },
}));

const SalesImport = () => {
  const defaultState = {
    campaign_id: '',
    customer_id: '',
    order_type: '',
    file: '',
  };
  const classes = useStyles();
  const [values, setValues] = useState(defaultState);
  const [loading, setLoading] = useState({ import: false, fieldMap: false, gettingFieldsMap: false });
  const [fileSelected, setFileSelected] = useState(false);
  const [fieldMap, setFieldMap] = useState([]);
  const [reportFields, setReportFields] = useState([]);
  const { campaigns, customers } = usePage().props;
  const [fieldsMapSaveError, setFieldsMapSaveError] = useState('')
  const [savedFieldsMap, setSavedFieldsMap] = useState(null)
  const [applyKeyChecked, setApplyKeyChecked] = useState(false)

  const handleFile = (file) => {
    // Boilerplate to set up FileReader
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = (e) => {
      // Parse data
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      // Get first worksheet
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // Convert array of arrays
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Update state
      setReportFields(data);
      setFileSelected(true);
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  };

  const generateReportFields = () => {
    let newFieldMap = [];

    reportFields[0] &&
      reportFields[0].forEach((item) => {
        newFieldMap.push({ applicationField: '', reportField: item });
      });

    setFieldMap([...newFieldMap]);
    setApplyKeyChecked(false)
  }

  useEffect(() => {
    generateReportFields()
  }, [reportFields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((oldValues) => ({ ...oldValues, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target?.files[0] !== undefined) {
      const { name, files } = e.target;
      handleFile(e.target.files[0]);
      setValues((oldValues) => ({ ...oldValues, [name]: files[0] }));
    } else {
      setFileSelected(false);
      setReportFields([]);
      setValues((oldValues) => ({ ...oldValues, [e.target.name]: '' }));
    }
  };

  const checkMappedFields = () => {
    const checkedField = fieldMap?.filter((item) => !item.applicationField || !item.reportField);

    const shippingZipIndex = fieldMap?.findIndex(
      (item) => item.applicationField === 'shipping_zip'
    );

    if (checkedField.length > 0 || shippingZipIndex < 0) return false;
    return true;
  };

  const headers = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkMappedFields()) {
      toast.error('Please map all fields');
      return;
    }

    setLoading((oldValues) => ({ ...oldValues, import: true }))
    const formData = new FormData();
    formData.append('file', values.file);
    formData.append('campaign_id', values.campaign_id);
    formData.append('customer_id', values.customer_id);
    formData.append('order_type', values.order_type);
    formData.append('fieldMap', JSON.stringify(fieldMap));

    axios
      .post(route('ecommerce-sales.importStore'), formData, headers)
      .then((res) => {
        setFileSelected(false);
        setReportFields([]);
        setValues(defaultState);
        e.target.reset();

        if (res.data?.alreadyExists) {
          exportReportAlreadyExist(res.data.alreadyExists);
        }
        setLoading((oldValues) => ({ ...oldValues, import: false }))
        toast.success(res.data.msg, { duration: 10000 });
      })
      .catch((err) => {
        let errors = '';
        if (err.response.data?.errors) {
          Object.values(err.response.data?.errors).map((error) => {
            errors += error[0] + '\n';
          });
        } else if (err.response.data?.msg) {
          errors = err.response.data.msg;
        }
        setLoading((oldValues) => ({ ...oldValues, import: false }))
        toast.error(errors, { duration: 5000 });
      });
  };

  const addFieldMap = (i) => {
    const newFieldMap = [...fieldMap];
    newFieldMap.splice(i, 0, {});
    setFieldMap([...newFieldMap]);
  };

  const saveOrUpdateFieldsMap = () => {
    setFieldsMapSaveError('')
    setLoading((oldValues) => ({ ...oldValues, fieldMap: true }))

    axios.post(route('sales.import.save.fields.map'), { values, fieldMap })
      .then((response) => {
        if (response.data.success === false && response.data.responseType === 'empty') {
          setFieldsMapSaveError(response.data.msg)
        } else if (response.data.success === true) {
          toast.success(response.data.msg)
        }
        setLoading((oldValues) => ({ ...oldValues, fieldMap: false }))
      }).catch((err) => {
        console.log(err)
        toast.error('Something went wrong!')
        setLoading((oldValues) => ({ ...oldValues, fieldMap: false }))
      })
  }

  const getFieldsMap = () => {
    const data = {
      campaign_id: values.campaign_id,
      customer_id: values.customer_id,
      order_type: values.order_type,
    }

    setLoading((oldValues) => ({ ...oldValues, gettingFieldsMap: true }))

    axios.post(route('sales.import.get.fields.map'), data)
      .then((response) => {
        if (response.data.success) {
          setSavedFieldsMap(response.data.data)
        } else if (!response.data.success) {
          setSavedFieldsMap([])
        }
        setLoading((oldValues) => ({ ...oldValues, gettingFieldsMap: false }))
      }).catch((err) => {
        console.log(err)
        setLoading((oldValues) => ({ ...oldValues, gettingFieldsMap: false }))
      })
  }

  useEffect(() => {
    if (values.campaign_id && values.customer_id && values.order_type) {
      generateReportFields()
      getFieldsMap()
    } else {
      setSavedFieldsMap(null)
    }
  }, [values.campaign_id, values.customer_id, values.order_type])

  const showApplyFieldsMap = () => {
    let message = ''

    if (loading.gettingFieldsMap) {
      message = (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress color="inherit" thickness={3} size="0.8rem" style={{ marginRight: '5px' }} /> Fetching fields map...
        </div >
      )
    } else if (savedFieldsMap === null) {
      message = (
        <div>For applying <b>key</b> (fields map), select <b>campaign</b>, <b>customer</b>, and <b>order type</b> first.</div>
      )
    } else if (savedFieldsMap.length && fileSelected) {
      message = (
        <div>
          <span style={{ marginRight: '5px' }}>
            Key (fields map) available.
          </span>
          <FormControlLabel
            control={
              <Checkbox
                checked={applyKeyChecked}
                onChange={handleApplyKeyChange}
                name="apply_key"
                color="primary"
              />
            }
            label="Apply key"
          />
        </div>
      )
    } else if (savedFieldsMap.length && !fileSelected) {
      message = 'Key (fields map) available, select a file to apply it.'
    } else if (!savedFieldsMap.length) {
      message = 'No Key found! You can save new after completing field map.'
    }

    return message
  }

  const handleApplyKeyChange = (e) => {
    if (e.target.checked) {
      setFieldMap(savedFieldsMap)
      setApplyKeyChecked(current => !current)
    } else {
      generateReportFields()
    }
  }

  return (
    <>
      <Helmet title="Import Sales Report" />
      <Note>
        Remember to <b>Create all Coupon/Dialed Phone</b>, otherwise report will be wrong. <br />
        <br />
        <b>Caution:</b> For CSV import, pick the call date and call time both; otherwise, an error will be generated.
        Additionally, if the date format is incorrect, the order will be uploaded with the current date.
      </Note >
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Import Sales Report
        </Typography>
        <form validate="true" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} style={{ paddingBottom: '5px' }}>
              <TextField
                value={values?.campaign_id}
                id="campaign_id"
                select
                name="campaign_id"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                label="Select Campaign"
                variant="outlined"
                size="small"
                fullWidth
                required={true}
              >
                <option value=""></option>
                {campaigns.map((option, indx) => (
                  <option key={indx + `-1`} value={option.id}>
                    {option.campaign_name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: '5px' }}>
              <TextField
                value={values?.customer_id}
                id="customer_id"
                select
                name="customer_id"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                label="Select Customer"
                variant="outlined"
                size="small"
                fullWidth
                required={true}
              >
                <option value=""></option>
                {customers.map((option, indx) => (
                  <option key={indx + `-2`} value={option.id}>
                    {option.customer_name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: '5px' }}>
              <TextField
                value={values?.order_type}
                id="order_type"
                select
                name="order_type"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                label="Select Order Type"
                variant="outlined"
                size="small"
                fullWidth
                required={true}
              >
                <option value=""></option>
                <option value="1">E-commerce</option>
                <option value="2">Phone</option>
              </TextField>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: '5px' }}>
              <label htmlFor="file">Select Sales Report</label>
              <TextField
                id="file"
                type="file"
                name="file"
                onChange={handleFileChange}
                className={classes.textField}
                fullWidth
                variant="outlined"
                size="small"
                required={true}
              />
              <small>
                <b>Supported File Type: csv, xlsx</b>
              </small>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: '5px' }} >
              {/* to be uncommented */}
              {/* <div className="apply-fields-map">
                {showApplyFieldsMap()}
              </div> */}
              {/* to be uncommented */}
            </Grid>
            {fileSelected && (
              <Grid item xs={12}>
                <div className="flx flx-around mt-4 mb-2" style={{ marginRight: 40 }}>
                  <b>Application Field</b>
                  <b>Report Field</b>
                </div>
                {fieldMap &&
                  fieldMap.map((reminderItem, index) => (
                    <FileImportMap
                      key={`r-fm-${index + 9}`}
                      index={index}
                      reminderField={reminderItem}
                      fieldMap={fieldMap}
                      setFieldMap={setFieldMap}
                      reportFields={reportFields}
                    />
                  ))}
                <div className="txt-center w-full mt-2" style={{ transform: 'translateX(-16px)' }}>
                  <button
                    onClick={() => addFieldMap(fieldMap.length)}
                    className="icn-btn sh-sm"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </Grid>
            )}
          </Grid>
          <Grid container justifyContent="flex-end" style={{ marginTop: '20px' }}>
            {/* to be uncommented */}
            {/* <Grid item style={{ marginRight: '8px' }}>
              <Button
                variant="outlined"
                color={fieldsMapSaveError ? 'secondary' : 'primary'}
                type="button"
                disabled={!checkMappedFields() || !values.campaign_id || !values.customer_id || !values.order_type || loading.fieldMap || loading.import}
                onClick={saveOrUpdateFieldsMap}
              >
                {loading.fieldMap &&
                  <CircularProgress color="inherit" thickness={3} size="1.2rem" style={{ marginRight: '5px' }} />}
                {savedFieldsMap?.length ? 'Update' : 'Save'} Fields Map
              </Button>
            </Grid> */}
            {/* to be uncommented */}
            <Grid item>
              <Button
                disabled={!checkMappedFields() || loading.import || loading.fieldMap}
                variant="contained"
                color="primary"
                type="submit"
              >
                {loading.import &&
                  <CircularProgress color="inherit" thickness={3} size="1.2rem" style={{ marginRight: '5px' }} />}
                Import
              </Button>
            </Grid>
          </Grid>
        </form>
        {fieldsMapSaveError &&
          <div className="fields-map-save-error">{fieldsMapSaveError}</div>
        }
      </Paper>
    </>
  );
};

SalesImport.layout = (page) => <Layout title="Import Sales Report">{page}</Layout>;
export default SalesImport;
