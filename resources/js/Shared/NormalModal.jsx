import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Typography } from "@material-ui/core";

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

export default function NormalModal({ open, setOpen, children, width, title }) {
  const classes = useStyles();


  const handleClose = () => {
    setOpen({ open: false });
  };
  const body = (
    <div className={classes.paper} style={{ width: width, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography variant="h5" className={classes.title}>
        {title}
      </Typography>
      {children}
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

