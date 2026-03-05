import React, { useState } from 'react'
import Layout from '../Layout/Layout'
import { Helmet } from 'react-helmet'
import { Button, Input, Typography, Spin, Card, Row, Col } from 'antd'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const { TextArea } = Input

const CustomEmail = () => {
    const { campaigns } = usePage().props
    const [campaignIds, setCampaignIds] = useState()
    const [affiliateOptions, setAffiliateOptions] = useState()
    const [selectedAffiliates, setSelectedAffiliates] = useState('')
    const [additionalEmails, setAdditionalEmails] = useState('')
    const [values, setValues] = useState()
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)

    const campaignOptions = campaigns.map((item) => ({
        label: item.campaign_name,
        value: item.id + '+' + item.campaign_name,
    }))

    const handleCampaignChange = (value) => {
        setCampaignIds(value)
        if (value) {
            getAffiliates(value)
        } else {
            setAffiliateOptions()
            setSelectedAffiliates('')
        }
    }

    const getAffiliates = (selectedCampaigns) => {
        axios
            .post(route('custom.email.get.affiliates'), { selectedCampaigns })
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

    const handleFileSelect = (e) => {
        setFiles([...files, ...e.target.files])
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData()

        formData.append('affiliateEmails', selectedAffiliates)
        formData.append('additionalEmails', additionalEmails)
        formData.append('subject', values?.subject)
        formData.append('message', values?.message)

        files.forEach((file) => {
            formData.append('files[]', file)
        })

        setLoading(true)

        axios
            .post(route('send.custom.email'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                if (response.data.success === true) {
                    setCampaignIds()
                    setAffiliateOptions()
                    setSelectedAffiliates('')
                    setAdditionalEmails('')
                    setFiles([])
                    e.target.reset()
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

    return (
        <>
            <Helmet title="Email Affiliate (Custom Email)" />
            <Card
                style={{
                    display: 'grid',
                    width: '800px',
                    margin: 'auto',
                    marginTop: '2rem',
                    padding: '40px',
                }}
            >
                <Typography.Title level={4} style={{ textAlign: 'center', marginBottom: '35px' }}>
                    Compose Email
                </Typography.Title>
                <form validate="true" onSubmit={handleSubmit}>
                    <Row gutter={[0, 16]}>
                        <Col span={24}>
                            <MultiSelect
                                name="campaign_ids"
                                onChange={(value) => handleCampaignChange(value)}
                                options={campaignOptions}
                                defaultValue={campaignIds}
                                style={{ width: '100%' }}
                                placeholder="Select Campaigns"
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="affiliate_emails"
                                onChange={(value) => setSelectedAffiliates(value)}
                                options={affiliateOptions}
                                defaultValue={selectedAffiliates}
                                style={{ width: '100%' }}
                                placeholder="Select Affiliates"
                                disabled={!campaignIds}
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="additional_emails"
                                onChange={(value) => setAdditionalEmails(value)}
                                defaultValue={additionalEmails}
                                style={{ width: '100%' }}
                                placeholder="Additional Emails (Write and press enter or comma(,) to add additional emails)"
                                customValue
                            />
                        </Col>

                        <Col span={24}>
                            <label style={{ display: 'block', marginBottom: 4 }}>Subject</label>
                            <Input
                                name="subject"
                                onChange={handleChange}
                                spellCheck
                                required
                                style={{ width: '100%' }}
                            />
                        </Col>

                        <Col span={24}>
                            <label style={{ display: 'block', marginBottom: 4 }}>Message</label>
                            <TextArea
                                name="message"
                                onChange={handleChange}
                                spellCheck
                                rows={8}
                                required
                                style={{ width: '100%', resize: 'vertical' }}
                            />
                        </Col>

                        <Col span={24}>
                            <Button component="label" style={{ position: 'relative' }}>
                                Attach Files
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    hidden
                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                />
                            </Button>
                            <span className="custom-email-file-list-line"></span>
                            <span className="custom-email-file-list">
                                {files.length === 0 ?
                                    'No files selected. (Multiple files can be added.)' :
                                    'Selected files: ' + files.map(file => file.name).toString()}
                            </span>
                        </Col>

                        <Col span={24}>
                            <Button
                                type="primary"
                                disabled={(!selectedAffiliates && !additionalEmails) || loading}
                                htmlType="submit"
                            >
                                {loading && (
                                    <span style={{ marginRight: '8px', marginBottom: '-5px', display: 'inline-flex' }}>
                                        <Spin size="small" />
                                    </span>
                                )}
                                SEND
                            </Button>
                        </Col>
                    </Row>
                </form>
            </Card>
        </>
    )
}

CustomEmail.layout = (page) => <Layout title="Email Affiliate (Custom Email)">{page}</Layout>
export default CustomEmail
