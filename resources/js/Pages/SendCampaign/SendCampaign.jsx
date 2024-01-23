import React, { useState } from 'react'
import Layout from "../Layout/Layout";
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import Spiner from './Components/Spiner';
import { useForm } from '@inertiajs/inertia-react';
import { Helmet } from 'react-helmet';
import { usePage } from '@inertiajs/inertia-react';
import consumerExpLogo from '../../../images/webform/logo.png'
import toast from 'react-hot-toast';
import { Inertia } from '@inertiajs/inertia';

const SendCampaign = () => {
    const { affiliates, allCampaigns, topMessage } = usePage().props
    const { data, setData, post, processing, errors, reset } = useForm({
        selectedAffiliates: '',
        additionalEmails: '',
        topMessage: topMessage ? topMessage : ''
    })
    const [topMessageLoading, setTopMessageLoading] = useState(false)

    const affiliateOptions = affiliates.map(affiliate => ({
        label: affiliate.affiliate_name + (affiliate.market ? ` (${affiliate.market})` : ''),
        value: affiliate.id.toString()
    }))

    const submit = (e) => {
        e.preventDefault()

        post(route('send.campaign'), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                toast.success('Campaigns sent successfully.')
            },
            onError: () => {
                toast.error('No emails found!')
            }
        })
    }

    const saveOrUpdateTopMessage = () => {
        Inertia.post(route('send.campaign.top.message'), { topMessage: data.topMessage }, {
            preserveScroll: true,
            onStart: () => {
                setTopMessageLoading(true)
            },
            onSuccess: () => {
                toast.success(`Top message ${topMessage ? 'updated' : 'saved'} successfully`)
                setTopMessageLoading(false)
            },
            onFinish: () => {
                setTopMessageLoading(false)
            }
        })
    }

    return (
        <>
            <Helmet title="Send Campaigns" />
            <div className="max-w-4xl mx-auto mt-10">
                <h4 className="text-2xl font-medium">Send Campaigns</h4>
                <div className="mt-8 p-8 rounded-2xl shadow">
                    <form className="space-y-5" onSubmit={submit}>
                        <div>
                            <p className="font-medium pl-1">Select Affiliates</p>
                            <MultiSelect
                                style={{ width: '100%' }}
                                placeholder="Select Affiliates"
                                options={affiliateOptions}
                                defaultValue={data.selectedAffiliates}
                                onChange={(value) => setData('selectedAffiliates', value)}
                            />
                        </div>
                        <div>
                            <p className="font-medium pl-1">Add additional emails</p>
                            <MultiSelect
                                style={{ width: '100%' }}
                                placeholder="Write and press enter or comma(,) to add additional emails"
                                defaultValue={data.additionalEmails}
                                onChange={(value) => setData('additionalEmails', value)}
                                customValue
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="top_message"
                                className="block mb-2  font-medium"
                            >
                                Message
                            </label>
                            <textarea
                                id="top_message"
                                rows={4}
                                className="block p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Write the top message..."
                                value={data.topMessage}
                                onChange={(e) => setData('topMessage', e.target.value)}
                            />
                            <button
                                className="flex items-center p-2 mt-1 rounded-md font-medium hover:bg-black/10 disabled:cursor-not-allowed"
                                type="button"
                                onClick={saveOrUpdateTopMessage}
                                disabled={topMessageLoading}
                            >
                                {topMessageLoading && <Spiner width="16px" height="16px" className="mr-2" />}
                                {topMessage ? 'Update' : 'Save'} message
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="flex items-center px-5 py-2 rounded-xl text-white font-semibold bg-[#6366f1] enabled:hover:bg-[#4338ca] disabled:opacity-75 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={processing || (!data.selectedAffiliates && !data.additionalEmails)}
                            >
                                {processing && <Spiner width="16px" height="16px" className="mr-2" />}
                                Send Campaigns
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="max-w-4xl mx-auto mt-10">
                <h4 className="text-xl font-medium">Campaign List (preview)</h4>
                <div className="mt-8 p-8 rounded-2xl shadow space-y-5">
                    <div>
                        <img src={consumerExpLogo} alt="consumer-exp-logo" className="-ml-4" />
                    </div>
                    {allCampaigns.map((campaign, index) => (
                        <div key={index}>
                            <h5 className="font-medium text-base">{campaign.campaign_name}</h5>
                            <div className="pl-2">
                                {campaign.description &&
                                    <p dangerouslySetInnerHTML={{ __html: campaign.description.replace(/\n/g, "<br />") }} />

                                }
                                {campaign.length_url &&
                                    <p dangerouslySetInnerHTML={{ __html: campaign.length_url.replace(/\n/g, "<br />") }} />
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

SendCampaign.layout = (page) => <Layout title="Send Campaigns">{page}</Layout>
export default SendCampaign