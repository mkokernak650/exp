<?php
namespace App\Http\Requests;

use App\Models\EcommerceSale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EcommerceSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'campaign_id'    => ['nullable', Rule::exists('ecommerce_campaigns', 'id')],
            'customer_id'    => ['nullable', Rule::exists('customers', 'id')],
            'order_type'     => ['required', Rule::in(EcommerceSale::ORDER_TYPE)],
            'order_no'       => ['required', 'string', 'max:255'],
            'coupon_code'    => ['max:255', Rule::requiredIf($this->input('order_type') == EcommerceSale::ORDER_TYPE['e-commerce'])],
            'dialed'         => ['max:255', Rule::requiredIf($this->input('order_type') == EcommerceSale::ORDER_TYPE['phone'])],
            'user_ip'        => ['nullable', 'max:255'],
            'inbound'        => ['nullable', 'max:255'],
            'shipping_city'  => ['nullable', 'string', 'max:255'],
            'shipping_state' => ['nullable', 'string', 'max:255'],
            'shipping_zip'   => ['nullable', 'string', 'max:255'],
            'billing_zip'    => ['nullable', 'string', 'max:255'],
            'quantity'       => ['nullable', 'string', 'max:255'],
            'subtotal'       => ['nullable', 'string', 'max:255'],
            'shipping_cost'  => ['nullable', 'string', 'max:255'],
            'total'          => ['nullable', 'string', 'max:255'],
        ];
    }
}
