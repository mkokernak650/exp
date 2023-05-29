import React, { useState } from 'react'
import Layout from '../Layout/Layout'
import { Helmet } from 'react-helmet'
import { Button, Grid, Paper, TextField, Typography, makeStyles } from '@material-ui/core'
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
    snackbar: {
        maxWidth: '500px',
    },
}))

const CustomEmail = () => {
    const classes = useStyles()
    const { campaigns } = usePage().props
    const [campaignIds, setCampaignIds] = useState()
    const [affiliateOptions, setAffiliateOptions] = useState()
    const [selectedAffiliates, setSelectedAffiliates] = useState()
    const [additionalEmails, setAdditionalEmails] = useState('')
    const [values, setValues] = useState()

    const campaignOptions = campaigns.map((item) => ({
        label: item.campaign_name,
        value: item.id.toString(),
    }))

    const handleCampaignChange = (value) => {
        setCampaignIds(value)
        if (value) {
            getAffiliates(value)
        } else {
            setAffiliateOptions()
            setSelectedAffiliates()
        }
    }

    const getAffiliates = (selectedCampaignIds) => {
        axios
            .post(route('custom.email.get.affiliates'), { selectedCampaignIds })
            .then((response) => {
                if (response.data) {
                    setAffiliateOptions(response.data)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setValues((values) => ({ ...values, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData()

        formData.append('affiliateEmails', selectedAffiliates)
        formData.append('additionalEmails', additionalEmails)
        formData.append('subject', values?.subject)
        formData.append('message', values?.message)

        axios
            .post(route('send.custom.email'), formData)
            .then((response) => {
                if (response.data.success === true) {
                    setCampaignIds()
                    setAffiliateOptions()
                    setSelectedAffiliates()
                    setAdditionalEmails('')
                    e.target.reset()
                    toast.success(response.data.msg)
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
            <Helmet title="Email Affiliate (Custom Email)" />
            <Paper className={classes.root}>
                <Typography variant="h6" className={classes.title}>
                    Compose Email
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
                                name="affiliate_emails"
                                onChange={(value) => setSelectedAffiliates(value)}
                                options={affiliateOptions}
                                defaultValue={selectedAffiliates}
                                style={{ width: '100%' }}
                                placeholder="Select Affiliates"
                                disabled={!campaignIds}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <MultiSelect
                                name="additional_emails"
                                onChange={(value) => setAdditionalEmails(value)}
                                defaultValue={additionalEmails}
                                style={{ width: '100%' }}
                                placeholder="Additional Emails (Write and press enter or comma(,) to add additional emails)"
                                customValue
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="subject"
                                label="Subject"
                                variant="outlined"
                                onChange={handleChange}
                                spellCheck
                                fullWidth
                                required
                            ></TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="message"
                                label="Message"
                                variant="outlined"
                                onChange={handleChange}
                                spellCheck
                                fullWidth
                                multiline
                                minRows="8"
                                maxRows="10"
                                required
                            ></TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={!campaignIds || !selectedAffiliates}
                                type="submit"
                            >
                                SEND
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </>
    )
}

CustomEmail.layout = (page) => <Layout title="Email Affiliate (Custom Email)">{page}</Layout>
export default CustomEmail