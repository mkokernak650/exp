import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { CircularProgress, Paper, Typography, TextField, Button, Snackbar } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid';
import { Inertia } from '@inertiajs/inertia'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
        width: '500px',
        margin: 'auto',
        marginTop: '5rem',
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

    }
}))


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const AddMarket = () => {
    const classes = useStyles();
    const [values, setValues] = useState()
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };


    const handleChange = (e) => {
        const { name, value } = e.target
        setValues(oldValues => ({
            ...oldValues,
            [name]: value
        }))
        console.log(values)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true)
        Inertia.post('store-market', values, {
            onFinish: () => {
                setLoading(false),
                    setOpen(true)
            }
        })
    }



    return (
        <>
            <Paper className={classes.root}>
                <Typography variant='h5' className={classes.title}>
                    Add Market
                </Typography>
                <form validate onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Market"
                                margin="normal"
                                name="market"
                                onChange={handleChange}
                                type="text"
                                // value={values.name}
                                variant="outlined"
                                required='true'
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" type="submit">
                                {loading ?
                                    <CircularProgress
                                        color="secondary"
                                        thickness="3"
                                        size='2rem'
                                    />
                                    : "Submit"}
                            </Button>


                        </Grid>
                    </Grid>
                </form>

            </Paper>
            <>

                <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} className={classes.snackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert severity="success">Successfully Submitted</Alert>
                </Snackbar>

            </>
        </>
    )
}

AddMarket.layout = page => <Layout title="Add Market">{page}</Layout>
export default AddMarket
