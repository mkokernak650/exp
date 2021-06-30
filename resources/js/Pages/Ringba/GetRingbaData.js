import React from 'react'
import Layout from '../Layout/Layout'
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        width: 600,
        margin: 'auto',
        flexDirection: 'column',
        marginTop: 60
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
        margin: '10px'
    },
    button: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
        margin: '10px'
    }
}));

const GetRingbaData = () => {
    const classes = useStyles();
    return (
        <div>
            <form className={classes.container} noValidate>
                <TextField
                    id="date"
                    label="Start Date"
                    type="date"
                    defaultValue="2017-05-24"
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    id="date"
                    label="End Date"
                    type="date"
                    defaultValue="2017-05-24"
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <Button variant="contained" color="primary" className={classes.button}>
                    Get Ringba Data
                </Button>
            </form>
        </div>
    )
}

GetRingbaData.layout = page => <Layout title="Get Ringba Data">{page}</Layout>
export default GetRingbaData
