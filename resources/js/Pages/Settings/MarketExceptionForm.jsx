import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Select, Spin, DatePicker } from 'antd'
import { Row, Col } from 'antd'
import { usePage } from '@inertiajs/inertia-react'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import toast from 'react-hot-toast'

const MarketExceptionForm = () => {
  const [values, setValues] = useState()
  const [loading, setLoading] = useState(false)
  const { allMarkets, allCampaigns, allStates } = usePage().props

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .post(route('add.market.exception'), values)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          toast.success(res.data.msg)
        }
      })
      .catch((err) => {
        setLoading(false)
        toast.error(err.response?.data?.msg || 'Something went wrong')
      })
  }

  return (
    <>
      <Helmet title="Add Exceptions" />
      <div className="grid w-[500px] m-auto mt-8 p-10 shadow rounded bg-white">
        <Typography.Title level={5} className="text-center !text-xl !mb-[35px]">
          Add Exceptions
        </Typography.Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Select
                id="campaign_id"
                placeholder="Select Campaign"
                onChange={(value) => handleSelectChange('campaign_id', value)}
                className="w-full"
              >
                {allCampaigns.map((option, indx) => (
                  <Select.Option key={indx} value={option.id}>
                    {option.campaign_name}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={24}>
              <Select
                id="state"
                placeholder="Select State"
                onChange={(value) => handleSelectChange('state', value)}
                className="w-full"
              >
                {allStates.map((option, indx) => (
                  <Select.Option key={indx} value={option.state}>
                    {option.state}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={24}>
              <Select
                id="market"
                placeholder="Select Market"
                onChange={(value) => handleSelectChange('market', value)}
                className="w-full"
              >
                {allMarkets.map((option, indx) => (
                  <Select.Option key={indx} value={option.market}>
                    {option.market}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={24}>
              <Select
                id="call_type"
                placeholder="Call Type"
                onChange={(value) => handleSelectChange('call_type', value)}
                className="w-full"
              >
                <Select.Option value="L">Landline (L)</Select.Option>
                <Select.Option value="W">Wireless (W)</Select.Option>
                <Select.Option value="B">Both L & W</Select.Option>
              </Select>
            </Col>

            <Col span={24}>
              <div>
                <label>Start Date</label>
                <DatePicker
                  onChange={(date, dateString) =>
                    handleChange({ target: { name: 'start_date', value: dateString } })
                  }
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

MarketExceptionForm.layout = (page) => <Layout title="Market Exception">{page}</Layout>
export default MarketExceptionForm
