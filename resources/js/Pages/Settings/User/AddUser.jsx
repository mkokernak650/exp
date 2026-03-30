import { React, useState } from 'react'
import Layout from '../../Layout/Layout'
import { Row } from 'antd'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'
import TextInput from '@/Components/Global/TextInput'
import Card from '@/Components/Global/Card'
import FormHeading from '@/Components/Global/FormHeading'
import PrimaryButton from '@/Components/Global/PrimaryButton'
import handleChange from '@/Helpers/handleChange'

const AddUser = () => {
  const [values, setValues] = useState()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .post(route('user.store'), values)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          setLoading(false)
          toast.success('User created successfully!')
          e.target.reset()
        }
      })
      .catch((err) => {
        setErrors(err.response.data.errors)
        setLoading(false)
      })
  }

  return (
    <>
      <Helmet title="Add User" />
      <Card>
        <FormHeading title="Add User" />
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <TextInput
              label="First Name*"
              name="firstname"
              handleChange={(e) => handleChange(e, setValues)}
              error={errors?.firstname}
              helperText={errors?.firstname?.[0]}
            />
            <TextInput
              label="Last Name*"
              name="lastname"
              handleChange={(e) => handleChange(e, setValues)}
              error={errors?.lastname}
              helperText={errors?.lastname?.[0]}
            />
            <TextInput
              label="Email*"
              name="email"
              handleChange={(e) => handleChange(e, setValues)}
              type="email"
              error={errors?.email}
              helperText={errors?.email?.[0]}
            />
            <TextInput
              label="Password*"
              name="password"
              handleChange={(e) => handleChange(e, setValues)}
              type="password"
              error={errors?.password}
              helperText={errors?.password?.[0]}
            />
            <TextInput
              label="Confirm Password*"
              name="password_confirmation"
              handleChange={(e) => handleChange(e, setValues)}
              type="password"
              error={errors?.password}
              helperText={errors?.password?.[0]}
            />

            <PrimaryButton btnText="Submit" loading={loading} htmlType="submit" />
          </Row>
        </form>
      </Card>
    </>
  )
}

AddUser.layout = (page) => <Layout>{page}</Layout>
export default AddUser
