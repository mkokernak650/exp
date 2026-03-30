import { React, useState } from 'react'
import Layout from '../../Layout/Layout'
import { Button, Typography, Input, Row } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'
import { usePage } from '@inertiajs/inertia-react'

const UserProfile = () => {
  const { user } = usePage().props
  const [values, setValues] = useState()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [showPassword, setShowPassword] = useState({
    password: false,
    new_password: false,
    cpassword: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .post(route('user.profile.update'), values)
      .then((res) => {
        console.log(res)
        setLoading(false)
        if (res.data.status_code === 201) {
          setLoading(false)
          toast.success(res.data.msg)
        } else if (res.data.status_code === 403) {
          setLoading(false)
          toast.error(res.data.msg)
        } else {
          setLoading(false)
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        setErrors(err.response.data.errors)
        setLoading(false)
      })
  }

  const handleChangePassword = () => {
    setShowPasswordFields((prevState) => !prevState)
  }

  const handleClickShowPassword = (name) =>
    setShowPassword((prevState) => ({ ...prevState, [name]: !prevState?.[name] }))

  return (
    <>
      <Helmet title="Edit Info" />
      <div className="grid w-[500px] m-auto mt-8 p-10 shadow rounded bg-white">
        <Typography.Title level={5} className="text-center !text-xl !mb-[35px]">
          Edit Info
        </Typography.Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <div className="w-full">
              <div className="mb-1">
                <label>First Name*</label>
              </div>
              <Input
                name="firstname"
                onChange={handleChange}
                type="text"
                defaultValue={user[0].firstname}
                status={errors?.firstname ? 'error' : ''}
                className="w-full"
              />
              {errors?.firstname && (
                <div className="text-red-500 text-xs">{errors?.firstname?.[0]}</div>
              )}
            </div>
            <div className="w-full">
              <div className="mb-1">
                <label>Last Name*</label>
              </div>
              <Input
                name="lastname"
                onChange={handleChange}
                type="text"
                defaultValue={user[0].lastname}
                status={errors?.lastname ? 'error' : ''}
                className="w-full"
              />
              {errors?.lastname && (
                <div className="text-red-500 text-xs">{errors?.lastname?.[0]}</div>
              )}
            </div>
            <div className="w-full">
              <div className="mb-1">
                <label>Email*</label>
              </div>
              <Input
                name="email"
                onChange={handleChange}
                type="email"
                defaultValue={user[0].email}
                status={errors?.email ? 'error' : ''}
                className="w-full"
              />
              {errors?.email && <div className="text-red-500 text-xs">{errors?.email?.[0]}</div>}
            </div>
            {!showPasswordFields && (
              <div className="w-full">
                <span
                  className="change-password text-[#1677ff] cursor-pointer"
                  onClick={handleChangePassword}
                >
                  Change Password
                </span>
              </div>
            )}

            {showPasswordFields && (
              <>
                <div className="w-full">
                  <div className="mb-1">
                    <label>Old Password</label>
                  </div>
                  <Input
                    name="password"
                    onChange={handleChange}
                    type={showPassword?.password ? 'text' : 'password'}
                    status={errors?.password ? 'error' : ''}
                    className="w-full"
                    suffix={
                      <span
                        onClick={() => handleClickShowPassword('password')}
                        className="cursor-pointer"
                      >
                        {showPassword?.password ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </span>
                    }
                  />
                  {errors?.password && (
                    <div className="text-red-500 text-xs">{errors?.password?.[0]}</div>
                  )}
                </div>
                <div className="w-full">
                  <div className="mb-1">
                    <label>New Password</label>
                  </div>
                  <Input
                    name="new_password"
                    onChange={handleChange}
                    type={showPassword?.new_password ? 'text' : 'password'}
                    status={errors?.new_password ? 'error' : ''}
                    className="w-full"
                    suffix={
                      <span
                        onClick={() => handleClickShowPassword('new_password')}
                        className="cursor-pointer"
                      >
                        {showPassword?.new_password ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </span>
                    }
                  />
                  {errors?.new_password && (
                    <div className="text-red-500 text-xs">{errors?.new_password?.[0]}</div>
                  )}
                </div>
                <div className="w-full">
                  <div className="mb-1">
                    <label>Confirm Password</label>
                  </div>
                  <Input
                    name="password_confirmation"
                    onChange={handleChange}
                    type={showPassword?.cpassword ? 'text' : 'password'}
                    status={errors?.password_confirmation ? 'error' : ''}
                    className="w-full"
                    suffix={
                      <span
                        onClick={() => handleClickShowPassword('cpassword')}
                        className="cursor-pointer"
                      >
                        {showPassword?.cpassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </span>
                    }
                  />
                  {errors?.password_confirmation && (
                    <div className="text-red-500 text-xs">
                      {errors?.password_confirmation?.[0]}
                    </div>
                  )}
                </div>
              </>
            )}

            <Button type="primary" htmlType="submit" loading={loading}>
              Update
            </Button>
          </Row>
        </form>
      </div>
    </>
  )
}

UserProfile.layout = (page) => <Layout title="Edit Info">{page}</Layout>
export default UserProfile
