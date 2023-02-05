import { makeStyles, Typography } from '@material-ui/core'

export default function FormHeading({ title }) {
    const useStyles = makeStyles(() => ({
        title: {
            textAlign: 'center',
            marginBottom: '35px',
        }
    }))
    const classes = useStyles()

    return (
        <Typography variant="h5" className={classes.title}>
            {title}
        </Typography>
    )
}
