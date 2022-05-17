<?php
namespace App\Http\Requests;

use App\Models\EcommerceSale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EcommerceAffiliateRequest extends FormRequest
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
            'campaign_id'   => ['nullable', Rule::exists('ecommerce_campaigns', 'id')],
            'customer_id'   => ['nullable', Rule::exists('customers', 'id')],
            'affiliate_id'  => ['required', Rule::exists('affiliates', 'id')],
            'order_type'    => ['required', Rule::in(EcommerceSale::ORDER_TYPE)],
            'revenue'       => ['required', 'numeric', 'min:0'],
            'affiliate_fee' => ['required', 'numeric', 'min:0'],
            'coupon_code'   => ['max:255', Rule::requiredIf($this->input('order_type') == EcommerceSale::ORDER_TYPE['e-commerce'])],
            'dialed'        => ['max:255', Rule::requiredIf($this->input('order_type') == EcommerceSale::ORDER_TYPE['phone'])],
        ];
    }
}
