import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Input, Row } from 'antd'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'

const AddBroadcastGroupName = () => {
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
      .post(route('store.broadcast_group_name'), values)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          toast.success(res.data.msg)
          e.target.reset()
          setValues()
        }
      })
      .catch(() => {
        setLoading(false)
        toast.error('Something went wrong')
      })
  }

  return (
    <>
      <Helmet title="Add Broadcast Group Name" />
      <div className="grid w-[500px] m-auto mt-8 p-10 shadow rounded bg-white">
        <Typography.Title level={5} className="text-center !text-xl !mb-[35px]">
          Add Broadcast Group Name
        </Typography.Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <div className="w-full">
              <div className="mb-1">
                <label>Broadcast Group Name</label>
              </div>
              <Input
                name="broadcast_group_name"
                onChange={handleChange}
                type="text"
                required
                className="w-full"
              />
            </div>

            <div className="w-full">
              <Typography.Text strong>Contact Details (optional)</Typography.Text>
              <small className="block text-gray-500 mb-2">
                Used when sending an IO for approval on behalf of every affiliate under this
                corporation.
              </small>
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>Contact Name</label>
              </div>
              <Input name="contact_name" onChange={handleChange} type="text" className="w-full" />
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>Contact Title</label>
              </div>
              <Input name="contact_title" onChange={handleChange} type="text" className="w-full" />
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>Contact Email</label>
              </div>
              <Input name="contact_email" onChange={handleChange} type="email" className="w-full" />
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>Contract Address</label>
              </div>
              <Input.TextArea
                name="contact_address"
                onChange={handleChange}
                rows={2}
                className="w-full"
              />
            </div>

            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Row>
        </form>
      </div>
    </>
  )
}

AddBroadcastGroupName.layout = (page) => <Layout title="Add Broadcast Group Name">{page}</Layout>
export default AddBroadcastGroupName
