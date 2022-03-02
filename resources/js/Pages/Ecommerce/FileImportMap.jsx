export default function FileImportMap({ index, reminderField, fieldMap, setFieldMap, reportFields }) {
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
    <div className="flx mt-2">
      <select className="custom-input mr-2" name="applicationField" value={reminderField.applicationField || ''} onChange={(e) => handleReminderFieldMapping(e)}>
        <option value="">Select Application Field</option>
        <option value="order_created_at">Order created at</option>
        <option value="order_no">Order no</option>
        <option value="coupon_code">Coupon code</option>
        <option value="user_ip">User ip</option>
        <option value="shipping_city">Shipping city</option>
        <option value="shipping_state">Shipping state</option>
        <option value="shipping_zip">Shipping zip</option>
        <option value="billing_zip">Billing zip</option>
        <option value="quantity">Quantity</option>
        <option value="subtotal">Subtotal</option>
        <option value="shipping_cost">Shipping cost</option>
        <option value="total">Total</option>
      </select>
      <select className="custom-input" name="reportField" value={reminderField.reportField || ''} onChange={(e) => handleReminderFieldMapping(e)}>
        <option value="">Select Report Field</option>
        {
          reportFields[0] && reportFields[0].map((fld, indx) => (
            <option key={`${indx}-2`} value={fld}>
              {fld}
            </option>
          ))
        }
      </select>
      <button onClick={() => delReminderFieldMap()} className="icn-btn sh-sm ml-1" type="button" aria-label="btn">
        x
      </button>
    </div>
  )
}
