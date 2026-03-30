import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Input, DatePicker, Row } from 'antd'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import toast from 'react-hot-toast'

const AddBroadcastWeek = () => {
  const [values, setValues] = useState({
    start_date: dayjs().format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
  })
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
      .post(route('broadcast.week.store'), values)
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
      <Helmet title="Add Broadcast Week" />
      <div className="grid w-[500px] m-auto mt-8 p-10 shadow rounded bg-white">
        <Typography.Title level={5} className="text-center !text-xl !mb-[35px]">
          Add Broadcast Week
        </Typography.Title>
        <form onSubmit={handleSubmit} className="add-target">
          <Row gutter={[16, 16]}>
            <div className="w-full">
              <div className="mb-1">
                <label>Broadcast Week</label>
              </div>
              <Input
                name="broad_cast_week"
                onChange={handleChange}
                type="text"
                required
                className="w-full"
              />
            </div>
            <div className="w-full">
              <div className="mb-1">
                <label>Start Date</label>
              </div>
              <DatePicker
                defaultValue={dayjs()}
                onChange={(date, dateString) =>
                  handleChange({ target: { name: 'start_date', value: dateString } })
                }
                className="w-full"
              />
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>End Date</label>
              </div>
              <DatePicker
                defaultValue={dayjs()}
                onChange={(date, dateString) =>
                  handleChange({ target: { name: 'end_date', value: dateString } })
                }
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

AddBroadcastWeek.layout = (page) => <Layout title="Add Broadcast Week">{page}</Layout>
export default AddBroadcastWeek
