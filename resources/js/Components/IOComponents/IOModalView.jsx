import Logo from "../../../images/webform/logo.png";

export default function IoModalView({ viewData }) {
    const { billingDetailsForView, orderDetailsForView, subTotal, ioFor } = viewData

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
                                        <li>{billingDetailsForView?.name}</li>
                                        <li>{billingDetailsForView?.contactName}</li>
                                        <li>{billingDetailsForView?.contactPhone}</li>
                                        <li>{billingDetailsForView?.email}</li>
                                        <li>{billingDetailsForView?.address}</li>
                                    </ul>
                                </td>
                                <td style={{ width: "40%" }}>
                                    {ioFor === 'customer' ? 'THIS IS NOT A BILL' : 'THIS IS NOT AN INVOICE'} <br />
                                    {ioFor === 'customer' ? 'Dub Order or Notification' : 'Traffic Instructions'} <br /> <br />
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
                                    <th style={{ width: "15%" }}>Title Name</th>
                                    <th style={{ width: "35%" }}>Description</th>
                                    <th style={{ width: "10%" }}>Terms</th>
                                    <th style={{ width: "15%" }}>800#</th>
                                    <th style={{ width: "15%" }}>Coupon Code</th>
                                    <th style={{ width: "10%" }}>{ioFor === 'customer' ? 'Payout' : 'Affiliate Fee'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetailsForView.map((item, index) => (
                                    <tr key={index + 1}>
                                        <td>{item.titleName}</td>
                                        <td style={{ fontSize: "12px" }}>
                                            {item.description}
                                            {(item.videoUrl && ioFor === 'affiliate') &&
                                                <>
                                                    <br />
                                                    <a href={item.videoUrl} target="_blank" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>Download TV Commercial</a>
                                                </>
                                            }
                                        </td>
                                        <td>{item.term}</td>
                                        <td>{item.dialed}</td>
                                        <td>{item.couponCode}</td>
                                        <td>{item.netPrice.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {/* <tr>
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
                                </tr> */}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="io-terms">
                    {ioFor === 'customer' ?
                        (
                            <>
                                <p>Customer pays on a per order or per call rate according to terms of this insertion order.</p>
                                <p>Customer pays via ACH bank processing according to periodic invoices generated or advance payments.</p>
                                <p>Customer may provide an advance payment or retainer agreement depending upon agreement.</p>
                                <p>
                                    Customer may be charged for dubs, for an agreed upon rate, ( if they cannot supply dubs to the affiliates).
                                    Dub rate will include traffic charges and may include assignment of product codes and/or telephone numbers.
                                </p>
                                <p>
                                    ConsumerEXP will provide Customer log-in access to its vendor banking portal to view and download detailed
                                    bills, call or order logs, and track payments. Also, the Customer portal will provide consolidated statements
                                    of accounts and contain uploaded transaction and sales documents.
                                </p>
                                <p>
                                    Customer states that it owns the TV commercial(s)  and that it has licensed the images, spokespeople,
                                    and music for the TV commercial(s). Furthermore, Customer attests that the TV commercial(s) do not
                                    knowingly violate the rights of any individual, company, state laws, or federal laws.
                                </p>
                                <p>Customer and ConsumerEXP can cancel the flight according to the terms of this insertion order.</p>
                            </>
                        )
                        : (
                            <>
                                <p>
                                    ConsumerEXP pays according to terms of this insertion order.
                                    The company can provide agency of record (AOR) proof upon request.</p>
                                <p>ConsumerEXP may provide a URL link to the TV commercial in this insertion order or by separate email.</p>
                                <p>ConsumerEXP pays via ACH bank processing according to periodic sales reports to media outlet.</p>
                                <p>
                                    ConsumerEXP will provide media outlet log-in access to its vendor banking portal to view and
                                    download detailed bills, call or order logs, and track payments.
                                </p>
                                <p>
                                    ConsumerEXP represents that it has required the companies that own the TV commercial(s) that they
                                    have licensed the images, spokespeople, and music for the TV commercial(s).Furthermore,
                                    ConsumerEXP has required the companies that own the TV commercial(s) contained in this insertion
                                    order to attest in its agreement with ConsumerEXP that the TV commercial(s) do not knowingly
                                    violate the rights of any individual, company, state laws, or federal laws.
                                </p>
                                <p>
                                    ConsumerEXP agrees to indemnify and hold media outlet harmless from any claims for damages
                                    (including reasonable attorney fees) based upon a claim that a commercial run by ConsumerEXP
                                    violates applicable federal or state law.
                                </p>
                                <p>
                                    ConsumerEXP and media outlet agree that insertion order, or titles in the insertion order,
                                    can be cancelled with two weeks advance notice.
                                </p>
                            </>
                        )}
                </div>
                <div className="io-footer">
                    <p>650 Huntington Avenue, Floor 22M | Boston, MA 02115 | Phone/Text: 617-874-4247 | www.consumerexp.com</p>
                </div>
            </section>
        </>
    )
}