import Logo from "../../../images/webform/logo.png";

export default function RingbaIOModalView({ viewData }) {
    const { billingDetailsForView, orderDetailsForView, ioFor } = viewData

    return (
        <>
            <section id="insertion-order-modal-view" className="insertion-order-modal-view">
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
                                        <li>{billingDetailsForView?.contactName}</li>
                                        <li>{billingDetailsForView?.contactPhone}</li>
                                        <li>{billingDetailsForView?.email}</li>
                                        <li>{billingDetailsForView?.address}</li>
                                    </ul>
                                </td>
                                <td style={{ width: "40%" }}>
                                    {ioFor === 'customer' ? 'Customer ' : ''}Insertion Order NO: {billingDetailsForView?.ioNo}
                                </td>
                            </tr>
                            <tr>
                                <td><b>BILL TO:</b></td>
                                <td><b>DATE:</b> {billingDetailsForView?.date}</td>
                            </tr>
                            <tr>
                                <td>{billingDetailsForView?.address}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="io-details-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "20%" }}>Title Name</th>
                                    <th style={{ width: "40%" }}>Description</th>
                                    <th style={{ width: "10%" }}>Terms</th>
                                    <th style={{ width: "20%" }}>Phone</th>
                                    <th style={{ width: "10%" }}>Net Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{orderDetailsForView.titleName}</td>
                                    <td style={{ fontSize: "12px" }}>
                                        {orderDetailsForView.description}
                                    </td>
                                    <td>{orderDetailsForView.term}</td>
                                    <td>{orderDetailsForView.phone}</td>
                                    <td>{orderDetailsForView.netPrice.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="3" rowSpan="3" style={{ textAlign: "center" }}>Thank You</td>
                                    <th>Sub Total</th>
                                    <td>${orderDetailsForView.netPrice.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Discount</th>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th>Grand Total</th>
                                    <td>${orderDetailsForView.netPrice.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="io-terms">
                    <p>{ioFor === 'customer' ? 'Customer' : 'ConsumerEXP'} pays according to terms of this insertion order. {ioFor === 'customer' ? 'Customer may need to' : 'The company can'} provide agency of record (AOR) proof upon request.</p>
                    <p>{ioFor === 'customer' ? 'Customer' : 'ConsumerEXP'} pays via ACH bank processing according to periodic sales reports to media outlet. {ioFor === 'customer' ? 'Customer may provide an advance payment' : ''}</p>
                    <p>
                        ConsumerEXP will provide {ioFor === 'customer' ? 'Customer' : 'media outlet'} log-in access to its vendor banking portal to view and download detailed bills, call or order logs,
                        and track payments. Also, the {ioFor === 'customer' ? 'Customer' : 'vendor'} portal will provide consolidated statements of accounts and contain uploaded transaction and sales documents.
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
                    <p>ConsumerEXP and media outlet agree that insertion order, or titles in the insertion order, can be cancelled with two weeks advance notice.
                        {ioFor === 'customer' ? ' Customer may be charged for dubs if they cannot supply dubs' : ''}
                    </p>
                </div>
                <div className="io-footer">
                    <p>650 Huntington Avenue, Floor 22M | Boston, MA 02115 | Phone/Text: 617-874-4247 | www.consumerexp.com</p>
                </div>
            </section>
        </>
    )
}