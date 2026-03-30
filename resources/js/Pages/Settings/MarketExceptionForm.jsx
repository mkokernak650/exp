import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Select, DatePicker, Row } from 'antd'
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
      [name]:
        name === 'campaign_id' && value != null && value !== ''
          ? Number(value)
          : value,
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
            <div className="w-full">
              <div className="mb-1">
                <label>Select Campaign</label>
              </div>
              <Select
                id="campaign_id"
                placeholder="Select Campaign"
                onChange={(value) => handleSelectChange('campaign_id', value)}
                className="w-full"
                value={values?.campaign_id}
                allowClear
                onClear={() => handleSelectChange('campaign_id', undefined)}
              >
                {allCampaigns.map((option, indx) => (
                  <Select.Option key={option.id ?? indx} value={Number(option.id)}>
                    {option.campaign_name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>Select State</label>
              </div>
              <Select
                id="state"
                placeholder="Select State"
                onChange={(value) => handleSelectChange('state', value)}
                className="w-full"
                value={values?.state}
                allowClear
                onClear={() => handleSelectChange('state', undefined)}
              >
                {allStates.map((option, indx) => (
                  <Select.Option key={indx} value={option.state}>
                    {option.state}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>Select Market</label>
              </div>
              <Select
                id="market"
                placeholder="Select Market"
                onChange={(value) => handleSelectChange('market', value)}
                className="w-full"
                value={values?.market}
                allowClear
                onClear={() => handleSelectChange('market', undefined)}
              >
                {allMarkets.map((option, indx) => (
                  <Select.Option key={indx} value={option.market}>
                    {option.market}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>Call Type</label>
              </div>
              <Select
                id="call_type"
                placeholder="Call Type"
                onChange={(value) => handleSelectChange('call_type', value)}
                className="w-full"
                value={values?.call_type}
                allowClear
                onClear={() => handleSelectChange('call_type', undefined)}
              >
                <Select.Option value="L">Landline (L)</Select.Option>
                <Select.Option value="W">Wireless (W)</Select.Option>
                <Select.Option value="B">Both L & W</Select.Option>
              </Select>
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>Start Date</label>
              </div>
              <DatePicker
                onChange={(date, dateString) =>
                  handleChange({ target: { name: 'start_date', value: dateString } })
                }
                className="w-full"
                value={values?.start_date ? dayjs(values.start_date) : null}
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

MarketExceptionForm.layout = (page) => <Layout title="Market Exception">{page}</Layout>
export default MarketExceptionForm
