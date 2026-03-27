import React from 'react'
import logo from '../../images/webform/logo.png'
import facebook from '../../images/webform/facebook.svg'
import twitter from '../../images/webform/twitter.svg'
import linkedin from '../../images/webform/linkedin.svg'
import phone from '../../images/webform/phone.svg'
import separate from '../../images/webform/separate.svg'
import mail from '../../images/webform/mail.svg'
import { useState } from 'react'
import axios from 'axios'
import { notification, Input } from 'antd'

export default function WebForm() {
  const initialValues = {
    company: '', lname: '', email: '', phone: '', skype: '',
    street: '', city: '', state: '', zipcode: '', country: '',
    website: '', comment: '',
  }
  const [values, setValues] = useState(initialValues)
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }
  const handleReset = () => {
    setValues(initialValues)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    axios
      .post(route('webform.store'), values)
      .then((res) => {
        if (res.status === 200) {
          notification.success({ message: res.data.msg, placement: 'bottomRight' })
          handleReset()
        } else {
          notification.success({ message: res.data.msg, placement: 'bottomRight' })
        }
      })
      .catch((err) => {
        notification.error({ message: err.response.data.msg, placement: 'bottomRight' })
      })
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-sans">
      <div className="flex items-center justify-center gap-6 bg-[#3d4f5f] text-white py-2.5 px-4 text-[13px]">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 shrink-0">
            <img src={phone} alt="phone" className="w-full h-full object-contain" />
          </div>
          <span>617-874-4247</span>
        </div>

        <div className="w-3.5 h-5 shrink-0">
          <img src={separate} alt="separate" className="w-full h-full object-contain" />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 shrink-0">
            <img src={mail} alt="mail" className="w-full h-full object-contain" />
          </div>
          <span>mkokernak@consumerexp.com</span>
        </div>
      </div>

      <nav className="bg-white shadow-sm border-b-[3px] border-[#2abfab] py-3" id="navbar">
        <div className="flex justify-between items-center px-8 max-w-6xl mx-auto">
          <div className="flex">
            <a href="https://www.consumerexp.com/">
              <img src={logo} alt="ConsumerEXP" className="w-[170px] h-[50px]" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://www.facebook.com/videothreezero/"
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#1877f2] p-0 transition-[.3s] hover:opacity-80"
              target="_blank"
            >
              <img src={facebook} alt="consumer exp Facebook Page" className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com/videothreezero"
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#1da1f2] p-0 transition-[.3s] hover:opacity-80"
              target="_blank"
            >
              <img src={twitter} alt="consumer exp twitter" className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/company/consumerexp/"
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#0a66c2] p-0 transition-[.3s] hover:opacity-80"
              target="_blank"
            >
              <img src={linkedin} alt="consumer exp linkedin" className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-[640px] mx-auto pt-16 pb-12 px-4 text-center">
        <h1 className="text-[32px] font-bold text-[#2abfab] mb-3">Publishers Choose ConsumerEXP</h1>
        <div className="text-[15px] text-gray-500 mb-10">
          <span>Are you ready to get started?</span>
        </div>
        <div className="bg-white border border-gray-200 rounded px-10 py-8 text-left [&_input::placeholder]:!text-[#747981] [&_textarea::placeholder]:!text-[#747981] [&_.ant-input]:!py-2.5 [&_.ant-input]:!rounded-lg [&_textarea.ant-input]:!rounded-lg">
          <div className="text-center">
            <h2 className="text-[17px] font-bold text-gray-800">Complete This Form To Sign Up</h2>
          </div>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit} method="post">
            <Input type="text" name="company" placeholder="Company Name *" value={values.company} onChange={handleChange} required />
            <Input type="text" name="lname" placeholder="Last Name *" value={values.lname} onChange={handleChange} required />
            <Input type="email" name="email" placeholder="E-mail Address *" value={values.email} onChange={handleChange} required />
            <Input type="tel" name="phone" placeholder="Phone Number" value={values.phone} onChange={handleChange} />
            <Input type="text" name="skype" placeholder="Skype ID" value={values.skype} onChange={handleChange} />
            <Input type="text" name="street" placeholder="Street" value={values.street} onChange={handleChange} />
            <Input type="text" name="city" placeholder="City" value={values.city} onChange={handleChange} />
            <Input type="text" name="state" placeholder="State" value={values.state} onChange={handleChange} />
            <Input type="text" name="zipcode" placeholder="Zip Code" value={values.zipcode} onChange={handleChange} />
            <Input type="text" name="country" placeholder="Country" value={values.country} onChange={handleChange} />
            <Input type="url" name="website" placeholder="Website" value={values.website} onChange={handleChange} />
            <Input.TextArea name="comment" placeholder="Write your comment" rows={5} value={values.comment} onChange={handleChange} />
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="px-8 py-2 bg-[#2abfab] text-white rounded hover:bg-[#24a896] transition-colors font-medium text-sm"
              >
                Apply Now
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="bg-[#3d4f5f] text-white pt-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center  justify-center sm:justify-between flex-col sm:flex-row gap-4">
          <div className="flex">
            <a href="https://www.consumerexp.com/">
              <img src={logo} alt="ConsumerEXP" className="w-[170px] h-[50px]" />
            </a>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <a
              href="https://www.consumerexp.com/Privacy-and-Disclaimer-consumerexpressions"
              target="_blank"
              className="hover:underline"
            >
              Privacy and Disclaimer
            </a>
            <span className="mx-1">|</span>
            <a
              href="https://www.consumerexp.com/Terms-and-Conditions-consumerexpressions"
              target="_blank"
              className="hover:underline"
            >
              Terms and Conditions
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://www.facebook.com/videothreezero/"
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#1877f2] p-0 transition-[.3s] hover:opacity-80"
              target="_blank"
            >
              <img src={facebook} alt="consumer exp facebook page" className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com/videothreezero"
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#1da1f2] p-0 transition-[.3s] hover:opacity-80"
              target="_blank"
            >
              <img src={twitter} alt="consumer exp twitter" className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/company/consumerexp/"
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#0a66c2] p-0 transition-[.3s] hover:opacity-80"
              target="_blank"
            >
              <img src={linkedin} alt="consumer exp linkedin" className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mx-auto text-center pb-4 pt-8">
          <div className="text-gray-400 text-[13px]">
            Copyright © {new Date().getFullYear()} ConsumerEXP Inc. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
