import { Button, Input, Typography } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import backgroundImage from '../../../images/background_image_compress.jpg'
import { useForm } from '@inertiajs/inertia-react'
import { useState } from 'react'

const Login = () => {
  const { data, setData, post, errors } = useForm({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const onHandleChange = (event) => {
    setData(
      event.target.name,
      event.target.type === 'checkbox' ? event.target.checked : event.target.value
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    post(route('login.attempt'))
  }

  return (
    <div
      className="bg-no-repeat bg-cover h-screen flex justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-[600px] h-[350px] mt-[150px] p-[30px] rounded-[40px_146px_40px_146px] flex justify-center items-center relative bg-white shadow">
        <div className="h-[100px] bg-[#ffcc00] w-[100px] absolute rounded-full -right-[50px]" />
        <div className="h-[100px] bg-[#f3327f] w-[100px] absolute rounded-full -left-[50px]" />
        <div className="flex flex-col h-full justify-center">
          <div className="max-w-sm mx-auto">
            <form validate="true" onSubmit={handleSubmit}>
              <div className="mb-6">
                <Typography.Title level={4} className="text-center">
                  Sign in
                </Typography.Title>
              </div>
              {errors.email && <div className="text-[#f71328]">{errors.email}</div>}
              <div className="mt-4 mb-2">
                <label className="block mb-1">Email Address</label>
                <Input
                  name="email"
                  onChange={onHandleChange}
                  type="email"
                  value={data.email}
                  required
                  className="w-full"
                />
              </div>
              <div className="mt-4 mb-2">
                <label className="block mb-1">Password</label>
                <Input
                  name="password"
                  onChange={onHandleChange}
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  required
                  className="w-full"
                  suffix={
                    <span
                      onClick={handleClickShowPassword}
                      className="cursor-pointer"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </span>
                  }
                />
              </div>
              {errors.password && <div className="text-[#f71328]">{errors.password}</div>}

              <div className="py-4">
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  className="bg-[#3b3e61] normal-case border-[#3b3e61]"
                >
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
