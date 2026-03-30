import React from 'react'
import { Modal } from 'antd'

export default function NormalModal({ open, setOpen, children, width, title, onClose, footer = null }) {
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose()
    } else {
      setOpen({ open: false })
    }
  }

  return (
    <Modal open={open} width={width} title={title} onCancel={handleClose} footer={footer} centered>
      {children}
    </Modal>
  )
}
