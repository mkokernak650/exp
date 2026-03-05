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
                className="grid w-[800px] m-auto mt-8 p-10"
            >
                <Typography.Title level={4} className="text-center mb-[35px]">
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
                                className="w-full"
                                placeholder="Select Campaigns"
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="affiliate_emails"
                                onChange={(value) => setSelectedAffiliates(value)}
                                options={affiliateOptions}
                                defaultValue={selectedAffiliates}
                                className="w-full"
                                placeholder="Select Affiliates"
                                disabled={!campaignIds}
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="additional_emails"
                                onChange={(value) => setAdditionalEmails(value)}
                                defaultValue={additionalEmails}
                                className="w-full"
                                placeholder="Additional Emails (Write and press enter or comma(,) to add additional emails)"
                                customValue
                            />
                        </Col>

                        <Col span={24}>
                            <label className="block mb-1">Subject</label>
                            <Input
                                name="subject"
                                onChange={handleChange}
                                spellCheck
                                required
                                className="w-full"
                            />
                        </Col>

                        <Col span={24}>
                            <label className="block mb-1">Message</label>
                            <TextArea
                                name="message"
                                onChange={handleChange}
                                spellCheck
                                rows={8}
                                required
                                className="w-full resize-y"
                            />
                        </Col>

                        <Col span={24}>
                            <Button component="label" className="relative">
                                Attach Files
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    hidden
                                    className="absolute inset-0 opacity-0 cursor-pointer"
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
                                    <span className="mr-2 -mb-[5px] inline-flex">
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
