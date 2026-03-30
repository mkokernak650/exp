import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Input, Row } from 'antd'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'

const AddTvHousehold = () => {
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
      .post(route('store.tv.households'), values)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false)
          toast.success(res.data.msg)
          e.target.reset()
        }
      })
      .catch((err) => {
        setLoading(false)
        toast.error(err.response?.data?.msg || 'Something went wrong')
      })
  }

  return (
    <>
      <Helmet title="Add TV Households" />
      <div className="grid w-[500px] m-auto mt-8 p-10 shadow rounded bg-white">
        <Typography.Title level={5} className="text-center !text-xl !mb-[35px]">
          Add TV Households
        </Typography.Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <div className="w-full">
              <div className="mb-1">
                <label>Market</label>
              </div>
              <Input
                name="market"
                onChange={handleChange}
                type="text"
                required
                className="w-full"
              />
            </div>
            <div className="w-full">
              <div className="mb-1">
                <label>State</label>
              </div>
              <Input name="state" onChange={handleChange} type="text" className="w-full" />
            </div>
            <div className="w-full">
              <div className="mb-1">
                <label>TV Households</label>
              </div>
              <Input
                name="tv_households"
                onChange={handleChange}
                type="text"
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

AddTvHousehold.layout = (page) => <Layout title="Add Customer">{page}</Layout>
export default AddTvHousehold
