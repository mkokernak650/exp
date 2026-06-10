import { React, useEffect, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Input, Select, Row, Col, Typography } from 'antd'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import toast from 'react-hot-toast'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { lengthSelectOptions } from '@/Helpers/lengths'

const { Title } = Typography
const { TextArea } = Input

const AffiliateCreate = () => {
  const defaultState = {
    revenue: 0,
    order_type: '',
    coupon_code: '',
    dialed: '',
    pay_on_multiple_orders: '',
    lengths: '',
    product_code: '',
    campaign_id: '',
    customer_id: '',
    affiliate_id: '',
    affiliate_fee: 0,
    consumerExp_fee: '',
    affiliate_fee_type: '',
    percentage: '',
    cash_buy: '',
    consumerEXP_cash_buy_fee_type: '',
    consumerEXP_cash_buy_fee: '',
    description: '',
    video_url: '',
  }
  const [values, setValues] = useState(defaultState)
  const [loading, setLoading] = useState(false)
  const { affiliates, campaigns, customers } = usePage().props

  useEffect(() => {
    setValues((oldValue) => ({
      ...oldValue,
      consumerExp_fee: oldValue.revenue - oldValue.affiliate_fee,
    }))
  }, [values.revenue, values.affiliate_fee])

  // Percentage of Sales: Total Percentage = Affiliate Fee % + ConsumerEXP Fee %
  useEffect(() => {
    if (values.affiliate_fee_type == 3) {
      const total =
        (Number(values.affiliate_fee) || 0) + (Number(values.consumerEXP_cash_buy_fee) || 0)
      setValues((oldValue) => ({ ...oldValue, percentage: total }))
    }
  }, [values.affiliate_fee, values.consumerEXP_cash_buy_fee, values.affiliate_fee_type])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((oldValues) => ({ ...oldValues, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setValues((oldValues) => ({ ...oldValues, [name]: value ?? '' }))
  }

  const campaginHandleChange = (value) => {
    setValues((oldValues) => ({ ...oldValues, description: '' }))
    setValues((oldValues) => ({ ...oldValues, campaign_id: value ?? '' }))

    if (value) {
      const selectedCampaign = campaigns.filter((campaign) => campaign.id == value)
      if (selectedCampaign[0].description) {
        setValues((oldValues) => ({ ...oldValues, description: selectedCampaign[0].description }))
      } else {
        setValues((oldValues) => ({ ...oldValues, description: '' }))
      }
    }
  }

  const headers = {
    headers: { Accept: 'application/json' },
  }

  const lengthOptions = lengthSelectOptions

  const lengthHandleChange = (val) => {
    setValues((oldValues) => ({ ...oldValues, lengths: val }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .post(route('ecommerce-affiliates.store'), values, headers)
      .then((res) => {
        setLoading(false)
        setValues(defaultState)
        toast.success(res.data.msg)
      })
      .catch((err) => {
        let errors = ''
        if (err.response.data?.errors) {
          Object.values(err.response.data?.errors).map((error) => {
            errors += error[0] + '\n'
          })
        } else if (err.response.data?.msg) {
          errors = err.response.data.msg
        }
        setLoading(false)
        toast.error(errors)
      })
  }

  return (
    <>
      <Helmet title="Create Coupon Code" />
      <div className="grid w-[500px] m-auto mt-8 p-10 grow shadow-md rounded-lg bg-white">
        <Title level={5} className="text-center !text-xl !mb-[35px]">
          Create Phone or Coupon Code
        </Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Select
                value={values?.campaign_id || undefined}
                onChange={(value) => campaginHandleChange(value)}
                className="w-full"
                placeholder="Select Campaign"
                allowClear
                options={campaigns.map((option, indx) => ({
                  key: indx + '-1',
                  value: option.id.toString(),
                  label: option.campaign_name,
                }))}
              />
            </Col>
            <Col span={24}>
              <Select
                value={values?.customer_id || undefined}
                onChange={(value) => handleSelectChange('customer_id', value)}
                className="w-full"
                placeholder="Select Customer"
                allowClear
                options={customers.map((option, indx) => ({
                  key: indx + '-2',
                  value: option.id.toString(),
                  label: option.customer_name,
                }))}
              />
            </Col>
            <Col span={24}>
              <Select
                value={values?.affiliate_id || undefined}
                onChange={(value) => handleSelectChange('affiliate_id', value)}
                className="w-full"
                placeholder="Select Affiliate"
                allowClear
                options={affiliates.map((option, indx) => ({
                  key: indx + '-3',
                  value: option.id.toString(),
                  label: `${option.affiliate_name} (${option.market})`,
                }))}
              />
            </Col>
            <Col span={24}>
              <div>
                <label>Product Code (ISCI Code)</label>
                <Input
                  value={values?.product_code}
                  type="text"
                  name="product_code"
                  placeholder="ISCI Code"
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </Col>
            <Col span={24}>
              <Select
                value={values?.order_type || undefined}
                onChange={(value) => handleSelectChange('order_type', value)}
                className="w-full"
                placeholder="Select Order Type"
                allowClear
                options={[
                  { value: '1', label: 'E-commerce' },
                  { value: '2', label: 'Phone' },
                ]}
              />
            </Col>

            {values?.order_type &&
              (values.order_type == 1 ? (
                <Col span={24}>
                  <div>
                    <label>Coupon Code</label>
                    <Input
                      value={values?.coupon_code}
                      type="text"
                      name="coupon_code"
                      placeholder="Exp: #CX12345"
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </Col>
              ) : (
                <Col span={24}>
                  <div>
                    <label>Dialed Phone</label>
                    <Input
                      value={values?.dialed}
                      type="text"
                      name="dialed"
                      placeholder="123123123"
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </Col>
              ))}

            <Col span={24}>
              <Select
                value={values?.pay_on_multiple_orders || undefined}
                onChange={(value) => handleSelectChange('pay_on_multiple_orders', value)}
                className="w-full"
                placeholder="Pay on multiple orders"
                allowClear
                options={[
                  { value: '1', label: 'Yes' },
                  { value: '0', label: 'No' },
                ]}
              />
            </Col>

            <Col span={24}>
              <MultiSelect
                className="!w-full"
                name="lengths"
                defaultValue={values?.lengths}
                onChange={(val) => lengthHandleChange(val)}
                options={lengthOptions}
                placeholder="Select Length"
              />
            </Col>

            <Col span={24}>
              <Select
                value={values?.affiliate_fee_type || undefined}
                onChange={(value) => handleSelectChange('affiliate_fee_type', value)}
                className="w-full"
                placeholder="Select Affiliate Fee Type"
                allowClear
                options={[
                  { value: '1', label: 'Payout Per Order' },
                  { value: '2', label: 'Cash Buy' },
                  { value: '3', label: 'Percentage of Sales' },
                ]}
              />
            </Col>

            {values?.affiliate_fee_type && values.affiliate_fee_type == 1 && (
              <>
                <Col span={24}>
                  <div>
                    <label>Payout Per Order</label>
                    <Input
                      value={values?.revenue}
                      type="text"
                      name="revenue"
                      placeholder="Exp: 100"
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </Col>

                <Col span={24}>
                  <div>
                    <label>Affiliate Fee</label>
                    <Input
                      value={values?.affiliate_fee}
                      type="text"
                      name="affiliate_fee"
                      placeholder="Exp: 100"
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </Col>

                <Col span={24}>
                  <div>
                    <label>ConsumerEXP Fee</label>
                    <Input
                      value={values?.consumerExp_fee}
                      type="text"
                      name="consumerExp_fee"
                      className="w-full"
                      readOnly
                      disabled
                    />
                  </div>
                </Col>
              </>
            )}

            {values.affiliate_fee_type == 2 && (
              <>
                <Col span={24}>
                  <div>
                    <label>Cash Buy</label>
                    <Input
                      value={values?.cash_buy}
                      type="number"
                      min={0}
                      name="cash_buy"
                      placeholder="10000"
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <Select
                    value={values?.consumerEXP_cash_buy_fee_type || undefined}
                    onChange={(value) => handleSelectChange('consumerEXP_cash_buy_fee_type', value)}
                    className="w-full"
                    placeholder="Select ConsumerEXP Fee Type"
                    allowClear
                    options={[
                      { value: '1', label: 'Percentage' },
                      { value: '2', label: 'Fixed' },
                    ]}
                  />
                </Col>
                <Col span={24}>
                  <div>
                    <label>
                      {values?.consumerEXP_cash_buy_fee_type === '1'
                        ? 'ConsumerEXP Fee (In Percentage)'
                        : 'ConsumerEXP Fee (Fixed)'}
                    </label>
                    <Input
                      value={values?.consumerEXP_cash_buy_fee}
                      type="number"
                      min={0}
                      name="consumerEXP_cash_buy_fee"
                      placeholder="consumerEXP Cash Buy Fee"
                      onChange={handleChange}
                      className="w-full"
                      required
                      disabled={!values?.consumerEXP_cash_buy_fee_type}
                    />
                  </div>
                </Col>
              </>
            )}

            {values.affiliate_fee_type == 3 && (
              <>
                <Col span={24}>
                  <div>
                    <label>Affiliate Fee (% of Sales)</label>
                    <Input
                      value={values?.affiliate_fee}
                      type="number"
                      min={0}
                      name="affiliate_fee"
                      placeholder="Exp: 7"
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <div>
                    <label>ConsumerEXP Fee (% of Sales)</label>
                    <Input
                      value={values?.consumerEXP_cash_buy_fee}
                      type="number"
                      min={0}
                      name="consumerEXP_cash_buy_fee"
                      placeholder="Exp: 3"
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <div>
                    <label>Total Percentage (%)</label>
                    <Input
                      value={values?.percentage}
                      type="number"
                      name="percentage"
                      className="w-full"
                      readOnly
                      disabled
                    />
                  </div>
                </Col>
              </>
            )}

            <Col span={24}>
              <div>
                <label>DRTV Download Link</label>
                <Input
                  value={values?.video_url}
                  type="text"
                  name="video_url"
                  placeholder="DRTV Download Link"
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </Col>
            <Col span={24}>
              <div>
                <label>Description (Read Only)</label>
                <TextArea
                  name="description"
                  value={values?.description}
                  spellCheck
                  className="w-full"
                  rows={4}
                  readOnly
                />
              </div>
            </Col>

            <Col span={24}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </Col>
          </Row>
        </form>
      </div>
    </>
  )
}

AffiliateCreate.layout = (page) => <Layout title="E-commerce Affiliate Create">{page}</Layout>
export default AffiliateCreate
