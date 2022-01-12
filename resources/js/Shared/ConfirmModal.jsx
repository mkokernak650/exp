import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button } from "@material-ui/core";
import Cancel from "../../images/cancel.svg";
import {CircularProgress} from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius: "10px",
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "column",
    margin: "100px auto auto auto",
    position: "relative",
  },
  title: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
  },
}));

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
  const classes = useStyles();
  const handleClose = () => {
    setOpen({ open: false });
  };
  const body = (
    <div className={classes.paper} style={{ width: width }}>
      <div className="confirm-modal">
        <span>{title}</span>
        <div className="button">
          <Button
            variant="contained"
            color="primary"
            onClick={() => btnAction(editData)}
          >
            {"Yes"}
            {loading && <CircularProgress color="inherit" size="1rem" thickness={2} style={{ marginLeft: "5px" }} />}
          </Button>
          <Button variant="contained" color="primary" onClick={closeAction}>
            No
          </Button>
        </div>

        <div onClick={closeAction} className="close-modal-icon">
          <img src={Cancel} alt="close-modal-icon"></img>
        </div>
      </div>
    </div>
  );
  return (
    <div className={classes.root}>
      <Modal
        open={open}
        width={width}
        title={title}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}
