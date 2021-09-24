import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    makeStyles,
} from "@material-ui/core";
import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";

const useStyles = makeStyles((theme) => ({
    paper: {
        maxWidth: "600px",
        height:"350px",
        margin: "auto",
        padding: "20px",
        marginTop:"150px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
}));

const Login = () => {
    const classes = useStyles();
    const [values, setValues] = useState({
        email: "",
        password: "",
    });

    function handleChange(e) {
        const key = e.target.name;
        const value = e.target.value;

        setValues((oldValues) => ({
            ...oldValues,
            [key]: value,
        }));
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        Inertia.post(route("login.attempt"), values);
    };
    return (
        <>
            <Paper className={classes.paper}>
                <Box
                    sx={{
                        backgroundColor: "background.default",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "center",
                    }}
                >
                    <Container maxWidth="sm">
                        <form validate onSubmit={handleSubmit}>
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    color="textPrimary"
                                    variant="h4"
                                    align="center"
                                >
                                    Sign in
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                label="Email Address"
                                margin="normal"
                                name="email"
                                onChange={handleChange}
                                type="email"
                                value={values.email}
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
                                value={values.password}
                                variant="outlined"
                                required={true}

                            />
                            <Box sx={{ py: 2 }}>
                                <Button
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                >
                                    Sign in 
                                </Button>
                            </Box>
                        </form>
                    </Container>
                </Box>
            </Paper>
        </>
    );
};

export default Login;
