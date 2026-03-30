import { React, useState } from 'react'
import Layout from '../../Layout/Layout'
import { Button, Typography, Select, Input, Row } from 'antd'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import toast from 'react-hot-toast'

const AnnotationCreate = () => {
  const [values, setValues] = useState()
  const [loading, setLoading] = useState(false)
  const { allCampaigns } = usePage().props

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
      .post(route('annotation.store'), values)
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
      <Helmet title="Create Annotations" />
      <div className="grid w-[500px] m-auto mt-8 p-10 shadow rounded bg-white">
        <Typography.Title level={5} className="text-center !text-xl !mb-[35px]">
          Create Annotations
        </Typography.Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <div className="w-full">
              <div className="mb-1">
                <label>Select Campaign</label>
              </div>
              <Select
                placeholder="Select Campaign"
                onChange={(value) => handleChange({ target: { name: 'campaign_id', value } })}
                className="w-full"
              >
                {allCampaigns.map((option, indx) => (
                  <Select.Option key={indx} value={option.id}>
                    {option.campaign_name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="w-full">
              <div className="mb-1">
                <label>Annotation</label>
              </div>
              <Input
                type="text"
                name="annotation_name"
                onChange={handleChange}
                className="w-full"
                required
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

AnnotationCreate.layout = (page) => <Layout title="Market Exception">{page}</Layout>
export default AnnotationCreate
