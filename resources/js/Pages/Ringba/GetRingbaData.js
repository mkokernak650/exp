import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { Inertia } from '@inertiajs/inertia'
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

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
    },

}));




const GetRingbaData = () => {
    const classes = useStyles();
    const [values, setValues] = useState()
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("")
    const handleChange = (e) => {
        const { name, value } = e.target
        setValues(oldValues => ({
            ...oldValues,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true)
        Inertia.post('temp-ringba-data', values, {
            onFinish: () => {
                setLoading(false),
                    setSuccessMessage("Data Fetched Successfully")
            }
        })
    }


    return (
        <div>
            <form className={classes.container} noValidate onSubmit={handleSubmit}>
                <TextField
                    id="date"
                    label="Start Date"
                    type="date"
                    name='startDate'
                    onChange={handleChange}
                    defaultValue="2021-01-06"
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    required
                />
                <TextField
                    id="date"
                    label="End Date"
                    type="date"
                    name='endDate'
                    defaultValue="2021-01-07"
                    className={classes.textField}
                    onChange={handleChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    required
                />
                <Button variant="contained" type="submit" color="primary" className={classes.button}>
                    {loading ?
                        <CircularProgress
                            color="secondary"
                        />
                        : "Get Ringba Data"}
                </Button>
                <h1>{successMessage}</h1>
            </form>
            <Typography
                variant="h6" id="tableTitle" component="div">
                    {successMessage}
            </Typography>
        </div>
    )
}

GetRingbaData.layout = page => <Layout title="Get Ringba Data">{page}</Layout>
export default GetRingbaData
