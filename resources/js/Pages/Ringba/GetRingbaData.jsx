import { React, useState } from "react"
import Layout from "../Layout/Layout"
import {
  CircularProgress,
  Typography,
  TextField,
  Button,
  makeStyles,
  Paper,
} from "@material-ui/core"
import { Helmet } from "react-helmet"
import { currentDate } from "../../Helpers/CurrentDate"
import { usePage } from "@inertiajs/inertia-react"
import axios from "axios"
import SnackBar from "../../Shared/SnackBar"


const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
    width: 600,
    margin: "auto",
    flexDirection: "column",
    marginTop: 60,
    textAlign: "center",
    padding: "20px",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300,
    margin: "10px",
  },
  button: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300,
    margin: "10px",
  },

  title: {
    textAlign: "center",
    marginBottom: "35px",
  },
}))

const GetRingbaData = () => {
  const classes = useStyles()
  const { lastDataFetchedDate } = usePage().props
  const [response, setResponse] = useState()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState({
    start_date:
      lastDataFetchedDate.length > 0
        ? lastDataFetchedDate[0].end_date
        : currentDate(),
    end_date: currentDate(),
  })
  const [loading, setLoading] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }))
  }




  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.post(route("temp-ringba-data"), values)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          setOpen(true)
          setResponse("Data Fetched Successfully")
        } else {
          setOpen(true)
          setResponse("Data Fetching Failed")
        }
      })
      .catch((err) => {
        setLoading(false)
        setOpen(true)
        setResponse("Data Fetching Failed")
      })
  }
  return (
    <div>
      <Helmet title="Get Ringba Data" />
      <Paper className={classes.container}>
        <Typography variant="h5" className={classes.title}>
          Fetch Ringba Data
        </Typography>
        <form validate="true" onSubmit={handleSubmit}>
          <TextField
            id="date"
            label="Data has been fetched up to this date"
            type="date"
            name="start_date"
            onChange={handleChange}
            defaultValue={values.start_date}
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <TextField
            id="date"
            label="End Date"
            type="date"
            name="end_date"
            defaultValue={values.end_date}
            className={classes.textField}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
          >

            {"Get Ringba Data"}
            {loading && <CircularProgress color="inherit" size="1rem" thickness={2} style={{ marginLeft: "10px" }} />}
          </Button>
        </form>
      </Paper>
      <SnackBar open={open} setOpen={setOpen} response={response} />
    </div>
  )
}

GetRingbaData.layout = (page) => (
  <Layout title="Get Ringba Data">{page}</Layout>
)
export default GetRingbaData
