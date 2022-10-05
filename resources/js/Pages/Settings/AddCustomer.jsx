import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { CircularProgress, Paper, Typography, TextField, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '500px',
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
}))

const AddCustomer = () => {
  const classes = useStyles()
  const [values, setValues] = useState()
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
    axios
      .post(route('store.customer'), values)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false)
          toast.success(res.data.msg)
          e.target.reset()
        }
      })
      .catch((err) => {})
  }

  return (
    <>
      <Helmet title="Add Customer" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Add Customer
        </Typography>
        <form validate="true" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name"
                margin="normal"
                name="customer"
                onChange={handleChange}
                type="text"
                variant="outlined"
                required={true}
              />
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                name="email"
                onChange={handleChange}
                type="email"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Telephone"
                margin="normal"
                name="telephone"
                onChange={handleChange}
                type="text"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Address"
                margin="normal"
                name="address"
                onChange={handleChange}
                type="text"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                {loading ? (
                  <CircularProgress color="secondary" thickness={3} size="2rem" />
                ) : (
                  'Submit'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}

AddCustomer.layout = (page) => <Layout title="Add Customer">{page}</Layout>
export default AddCustomer
