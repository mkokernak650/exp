import React, { useState } from 'react'
import Layout from '../Layout/Layout'
import { Helmet } from 'react-helmet'
import { Button, CircularProgress, FormControlLabel, Grid, Paper, Radio, RadioGroup, TextField, Typography, makeStyles } from '@material-ui/core'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import NormalModal from '../../Shared/NormalModal'
import Cancel from '@/Components/Icons/Cancel.jsx'
import RingbaIOModalView from '../../Components/IOComponents/RingbaIOModalView'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
        width: '600px',
        margin: 'auto',
        marginTop: '2rem',
        padding: '40px',
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
    },
    title: {
        textAlign: 'center',
        marginBottom: '35px',
    },
}))

const RingbaInsertionOrderTermCreate = () => {
    const classes = useStyles()
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
            const phoneOptionByAffiliate = phoneOptions.filter(item => item.affiliateId === value)
            setPhoneOptionByAffiliate(phoneOptionByAffiliate)
        } else {
            setPhoneOptionByAffiliate(phoneOptions)
        }
    }

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

        axios
            .post(route('insertion.order.ringba.term.store'), formData)
            .then((response) => {
                if (response.data.success) {
                    setSelectedCampaign('')
                    setSelectedCustomer('')
                    setSelectedAffiliate('')
                    setSelectedPhone('')
                    setOrderType('')
                    setSelectedTerm('')
                    setSelectedPayout('')
                    setSelectedRevenue('')
                    setSelectedCallLength('')
                    setInsertionOrderFor('customer')
                    setDescription('')
                    setVideoUrl('')
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
            <Paper className={classes.root}>
                <Typography variant="h6" className={classes.title}>
                    Pay Per Call Insertion Order Term
                </Typography>
                <form validate="true" onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <MultiSelect
                                name="select_campaign"
                                onChange={(value) => campaignHandleChange(value)}
                                options={campaignOptions}
                                defaultValue={selectedCampaign}
                                style={{ width: '100%' }}
                                placeholder="Select Campaign"
                                singleSelect
                            />
                        </Grid>
                        {loading.campaignData && <Grid item xs={12}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress color="inherit" thickness={3} size="0.8rem" style={{ marginRight: '5px' }} /> Fetching campaign related data...
                            </div>
                        </Grid>}
                        <Grid item xs={12}>
                            <MultiSelect
                                name="select_customer"
                                onChange={(value) => setSelectedCustomer(value)}
                                options={customerOptions}
                                defaultValue={selectedCustomer}
                                style={{ width: '100%' }}
                                placeholder="Select Customer"
                                singleSelect
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="select_affiliate"
                                onChange={(value) => affiliateHandleChange(value)}
                                options={affiliateOptions}
                                defaultValue={selectedAffiliate}
                                style={{ width: '100%' }}
                                placeholder="Select Affiliate"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="ringba_phone"
                                onChange={(value) => setSelectedPhone(value)}
                                options={phoneOptionByAffiliate}
                                defaultValue={selectedPhone}
                                style={{ width: '100%' }}
                                placeholder="Select Phone"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="order_type"
                                onChange={(value) => setOrderType(value)}
                                options={[{ value: '1', label: 'Pay Per Call' }]}
                                defaultValue={orderType}
                                style={{ width: '100%' }}
                                placeholder="Select Order Type"
                                singleSelect
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="term"
                                onChange={(value) => setSelectedTerm(value)}
                                options={termOptions}
                                defaultValue={selectedTerm}
                                style={{ width: '100%' }}
                                placeholder="Select Terms"
                                singleSelect
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="select_payout"
                                onChange={(value) => setSelectedPayout(value)}
                                options={payoutOptions}
                                defaultValue={selectedPayout}
                                style={{ width: '100%' }}
                                placeholder="Select Payout"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="select_revenue"
                                onChange={(value) => setSelectedRevenue(value)}
                                options={revenueOptions}
                                defaultValue={selectedRevenue}
                                style={{ width: '100%' }}
                                placeholder="Select Revenue"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="select_call_length"
                                onChange={(value) => setSelectedCallLength(value)}
                                options={callLengthOptions}
                                defaultValue={selectedCallLength}
                                style={{ width: '100%' }}
                                placeholder="Select Call Length"
                                disabled={!selectedCampaign || loading.campaignData}
                                singleSelect
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="video_url"
                                label="DRTV Download Link"
                                variant="outlined"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Description (read only)"
                                variant="outlined"
                                value={description}
                                fullWidth
                                multiline
                                minRows="2"
                                maxRows="4"
                                inputProps={
                                    { readOnly: true, }
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <RadioGroup
                                name="insertion_order_for"
                                value={insertionOrderFor}
                                onChange={(e) => setInsertionOrderFor(e.target.value)}
                                style={{ display: 'flex', flexDirection: 'row' }}
                            >
                                <FormControlLabel
                                    value="customer"
                                    control={<Radio color="primary" />}
                                    label="For Customer"
                                />
                                <FormControlLabel
                                    value="affiliate"
                                    control={<Radio color="primary" />}
                                    label="For Affiliate"
                                />
                            </RadioGroup>
                        </Grid>

                        <Grid container justifyContent="flex-end">
                            <Grid item style={{ marginRight: '8px' }}>
                                <Button
                                    variant="outlined"
                                    disabled={(insertionOrderFor === 'affiliate' && (!selectedAffiliate || !selectedPayout)) || (insertionOrderFor === 'customer' && (!selectedCustomer || !selectedRevenue)) || !selectedCampaign || !selectedPhone || loading.submit || loading.save || loading.view}
                                    type="button"
                                    onClick={handleView}
                                >
                                    {loading.view && (<span style={{ marginRight: '8px', marginBottom: '-5px' }}>
                                        <CircularProgress size={20} color="inherit" />
                                    </span>)}
                                    View
                                </Button>
                            </Grid>
                            <Grid item style={{ marginRight: '8px' }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    disabled={(insertionOrderFor === 'affiliate' && (!selectedAffiliate || !selectedPayout)) || (insertionOrderFor === 'customer' && (!selectedCustomer || !selectedRevenue)) || !selectedCampaign || !selectedPhone || loading.submit || loading.save}
                                    type="button"
                                    onClick={(e) => handleSubmit(e, 'save')}
                                >
                                    {loading.save && (<span style={{ marginRight: '8px', marginBottom: '-5px' }}>
                                        <CircularProgress size={20} color="inherit" />
                                    </span>)}
                                    Save
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={(insertionOrderFor === 'affiliate' && (!selectedAffiliate || !selectedPayout)) || (insertionOrderFor === 'customer' && (!selectedCustomer || !selectedRevenue)) || !selectedCampaign || !selectedPhone || loading.submit || loading.save}
                                    type="submit"
                                >
                                    {loading.submit && (<span style={{ marginRight: '8px', marginBottom: '-5px' }}>
                                        <CircularProgress size={20} color="inherit" />
                                    </span>)}
                                    Create and Send
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
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