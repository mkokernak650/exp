import React from 'react'
import { Modal } from 'antd'

export default function ConfirmModal({
  open,
  setOpen,
  btnAction,
  closeAction,
  editData,
  width,
  title,
  loading,
}) {
  const handleClose = () => {
    setOpen({ open: false })
  }

  const handleCancel = () => {
    if (typeof closeAction === 'function') {
      closeAction()
      return
    }
    handleClose()
  }

  return (
    <Modal
      open={open}
      width={width}
      title={title}
      onCancel={handleCancel}
      onOk={() => btnAction(editData)}
      okText="Yes"
      cancelText="No"
      confirmLoading={loading}
      centered
    />
  )
}
