import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Input } from 'antd'
import { Row, Col } from 'antd'
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
            <Col span={24}>
              <div>
                <label>Broadcast Group Name</label>
                <Input
                  name="broadcast_group_name"
                  onChange={handleChange}
                  type="text"
                  required
                  className="w-full"
                />
              </div>
            </Col>

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

AddBroadcastGroupName.layout = (page) => <Layout title="Add Broadcast Group Name">{page}</Layout>
export default AddBroadcastGroupName
