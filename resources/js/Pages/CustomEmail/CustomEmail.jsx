import React, { useRef, useState } from 'react'
import Layout from '../Layout/Layout'
import { Helmet } from 'react-helmet'
import { Button, Input, Typography, Spin, Card, Row, Col } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
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
    const fileInputRef = useRef(null)

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
        setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files || [])])
        e.target.value = ''
    }

    const handleRemoveFile = (fileIndex) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== fileIndex))
    }

    const handleRemoveAllFiles = () => {
        setFiles([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
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
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                    }
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
                <Typography.Title level={4} className="text-center !text-xl !mb-[35px]">
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
                                className="!w-full"
                                placeholder="Select Campaigns"
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="affiliate_emails"
                                onChange={(value) => setSelectedAffiliates(value)}
                                options={affiliateOptions}
                                defaultValue={selectedAffiliates}
                                className="!w-full"
                                placeholder="Select Affiliates"
                                disabled={!campaignIds}
                            />
                        </Col>

                        <Col span={24}>
                            <MultiSelect
                                name="additional_emails"
                                onChange={(value) => setAdditionalEmails(value)}
                                defaultValue={additionalEmails}
                                className="!w-full"
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
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                hidden
                            />
                            <Button onClick={() => fileInputRef.current?.click()}>
                                Attach Files
                            </Button>
                            <div className="">
                                {files.length === 0 ? 
                                    (<div className="mt-1">No files selected. (Multiple files can be added.)</div>
                                ) : (
                                    <>
                                        <div className='flex items-center'>
                                            Selected files:
                                            <Button
                                                type="link"
                                                danger
                                                className="!p-0 !ml-2"
                                                onClick={handleRemoveAllFiles}
                                                title="Remove all files"
                                            >
                                                <DeleteOutlined />
                                            </Button>
                                        </div>
                                        <ul className="list-disc pl-6">
                                            {files.map((file, index) => (
                                                <li key={`${file.name}-${file.lastModified}-${index}`} className=''>
                                                    <div className='flex items-center gap-2'>
                                                        <span>{file.name}</span>
                                                        <Button
                                                            type="link"
                                                            danger
                                                            className="!p-0"
                                                            onClick={() => handleRemoveFile(index)}
                                                            title="Remove file"
                                                        >
                                                            <DeleteOutlined />
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
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
