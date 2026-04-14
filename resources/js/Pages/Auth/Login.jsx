import { Button, Input, Typography } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useForm } from '@inertiajs/inertia-react'
import { useState } from 'react'

const Login = () => {
  const { data, setData, post, errors, processing } = useForm({
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
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-10">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <LockOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            Welcome back
          </Typography.Title>
          <Typography.Text type="secondary">
            Sign in to your account
          </Typography.Text>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <Input
              name="email"
              onChange={onHandleChange}
              type="email"
              value={data.email}
              required
              size="large"
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="you@example.com"
              status={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <div className="text-red-500 text-xs mt-1">{errors.email}</div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <Input
              name="password"
              onChange={onHandleChange}
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              required
              size="large"
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter your password"
              status={errors.password ? 'error' : ''}
              suffix={
                <span
                  onClick={handleClickShowPassword}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
              }
            />
            {errors.password && (
              <div className="text-red-500 text-xs mt-1">{errors.password}</div>
            )}
          </div>

          <Button
            type="primary"
            size="large"
            htmlType="submit"
            block
            loading={processing}
            style={{
              height: 44,
              borderRadius: 10,
              fontWeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login
