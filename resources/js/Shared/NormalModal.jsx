import React from 'react'
import { Modal } from 'antd'

export default function NormalModal({ open, setOpen, children, width, title }) {
  const handleClose = () => {
    setOpen({ open: false })
  }

  return (
    <Modal
      open={open}
      width={width}
      title={title}
      onCancel={handleClose}
      footer={null}
      centered
    >
      {children}
    </Modal>
  )
}
