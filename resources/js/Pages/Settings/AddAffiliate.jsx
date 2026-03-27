import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Select, Spin } from 'antd'
import { Row, Col } from 'antd'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'
import TextInput from '@/Components/Global/TextInput'
import { usePage } from '@inertiajs/inertia-react'
import Note from '../../Components/Note'

const AddAffiliate = () => {
  const [values, setValues] = useState()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [similarAffiliates, setSimilarAffiliates] = useState('')
  const { allMarkets } = usePage().props

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
      .post(route('store.affiliate'), values)
      .then((res) => {
        if (res.status === 206) {
          setLoading(false)
          setErrors({})
          setSimilarAffiliates(res.data.msg)
        }
        if (res.status === 200) {
          setLoading(false)
          toast.success(res.data.msg)
          e.target.reset()
          setErrors({})
          setValues()
          setSimilarAffiliates('')
        }
      })
      .catch((err) => {
        setLoading(false)
        setErrors(err.response.data.errors)
      })
  }

  return (
    <>
      <Helmet title="Add Affiliate" />
      <Note>
        <p>For Ringba affiliates, fetching the Ringba data will fetch affiliates as well.</p>
        <p>
          To avoid duplicate affiliates, update Ringba data first, and then this page will prevent
          users from inserting duplicates.
        </p>
      </Note>
      <div className="grid w-[500px] m-auto mt-8 p-10 shadow rounded bg-white">
        <Typography.Title level={5} className="text-center !text-xl !mb-[35px]">
          Add Affiliate
        </Typography.Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[16, 16]}>
            <TextInput
              label="Affiliate Id"
              name="affiliate_id"
              handleChange={handleChange}
              error={errors?.affiliate_id}
              helperText={errors?.affiliate_id?.[0]}
            />
            <TextInput
              label="Affiliate Name"
              name="affiliate_name"
              handleChange={handleChange}
              error={errors?.affiliate_name || similarAffiliates}
              helperText={errors?.affiliate_name?.[0] || similarAffiliates}
            />
            <TextInput label="Email" name="email" handleChange={handleChange} />
            <TextInput label="Telephone" name="telephone" handleChange={handleChange} />
            <TextInput label="Address" name="address" handleChange={handleChange} />
            <div className="w-full">
              <div className="mb-1">
                <label>Select Market</label>
              </div>
              <Select
                id="market"
                placeholder="Select Market"
                value={values?.market ?? undefined}
                onChange={(value) => {
                  handleChange({ target: { name: 'market', value } })
                }}
                className="w-full "
                status={errors?.market ? 'error' : undefined}
                allowClear
              >
                {allMarkets.map((item) => (
                  <Select.Option key={item.market} value={item.market}>
                    {item.market}
                  </Select.Option>
                ))}
              </Select>
              {errors?.market && <div className="text-red-500 text-xs">{errors?.market?.[0]}</div>}
            </div>
            <TextInput label="Contact Name" name="contact_name" handleChange={handleChange} />
            <TextInput
              label="Contact Telephone"
              name="contact_telephone"
              handleChange={handleChange}
            />

              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
          </Row>
        </form>
      </div>
    </>
  )
}

AddAffiliate.layout = (page) => <Layout title="Add Affiliate">{page}</Layout>
export default AddAffiliate
