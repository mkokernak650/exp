import React, { useState } from "react"
import { Helmet } from "react-helmet"
import Logo from "../../../images/webform/logo.png";
import { usePage } from "@inertiajs/inertia-react";
import axios from "axios";
import toast from "react-hot-toast";

const InsertionOrderPublicIndex = () => {
    const { billingDetails, orderDetails, subTotal } = usePage().props
    const [loading, setLoading] = useState(false)

    const changeIoStatus = (value) => {
        setLoading(true)
        axios
            .post(route('insertion.order.public.update.status', { id: billingDetails.id, status: value }))
            .then((response) => {
                if (response.data.success === true) {
                    billingDetails.status = response.data.status
                    if (response.data.status === 'accepted') {
                        toast.success('Insertion order accepted')
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

    return (
        <>
            <Helmet title="Insertion Order Public" />
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
                                <td style={{ width: "60%" }}>
                                    <ul>
                                        <li>{billingDetails?.contactName}</li>
                                        <li>{billingDetails?.contactPhone}</li>
                                        <li>{billingDetails?.email}</li>
                                        <li>{billingDetails?.address}</li>
                                    </ul>
                                </td>
                                <td style={{ width: "40%" }}>
                                    Insertion Order NO: {billingDetails?.ioNo}
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
                                    <th style={{ width: "15%" }}>Title Name</th>
                                    <th style={{ width: "35%" }}>Description</th>
                                    <th style={{ width: "10%" }}>Terms</th>
                                    <th style={{ width: "15%" }}>800#</th>
                                    <th style={{ width: "15%" }}>Coupon Code</th>
                                    <th style={{ width: "10%" }}>Gross Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails.map((item, index) => (
                                    <tr key={index + 1}>
                                        <td>{item.titleName}</td>
                                        <td style={{ fontSize: "12px" }}>{item.description}</td>
                                        <td>{item.term}</td>
                                        <td>{item.dialed}</td>
                                        <td>{item.couponCode}</td>
                                        <td>{item.grossPrice.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="4" rowSpan="3" style={{ textAlign: "center" }}>Thank You</td>
                                    <th>Sub Total</th>
                                    <td>${subTotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Discount</th>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th>Grand Total</th>
                                    <td>${subTotal.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="io-terms">
                    <p>ConsumerEXP pays according to terms of this insertion order. The company can provide agency of record (AOR) proof upon request.</p>
                    <p>ConsumerEXP pays via ACH bank processing according to periodic sales reports to media outlet.</p>
                    <p>
                        ConsumerEXP will provide media outlet log-in access to its vendor banking portal to view and download detailed bills, call or order logs,
                        and track payments. Also, the vendor portal will provide consolidated statements of accounts and contain uploaded transaction and sales documents.
                    </p>
                    <p>
                        ConsumerEXP represents that it has required the companies that own the TV commercial(s) that they have licensed the images, spokespeople, and
                        music for the TV commercial(s).Furthermore, ConsumerEXP has required the companies that own the TV commercial(s) contained in this insertion
                        order to attest in its agreement with ConsumerEXP that the TV commercial(s) do not knowingly violate the rights of any individual, company,
                        state laws, or federal laws.
                    </p>
                    <p>
                        ConsumerEXP agrees to indemnify and hold media outlet harmless from any claims for damages (including reasonable attorney fees) based upon a claim
                        that a commercial run by ConsumerEXP violates applicable federal or state law.
                    </p>
                    <p>ConsumerEXP and media outlet agree that insertion order, or titles in the insertion order, can be cancelled with two weeks advance notice.</p>
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
                    <button style={{ backgroundColor: "#FF0000" }} onClick={() => changeIoStatus('declined')}>{loading ? 'Loading..' : 'Decline'}</button>
                    <button style={{ backgroundColor: "#6600FF" }} onClick={() => changeIoStatus('accepted')}>{loading ? 'Loading..' : 'Accept'}</button>
                </div>}
            </section>
        </>
    )
}

export default InsertionOrderPublicIndex