import React, { useState } from 'react'
import Layout from '../Layout/Layout'
import { Helmet } from 'react-helmet'
import { Button, CircularProgress, Grid, Paper, TextField, Typography, makeStyles } from '@material-ui/core'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import toast from 'react-hot-toast'

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
    const [selectedAffiliate, setSelectedAffiliate] = useState('')
    const [selectedPhone, setSelectedPhone] = useState('')
    const [orderType, setOrderType] = useState('')
    const [selectedTerm, setSelectedTerm] = useState('')
    const [selectedPayout, setSelectedPayout] = useState('')
    const [selectedRevenue, setSelectedRevenue] = useState('')
    const [loading, setLoading] = useState({ submit: false, campaignData: false })

    const campaignOptions = campaigns.map((item) => ({
        label: item.campaign_name,
        value: item.campaign_id === null ? "null" : item.campaign_id,
    }))

    const customerOptions = customers.map((item) => ({
        label: item.customer_name,
        value: item.customer_name,
    }))

    const terms = ['Cash in advance', 'Net 7 days', 'Net 14 days', 'Net 30 days', 'Net 45 days']

    const termOptions = terms.map((item) => ({
        label: item,
        value: item,
    }))

    const campaignHandleChange = (value) => {
        setSelectedAffiliate('')
        setSelectedPhone('')
        setSelectedPayout('')
        setSelectedRevenue('')
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

    // const handleSubmit = (e, type = 'create&save') => {
    //     e.preventDefault()
    //     const formData = new FormData()
    //     formData.append('selectedCodesAndPhones', selectedCodesAndPhones)
    //     formData.append('insertionOrderFor', insertionOrderFor)
    //     formData.append('selectedTerm', selectedTerm)
    //     formData.append('type', type)

    //     if (type === 'create&save') {
    //         setLoading((oldValues) => ({ ...oldValues, submit: true }))
    //     } else {
    //         setLoading((oldValues) => ({ ...oldValues, save: true }))
    //     }

    //     axios
    //         .post(route(''), formData)
    //         .then((response) => {
    //             if (response.data.success === true) {
    //                 setSelectedAffiliate('')
    //                 setSelectedCodesAndPhones('')
    //                 setInsertionOrderFor('customer')
    //                 setSelectedTerm('')
    //                 toast.success(response.data.msg)
    //                 setLoading((oldValues) => ({ ...oldValues, submit: false, save: false }))
    //             } else {
    //                 toast.error(response.data.msg)
    //                 setLoading((oldValues) => ({ ...oldValues, submit: false, save: false }))
    //             }
    //         })
    //         .catch((err) => {
    //             toast.error('Something went wrong!')
    //             setLoading((oldValues) => ({ ...oldValues, submit: false, save: false }))
    //         })
    // }

    return (
        <>
            <Helmet title="Ringba Insertion Order Term - Create" />
            <Paper className={classes.root}>
                <Typography variant="h6" className={classes.title}>
                    Ringba Insertion Order Term
                </Typography>
                <form validate="true" onSubmit={''}>
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

                        {/* <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Description"
                                variant="outlined"
                                // onChange={handleChange}
                                spellCheck
                                fullWidth
                                multiline
                                minRows="2"
                                maxRows="4"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="video_url"
                                label="Video URL"
                                variant="outlined"
                                // onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid> */}

                        <Grid item >
                            <Button
                                variant="contained"
                                color="primary"
                                disabled
                                type="submit"
                            >
                                {loading.submit && (<span style={{ marginRight: '8px', marginBottom: '-5px' }}>
                                    <CircularProgress size={20} color="inherit" />
                                </span>)}
                                CREATE
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </>
    )
}

RingbaInsertionOrderTermCreate.layout = (page) => <Layout title="Ringba Insertion Order Term - Create">{page}</Layout>
export default RingbaInsertionOrderTermCreate