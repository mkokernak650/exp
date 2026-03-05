import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Input, DatePicker } from 'antd'
import { Row, Col } from 'antd'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import toast from 'react-hot-toast'

const AddBroadcastWeek = () => {
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
      <div style={{ display: 'grid', width: '500px', margin: 'auto', marginTop: '2rem', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', borderRadius: '4px', background: '#fff' }}>
        <Typography.Title level={5} style={{ textAlign: 'center', marginBottom: '35px' }}>
          Add Broadcast Week
        </Typography.Title>
        <form onSubmit={handleSubmit} className="add-target">
          <Row gutter={[16, 16]}>
            <Col span={24} style={{ padding: '4px', marginBottom: '15px' }}>
              <div>
                <label>Broadcast Week</label>
                <Input
                  name="broad_cast_week"
                  onChange={handleChange}
                  type="text"
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
            <Col span={24} style={{ padding: '4px', marginBottom: '15px' }}>
              <div>
                <label>Start Date</label>
                <DatePicker
                  defaultValue={dayjs()}
                  onChange={(date, dateString) => handleChange({ target: { name: 'start_date', value: dateString } })}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>

            <Col span={24} style={{ padding: '4px', marginBottom: '15px' }}>
              <div>
                <label>End Date</label>
                <DatePicker
                  defaultValue={dayjs()}
                  onChange={(date, dateString) => handleChange({ target: { name: 'end_date', value: dateString } })}
                  style={{ width: '100%' }}
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

AddBroadcastWeek.layout = (page) => <Layout title="Add Broadcast Week">{page}</Layout>
export default AddBroadcastWeek
