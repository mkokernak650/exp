import React, { useState } from 'react'
import Layout from '../Layout/Layout'
import { Helmet } from 'react-helmet'
import { Button, CircularProgress, FormControlLabel, Grid, Paper, Radio, RadioGroup, Typography, makeStyles } from '@material-ui/core'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
        width: '800px',
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

const InsertionOrderCreate = () => {
    const classes = useStyles()
    const { campaigns, customers } = usePage().props
    const [campaignIds, setCampaignIds] = useState('')
    const [customerIds, setCustomerIds] = useState('')
    const [affiliateOptions, setAffiliateOptions] = useState()
    const [codeAndPhoneOptions, setCodeAndPhoneOptions] = useState([])
    const [selectedAffiliates, setSelectedAffiliates] = useState('')
    const [selectedCodesAndPhones, setSelectedCodesAndPhones] = useState('')
    const [insertionOrderFor, setInsertionOrderFor] = useState('customer')
    const [selectedTerm, setSelectedTerm] = useState('')
    const [loading, setLoading] = useState(false)

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
        getCodesAndPhones(campaignIds, customerIds, value)
        setSelectedCodesAndPhones('')
    }

    const getAffiliates = (selectedCampaigns, selectedCustomers) => {
        axios
            .post(route('insertion.order.get.affiliates'), { selectedCampaigns, selectedCustomers })
            .then((response) => {
                if (response.data) {
                    setAffiliateOptions(response.data)
                }
            })
            .catch((err) => {
                toast.error('Affiliates fetching failed!')
            })
    }

    const getCodesAndPhones = (selectedCampaigns, selectedCustomers, selectedAffiliates) => {
        axios
            .post(route('insertion.order.get.codes.phones'), { selectedCampaigns, selectedCustomers, selectedAffiliates })
            .then((response) => {
                if (response.data) {
                    setCodeAndPhoneOptions(response.data)
                }
            })
            .catch((err) => {
                toast.error('Codes and Phones fetching failed!')
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('selectedCustomers', customerIds)
        formData.append('selectedAffiliates', selectedAffiliates)
        formData.append('selectedCodesAndPhones', selectedCodesAndPhones)
        formData.append('insertionOrderFor', insertionOrderFor)
        formData.append('selectedTerm', selectedTerm)
        setLoading(true)

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
                    toast.success(response.data.msg)
                    setLoading(false)
                } else {
                    toast.error(response.data.msg)
                    setLoading(false)
                }
            })
            .catch((err) => {
                toast.error('Something went wrong!')
                setLoading(false)
            })
    }

    const handleView = () => {
        const formData = new FormData()
        formData.append('selectedCustomers', customerIds)
        formData.append('selectedAffiliates', selectedAffiliates)
        formData.append('selectedCodesAndPhones', selectedCodesAndPhones)
        formData.append('insertionOrderFor', insertionOrderFor)
        formData.append('selectedTerm', selectedTerm)

        axios
            .post(route('insertion.order.view'), formData)
            .then((response) => {
                if (response.data.success === true) {

                } else {
                    toast.error(response.data.msg)
                }
            })
            .catch((err) => {
                toast.error('Something went wrong!')
            })
    }

    return (
        <>
            <Helmet title="Insertion Order - Create" />
            <Paper className={classes.root}>
                <Typography variant="h6" className={classes.title}>
                    Insertion Order
                </Typography>
                <form validate="true" onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <MultiSelect
                                name="campaign_ids"
                                onChange={(value) => handleCampaignChange(value)}
                                options={campaignOptions}
                                defaultValue={campaignIds}
                                style={{ width: '100%' }}
                                placeholder="Select Campaigns"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <MultiSelect
                                name="customer_ids"
                                onChange={(value) => handleCustomerChange(value)}
                                options={customerOptions}
                                defaultValue={customerIds}
                                style={{ width: '100%' }}
                                placeholder="Select Customers"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="affiliate_ids"
                                onChange={(value) => handleAffiliateChange(value)}
                                options={affiliateOptions}
                                defaultValue={selectedAffiliates}
                                style={{ width: '100%' }}
                                placeholder="Select Affiliates"
                                disabled={!campaignIds && !customerIds}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="codes_and_Phones"
                                onChange={(value) => setSelectedCodesAndPhones(value)}
                                options={codeAndPhoneOptions}
                                defaultValue={selectedCodesAndPhones}
                                style={{ width: '100%' }}
                                placeholder="Select Codes or Phones"
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
                                    disabled={(insertionOrderFor === 'affiliate' && !selectedAffiliates) || (insertionOrderFor === 'customer' && !customerIds) || !selectedCodesAndPhones || loading}
                                    type="button"
                                    onClick={handleView}
                                >
                                    {loading && (<span style={{ marginRight: '8px', marginBottom: '-5px' }}>
                                        <CircularProgress size={20} color="inherit" />
                                    </span>)}
                                    View
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={(insertionOrderFor === 'affiliate' && !selectedAffiliates) || (insertionOrderFor === 'customer' && !customerIds) || !selectedCodesAndPhones || loading}
                                    type="submit"
                                >
                                    {loading && (<span style={{ marginRight: '8px', marginBottom: '-5px' }}>
                                        <CircularProgress size={20} color="inherit" />
                                    </span>)}
                                    CREATE & SEND
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </>
    )
}

InsertionOrderCreate.layout = (page) => <Layout title="Insertion Order - Create">{page}</Layout>
export default InsertionOrderCreate