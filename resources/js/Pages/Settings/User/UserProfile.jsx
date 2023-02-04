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

const UserProfile = () => {
    const { user } = usePage().props
    const classes = useStyles()
    const [values, setValues] = useState()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showPasswordFields, setShowPasswordFields] = useState(false)
    const [showPassword, setShowPassword] = useState({ password: false, new_password: false, cpassword: false })

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
            .post(route('user.profile.update'), values)
            .then((res) => {
                console.log(res)
                setLoading(false)
                if (res.data.status_code === 201) {
                    setLoading(false)
                    toast.success(res.data.msg)
                }else{
                    setLoading(false)
                    toast.error(res.data.msg)
                }
            })
            .catch((err) => {
                setErrors(err.response.data.errors)
                setLoading(false)

            })
    }

    const handleChangePassword = () => {
        setShowPasswordFields(prevState => !prevState)
    }

    const handleClickShowPassword = (name) => setShowPassword((prevState) => ({ ...prevState, [name]: !prevState?.[name] }))

    return (
        <>
            <Helmet title="Edit Info" />
            <Paper className={classes.root}>
                <Typography variant="h5" className={classes.title}>
                    Edit Info
                </Typography>
                <form validate="true" onSubmit={handleSubmit}>
                    <Grid id container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="First Name*"
                                margin="normal"
                                name="firstname"
                                onChange={handleChange}
                                type="text"
                                variant="outlined"
                                defaultValue={user[0].firstname}
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
                                defaultValue={user[0].lastname}
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
                                defaultValue={user[0].email}
                                error={errors?.email}
                                helperText={errors?.email?.[0]}
                            />
                            {!showPasswordFields &&
                                <span className='change-password' onClick={handleChangePassword} style={{ color: "#3f51b5", cursor: "pointer" }}>Change Password</span>
                            }

                            {showPasswordFields &&
                                <>
                                    <TextField
                                        fullWidth
                                        label="Old Password*"
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
                                        label="New Password*"
                                        margin="normal"
                                        name="new_password"
                                        onChange={handleChange}
                                        type={showPassword?.new_password ? 'text' : 'password'}
                                        variant="outlined"
                                        error={errors?.new_password}
                                        helperText={errors?.new_password?.[0]}
                                        InputProps={{
                                            endAdornment:
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => handleClickShowPassword('new_password')}
                                                        edge="end"
                                                    >
                                                        {showPassword?.new_password ? <VisibilityOff /> : <Visibility />}
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
                                        error={errors?.password_confirmation}
                                        helperText={errors?.password_confirmation?.[0]}
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
                                </>
                            }
                        </Grid>

                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" type="submit">
                                {loading ? (
                                    <CircularProgress color="secondary" thickness={3} size="2rem" />
                                ) : (
                                    'Update'
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </>
    )
}

UserProfile.layout = (page) => <Layout title="Edit Info">{page}</Layout>
export default UserProfile
