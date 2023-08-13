<?php

namespace App\Http\Controllers;

use App\Models\InsertionOrder;
use App\Models\InsertionOrderDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsertionOrderPublicController extends Controller
{
    public function show()
    {
        $insertionOrder = InsertionOrder::with(['customer', 'affiliate'])->where('io_no', request('io'))->first();
        $billingFor     = request('type') == 'customer' ? $insertionOrder->customer : $insertionOrder->affiliate;
        $billingDetails = [];

        if (!empty($billingFor)) {
            $billingDetails = [
                'ioNo'         => 'IO-' . str_pad($insertionOrder->id, 3, 0, STR_PAD_LEFT),
                'contactName'  => !empty($billingFor->contact_name) ? $billingFor->contact_name : 'Contact Name',
                'contactPhone' => !empty($billingFor->contact_telephone) ? $billingFor->contact_telephone : 'Telephone',
                'email'        => !empty($billingFor->email) ? $billingFor->email : 'Email',
                'address'      => $billingFor->address,
                'date'         => date_format(date_create($insertionOrder->created_at), 'd-M-Y')
            ];
        }

        $insertionOrderDetails = InsertionOrderDetail::with('ecommerceAffiliate')->where('io_no', request('io'))->get();

        foreach ($insertionOrderDetails as $insertionOrderDetail) {
            $ecommerceAffiliate = $insertionOrderDetail->ecommerceAffiliate;

            if (!empty($ecommerceAffiliate->lengths)) {
                $lengths = explode(',', str_replace(':', '', $ecommerceAffiliate->lengths));

                foreach ($lengths as $length) {
                    $orderDetails[] = [
                        'titleName'   => $length . ' sec- ' . $ecommerceAffiliate?->campaign?->campaign_name,
                        'description' => $ecommerceAffiliate->description,
                        'term'        => $insertionOrderDetail->term,
                        'dialed'      => !empty($ecommerceAffiliate->dialed) ? $ecommerceAffiliate->dialed : 'null',
                        'couponCode'  => !empty($ecommerceAffiliate->coupon_code) ? $ecommerceAffiliate->coupon_code : 'null',
                        'grossPrice'  => (float) (request('type') == 'customer' ? $ecommerceAffiliate->revenue : $ecommerceAffiliate->affiliate_fee)
                    ];
                }
            } else {
                $orderDetails[] = [
                    'titleName'   => $ecommerceAffiliate->campaign->campaign_name,
                    'description' => $ecommerceAffiliate->description,
                    'term'        => $insertionOrderDetail->term,
                    'dialed'      => !empty($ecommerceAffiliate->dialed) ? $ecommerceAffiliate->dialed : 'null',
                    'couponCode'  => !empty($ecommerceAffiliate->coupon_code) ? $ecommerceAffiliate->coupon_code : 'null',
                    'grossPrice'  => (float) (request('type') == 'customer' ? $ecommerceAffiliate->revenue : $ecommerceAffiliate->affiliate_fee)
                ];
            }
        }

        $subTotal = collect($orderDetails)->sum('grossPrice');

        return Inertia::render('InsertionOrderPublic/InsertionOrderPublicIndex', compact('billingDetails', 'orderDetails', 'subTotal'));
    }
}
