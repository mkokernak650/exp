import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { CircularProgress, Paper, Typography, Button, Select, InputLabel, FormControl, MenuItem, FormHelperText } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'
import TextInput from '@/Components/Global/TextInput'
import { usePage } from '@inertiajs/inertia-react'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '500px',
    margin: 'auto',
    marginTop: '2rem',
    padding: '40px',
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: '35px',
  },
  snackbar: {
    maxWidth: '500px',
  },
}))

const AddAffiliate = () => {
  const classes = useStyles()
  const [values, setValues] = useState()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [similarAffiliates, setSimilarAffiliates] = useState('')
  const { allMarkets } = usePage().props

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
      .post(route('store.affiliate'), values)
      .then((res) => {
        if (res.status === 206) {
          setLoading(false)
          setErrors({})
          setSimilarAffiliates(res.data.msg)
        }
        if (res.status === 200) {
          setLoading(false)
          toast.success(res.data.msg)
          e.target.reset()
          setErrors({})
          setValues()
          setSimilarAffiliates('')
        }
      })
      .catch((err) => {
        setLoading(false)
        setErrors(err.response.data.errors)
      })
  }

  return (
    <>
      <Helmet title="Add Affiliate" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Add Affiliate
        </Typography>
        <form validate="true" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextInput
                label="Affiliate Id"
                name="affiliate_id"
                handleChange={handleChange}
                error={errors?.affiliate_id}
                helperText={errors?.affiliate_id?.[0]}
              />
              <TextInput
                label="Affiliate Name"
                name="affiliate_name"
                handleChange={handleChange}
                error={errors?.affiliate_name || similarAffiliates}
                helperText={errors?.affiliate_name?.[0] || similarAffiliates}
              />
              <TextInput
                label="Email"
                name="email"
                handleChange={handleChange}
              />
              <TextInput
                label="Telephone"
                name="telephone"
                handleChange={handleChange}
              />
              <TextInput
                label="Address"
                name="address"
                handleChange={handleChange}
              />
              <Grid item style={{ paddingTop: 18 }}>
                <FormControl variant="outlined" className={classes.formControl} fullWidth>
                  <InputLabel id="market-label">Select Market</InputLabel>
                  <Select
                    labelId="market-label"
                    id="market"
                    name="market"
                    value={values?.market ?? ""}
                    defaultValue=""
                    onChange={handleChange}
                    label="Select Market"
                    error={errors?.market}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {allMarkets.map((item) => (
                      <MenuItem key={item.market} value={item.market}>{item.market}</MenuItem>
                    ))}
                  </Select>
                  {errors?.market && <FormHelperText style={{ color: 'red' }}>{errors?.market?.[0]}</FormHelperText>}
                </FormControl>
              </Grid>
              <TextInput
                label="Contact Name"
                name="contact_name"
                handleChange={handleChange}
              />
              <TextInput
                label="Contact Telephone"
                name="contact_telephone"
                handleChange={handleChange}
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

AddAffiliate.layout = (page) => <Layout title="Add Affiliate">{page}</Layout>
export default AddAffiliate
