import React from "react";
import { Snackbar, makeStyles } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

const useStyles = makeStyles(() => ({}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const SnackBar = ({ open, setOpen, severity = 'success', response }) => {
  const classes = useStyles();
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        className={classes.snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={severity}>{response}</Alert>
      </Snackbar>
    </div>
  );
};

export default SnackBar;
