import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Input, DatePicker } from 'antd'
import { Row, Col } from 'antd'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import toast from 'react-hot-toast'

const AddBroadcastMonth = () => {
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
      .post(route('broadcast.month.store'), values)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          toast.success(res.data.msg)
          e.target.reset()
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  return (
    <>
      <Helmet title="Add Broadcast Month" />
      <div className="grid w-[500px] m-auto mt-8 p-10 shadow rounded bg-white">
        <Typography.Title level={5} className="text-center mb-[35px]">
          Add Broadcast Month
        </Typography.Title>
        <form onSubmit={handleSubmit} className="add-target">
          <Row gutter={[16, 16]}>
            <Col span={24} className="p-1 mb-[15px]">
              <div>
                <label>Broadcast Month</label>
                <Input
                  name="broad_cast_month"
                  onChange={handleChange}
                  type="text"
                  required
                  className="w-full"
                />
              </div>
            </Col>
            <Col span={24} className="p-1 mb-[15px]">
              <div>
                <label>Start Date</label>
                <DatePicker
                  defaultValue={dayjs()}
                  onChange={(date, dateString) => handleChange({ target: { name: 'start_date', value: dateString } })}
                  className="w-full"
                />
              </div>
            </Col>

            <Col span={24} className="p-1 mb-[15px]">
              <div>
                <label>End Date</label>
                <DatePicker
                  defaultValue={dayjs()}
                  onChange={(date, dateString) => handleChange({ target: { name: 'end_date', value: dateString } })}
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

AddBroadcastMonth.layout = (page) => <Layout title="Add Broadcast Month">{page}</Layout>
export default AddBroadcastMonth
