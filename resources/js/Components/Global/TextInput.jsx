import { TextField } from '@material-ui/core'
import React from 'react'

export default function TextInput({ label, name, handleChange, type='text',required=false, ...rest }) {
    return (
        <TextField
            fullWidth
            label={label}
            margin="normal"
            name={name}
            onChange={handleChange}
            type={type}
            variant="outlined"
            required={required}
            {...rest}
        />
    )
}
