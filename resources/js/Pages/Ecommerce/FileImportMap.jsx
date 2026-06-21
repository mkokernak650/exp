import { CloseOutlined } from '@ant-design/icons'

export default function FileImportMap({
  index,
  reminderField,
  fieldMap,
  setFieldMap,
  reportFields,
}) {
  const handleReminderFieldMapping = (e) => {
    const newFieldMap = [...fieldMap]
    newFieldMap[index][e.target.name] = e.target.value
    setFieldMap([...newFieldMap])
  }

  const delReminderFieldMap = () => {
    const newFieldMap = [...fieldMap]
    if (newFieldMap.length > 1) {
      newFieldMap.splice(index, 1)
    }
    setFieldMap([...newFieldMap])
  }

  return (
    <div className="flx mt-2 align-center">
      <select
        className="custom-input mr-2"
        name="applicationField"
        value={reminderField.applicationField || ''}
        onChange={(e) => handleReminderFieldMapping(e)}
      >
        <option value="">Select Application Field</option>
        <option value="order_date_time">Order datetime</option>
        <option value="order_date">Order date</option>
        <option value="order_time">Order time</option>
        <option value="order_no">Order no</option>
        <option value="coupon_code">Coupon / Promo Code</option>
        <option value="tracking_url">Tracking URL</option>
        <option value="user_ip">User ip</option>
        <option value="dialed">Dialed (800#)</option>
        <option value="inbound">Inbound</option>
        <option value="shipping_city">Shipping city</option>
        <option value="shipping_state">Shipping state</option>
        <option value="ship_country">Ship Country</option>
        <option value="shipping_zip">Shipping zip</option>
        <option value="billing_zip">Billing zip</option>
        <option value="quantity">Quantity (R2)</option>
        <option value="subtotal">Subtotal</option>
        <option value="shipping_cost">Shipping cost (S&amp;H)</option>
        <option value="total">Total</option>
        <option value="vendor_fee">Vendor Fee (Total Fee)</option>
        <option value="consumerexp_fee">ConsumerEXP Fee</option>
        <option value="vendor_code">Vendor Code</option>
        <option value="telemarketing_co">Telemarketing Co.</option>
        <option value="product_code">Product Code</option>
        <option value="isci">ISCI</option>
        <option value="order_description">Order Description</option>
        <option value="station">Station</option>
        <option value="ani">ANI / Consumer Phone</option>
        <option value="call_length">Call Length</option>
        <option value="payment_type">Payment Type</option>
        <option value="r1">R1</option>
        <option value="campaign_indicator">Campaign Indicator (row-level)</option>
        <option value="record_kind">Record Kind (SALE / RETURN / ZERO_CALL)</option>
      </select>
      <select
        className="custom-input"
        name="reportField"
        value={reminderField.reportField || ''}
        onChange={(e) => handleReminderFieldMapping(e)}
      >
        <option value="">Select Report Field</option>
        {reportFields[0] &&
          reportFields[0].map((fld, indx) => (
            <option key={`${indx}-2`} value={fld}>
              {fld}
            </option>
          ))}
      </select>
      <button
        onClick={() => delReminderFieldMap()}
        className="icn-btn sh-sm ml-1"
        type="button"
        aria-label="btn"
      >
        <CloseOutlined style={{ fontSize: '1rem' }} />
      </button>
    </div>
  )
}
