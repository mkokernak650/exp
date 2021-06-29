import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { Formik } from 'formik';
import {
    Box,
    Button,
    Container,
    Grid,
    Link,
    TextField,
    Typography
} from '@material-ui/core';
import { useState } from 'react'
import { Inertia } from '@inertiajs/inertia';


const Login = () => {
    const [values, setValues] = useState({
        email: '',
        password: '',
    });
    function handleChange(e) {
        const key = e.target.name;
        const value = e.target.value;
        console.log(value);

        setValues(oldValues => ({
            ...oldValues,
            [key]: value,
        }));
    }
    const handleSubmit = () => {
        Inertia.post('login', values);
    }
    return (
        <>
            <Box
                sx={{
                    backgroundColor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'center',
                }}
            >
                <Container maxWidth="sm" style={{ marginTop: '80px' }}>
                    <Formik
                        initialValues={{
                            email: 'demo@devias.io',
                            password: 'Password123'
                        }}
                        validationSchema={Yup.object().shape({
                            email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                            password: Yup.string().max(255).required('Password is required')
                        })}
                    >
                        {({
                            errors,
                            handleBlur,
                            isSubmitting,
                            touched,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        color="textPrimary"
                                        variant="h4"
                                        align="center"
                                    >
                                        Sign in
                                    </Typography>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="body2"
                                    >

                                    </Typography>
                                </Box>

                                <TextField
                                    error={Boolean(touched.email && errors.email)}
                                    fullWidth
                                    helperText={touched.email && errors.email}
                                    label="Email Address"
                                    margin="normal"
                                    name="email"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    type="email"
                                    value={values.email}
                                    variant="outlined"
                                />
                                <TextField
                                    error={Boolean(touched.password && errors.password)}
                                    fullWidth
                                    helperText={touched.password && errors.password}
                                    label="Password"
                                    margin="normal"
                                    name="password"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    type="password"
                                    value={values.password}
                                    variant="outlined"
                                />
                                <Box sx={{ py: 2 }}>
                                    <Button
                                        color="primary"
                                        disabled={isSubmitting}
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                    >
                                        Sign in now
                                    </Button>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Box>
        </>
    );
};

export default Login;
