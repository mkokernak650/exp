import { React, useState } from 'react'
import Layout from '../../Layout/Layout'
import { Button, Typography, Input, Row, Col } from 'antd'
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
    const [showPassword, setShowPassword] = useState({ password: false, new_password: false, cpassword: false })

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
                }
                else if(res.data.status_code === 403){
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
        setShowPasswordFields(prevState => !prevState)
    }

    const handleClickShowPassword = (name) => setShowPassword((prevState) => ({ ...prevState, [name]: !prevState?.[name] }))

    return (
        <>
            <Helmet title="Edit Info" />
            <div style={{
                display: 'grid',
                width: '500px',
                margin: 'auto',
                marginTop: '2rem',
                padding: '40px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                borderRadius: '4px',
                background: '#fff',
            }}>
                <Typography.Title level={5} style={{ textAlign: 'center', marginBottom: '35px' }}>
                    Edit Info
                </Typography.Title>
                <form onSubmit={handleSubmit}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <div className="mb-4">
                                <label>First Name*</label>
                                <Input
                                    name="firstname"
                                    onChange={handleChange}
                                    type="text"
                                    defaultValue={user[0].firstname}
                                    status={errors?.firstname ? 'error' : ''}
                                    style={{ width: '100%' }}
                                />
                                {errors?.firstname && <div style={{ color: 'red', fontSize: '12px' }}>{errors?.firstname?.[0]}</div>}
                            </div>
                            <div className="mb-4">
                                <label>Last Name*</label>
                                <Input
                                    name="lastname"
                                    onChange={handleChange}
                                    type="text"
                                    defaultValue={user[0].lastname}
                                    status={errors?.lastname ? 'error' : ''}
                                    style={{ width: '100%' }}
                                />
                                {errors?.lastname && <div style={{ color: 'red', fontSize: '12px' }}>{errors?.lastname?.[0]}</div>}
                            </div>
                            <div className="mb-4">
                                <label>Email*</label>
                                <Input
                                    name="email"
                                    onChange={handleChange}
                                    type="email"
                                    defaultValue={user[0].email}
                                    status={errors?.email ? 'error' : ''}
                                    style={{ width: '100%' }}
                                />
                                {errors?.email && <div style={{ color: 'red', fontSize: '12px' }}>{errors?.email?.[0]}</div>}
                            </div>
                            {!showPasswordFields &&
                                <span className='change-password' onClick={handleChangePassword} style={{ color: "#1677ff", cursor: "pointer" }}>Change Password</span>
                            }

                            {showPasswordFields &&
                                <>
                                    <div className="mb-4">
                                        <label>Old Password</label>
                                        <Input
                                            name="password"
                                            onChange={handleChange}
                                            type={showPassword?.password ? 'text' : 'password'}
                                            status={errors?.password ? 'error' : ''}
                                            style={{ width: '100%' }}
                                            suffix={
                                                <span onClick={() => handleClickShowPassword('password')} style={{ cursor: 'pointer' }}>
                                                    {showPassword?.password ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                                </span>
                                            }
                                        />
                                        {errors?.password && <div style={{ color: 'red', fontSize: '12px' }}>{errors?.password?.[0]}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label>New Password</label>
                                        <Input
                                            name="new_password"
                                            onChange={handleChange}
                                            type={showPassword?.new_password ? 'text' : 'password'}
                                            status={errors?.new_password ? 'error' : ''}
                                            style={{ width: '100%' }}
                                            suffix={
                                                <span onClick={() => handleClickShowPassword('new_password')} style={{ cursor: 'pointer' }}>
                                                    {showPassword?.new_password ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                                </span>
                                            }
                                        />
                                        {errors?.new_password && <div style={{ color: 'red', fontSize: '12px' }}>{errors?.new_password?.[0]}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label>Confirm Password</label>
                                        <Input
                                            name="password_confirmation"
                                            onChange={handleChange}
                                            type={showPassword?.cpassword ? 'text' : 'password'}
                                            status={errors?.password_confirmation ? 'error' : ''}
                                            style={{ width: '100%' }}
                                            suffix={
                                                <span onClick={() => handleClickShowPassword('cpassword')} style={{ cursor: 'pointer' }}>
                                                    {showPassword?.cpassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                                </span>
                                            }
                                        />
                                        {errors?.password_confirmation && <div style={{ color: 'red', fontSize: '12px' }}>{errors?.password_confirmation?.[0]}</div>}
                                    </div>
                                </>
                            }
                        </Col>

                        <Col span={24}>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Update
                            </Button>
                        </Col>
                    </Row>
                </form>
            </div>
        </>
    )
}

UserProfile.layout = (page) => <Layout title="Edit Info">{page}</Layout>
export default UserProfile
