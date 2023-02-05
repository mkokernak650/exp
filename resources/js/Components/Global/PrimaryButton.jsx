import { Button, CircularProgress } from '@material-ui/core'
import React from 'react'

export default function PrimaryButton({ btnText, color = "primary", loading = false, ...rest }) {
    return (
        <Button variant="contained" color={color} {...rest}>
            {loading ? (
                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
            ) : (
                btnText
            )}
        </Button>
    )
}
