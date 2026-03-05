import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Spin } from 'antd'
import { Row, Col } from 'antd'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'
import TextInput from '@/Components/Global/TextInput'

const AddCustomer = () => {
  const [values, setValues] = useState()
  const [loading, setLoading] = useState(false)

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
      .post(route('store.customer'), values)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false)
          toast.success(res.data.msg)
          e.target.reset()
        }
      })
      .catch((err) => { })
  }

  return (
    <>
      <Helmet title="Add Customer" />
      <div style={{ display: 'grid', width: '500px', margin: 'auto', marginTop: '2rem', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', borderRadius: '4px', background: '#fff' }}>
        <Typography.Title level={5} style={{ textAlign: 'center', marginBottom: '35px' }}>
          Add Customer
        </Typography.Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <TextInput
              label="Customer Name"
              name="customer"
              handleChange={handleChange}
              required={true}
            />
            <TextInput
              label="Email"
              name="email"
              handleChange={handleChange}
              type="email"
            />
            <TextInput
              label="Telephone"
              name="telephone"
              handleChange={handleChange}
            />
            <TextInput
              label="Address"
              name="address"
              handleChange={handleChange}
            />
            <TextInput
              label="Contact Name"
              name="contact_name"
              handleChange={handleChange}
            />
            <TextInput
              label="Contact Telephone"
              name="contact_telephone"
              handleChange={handleChange}
            />
            <Col span={24}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Col>
          </Row>
        </form>
      </div>
    </>
  )
}

AddCustomer.layout = (page) => <Layout title="Add Customer">{page}</Layout>
export default AddCustomer
