import React, { useState } from "react"
import { Helmet } from "react-helmet"
import Logo from "../../../images/webform/logo.png";
import { usePage } from "@inertiajs/inertia-react";
import axios from "axios";
import toast from "react-hot-toast";

const RingbaInsertionOrderPublicIndex = () => {
    const { billingDetails, orderDetails, ioFor } = usePage().props
    const [loading, setLoading] = useState(false)

    const changeIoStatus = (value) => {
        setLoading(true)
        axios
            .post(route('insertion.order.ringba.public.update.status', { id: billingDetails.id, status: value }))
            .then((response) => {
                if (response.data.success === true) {
                    const updatedStatus = response.data.status
                    billingDetails.status = updatedStatus
                    if (updatedStatus === 'accepted' || updatedStatus === 'canceled') {
                        toast.success('Insertion order ' + updatedStatus)
                        sendIODocument()
                    } else {
                        toast.error('Insertion order declined')
                    }
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

    const sendIODocument = () => {
        axios
            .post(route('insertion.order.ringba.public.send.io.document', { billingDetails, orderDetails, ioFor }))
            .then((response) => {
                if (response.data.success === true) {
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
            <Helmet title="ConsumerEXP - Pay Per Call Insertion Order Public" />
            <section id="insertion-order-public" className="insertion-order-public">
                <div className="consumerexp-heading">
                    <img src={Logo} alt="consumer-exp-logo"></img>
                    <ul className="consumerexp-info">
                        <li>650 Huntington Avenue, Floor 22M</li>
                        <li>Boston, MA 02115</li>
                        <li>Tel/Text: 617-874-4247</li>
                        <li>FEIN: 83-2614795</li>
                        <li><a href="mailto:info@consumerexp.com">info@consumerexp.com</a></li>
                        <li><a href="https://www.consumerexp.com/">www.consumerexp.com</a></li>
                    </ul>
                </div>
                <div className="io-table">
                    <table>
                        <tbody>
                            <tr>
                                <td className="w-[60%]">
                                    <ul>
                                        <li>{billingDetails?.name}</li>
                                        <li>{billingDetails?.contactName}</li>
                                        <li>{billingDetails?.contactPhone}</li>
                                        <li>{billingDetails?.email}</li>
                                        <li>{billingDetails?.address}</li>
                                    </ul>
                                </td>
                                <td className="w-[40%]">
                                    {ioFor === 'customer' ? 'THIS IS NOT A BILL' : 'THIS IS NOT AN INVOICE'} <br />
                                    {ioFor === 'customer' ? 'Dub Order or Notification' : 'Traffic Instructions'} <br /> <br />
                                    {ioFor === 'customer' ? 'Customer ' : ''}Insertion Order NO: {billingDetails?.ioNo}
                                </td>
                            </tr>
                            <tr>
                                <td><b>BILL TO:</b></td>
                                <td><b>DATE:</b> {billingDetails?.date}</td>
                            </tr>
                            <tr>
                                <td>{billingDetails?.address}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="io-details-table">
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-[20%]">Title Name</th>
                                    <th className="w-[40%]">Description</th>
                                    <th className="w-[10%]">Terms</th>
                                    <th className="w-[20%]">Phone</th>
                                    <th className="w-[10%]">{ioFor === 'customer' ? 'Rate' : 'Net Payout'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails.map((item, index) => (
                                    <tr key={index + 1}>
                                        <td>{item.titleName}</td>
                                        <td className="text-xs">
                                            {item.description}
                                            {(item.videoUrl && ioFor === 'affiliate') &&
                                                <>
                                                    <br />
                                                    <a href={item.videoUrl} target="_blank" className="underline font-bold">Download TV Commercial</a>
                                                </>
                                            }
                                        </td>
                                        <td>{item.term}</td>
                                        <td>{item.phone}</td>
                                        <td>{item.netPrice.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {/* <tr>
                                    <td colSpan="3" rowSpan="3" className="text-center">Thank You</td>
                                    <th>Sub Total</th>
                                    <td>${orderDetails.netPrice.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Discount</th>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th>Grand Total</th>
                                    <td>${orderDetails.netPrice.toFixed(2)}</td>
                                </tr> */}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="io-terms">
                    <p>{ioFor === 'customer' ? 'Customer' : 'ConsumerEXP'} pays according to terms of this insertion order.</p>
                    {ioFor === 'customer' ?
                        (<p>Customer pays via ACH bank processing according to periodic sales reports to media outlet. Customer may provide an advance payment or retainer agreement.</p>)
                        : (
                            <>
                                <p>A link to the dub will be contained within this insertion order or sent by separate email.</p>
                                <p>ConsumerEXP pays via ACH bank processing according to periodic sales reports to media outlet.</p>
                            </>
                        )
                    }
                    <p>
                        ConsumerEXP will provide {ioFor === 'customer' ? 'Customer' : 'media outlet'} log-in access to its vendor banking portal to view and download detailed bills, call or order logs,
                        and track payments. Also, the {ioFor === 'customer' ? 'Customer' : 'vendor'} portal will provide consolidated statements of accounts and contain uploaded transaction and sales documents.
                    </p>
                    {ioFor === 'customer' ?
                        (<p>The customer attests that it owns the TV commercial(s) and that they have licensed the images, spokespeople, and music for the TV commercial(s). Furthermore,
                            the customer attests that the TV commercial(s) do not knowingly violate the rights of any individual, company, state laws, or federal laws.</p>)
                        :
                        (<p>ConsumerEXP agrees to indemnify and hold media outlet harmless from any claims for damages (including reasonable attorney fees)
                            based upon a claim that a commercial run by ConsumerEXP violates applicable federal or state law.</p>)}
                    {ioFor === 'customer' ?
                        (<p>ConsumerEXP and media outlet agree that insertion order, or titles in the insertion order, can be cancelled with as mentioned in this insertion order.</p>)
                        : (<p>ConsumerEXP and media outlet agree that insertion order, or titles in the insertion order, can be cancelled with based upon the terms of this insertion order.</p>)}
                    {ioFor === 'customer' ?
                        (<p>Customer may be charged for dubs, if they cannot supply dubs, as per agreement.</p>)
                        : ''}
                </div>
                <div className="io-footer">
                    <p>650 Huntington Avenue, Floor 22M | Boston, MA 02115 | Phone/Text: 617-874-4247 | www.consumerexp.com</p>
                </div>
            </section>
            <section className="decision-box" id="decision-box">
                <div className="decision-box-text">
                    This insertion order is {billingDetails.status}.
                </div>
                {billingDetails.status === 'pending' && <div className="decision-box-buttons">
                    <button className="bg-[#FF0000]" onClick={() => changeIoStatus('declined')}>{loading ? 'Loading..' : 'Decline'}</button>
                    <button className="bg-[#6600FF]" onClick={() => changeIoStatus('accepted')}>{loading ? 'Loading..' : 'Accept'}</button>
                </div>}
                {billingDetails.status === 'accepted' && <div className="decision-box-buttons">
                    <button className="bg-[#ff0e0e]" onClick={() => changeIoStatus('canceled')}>{loading ? 'Loading..' : 'Cancel'}</button>
                </div>}
            </section>
        </>
    )
}

export default RingbaInsertionOrderPublicIndex
