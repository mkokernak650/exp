import { makeStyles, Paper } from '@material-ui/core'
export default function Card({children}) {
    const useStyles = makeStyles(() => ({
        root: {
            display: 'grid',
            width: '500px',
            margin: 'auto',
            marginTop: '2rem',
            padding: '40px',
        }
    }))
    const classes = useStyles()

    return (
        <Paper className={classes.root}>
            {children}

        </Paper>
    )
}
