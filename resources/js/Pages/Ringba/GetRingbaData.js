import { React, useState } from 'react'
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
    const [values, setValues] = useState()

    const handleChange = (e) => {
        const { name, value } = e.target
        setValues(oldValues => ({
            ...oldValues,
            [name]: value
        }))
    }

    const handleSubmit = () => {
        console.log(values)

        // Inertia.post('login', values);
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
                    defaultValue="2021-06-01"
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    id="date"
                    label="End Date"
                    type="date"
                    name='endDate'
                    defaultValue="2021-07-01"
                    className={classes.textField}
                    onChange={handleChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <Button variant="contained" type="submit" color="primary" className={classes.button}>
                    Get Ringba Data
                </Button>
            </form>
        </div>
    )
}

GetRingbaData.layout = page => <Layout title="Get Ringba Data">{page}</Layout>
export default GetRingbaData
