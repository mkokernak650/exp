import React from 'react'
import Layout from "../Layout/Layout";
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import Spiner from './Components/Spiner';
import { useForm } from '@inertiajs/inertia-react';
import { Helmet } from 'react-helmet';
import { usePage } from '@inertiajs/inertia-react';

const SendCampaign = () => {
    const { affiliates, allCampaigns } = usePage().props
    const { data, setData, post, processing, errors, reset } = useForm({
        selectedAffiliates: '',
        additionalEmails: ''
    })

    const affiliateOptions = affiliates.map(affiliate => ({
        label: affiliate.affiliate_name + (affiliate.market ? ` (${affiliate.market})` : ''),
        value: affiliate.id.toString()
    }))

    return (
        <>
            <Helmet title="Send Campaigns" />
            <div className="max-w-4xl mx-auto mt-10">
                <h4 className="text-2xl font-medium">Send Campaigns</h4>
                <div className="mt-8 p-8 rounded-2xl shadow">
                    <form className="space-y-5">
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
                        <div className="flex justify-end">
                            <button
                                className="flex items-center px-5 py-2 rounded-xl text-white font-semibold bg-[#6366f1] enabled:hover:bg-[#4338ca] disabled:opacity-75"
                                type="submit"
                                disabled={processing}
                            >
                                {processing && <Spiner width="4" height="4" className="mr-2" />}
                                Send Campaigns
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="max-w-4xl mx-auto mt-10">
                <h4 className="text-xl font-medium">Campaign List (preview)</h4>
                <div className="mt-8 p-8 rounded-2xl shadow space-y-5">
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