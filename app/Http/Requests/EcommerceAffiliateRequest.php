<?php

namespace App\Http\Requests;

use App\Models\EcommerceAffiliate;
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
            'affiliate_fee_type'            => ['required', Rule::in(array_values(EcommerceAffiliate::FEE_MODE))],
            'percentage'                    => ['nullable', 'numeric', 'min:0'],
            'consumerEXP_cash_buy_fee'      => ['nullable'],
            'consumerEXP_cash_buy_fee_type' => ['nullable'],
            'description'                   => ['nullable'],
            'video_url'                     => ['nullable'],
        ];

        if ($this->affiliate_fee_type == EcommerceAffiliate::FEE_MODE['payout_per_order']) {
            $rules['revenue']       = ['numeric', 'min:0', 'required'];
            $rules['affiliate_fee'] = ['numeric', 'min:0', 'required'];
        }

        // "Percentage of Sales": affiliate % in `affiliate_fee`, ConsumerEXP % in
        // `consumerEXP_cash_buy_fee`; total `percentage` is computed server-side.
        if ($this->affiliate_fee_type == EcommerceAffiliate::FEE_MODE['fixed_pct']) {
            $rules['affiliate_fee']            = ['required', 'numeric', 'min:0'];
            $rules['consumerEXP_cash_buy_fee'] = ['required', 'numeric', 'min:0'];
        }

        return $rules;
    }
}
