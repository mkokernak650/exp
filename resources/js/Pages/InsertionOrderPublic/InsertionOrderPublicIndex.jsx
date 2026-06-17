import React, { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import Logo from '../../../images/webform/logo.png'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const InsertionOrderPublicIndex = () => {
  const { billingDetails, orderDetails, subTotal, ioFor } = usePage().props
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(billingDetails.status)

  const token = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const params = new URLSearchParams(window.location.search)
    return params.get('t') || ''
  }, [])

  const changeIoStatus = (value) => {
    setLoading(true)
    axios
      .post(
        route('insertion.order.public.update.status', { id: billingDetails.id, status: value }),
        { t: token, type: ioFor }
      )
      .then((response) => {
        if (response.data.success === true) {
          const updatedStatus = response.data.status
          setStatus(updatedStatus)
          if (updatedStatus === 'accepted') {
            toast.success('Insertion order accepted')
            sendIODocument()
          } else if (value === 'accepted' && updatedStatus === 'sent') {
            toast.success('Your acceptance is recorded. Awaiting the other party.')
          } else if (updatedStatus === 'declined' || updatedStatus === 'void') {
            toast.error('Insertion order declined')
          } else if (updatedStatus === 'canceled') {
            toast.success('Insertion order canceled')
            sendIODocument()
          }
          setLoading(false)
        } else {
          toast.error(response.data.msg)
          setLoading(false)
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.msg || 'Something went wrong!')
        setLoading(false)
      })
  }

  const sendIODocument = () => {
    axios
      .post(
        route('insertion.order.public.send.io.document', {
          billingDetails: { ...billingDetails, status },
          orderDetails,
          subTotal,
          ioFor,
        })
      )
      .then((response) => {
        if (response.data.success === true) {
          toast.success(response.data.msg)
        } else {
          toast.error(response.data.msg)
        }
      })
      .catch(() => {
        toast.error('Something went wrong!')
      })
  }

  const sideAcceptedLabel = () => {
    const ours = ioFor === 'customer'
      ? billingDetails.customer_accepted_at
      : billingDetails.affiliate_accepted_at
    const theirs = ioFor === 'customer'
      ? billingDetails.affiliate_accepted_at
      : billingDetails.customer_accepted_at
    if (ours && theirs) return 'Both parties have accepted.'
    if (ours && !theirs) return 'Your acceptance is recorded. Awaiting the other party.'
    if (!ours && theirs) return 'The other party has accepted. Awaiting your approval.'
    return ''
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
            <li>
              <a href="mailto:info@consumerexp.com">info@consumerexp.com</a>
            </li>
            <li>
              <a href="https://www.consumerexp.com/">www.consumerexp.com</a>
            </li>
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
                  {ioFor === 'customer' ? 'Dub Order or Notification' : 'Traffic Instructions'}{' '}
                  <br /> <br />
                  {ioFor === 'customer' ? 'Customer ' : ''}Insertion Order NO:{' '}
                  {billingDetails?.ioNo}
                </td>
              </tr>
              <tr>
                <td>
                  <b>BILL TO:</b>
                </td>
                <td>
                  <b>DATE:</b> {billingDetails?.date}
                </td>
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
                  <th className="w-[15%]">Title Name</th>
                  <th className="w-[35%]">Description</th>
                  <th className="w-[10%]">Terms</th>
                  <th className="w-[15%]">800#</th>
                  <th className="w-[15%]">Coupon Code</th>
                  <th className="w-[10%]">{ioFor === 'customer' ? 'Payout' : 'Affiliate Fee'}</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.map((item, index) => (
                  <tr key={index + 1}>
                    <td>{item.titleName}</td>
                    <td className="text-xs">
                      {item.description}
                      {item.videoUrl && ioFor === 'affiliate' && (
                        <>
                          <br />
                          <a href={item.videoUrl} target="_blank" className="underline font-bold">
                            Download TV Commercial
                          </a>
                        </>
                      )}
                    </td>
                    <td>{item.term}</td>
                    <td>{item.dialed}</td>
                    <td>{item.couponCode}</td>
                    <td>{item.netPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="io-terms">
          {ioFor === 'customer' ? (
            <>
              <p>
                Customer pays on a per order or per call rate according to terms of this insertion
                order.
              </p>
              <p>
                Customer pays via ACH bank processing according to periodic invoices generated or
                advance payments.
              </p>
              <p>
                Customer may provide an advance payment or retainer agreement depending upon
                agreement.
              </p>
              <p>
                Customer may be charged for dubs, for an agreed upon rate, ( if they cannot supply
                dubs to the affiliates). Dub rate will include traffic charges and may include
                assignment of product codes and/or telephone numbers.
              </p>
              <p>
                ConsumerEXP will provide Customer log-in access to its vendor banking portal to view
                and download detailed bills, call or order logs, and track payments. Also, the
                Customer portal will provide consolidated statements of accounts and contain
                uploaded transaction and sales documents.
              </p>
              <p>
                Customer states that it owns the TV commercial(s) and that it has licensed the
                images, spokespeople, and music for the TV commercial(s). Furthermore, Customer
                attests that the TV commercial(s) do not knowingly violate the rights of any
                individual, company, state laws, or federal laws.
              </p>
              <p>
                <b>30-Day Cancellation Notice:</b> Either party may cancel this insertion order with
                thirty (30) days written notice. Sales will continue to be tracked through the
                cancellation effective date.
              </p>
            </>
          ) : (
            <>
              <p>
                ConsumerEXP pays according to terms of this insertion order. The company can provide
                agency of record (AOR) proof upon request.
              </p>
              <p>
                ConsumerEXP may provide a URL link to the TV commercial in this insertion order or
                by separate email.
              </p>
              <p>
                ConsumerEXP pays via ACH bank processing according to periodic sales reports to
                media outlet.
              </p>
              <p>
                ConsumerEXP will provide media outlet log-in access to its vendor banking portal to
                view and download detailed bills, call or order logs, and track payments.
              </p>
              <p>
                ConsumerEXP represents that it has required the companies that own the TV
                commercial(s) that they have licensed the images, spokespeople, and music for the TV
                commercial(s).Furthermore, ConsumerEXP has required the companies that own the TV
                commercial(s) contained in this insertion order to attest in its agreement with
                ConsumerEXP that the TV commercial(s) do not knowingly violate the rights of any
                individual, company, state laws, or federal laws.
              </p>
              <p>
                ConsumerEXP agrees to indemnify and hold media outlet harmless from any claims for
                damages (including reasonable attorney fees) based upon a claim that a commercial
                run by ConsumerEXP violates applicable federal or state law.
              </p>
              <p>
                <b>30-Day Cancellation Notice:</b> Either party may cancel this insertion order with
                thirty (30) days written notice. Sales will continue to be tracked through the
                cancellation effective date.
              </p>
            </>
          )}
        </div>
        <div className="io-footer">
          <p>
            650 Huntington Avenue, Floor 22M | Boston, MA 02115 | Phone/Text: 617-874-4247 |
            www.consumerexp.com
          </p>
        </div>
      </section>
      <section className="decision-box" id="decision-box">
        <div className="decision-box-text">This insertion order is {status}.</div>
        {sideAcceptedLabel() && (
          <div className="decision-box-text text-sm">{sideAcceptedLabel()}</div>
        )}
        {(status === 'sent' || status === 'pending') && (
          <div className="decision-box-buttons">
            <button
              className="bg-[#FF0000]"
              disabled={loading}
              onClick={() => changeIoStatus('declined')}
            >
              {loading ? 'Loading..' : 'Decline'}
            </button>
            <button
              className="bg-[#6600FF]"
              disabled={loading}
              onClick={() => changeIoStatus('accepted')}
            >
              {loading ? 'Loading..' : 'Accept'}
            </button>
          </div>
        )}
        {status === 'accepted' && (
          <div className="decision-box-buttons">
            <button
              className="bg-[#ff0e0e]"
              disabled={loading}
              onClick={() => changeIoStatus('canceled')}
            >
              {loading ? 'Loading..' : 'Cancel (30-day notice)'}
            </button>
          </div>
        )}
      </section>
    </>
  )
}

export default InsertionOrderPublicIndex
