import React from 'react'
import Layout from '../Layout/Layout'
import { Paper, Typography, TextField, MenuItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid';
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
        width: '700px',
        margin: 'auto',
        textAlign: 'center',
        marginTop: '5rem',
        padding: '20px',
        flexGrow: 1,

    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}))

const currencies = [
    {
        value: 'USD',
        label: '$',
    },
    {
        value: 'EUR',
        label: '€',
    },
    {
        value: 'BTC',
        label: '฿',
    },
    {
        value: 'JPY',
        label: '¥',
    },
];

const MarketException = () => {
    const classes = useStyles()
    const [currency, setCurrency] = React.useState('EUR');

    const handleChange = (event) => {
        setCurrency(event.target.value);
    };
    return (
        <Paper className={classes.root}>

            <Typography variant='h5'>
                Market Exception
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        id="standard-select-currency-native"
                        select
                        label="Native select"
                        value={currency}
                        onChange={handleChange}
                        SelectProps={{
                            native: true,
                        }}
                        helperText="Please select your currency"
                    >
                        {currencies.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12}>
                    <Paper className={classes.paper}>xs=12</Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper className={classes.paper}>xs=12 sm=6</Paper>
                </Grid>
            </Grid>

        </Paper>
    )
}

MarketException.layout = page => <Layout title="Market Exception">{page}</Layout>
export default MarketException
