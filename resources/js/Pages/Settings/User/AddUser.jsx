import { React, useState } from 'react'
import Layout from '../../Layout/Layout'
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

const AddUser = () => {
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
            .post(route('user.store'), values)
            .then((res) => {
                console.log(res)
                setLoading(false)
                if (res.data.status_code === 201) {
                    setLoading(false)
                    toast.success(res.data.msg)
                    e.target.reset()
                }
            })
            .catch((err) => { 
                setLoading(false)

            })
    }

    return (
        <>
            <Helmet title="Add User" />
            <Paper className={classes.root}>
                <Typography variant="h5" className={classes.title}>
                    Add User
                </Typography>
                <form validate="true" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Grid item xs={12}>
                                <TextField
                                    id="standard-select-currency-native"
                                    select
                                    name="role"
                                    onChange={handleChange}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    fullWidth
                                >
                                    <option value="">Select Role</option>
                                    <option value="affiliate">Affiliate</option>
                                    <option value="user">User</option>
                                </TextField>
                            </Grid>
                            <TextField
                                fullWidth
                                label="First Name"
                                margin="normal"
                                name="firstname"
                                onChange={handleChange}
                                type="text"
                                variant="outlined"
                                required={true}
                            />
                            <TextField
                                fullWidth
                                label="Last Name"
                                margin="normal"
                                name="lastname"
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
                                required={true}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                margin="normal"
                                name="password"
                                onChange={handleChange}
                                type="password"
                                variant="outlined"
                                required={true}
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

AddUser.layout = (page) => <Layout title="Add User">{page}</Layout>
export default AddUser
