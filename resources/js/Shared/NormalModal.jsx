import React from "react";
import { Modal, Typography } from "antd";

const { Title } = Typography;

export default function NormalModal({ open, setOpen, children, width, title }) {
  const handleClose = () => {
    setOpen({ open: false });
  };

  return (
    <Modal
      open={open}
      width={width}
      title={<Title level={5} className="text-center mb-0">{title}</Title>}
      onCancel={handleClose}
      footer={null}
      centered
      styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
    >
      {children}
    </Modal>
  );
}
