import React from 'react'
import { message } from 'antd'
import { useEffect } from 'react'

const SnackBar = ({ open, setOpen, severity = 'success', response }) => {
  useEffect(() => {
    if (open) {
      message[severity](response, 3)
      setOpen(false)
    }
  }, [open])

  return null
}

export default SnackBar
