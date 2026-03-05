import { Button, Input, Typography } from "antd"
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons"
import backgroundImage from "../../../images/background_image_compress.jpg"
import { useForm } from "@inertiajs/inertia-react"
import { useState } from "react"

const Login = () => {
  const { data, setData, post, errors } = useForm({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const onHandleChange = (event) => {
    setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    post(route("login.attempt"))
  }

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "600px",
          height: "350px",
          marginTop: "150px",
          padding: "30px",
          borderRadius: "40px 146px 40px 146px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        }}
      >
        <div
          style={{
            height: "100px",
            background: "#ffcc00",
            width: "100px",
            position: "absolute",
            borderRadius: "100%",
            right: "-50px",
          }}
        />
        <div
          style={{
            height: "100px",
            background: "#f3327f",
            width: "100px",
            position: "absolute",
            borderRadius: "100%",
            left: "-50px",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
          }}
        >
          <div className="max-w-sm mx-auto">
            <form validate="true" onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <Typography.Title level={4} style={{ textAlign: "center" }}>
                  Sign in
                </Typography.Title>
              </div>
              {errors.email && (
                <div style={{ color: "#f71328" }}>{errors.email}</div>
              )}
              <div style={{ marginTop: 16, marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 4 }}>Email Address</label>
                <Input
                  name="email"
                  onChange={onHandleChange}
                  type="email"
                  value={data.email}
                  required
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ marginTop: 16, marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 4 }}>Password</label>
                <Input
                  name="password"
                  onChange={onHandleChange}
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  required
                  style={{ width: "100%" }}
                  suffix={
                    <span
                      onClick={handleClickShowPassword}
                      style={{ cursor: "pointer" }}
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </span>
                  }
                />
              </div>
              {errors.password && (
                <div style={{ color: "#f71328" }}>{errors.password}</div>
              )}

              <div style={{ paddingTop: 16, paddingBottom: 16 }}>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  style={{
                    backgroundColor: "#3b3e61",
                    textTransform: "none",
                    borderColor: "#3b3e61",
                  }}
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
