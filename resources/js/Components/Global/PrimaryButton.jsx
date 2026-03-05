import { Button } from 'antd'
import React from 'react'

export default function PrimaryButton({ btnText, color = "primary", loading = false, ...rest }) {
    return (
        <Button type="primary" loading={loading} {...rest}>
            {btnText}
        </Button>
    )
}
