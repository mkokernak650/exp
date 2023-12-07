<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\RingbaInsertionOrder;
use App\Notifications\RingbaInsertionOrderDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class RingbaInsertionOrderPublicController extends Controller
{
    public function show()
    {
        $ringbaInsertionOrder = RingbaInsertionOrder::where('io_no', request('io'))->first();

        if (empty($ringbaInsertionOrder)) {
            return Inertia::render('RingbaInsertionOrderPublic/RingbaInsertionOrderPublicNotFound');
        }

        $ioFor = $ringbaInsertionOrder->io_for;

        if ($ioFor === 'customer') {
            $customer       = Customer::where('id', $ringbaInsertionOrder->customer_id)->first();
            $billingDetails = $this->billingDetails($customer, $ringbaInsertionOrder);
        } else {
            $affiliate      = Affiliate::where('affiliate_id', $ringbaInsertionOrder->affiliate_id)->first();
            $billingDetails = $this->billingDetails($affiliate, $ringbaInsertionOrder);
        }

        $orderDetails = $this->orderDetails($ringbaInsertionOrder, $ioFor);

        return Inertia::render('RingbaInsertionOrderPublic/RingbaInsertionOrderPublicIndex', compact('billingDetails', 'orderDetails', 'ioFor'));
    }

    public function updateStatus($id, $status)
    {
        $result = RingbaInsertionOrder::find($id)->update(['status' => $status]);

        if ($result) {
            return ['success' => true, 'msg' => '', 'status' => $status];
        } else {
            return ['success' => false, 'msg' => 'Failed to update', 'status' => ''];
        }
    }

    public function sendIODocument()
    {
        if (filter_var(request('billingDetails')['email'], FILTER_VALIDATE_EMAIL)) {
            $email          = request('billingDetails')['email'];
            $billingDetails = request('billingDetails');
            $orderDetails   = request('orderDetails');
            $ioFor          = request('ioFor');

            if (app()->environment('local')) {
                $email = 'fahimikbal97@gmail.com';
            }

            Notification::route('mail', $email)->notify(new RingbaInsertionOrderDocument($billingDetails, $orderDetails, $ioFor));

            return ['success' => true, 'msg' => 'IO document sent.'];
        } else {
            return ['success' => false, 'msg' => 'Failed to send the IO document (no email found).'];
        }
    }

    private function billingDetails($billingFor, $io)
    {
        if (!empty($billingFor)) {
            return [
                'id'           => $io->id,
                'ioNo'         => 'IO-' . str_pad($io->id, 3, 0, STR_PAD_LEFT),
                'name'         => $io->io_for === 'customer' ? $billingFor->customer_name : $billingFor->affiliate_name,
                'contactName'  => !empty($billingFor->contact_name) ? $billingFor->contact_name : 'Contact Name',
                'contactPhone' => !empty($billingFor->contact_telephone) ? $billingFor->contact_telephone : 'Telephone',
                'email'        => !empty($billingFor->email) ? $billingFor->email : 'Email',
                'address'      => $billingFor?->address,
                'status'       => $io->status,
                'date'         => date_format(date_create($io->created_at), 'd-M-Y')
            ];
        }

        return [
            'id'           => 'N/A',
            'ioNo'         => 'N/A',
            'name'         => 'N/A',
            'contactName'  => 'N/A',
            'contactPhone' => 'N/A',
            'email'        => 'N/A',
            'address'      => 'N/A',
            'status'       => 'N/A',
            'date'         => 'N/A'
        ];
    }

    private function orderDetails($ringbaInsertionOrder, $ioFor)
    {
        $campaign = Campaign::where('campaign_id', $ringbaInsertionOrder->campaign_id)->first();

        if (!empty($ringbaInsertionOrder->lengths)) {
            $lengths = explode(',', str_replace(':', '', $ringbaInsertionOrder->lengths));

            foreach ($lengths as $length) {
                if ($length == '2830') {
                    $length = '28:30';
                }

                $orderDetails[] = [
                    'titleName'   => $length . ' sec - ' . $campaign?->campaign_name,
                    'description' => (!empty($ringbaInsertionOrder->call_length) ?  $ringbaInsertionOrder->call_length . ' seconds duration - ' : '') . $campaign?->description,
                    'videoUrl'    => $ringbaInsertionOrder->video_url,
                    'term'        => $ringbaInsertionOrder->term,
                    'phone'       => $ringbaInsertionOrder->phone,
                    'netPrice'    => (float) ($ioFor === 'affiliate' ? $ringbaInsertionOrder->payout : $ringbaInsertionOrder->revenue)
                ];
            }
        } else {
            $orderDetails[] = [
                'titleName'   => $campaign?->campaign_name,
                'description' => (!empty($ringbaInsertionOrder->call_length) ?  $ringbaInsertionOrder->call_length . ' seconds duration - ' : '') . $campaign?->description,
                'videoUrl'    => $ringbaInsertionOrder->video_url,
                'term'        => $ringbaInsertionOrder->term,
                'phone'       => $ringbaInsertionOrder->phone,
                'netPrice'    => (float) ($ioFor === 'affiliate' ? $ringbaInsertionOrder->payout : $ringbaInsertionOrder->revenue)
            ];
        }

        return $orderDetails;
    }
}
