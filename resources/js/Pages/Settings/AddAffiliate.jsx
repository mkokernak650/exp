import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Select } from 'antd'
import { Row } from 'antd'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import toast from 'react-hot-toast'
import TextInput from '@/Components/Global/TextInput'
import AffiliateZipCodeSelect from '@/Components/AffiliateZipCodeSelect'
import { usePage } from '@inertiajs/inertia-react'
import Note from '../../Components/Note'

const AddAffiliate = () => {
  const [values, setValues] = useState()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [similarAffiliates, setSimilarAffiliates] = useState('')
  const [selectedCorporations, setSelectedCorporations] = useState([])
  const {
    allMarkets,
    allBroadcastGroupNames,
    allMsoNames,
    allNetworkNames,
    allCorporations = [],
  } = usePage().props

  const corporationOptions = allCorporations.map((c) => ({
    value: `${c.type}:${c.id}`,
    label: `${c.name} (${c.type_label})`,
    type: c.type,
    id: c.id,
  }))

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

    const corporations = selectedCorporations
      .map((compositeValue) => {
        const match = corporationOptions.find((opt) => opt.value === compositeValue)
        return match ? { type: match.type, id: match.id } : null
      })
      .filter(Boolean)

    const payload = { ...(values || {}), corporations }

    axios
      .post(route('store.affiliate'), payload)
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
          setSelectedCorporations([])
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
            <div className="w-full">
              <div className="mb-1">
                <label>Select Ownership</label>
              </div>
              <Select
                id="ownership_type"
                placeholder="Select Ownership"
                value={values?.ownership_type ?? undefined}
                onChange={(value) => {
                  handleChange({ target: { name: 'ownership_type', value } })
                  handleChange({ target: { name: 'ownership_name', value: undefined } })
                }}
                className="w-full"
                allowClear
                onClear={() => {
                  handleChange({ target: { name: 'ownership_type', value: undefined } })
                  handleChange({ target: { name: 'ownership_name', value: undefined } })
                }}
              >
                <Select.Option value="Broadcast Group">Broadcast Group</Select.Option>
                <Select.Option value="MSO">MSO</Select.Option>
                <Select.Option value="Network">Network</Select.Option>
              </Select>
            </div>
            {values?.ownership_type === 'Broadcast Group' && (
              <div className="w-full">
                <div className="mb-1">
                  <label>Select Broadcast Group Name</label>
                </div>
                <Select
                  id="ownership_name"
                  placeholder="Select Broadcast Group Name"
                  value={values?.ownership_name ?? undefined}
                  onChange={(value) => {
                    handleChange({ target: { name: 'ownership_name', value } })
                  }}
                  className="w-full"
                  allowClear
                >
                  {allBroadcastGroupNames.map((item) => (
                    <Select.Option
                      key={item.broadcast_group_name}
                      value={item.broadcast_group_name}
                    >
                      {item.broadcast_group_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
            {values?.ownership_type === 'MSO' && (
              <div className="w-full">
                <div className="mb-1">
                  <label>Select MSO Name</label>
                </div>
                <Select
                  id="ownership_name"
                  placeholder="Select MSO Name"
                  value={values?.ownership_name ?? undefined}
                  onChange={(value) => {
                    handleChange({ target: { name: 'ownership_name', value } })
                  }}
                  className="w-full"
                  allowClear
                >
                  {allMsoNames.map((item) => (
                    <Select.Option key={item.mso_name} value={item.mso_name}>
                      {item.mso_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
            {values?.ownership_type === 'Network' && (
              <div className="w-full">
                <div className="mb-1">
                  <label>Select Network Name</label>
                </div>
                <Select
                  id="ownership_name"
                  placeholder="Select Network Name"
                  value={values?.ownership_name ?? undefined}
                  onChange={(value) => {
                    handleChange({ target: { name: 'ownership_name', value } })
                  }}
                  className="w-full"
                  allowClear
                >
                  {allNetworkNames.map((item) => (
                    <Select.Option key={item.network_name} value={item.network_name}>
                      {item.network_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
            <div className="w-full">
              <div className="mb-1">
                <label>Select ZipCode</label>
              </div>
              <AffiliateZipCodeSelect
                id="zip_code"
                value={values?.zip_code}
                onChange={(value) => handleChange({ target: { name: 'zip_code', value } })}
                status={errors?.zip_code ? 'error' : undefined}
              />
              {errors?.zip_code && (
                <div className="text-red-500 text-xs">{errors?.zip_code?.[0]}</div>
              )}
            </div>
            <TextInput
              label="Website"
              name="website"
              type="url"
              handleChange={handleChange}
              error={errors?.website}
              helperText={errors?.website?.[0]}
              placeholder="https://example.com"
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
            <TextInput label="Contact Title" name="contact_title" handleChange={handleChange} />
            <TextInput
              label="Contact Telephone"
              name="contact_telephone"
              handleChange={handleChange}
            />

            <div className="w-full">
              <div className="mb-1">
                <label>
                  Corporations (multi-link) <small className="text-gray-500">— optional</small>
                </label>
              </div>
              <Select
                mode="multiple"
                placeholder="Link to broadcast groups, MSOs and/or networks"
                value={selectedCorporations}
                onChange={(vals) => setSelectedCorporations(vals)}
                options={corporationOptions}
                className="w-full"
                allowClear
                optionFilterProp="label"
              />
              <small className="text-gray-500">
                One station may belong to multiple corporations (e.g. a broadcast group + a network).
              </small>
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

AddAffiliate.layout = (page) => <Layout title="Add Affiliate">{page}</Layout>
export default AddAffiliate
