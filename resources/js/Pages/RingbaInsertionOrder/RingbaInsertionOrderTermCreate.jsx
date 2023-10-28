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
    const { campaigns, customers, affiliateOptions, ringbaNumbers } = usePage().props
    const [selectedCampaign, setSelectedCampaign] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState('')
    const [selectedAffiliate, setSelectedAffiliate] = useState('')
    const [selectedPhone, setSelectedPhone] = useState('')
    const [orderType, setOrderType] = useState('')
    const [selectedTerm, setSelectedTerm] = useState('')
    const [loading, setLoading] = useState({ view: false, submit: false, save: false })

    const campaignOptions = campaigns.map((item) => ({
        label: item.campaign_name,
        value: item.campaign_name,
    }))

    const customerOptions = customers.map((item) => ({
        label: item.customer_name,
        value: item.customer_name,
    }))

    const ringbaNumberOptions = ringbaNumbers.map((item) => ({
        label: item.phoneNumber,
        value: item.phoneNumber
    }))

    const terms = ['Cash in advance', 'Net 7 days', 'Net 14 days', 'Net 30 days', 'Net 45 days']

    const termOptions = terms.map((item) => ({
        label: item,
        value: item,
    }))

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
                                onChange={(value) => setSelectedCampaign(value)}
                                options={campaignOptions}
                                defaultValue={selectedCampaign}
                                style={{ width: '100%' }}
                                placeholder="Select Campaign"
                                singleSelect
                            />
                        </Grid>
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
                                onChange={(value) => setSelectedAffiliate(value)}
                                options={affiliateOptions}
                                defaultValue={selectedAffiliate}
                                style={{ width: '100%' }}
                                placeholder="Select Affiliate"
                                singleSelect
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="ringba_phone"
                                onChange={(value) => setSelectedPhone(value)}
                                options={ringbaNumberOptions}
                                defaultValue={selectedPhone}
                                style={{ width: '100%' }}
                                placeholder="Select Phone"
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
                            <TextField
                                name="revenue"
                                label="Revenue"
                                variant="outlined"
                                // onChange={handleChange}
                                type="number"
                                fullWidth
                                required
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="payout"
                                label="Payout"
                                variant="outlined"
                                // onChange={handleChange}
                                type="number"
                                fullWidth
                                required
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
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
                        </Grid>

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