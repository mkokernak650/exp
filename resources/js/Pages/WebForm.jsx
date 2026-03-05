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
import { message, Input } from "antd";

export default function WebForm() {
  const [values, setValues] = useState();
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(route("webform.store"), values, setValues)
      .then((res) => {
        if (res.status_code === 200) {
          message.success(res.data.msg);
          e.target.reset()
        } else {
          message.success(res.data.msg);
        }
      })
      .catch((err) => {
        message.error(err.response.data.msg);
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
            <Input
              type="text"
              name="company"
              placeholder="Company Name *"
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="lname"
              placeholder="Last Name *"
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="E-mail Address *"
              onChange={handleChange}
              required
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
            />
            <Input
              type="text"
              name="skype"
              placeholder="Skype ID"
              onChange={handleChange}
            />
            <Input
              type="text"
              name="street"
              placeholder="Street"
              onChange={handleChange}
            />
            <Input
              type="text"
              name="city"
              placeholder="City"
              onChange={handleChange}
            />
            <Input
              type="text"
              name="state"
              placeholder="State"
              onChange={handleChange}
            />
            <Input
              type="text"
              name="zipcode"
              placeholder="Zip Code"
              onChange={handleChange}
            />
            <Input
              type="text"
              name="country"
              placeholder="Country"
              onChange={handleChange}
            />
            <Input
              type="url"
              name="website"
              placeholder="Website"
              onChange={handleChange}
            />
            <Input.TextArea
              name="omment"
              placeholder="Write your comment"
              rows={5}
              onChange={handleChange}
            />
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
    </div>
  );
}
