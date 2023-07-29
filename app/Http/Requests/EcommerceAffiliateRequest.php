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
        $rules = [
            'campaign_id'                   => ['nullable', Rule::exists('ecommerce_campaigns', 'id')],
            'customer_id'                   => ['nullable', Rule::exists('customers', 'id')],
            'affiliate_id'                  => ['required', Rule::exists('affiliates', 'id')],
            'product_code'                  => ['nullable'],
            'order_type'                    => ['required', Rule::in(EcommerceSale::ORDER_TYPE)],
            'coupon_code'                   => ['max:255', Rule::requiredIf($this->input('order_type') == EcommerceSale::ORDER_TYPE['e-commerce'])],
            'dialed'                        => ['max:255', Rule::requiredIf($this->input('order_type') == EcommerceSale::ORDER_TYPE['phone'])],
            'lengths'                       => ['nullable'],
            'pay_on_multiple_orders'        => ['required'],
            'cash_buy'                      => ['nullable', 'numeric', 'min:0'],
            'affiliate_fee_type'            => ['required', Rule::in(EcommerceSale::AFFILIATE_FEE_TYPE)],
            'consumerEXP_cash_buy_fee'      => ['nullable'],
            'consumerEXP_cash_buy_fee_type' => ['nullable'],
            'description'                   => ['nullable'],
        ];

        if ($this->affiliate_fee_type == 1) {
            $rules['revenue']       = ['numeric', 'min:0', Rule::requiredIf($this->input('affiliate_fee_type') == EcommerceSale::AFFILIATE_FEE_TYPE['payout_per_order'])];
            $rules['affiliate_fee'] = ['numeric', 'min:0', Rule::requiredIf($this->input('affiliate_fee_type') == EcommerceSale::AFFILIATE_FEE_TYPE['payout_per_order'])];
        }

        return $rules;
    }
}
