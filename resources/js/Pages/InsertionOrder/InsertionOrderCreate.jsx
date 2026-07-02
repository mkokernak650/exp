import React, { useState } from 'react'
import Layout from '../Layout/Layout'
import { Helmet } from 'react-helmet'
import { Button, Row, Col, Typography, Radio, Select, Checkbox } from 'antd'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import NormalModal from '../../Shared/NormalModal'
import IoModalView from '../../Components/IOComponents/IOModalView'
import CashBuyScheduleEditor from './CashBuyScheduleEditor'

const { Title } = Typography

const InsertionOrderCreate = () => {
  const { campaigns, customers, allCorporations = [] } = usePage().props
  const [campaignIds, setCampaignIds] = useState('')
  const [customerIds, setCustomerIds] = useState('')
  const [affiliateOptions, setAffiliateOptions] = useState()
  const [codeAndPhoneOptions, setCodeAndPhoneOptions] = useState([])
  const [selectedAffiliates, setSelectedAffiliates] = useState('')
  const [selectedCodesAndPhones, setSelectedCodesAndPhones] = useState('')
  const [insertionOrderFor, setInsertionOrderFor] = useState('customer')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [loading, setLoading] = useState({ view: false, submit: false, save: false })
  const [viewData, setViewData] = useState({})
  const [showViewModal, setShowViewModal] = useState({ open: false })

  const [selectedCorporation, setSelectedCorporation] = useState(null)
  const [applyToAllAffiliates, setApplyToAllAffiliates] = useState(false)
  const [cashBuySpots, setCashBuySpots] = useState([])

  const corporationOptions = allCorporations.map((c) => ({
    value: `${c.type}:${c.id}`,
    label: `${c.name} (${c.type_label})`,
    type: c.type,
    id: c.id,
  }))

  const parseCorpComposite = (composite) => {
    if (!composite) return { type: null, id: null }
    const [type, idStr] = composite.split(':')
    return { type, id: parseInt(idStr, 10) }
  }

  const campaignOptions = campaigns.map((item) => ({
    label: item.campaign_name,
    value: item.id.toString(),
  }))

  const customerOptions = customers.map((item) => ({
    label: item.customer_name,
    value: item.id + '+cEmail+' + (item.email ? item.email : 'n/a'),
  }))

  const terms = ['Cash in advance', 'Net 7 days', 'Net 14 days', 'Net 30 days', 'Net 45 days']

  const termOptions = terms.map((item) => ({
    label: item,
    value: item,
  }))

  const handleCampaignChange = (value) => {
    setCampaignIds(value)
    getAffiliates(value, customerIds)
    getCodesAndPhones(value, customerIds, selectedAffiliates)
    setSelectedAffiliates('')
    setSelectedCodesAndPhones('')
  }

  const handleCustomerChange = (value) => {
    setCustomerIds(value)
    getAffiliates(campaignIds, value)
    getCodesAndPhones(campaignIds, value, selectedAffiliates)
    setSelectedAffiliates('')
    setSelectedCodesAndPhones('')
  }

  const handleAffiliateChange = (value) => {
    setSelectedAffiliates(value)
    // When a corporation is in play, codes/phones live on ecommerce_affiliates rows
    // that may not exist for corp-linked affiliates. Drop the affiliate filter then so
    // the user still sees campaign/customer codes/phones to attach.
    const affiliateFilter = selectedCorporation ? '' : value
    getCodesAndPhones(campaignIds, customerIds, affiliateFilter)
    setSelectedCodesAndPhones('')
  }

  const getAffiliates = (
    selectedCampaigns,
    selectedCustomers,
    corpComposite = selectedCorporation
  ) => {
    const { type, id } = parseCorpComposite(corpComposite)
    axios
      .post(route('insertion.order.get.affiliates'), {
        selectedCampaigns,
        selectedCustomers,
        corporation_type: type,
        corporation_id: id,
      })
      .then((response) => {
        if (response.data) {
          setAffiliateOptions(response.data)
          // Apply-to-all: auto-pick every affiliate + refresh codes/phones.
          if (applyToAllAffiliates) {
            const allValues = response.data.map((opt) => opt.value).join(',')
            setSelectedAffiliates(allValues)
            getCodesAndPhones(selectedCampaigns, selectedCustomers, allValues)
          }
        }
      })
      .catch((err) => {
        toast.error('Affiliates fetching failed!')
      })
  }

  const handleCorporationChange = (value) => {
    setSelectedCorporation(value || null)
    getAffiliates(campaignIds, customerIds, value || null)
    setSelectedAffiliates('')
    setSelectedCodesAndPhones('')
    // Refresh codes/phones using only campaign + customer (corp path bypasses affiliate filter).
    if (value) {
      getCodesAndPhones(campaignIds, customerIds, '')
    }
  }

  const handleApplyToAllChange = (e) => {
    const checked = e.target.checked
    setApplyToAllAffiliates(checked)
    if (checked && Array.isArray(affiliateOptions)) {
      const allValues = affiliateOptions.map((opt) => opt.value).join(',')
      setSelectedAffiliates(allValues)
      getCodesAndPhones(campaignIds, customerIds, '')
    } else {
      setSelectedAffiliates('')
      setSelectedCodesAndPhones('')
    }
  }

  const getCodesAndPhones = (
    selectedCampaigns,
    selectedCustomers,
    selectedAffiliates,
    corpComposite = selectedCorporation
  ) => {
    const { type, id } = parseCorpComposite(corpComposite)
    axios
      .post(route('insertion.order.get.codes.phones'), {
        selectedCampaigns,
        selectedCustomers,
        selectedAffiliates,
        corporation_type: type,
        corporation_id: id,
      })
      .then((response) => {
        if (response.data) {
          setCodeAndPhoneOptions(response.data)
        }
      })
      .catch((err) => {
        toast.error('Codes and Phones fetching failed!')
      })
  }

    const handleSubmit = (e, type = 'create&save') => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('selectedCustomers', customerIds)
    formData.append('selectedAffiliates', selectedAffiliates)
    formData.append('selectedCodesAndPhones', selectedCodesAndPhones)
    formData.append('insertionOrderFor', insertionOrderFor)
    formData.append('selectedTerm', selectedTerm)
    formData.append('type', type)
    const { type: corpType, id: corpId } = parseCorpComposite(selectedCorporation)
    formData.append('corporation_type', corpType || '')
    formData.append('corporation_id', corpId || '')
    formData.append('apply_to_all_affiliates', applyToAllAffiliates ? '1' : '0')

    cashBuySpots.forEach((s, i) => {
      formData.append(`cash_buy_spots[${i}][spot_date]`, s.spot_date)
      formData.append(`cash_buy_spots[${i}][spot_time]`, s.spot_time)
      formData.append(`cash_buy_spots[${i}][affiliate_id]`, s.affiliate_id)
      formData.append(`cash_buy_spots[${i}][day_of_week]`, s.day_of_week)
      formData.append(`cash_buy_spots[${i}][time_zone]`, s.time_zone)
      formData.append(`cash_buy_spots[${i}][amount]`, s.amount)
      formData.append(`cash_buy_spots[${i}][weeks_count]`, 1)
    })

    if (type === 'create&save') {
      setLoading((oldValues) => ({ ...oldValues, submit: true }))
    } else {
      setLoading((oldValues) => ({ ...oldValues, save: true }))
    }

    axios
      .post(route('insertion.order.store'), formData)
      .then((response) => {
        if (response.data.success === true) {
          setCampaignIds('')
          setCustomerIds('')
          setAffiliateOptions()
          setSelectedAffiliates('')
          setSelectedCodesAndPhones('')
          setInsertionOrderFor('customer')
          setSelectedTerm('')
          setCashBuySpots([])
          toast.success(response.data.msg)
          setLoading((oldValues) => ({ ...oldValues, submit: false, save: false }))
        } else {
          toast.error(response.data.msg)
          setLoading((oldValues) => ({ ...oldValues, submit: false, save: false }))
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.msg || 'Something went wrong!'
        toast.error(msg)
        setLoading((oldValues) => ({ ...oldValues, submit: false, save: false }))
      })
  }

  const handleView = () => {
    const formData = new FormData()
    formData.append('selectedCustomers', customerIds)
    formData.append('selectedAffiliates', selectedAffiliates)
    formData.append('selectedCodesAndPhones', selectedCodesAndPhones)
    formData.append('insertionOrderFor', insertionOrderFor)
    formData.append('selectedTerm', selectedTerm)
    setLoading((oldValues) => ({ ...oldValues, view: true }))

    axios
      .post(route('insertion.order.view'), formData)
      .then((response) => {
        if (response.data.success === true) {
          setViewData(response.data.data)
          setShowViewModal({ open: true })
          setLoading((oldValues) => ({ ...oldValues, view: false }))
        } else {
          toast.error(response.data.msg)
          setLoading((oldValues) => ({ ...oldValues, view: false }))
        }
      })
      .catch((err) => {
        toast.error('Something went wrong!')
        setLoading((oldValues) => ({ ...oldValues, view: false }))
      })
  }

  return (
    <>
      <Helmet title="Insertion Order - Create" />
      <div className="grid w-[800px] m-auto mt-8 p-10 grow shadow-md rounded-lg bg-white">
        <Title level={5} className="text-center !text-xl !mb-[35px]">
          Insertion Order
        </Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <MultiSelect
                name="campaign_ids"
                onChange={(value) => handleCampaignChange(value)}
                options={campaignOptions}
                defaultValue={campaignIds}
                className="!w-full"
                placeholder="Select Campaigns"
              />
            </Col>
            <Col span={24}>
              <MultiSelect
                name="customer_ids"
                onChange={(value) => handleCustomerChange(value)}
                options={customerOptions}
                defaultValue={customerIds}
                className="!w-full"
                placeholder="Select Customers"
              />
            </Col>

            <Col span={24}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Select Corporation (broadcast group / MSO / network) — optional"
                className="w-full"
                value={selectedCorporation || undefined}
                onChange={handleCorporationChange}
                options={corporationOptions}
              />
            </Col>

            {selectedCorporation && (
              <Col span={24}>
                <Checkbox
                  checked={applyToAllAffiliates}
                  onChange={handleApplyToAllChange}
                  disabled={!campaignIds && !customerIds}
                >
                  Apply to all affiliates of this corporation
                </Checkbox>
              </Col>
            )}

            <Col span={24}>
              <MultiSelect
                name="affiliate_ids"
                key={`aff-${selectedAffiliates}`}
                onChange={(value) => handleAffiliateChange(value)}
                options={affiliateOptions}
                defaultValue={selectedAffiliates}
                className="!w-full"
                placeholder={applyToAllAffiliates ? 'All affiliates of corporation (auto)' : 'Select Affiliates'}
                disabled={(!campaignIds && !customerIds) || applyToAllAffiliates}
              />
            </Col>

            <Col span={24}>
              <MultiSelect
                name="codes_and_Phones"
                onChange={(value) => setSelectedCodesAndPhones(value)}
                options={codeAndPhoneOptions}
                defaultValue={selectedCodesAndPhones}
                className="!w-full"
                placeholder="Select Codes or Phones"
              />
            </Col>

            <Col span={24}>
              <MultiSelect
                name="term"
                onChange={(value) => setSelectedTerm(value)}
                options={termOptions}
                defaultValue={selectedTerm}
                className="!w-full"
                placeholder="Select Terms"
                singleSelect
              />
            </Col>

            <Col span={24}>
              <Radio.Group
                name="insertion_order_for"
                value={insertionOrderFor}
                onChange={(e) => setInsertionOrderFor(e.target.value)}
                className="flex flex-row"
              >
                <Radio value="customer">For Customer</Radio>
                <Radio value="affiliate">For Affiliate</Radio>
              </Radio.Group>
            </Col>

            <Col span={24}>
              <CashBuyScheduleEditor
                spots={cashBuySpots}
                setSpots={setCashBuySpots}
                affiliateOptions={affiliateOptions || []}
              />
            </Col>

            <Row justify="end" className="w-full">
              <Col className="mr-2">
                <Button
                  disabled={
                    (insertionOrderFor === 'affiliate' && !selectedAffiliates) ||
                    (insertionOrderFor === 'customer' && !customerIds) ||
                    !selectedCodesAndPhones ||
                    loading.view
                  }
                  onClick={handleView}
                  loading={loading.view}
                >
                  View
                </Button>
              </Col>
              <Col className="mr-2">
                <Button
                  disabled={
                    (insertionOrderFor === 'affiliate' && !selectedAffiliates) ||
                    (insertionOrderFor === 'customer' && !customerIds) ||
                    !selectedCodesAndPhones ||
                    loading.save ||
                    loading.submit
                  }
                  onClick={(e) => handleSubmit(e, 'save')}
                  loading={loading.save}
                >
                  Save
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  disabled={
                    (insertionOrderFor === 'affiliate' && !selectedAffiliates) ||
                    (insertionOrderFor === 'customer' && !customerIds) ||
                    !selectedCodesAndPhones ||
                    loading.submit ||
                    loading.save
                  }
                  htmlType="submit"
                  loading={loading.submit}
                >
                  CREATE & SEND
                </Button>
              </Col>
            </Row>
          </Row>
        </form>
      </div>
      <NormalModal
        open={showViewModal.open}
        setOpen={setShowViewModal}
        width={'794px'}
        title={'Insertion Order View'}
      >
        <div>
          <IoModalView viewData={viewData} />
        </div>
      </NormalModal>
    </>
  )
}

InsertionOrderCreate.layout = (page) => <Layout title="Insertion Order - Create">{page}</Layout>
export default InsertionOrderCreate
