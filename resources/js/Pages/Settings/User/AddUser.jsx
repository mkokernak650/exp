import { React, useState } from 'react'
import Layout from '../../Layout/Layout'
import { CircularProgress, Paper, Typography, TextField, Button, InputAdornment, IconButton } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'
import { VisibilityOff } from '@material-ui/icons'
import { Visibility } from '@material-ui/icons'

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
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState({ password: false, cpassword: false })

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
                if (res.status === 200) {
                    setLoading(false)
                    toast.success("User created successfully!")
                    e.target.reset()
                }
            })
            .catch((err) => {
                setErrors(err.response.data.errors)
                setLoading(false)

            })
    }

    const handleClickShowPassword = (name) => setShowPassword((prevState) => ({ ...prevState, [name]: !prevState?.[name] }))

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
                            <TextField
                                fullWidth
                                label="First Name*"
                                margin="normal"
                                name="firstname"
                                onChange={handleChange}
                                type="text"
                                variant="outlined"
                                error={errors?.firstname}
                                helperText={errors?.firstname?.[0]}
                            />
                            <TextField
                                fullWidth
                                label="Last Name*"
                                margin="normal"
                                name="lastname"
                                onChange={handleChange}
                                type="text"
                                variant="outlined"
                                error={errors?.lastname}
                                helperText={errors?.lastname?.[0]}
                            />
                            <TextField
                                fullWidth
                                label="Email*"
                                margin="normal"
                                name="email"
                                onChange={handleChange}
                                type="email"
                                variant="outlined"
                                error={errors?.email}
                                helperText={errors?.email?.[0]}
                            />
                            <TextField
                                fullWidth
                                label="Password*"
                                margin="normal"
                                name="password"
                                onChange={handleChange}
                                type={showPassword?.password ? 'text' : 'password'}
                                variant="outlined"
                                error={errors?.password}
                                helperText={errors?.password?.[0]}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => handleClickShowPassword('password')}
                                                edge="end"
                                            >
                                                {showPassword?.password ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>

                                }}
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password*"
                                margin="normal"
                                name="password_confirmation"
                                onChange={handleChange}
                                type={showPassword?.cpassword ? 'text' : 'password'}
                                variant="outlined"
                                error={errors?.password}
                                helperText={errors?.password?.[0]}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => handleClickShowPassword('cpassword')}
                                                edge="end"
                                            >
                                                {showPassword?.cpassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>

                                }}
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
