import React from 'react'
import Layout from '../Layout/Layout'
import { Helmet } from 'react-helmet'
import { Divider, Grid, Paper, TextField, Typography, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
        width: '800px',
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

const CustomEmail = () => {
    const classes = useStyles()

    return (
        <>
            <Helmet title="Create Coupon Code" />
            <Paper className={classes.root}>
                <Typography variant="h6" className={classes.title}>
                    Compose Email
                    {/* <Divider /> */}
                </Typography>
                <form>
                    <Grid container spacing={4}>
                        <TextField multiline minRows={4} fullWidth spellCheck maxRows={6} variant='outlined' label="Okay"></TextField>
                    </Grid>
                </form>
            </Paper>
        </>
    )
}

CustomEmail.layout = (page) => <Layout title="Email Affiliate (Custome Email)">{page}</Layout>
export default CustomEmail