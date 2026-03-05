import React, { useEffect, useState } from 'react'
import Layout from '../Layout/Layout'
import { Helmet } from 'react-helmet'
import { Button, Input, Row, Col, Typography, Spin, Radio } from 'antd'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import NormalModal from '../../Shared/NormalModal'
import Cancel from '@/Components/Icons/Cancel.jsx'
import RingbaIOModalView from '../../Components/IOComponents/RingbaIOModalView'

const { Title } = Typography
const { TextArea } = Input

const RingbaInsertionOrderTermCreate = () => {
    const { campaigns, customers } = usePage().props
    const [selectedCampaign, setSelectedCampaign] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState('')
    const [affiliateOptions, setAffiliateOptions] = useState([])
    const [phoneOptions, setPhoneOptions] = useState([])
    const [phoneOptionByAffiliate, setPhoneOptionByAffiliate] = useState([])
    const [payoutOptions, setPayoutOptions] = useState([])
    const [revenueOptions, setRevenueOptions] = useState([])
    const [callLengthOptions, setCallLengthOptions] = useState([])
    const [selectedAffiliate, setSelectedAffiliate] = useState('')
    const [selectedPhone, setSelectedPhone] = useState('')
    const [orderType, setOrderType] = useState('')
    const [selectedTerm, setSelectedTerm] = useState('')
    const [selectedPayout, setSelectedPayout] = useState('')
    const [selectedRevenue, setSelectedRevenue] = useState('')
    const [selectedCallLength, setSelectedCallLength] = useState('')
    const [loading, setLoading] = useState({ submit: false, save: false, view: false, campaignData: false })
    const [insertionOrderFor, setInsertionOrderFor] = useState('customer')
    const [viewData, setViewData] = useState({})
    const [showViewModal, setShowViewModal] = useState({ open: false })
    const [description, setDescription] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [selectedLengths, setSelectedLengths] = useState('')
    const [tmpSelectedAffiliate, setTmpSelectedAffiliate] = useState('')
    const [tmpSelectedPhone, setTmpSelectedPhone] = useState('')
    const [showPhoneFiled, setShowPhoneField] = useState(true)

    const campaignOptions = campaigns.map((item) => ({
        label: item.campaign_name,
        value: item.campaign_id === null ? "null" : item.campaign_id,
    }))

    const customerOptions = customers.map((item) => ({
        label: item.customer_name,
        value: item.id.toString(),
    }))

    const terms = ['Cash in advance', 'Net 7 days', 'Net 10 days', 'Net 14 days', 'Net 30 days', 'Net 45 days']

    const termOptions = terms.map((item) => ({
        label: item,
        value: item,
    }))

    const lengths = [':15', ':30', ':60', ':120', '28:30']

    const lengthOptions = lengths.map((length) => ({
        label: length,
        value: length,
    }))

    const campaignHandleChange = (value) => {
        setSelectedAffiliate('')
        setSelectedPhone('')
        setSelectedPayout('')
        setSelectedRevenue('')
        setSelectedCallLength('')
        setDescription('')
        if (value) {
            setSelectedCampaign(value)
            getDataByCampaign(value)
        } else {
            setSelectedCampaign('')
            setAffiliateOptions([])
            setPhoneOptions([])
            setPhoneOptionByAffiliate([])
            setPayoutOptions([])
            setRevenueOptions([])
            setCallLengthOptions([])
        }
    }

    const getDataByCampaign = (campaignId) => {
        if (campaignId === "null") {
            toast.error('This campaign is not available in Ringba!')
            return
        }

        setLoading((oldValues) => ({ ...oldValues, campaignData: true }))

        axios.post(route('insertion.order.ringba.term.data.by.campaign'), { campaignId })
            .then((response) => {
                if (response.data.success) {
                    const data = response.data.data
                    setAffiliateOptions(data.affiliateOptions)
                    setPhoneOptions(data.phoneOptions)
                    setPhoneOptionByAffiliate(data.phoneOptions)
                    setPayoutOptions(data.payoutOptions)
                    setRevenueOptions(data.revenueOptions)
                    setCallLengthOptions(data.callLengthOptions)
                    setCampaignDescrUrl(data.campaignOtherDetails)
                    toast.success(response.data.msg)
                } else if (!response.data.success) {
                    toast.error(response.data.msg)
                } else {
                    toast.error('something went wrong!')
                }
                setLoading((oldValues) => ({ ...oldValues, campaignData: false }))
            })
            .catch((err) => {
                console.log(err)
                setLoading((oldValues) => ({ ...oldValues, campaignData: false }))
                toast.error('something went wrong!')
            })
    }

    const setCampaignDescrUrl = (value) => {
        if (value.description) {
            setDescription(value.description)
        }
    }

    const affiliateHandleChange = (value) => {
        setSelectedAffiliate(value)
        setSelectedPhone('')
        if (value) {
            const phoneOptionByAffiliate = phoneOptions.filter(item => {
                return value.split(',').some(val => val == item.affiliateId)
            })
            setPhoneOptionByAffiliate(phoneOptionByAffiliate)
        } else {
            setPhoneOptionByAffiliate(phoneOptions)
        }
    }

    const handleInsertionOrderFor = (e) => {
        setInsertionOrderFor(e.target.value)
        setTmpSelectedAffiliate(selectedAffiliate)
        setTmpSelectedPhone(selectedPhone)

        if (e.target.value === 'affiliate') {
            let tmpPhoneOptionByAffiliate

            if (selectedAffiliate) {
                setSelectedAffiliate(selectedAffiliate.split(',')[0])
                const phoneOptionByAffiliate = phoneOptions.filter(item => item.affiliateId === selectedAffiliate.split(',')[0])
                tmpPhoneOptionByAffiliate = phoneOptionByAffiliate
                setPhoneOptionByAffiliate(phoneOptionByAffiliate)
            }

            if (selectedPhone) {
                let phoneSetted = null

                selectedPhone.split(',').forEach(phone => {
                    if (tmpPhoneOptionByAffiliate.some(item => item.value == phone)) {
                        setSelectedPhone(phone)
                        phoneSetted = true
                    }
                })

                if (!phoneSetted) {
                    setSelectedPhone('')
                }
            }
        } else {
            setSelectedAffiliate(tmpSelectedAffiliate)
            setSelectedPhone(tmpSelectedPhone)
            const phoneOptionByAffiliate = phoneOptions.filter(item => {
                return tmpSelectedAffiliate.split(',').some(val => val == item.affiliateId)
            })
            setPhoneOptionByAffiliate(phoneOptionByAffiliate)
        }
    }

    useEffect(() => {
        setShowPhoneField(false)
        const timeoutId = setTimeout(() => {
            setShowPhoneField(true)
            clearTimeout(timeoutId)
        }, 300);
    }, [insertionOrderFor])

    const handleSubmit = (e, submitType = 'create&save') => {
        e.preventDefault()

        if (submitType === 'create&save') {
            setLoading((oldValues) => ({ ...oldValues, submit: true }))
        } else {
            setLoading((oldValues) => ({ ...oldValues, save: true }))
        }

        const formData = new FormData()
        formData.append('campaign_id', selectedCampaign)
        formData.append('customer_id', selectedCustomer)
        formData.append('affiliate_id', selectedAffiliate)
        formData.append('phone', selectedPhone)
        formData.append('order_type', orderType)
        formData.append('term', selectedTerm)
        formData.append('payout', selectedPayout)
        formData.append('revenue', selectedRevenue)
        formData.append('call_length', selectedCallLength)
        formData.append('io_for', insertionOrderFor)
        formData.append('submit_type', submitType)
        formData.append('video_url', videoUrl)
        formData.append('lengths', selectedLengths)

        axios
            .post(route('insertion.order.ringba.term.store'), formData)
            .then((response) => {
                if (response.data.success) {
                    toast.success(response.data.msg)
                    setLoading((oldValues) => ({ ...oldValues, submit: false, save: false }))
                } else {
                    toast.error(response.data.msg)
                    setLoading((oldValues) => ({ ...oldValues, submit: false, save: false }))
                }
            })
            .catch((err) => {
                toast.error('Something went wrong!')
                setLoading((oldValues) => ({ ...oldValues, submit: false, save: false }))
            })
    }

    const handleView = () => {
        setLoading((oldValues) => ({ ...oldValues, view: true }))

        const formData = new FormData()
        formData.append('campaign_id', selectedCampaign)
        formData.append('customer_id', selectedCustomer)
        formData.append('affiliate_id', selectedAffiliate)
        formData.append('phone', selectedPhone)
        formData.append('order_type', orderType)
        formData.append('term', selectedTerm)
        formData.append('payout', selectedPayout)
        formData.append('revenue', selectedRevenue)
        formData.append('call_length', selectedCallLength)
        formData.append('io_for', insertionOrderFor)
        formData.append('video_url', videoUrl)
        formData.append('lengths', selectedLengths)

        axios
            .post(route('insertion.order.ringba.term.view'), formData)
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
            <Helmet title="Pay Per Call Insertion Order Term - Create" />
            <div className="grid w-[600px] m-auto mt-8 p-10 grow shadow-md rounded-lg bg-white">
                <Title level={5} className="text-center mb-[35px]">
                    Pay Per Call Insertion Order Term
                </Title>
                <form onSubmit={handleSubmit}>
                    <Row gutter={[0, 16]}>
                        <Col span={24}>
                            <MultiSelect
                                name="select_campaign"
                                onChange={(value) => campaignHandleChange(value)}
                                options={campaignOptions}
                                defaultValue={selectedCampaign}
                                className="w-full"
                                placeholder="Select Campaign"
                                singleSelect
                            />
                        </Col>
                        {loading.campaignData && <Col span={24}>
                            <div className="flex items-center">
                                <Spin size="small" className="mr-[5px]" /> Fetching campaign related data...
                            </div>
                        </Col>}
                        <Col span={24}>
                            <MultiSelect
                                name="select_customer"
                                onChange={(value) => setSelectedCustomer(value)}
                                options={customerOptions}
                                defaultValue={selectedCustomer}
                                className="w-full"
                                placeholder="Select Customer"
                                singleSelect
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="select_affiliate"
                                onChange={(value) => affiliateHandleChange(value)}
                                options={affiliateOptions}
                                defaultValue={selectedAffiliate}
                                className="w-full"
                                placeholder="Select Affiliate"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect={insertionOrderFor === 'affiliate'}
                            />
                        </Col>

                        <Col span={24}>
                            {showPhoneFiled ? <MultiSelect
                                name="ringba_phone"
                                onChange={(value) => setSelectedPhone(value)}
                                options={phoneOptionByAffiliate}
                                defaultValue={selectedPhone}
                                className="w-full"
                                placeholder="Select Phone"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect={insertionOrderFor === 'affiliate'}
                            /> :
                                <div className="flex items-center">
                                    <Spin size="small" className="mr-[5px]" /> loading phone filed...
                                </div>
                            }
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="order_type"
                                onChange={(value) => setOrderType(value)}
                                options={[{ value: '1', label: 'Pay Per Call' }]}
                                defaultValue={orderType}
                                className="w-full"
                                placeholder="Select Order Type"
                                singleSelect
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="term"
                                onChange={(value) => setSelectedTerm(value)}
                                options={termOptions}
                                defaultValue={selectedTerm}
                                className="w-full"
                                placeholder="Select Terms"
                                singleSelect
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="select_payout"
                                onChange={(value) => setSelectedPayout(value)}
                                options={payoutOptions}
                                defaultValue={selectedPayout}
                                className="w-full"
                                placeholder="Select Payout"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="select_revenue"
                                onChange={(value) => setSelectedRevenue(value)}
                                options={revenueOptions}
                                defaultValue={selectedRevenue}
                                className="w-full"
                                placeholder="Select Revenue"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="select_call_length"
                                onChange={(value) => setSelectedCallLength(value)}
                                options={callLengthOptions}
                                defaultValue={selectedCallLength}
                                className="w-full"
                                placeholder="Select Call Length"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="select_lengths"
                                onChange={(value) => setSelectedLengths(value)}
                                options={lengthOptions}
                                defaultValue={selectedLengths}
                                className="w-full"
                                placeholder="Select Lengths"
                            />
                        </Col>

                        <Col span={24}>
                            <div>
                                <label>DRTV Download Link</label>
                                <Input
                                    name="video_url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </Col>

                        <Col span={24}>
                            <div>
                                <label>Description (read only)</label>
                                <TextArea
                                    name="description"
                                    value={description}
                                    className="w-full"
                                    rows={3}
                                    readOnly
                                />
                            </div>
                        </Col>

                        <Col span={24}>
                            <Radio.Group
                                name="insertion_order_for"
                                value={insertionOrderFor}
                                onChange={handleInsertionOrderFor}
                                className="flex flex-row"
                            >
                                <Radio value="customer">For Customer</Radio>
                                <Radio value="affiliate">For Affiliate</Radio>
                            </Radio.Group>
                        </Col>

                        <Row justify="end" className="w-full">
                            <Col className="mr-2">
                                <Button
                                    disabled={(insertionOrderFor === 'affiliate' && (!selectedAffiliate || !selectedPayout)) || (insertionOrderFor === 'customer' && (!selectedCustomer || !selectedRevenue)) || !selectedCampaign || !selectedPhone || loading.submit || loading.save || loading.view}
                                    onClick={handleView}
                                    loading={loading.view}
                                >
                                    View
                                </Button>
                            </Col>
                            <Col className="mr-2">
                                <Button
                                    disabled={(insertionOrderFor === 'affiliate' && (!selectedAffiliate || !selectedPayout)) || (insertionOrderFor === 'customer' && (!selectedCustomer || !selectedRevenue)) || !selectedCampaign || !selectedPhone || loading.submit || loading.save}
                                    onClick={(e) => handleSubmit(e, 'save')}
                                    loading={loading.save}
                                >
                                    Save
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    disabled={(insertionOrderFor === 'affiliate' && (!selectedAffiliate || !selectedPayout)) || (insertionOrderFor === 'customer' && (!selectedCustomer || !selectedRevenue)) || !selectedCampaign || !selectedPhone || loading.submit || loading.save}
                                    htmlType="submit"
                                    loading={loading.submit}
                                >
                                    Create and Send
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
                    <RingbaIOModalView viewData={viewData} />
                    <div onClick={() => setShowViewModal({ open: false })} className="close-modal-icon">
                        <Cancel />
                    </div>
                </div>
            </NormalModal>
        </>
    )
}

RingbaInsertionOrderTermCreate.layout = (page) => <Layout title="Pay Per Call Insertion Order Term - Create">{page}</Layout>
export default RingbaInsertionOrderTermCreate
