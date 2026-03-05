import React from "react";
import { Modal, Button } from "antd";
import Cancel from "../../images/cancel.svg";

export default function ConfirmModal({
  open,
  setOpen,
  btnAction,
  closeAction,
  editData,
  width,
  title,
  loading
}) {
  const handleClose = () => {
    setOpen({ open: false });
  };

  return (
    <Modal
      open={open}
      width={width}
      onCancel={handleClose}
      footer={null}
      centered
      closable={false}
    >
      <div className="confirm-modal">
        <span>{title}</span>
        <div className="button">
          <Button
            type="primary"
            onClick={() => btnAction(editData)}
            loading={loading}
          >
            Yes
          </Button>
          <Button type="primary" onClick={closeAction}>
            No
          </Button>
        </div>
        <div onClick={closeAction} className="close-modal-icon">
          <img src={Cancel} alt="close-modal-icon" />
        </div>
      </div>
    </Modal>
  );
}
