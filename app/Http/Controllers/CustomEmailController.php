<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Notifications\CustomEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CustomEmailController extends Controller
{
    public function index()
    {
        $campaigns = EcommerceCampaign::active()->get();

        return Inertia::render('CustomEmail/CustomEmail', compact('campaigns'));
    }

    public function getAffiliates(Request $request)
    {
        $campaignIds         = explode(',', $request->selectedCampaignIds);
        $ecommerceAffiliates = EcommerceAffiliate::distinct()->whereIn('campaign_id', $campaignIds)->pluck('affiliate_id')->toArray();
        $affiliates          = Affiliate::whereIn('id', $ecommerceAffiliates)->orderBy('affiliate_name')->get();

        foreach ($affiliates as $affiliate) {
            if (!empty($affiliate->email)) {
                $affiliateOptions[] = [
                    'label' => "{$affiliate->affiliate_name} ({$affiliate->market})",
                    'value' => $affiliate->email
                ];
            }
        }

        return $affiliateOptions;
    }

    public function sendCustomEmail(Request $request)
    {
        $affiliateEmails   = [];
        $additionalEmails  = [];
        $attachedFilesData = [];
        $emailSubject      = $request->subject;
        $emailMessage      = $request->message;
        $attachedFiles     = $request->file('files');

        if (!empty($request->affiliateEmails)) {
            $affiliateEmails = explode(',', $request->affiliateEmails);
        }

        if (!empty($request->additionalEmails)) {
            $additionalEmails = explode(',', $request->additionalEmails);
        }

        $emails = array_unique(array_merge($affiliateEmails, $additionalEmails));

        if (!empty($attachedFiles)) {
            foreach ($attachedFiles as $file) {
                $attachedFilesData[] = [
                    'filePath' => Storage::path($file->store('customEmailFile')),
                    'fileName' => $file->getClientOriginalName()
                ];
            }
        }

        if (app()->environment('local')) {
            $emails = ['fahimikbal97@gmail.com'];
        }

        if (empty($emails)) {
            return ['success' => false, 'msg' => 'No emails found'];
        } else {
            foreach ($emails as $email) {
                Notification::route('mail', $email)->notify(new CustomEmail($emailSubject, $emailMessage, $attachedFilesData));
            }
        }

        return ['success' => true, 'msg' => 'Email sent successfully'];
    }
}
