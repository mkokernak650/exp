import { React, useState } from 'react'
import Layout from '../../Layout/Layout'
import { InputAdornment, IconButton } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'
import { VisibilityOff } from '@material-ui/icons'
import { Visibility } from '@material-ui/icons'
import TextInput from '@/Components/Global/TextInput'
import Card from '@/Components/Global/Card'
import FormHeading from '@/Components/Global/FormHeading'
import PrimaryButton from '@/Components/Global/PrimaryButton'
import handleChange from '@/Helpers/handleChange'



const AddUser = () => {
    const [values, setValues] = useState()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState({ password: false, cpassword: false })

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        axios
            .post(route('user.store'), values)
            .then((res) => {
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
            <Card>
                <FormHeading title="Add User" />
                <form validate="true" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextInput
                                label="First Name*"
                                name="firstname"
                                handleChange={(e) => handleChange(e, setValues)}
                                error={errors?.firstname}
                                helperText={errors?.firstname?.[0]}
                            />
                            <TextInput
                                label="Last Name*"
                                name="lastname"
                                handleChange={(e) => handleChange(e, setValues)}
                                error={errors?.lastname}
                                helperText={errors?.lastname?.[0]}
                            />
                            <TextInput
                                label="Email*"
                                name="email"
                                handleChange={(e) => handleChange(e, setValues)}
                                type="email"
                                error={errors?.email}
                                helperText={errors?.email?.[0]}
                            />
                            <TextInput
                                label="Password*"
                                name="password"
                                handleChange={(e) => handleChange(e, setValues)}
                                type={showPassword?.password ? 'text' : 'password'}
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
                            <TextInput
                                label="Confirm Password*"
                                name="password_confirmation"
                                handleChange={(e) => handleChange(e, setValues)}
                                type={showPassword?.cpassword ? 'text' : 'password'}
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
                            <PrimaryButton
                                btnText="Submit" loading={loading} type="submit"
                            />
                        </Grid>
                    </Grid>
                </form>
            </Card>
        </>
    )
}

AddUser.layout = (page) => <Layout>{page}</Layout>
export default AddUser
