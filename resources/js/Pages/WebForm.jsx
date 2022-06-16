import React from "react";
import logo from "../../images/webform/logo.png";
import facebook from "../../images/webform/facebook.svg";
import twitter from "../../images/webform/twitter.svg";
import linkedin from "../../images/webform/linkedin.svg";
import phone from "../../images/webform/phone.svg";
import separate from "../../images/webform/separate.svg";
import mail from "../../images/webform/mail.svg";
import { useState } from "react";
import axios from "axios";
import MuiAlert from "@material-ui/lab/Alert";
import { Snackbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    width: "500px",
    margin: "auto",
    marginTop: "2rem",
    padding: "40px",
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  title: {
    textAlign: "center",
    marginBottom: "35px",
  },
  snackbar: {
    maxWidth: "500px",
  },
}));
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function WebForm() {
  const classes = useStyles();
  const [values, setValues] = useState();
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(route("webform.store"), values, setValues)
      .then((res) => {
        if (res.status_code === 200) {
          setResponse(res.data.msg);
          setOpen(true);
          e.target.reset()
        } else {
          setResponse(res.data.msg);
          setOpen(true);
        }
      })
      .catch((err) => {
        setResponse(err.response.data.msg);
        setOpen(true);
      })

  };





  return (
    <div className="web-form">
      <div className="top-bar">
        <div className="left">
          <div className="phone-icon">
            <img src={phone} alt="phone"></img>
          </div>
          <div className="phone-no">617-874-4247</div>
        </div>

        <div className="separate-icon">
          <img src={separate} alt="separate"></img>
        </div>

        <div className="right">
          <div className="mail-icon">
            <img src={mail} alt="mail"></img>
          </div>
          <div className="mail">mkokernak@consumerexp.com</div>
        </div>
      </div>

      <div className="navbar" id="navbar">
        <div className="container flex flex-between">
          <div className="logo flex">
            <a href="https://www.consumerexp.com/">
              <img src={logo} alt="file not found"></img>
            </a>
          </div>
          <div className="links flex" id="links">
            <a className="closebtn">
              <img src="" alt="file not found"></img>
            </a>

            <div className="icon flex flex-row mt-1">
              <a
                href="https://www.facebook.com/videothreezero/"
                className="facebook"
                target="_blank"
              >
                <img src={facebook} alt="consumer exp Facebook Page"></img>
              </a>
              <a
                href="https://twitter.com/videothreezero"
                className="twitter"
                target="_blank"
              >
                <img src={twitter} alt="consumer exp twitter"></img>
              </a>
              <a
                href="https://www.linkedin.com/company/consumerexp/"
                className="linkedin"
                target="_blank"
              >
                <img src={linkedin} alt="consumer exp linkedin"></img>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="main">
        <h1>Publishers Choose ConsumerEXP</h1>
        <div className="title">
          <span>Are you ready to get started?</span>
        </div>
        <div className="info-form">
          <div className="form-title">
            <h2 className="mt-4">Complete This Form To Sign Up</h2>
          </div>
          <form className="mt-6" onSubmit={handleSubmit} method="post">
            <input
              type="text"
              name="company"
              placeholder="Company Name *"
              onChange={handleChange}
              required
            ></input>
            <input
              type="text"
              name="lname"
              placeholder="Last Name *"
              onChange={handleChange}
              required
            ></input>
            <input
              type="email"
              name="email"
              placeholder="E-mail Address *"
              onChange={handleChange}
              required
            ></input>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
            ></input>
            <input
              type="text"
              name="skype"
              placeholder="Skype ID"
              onChange={handleChange}
            ></input>
            <input
              type="text"
              name="street"
              placeholder="Street"
              onChange={handleChange}
            ></input>
            <input
              type="text"
              name="city"
              placeholder="City"
              onChange={handleChange}
            ></input>
            <input
              type="text"
              name="state"
              placeholder="State"
              onChange={handleChange}
            ></input>
            <input
              type="text"
              name="zipcode"
              placeholder="Zip Code"
              onChange={handleChange}
            ></input>
            <input
              type="text"
              name="country"
              placeholder="Country"
              onChange={handleChange}
            ></input>
            <input
              type="url"
              name="website"
              placeholder="Website"
              onChange={handleChange}
            ></input>
            <textarea
              name="omment"
              placeholder="Write your comment"
              rows="5"
              onChange={handleChange}
            ></textarea>
            <div className="form-button">
              <button type="submit" className="btn">
                Apply Now
              </button>
              <button className="btn" type="reset">
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="footer">
        <div className="container flex flex-between">
          <div className="logo flex">
            <a href="https://www.consumerexp.com/">
              <img src={logo} alt="file not found"></img>
            </a>
          </div>
          <div className="privacy-desclaimer">
            <a
              href="https://www.consumerexp.com/Privacy-and-Disclaimer-consumerexpressions"
              target="_blank"
            >
              Privacy and Diclaimer
            </a>
            <span className="divider">|</span>
            <a
              href="https://www.consumerexp.com/Terms-and-Conditions-consumerexpressions"
              target="_blank"
            >
              Terms and Conditions
            </a>
          </div>
          <div className="links flex" id="links">
            <div className="icon flex flex-row mt-1">
              <a
                href="https://www.facebook.com/videothreezero/"
                className="facebook"
                target="_blank"
              >
                <img src={facebook} alt="consumer exp facebook page"></img>
              </a>
              <a
                href="https://twitter.com/videothreezero"
                className="twitter"
                target="_blank"
              >
                <img src={twitter} alt="consumer exp twitter"></img>
              </a>
              <a
                href="https://www.linkedin.com/company/consumerexp/"
                className="linkedin"
                target="_blank"
              >
                <img src={linkedin} alt="consumer exp linkedin"></img>
              </a>
            </div>
          </div>
        </div>

        <div className="container text-center mt-4 mb-2">
          <div className="copyright">
            Copyright © 2021 ConsumerEXP Inc. All Rights Reserved.
          </div>
        </div>
      </div>

      <>
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          className={classes.snackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity="success">{response}</Alert>
        </Snackbar>
      </>
    </div>
  );
}
