import React from "react"
import { Helmet } from "react-helmet"
import Logo from "../../../images/webform/logo.png";

const InsertionOrderPublicIndex = () => {
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
                                        <li>Dan Viles</li>
                                        <li>+18455490550</li>
                                        <li>cannytv@gmail.com</li>
                                        <li>Albany-Schenectady-Troy, NY</li>
                                        <li>Households:</li>
                                    </ul>
                                </td>
                                <td style={{ width: "40%" }}>
                                    Insertion Order NO: IO-025
                                </td>
                            </tr>
                            <tr>
                                <td>BILL TO:</td>
                                <td>DATE:</td>
                            </tr>
                            <tr>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
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
                            <tr>
                                <td></td>
                                <td style={{ fontSize: "12px" }}>Paid based on e-commerce sale by TV COUPON CODE. The Best Engineered
                                    Mouth Guard for Teeth Grinding and Clenching.
                                    https://www.bruxnightguard.com/</td>
                                <td></td>
                                <td>8009135440</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td colSpan="4" rowSpan="3" style={{ textAlign: "center" }}>Thank You</td>
                                <td>Sub Total</td>
                                <td>20</td>
                            </tr>
                            <tr>
                                <td>Discount</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>Grand Total</td>
                                <td>20</td>
                            </tr>
                        </tbody>
                    </table>
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
        </>
    )
}

export default InsertionOrderPublicIndex