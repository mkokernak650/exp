<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\Campaign;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Notifications\CustomEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CustomEmailController extends Controller
{
    public function index()
    {
        $ecommerceCampaigns = EcommerceCampaign::active()->get();
        $otherCampaigns     = Campaign::active()->get();
        $campaigns          = $ecommerceCampaigns->merge($otherCampaigns);

        return Inertia::render('CustomEmail/CustomEmail', compact('campaigns'));
    }

    public function getAffiliates(Request $request)
    {
        $selectedCampaigns = explode(',', $request->selectedCampaigns);

        foreach ($selectedCampaigns as $selectedCampaign) {
            $separateCampaignIdName = explode('+', $selectedCampaign);
            $campaignIds[]          = $separateCampaignIdName[0];
            $campaignNames[]        = $separateCampaignIdName[1];
        }

        $ecommerceAffiliates = EcommerceAffiliate::distinct()->whereIn('campaign_id', $campaignIds)->pluck('affiliate_id')->toArray();

        $fromBilled     = DB::table('billed_call_logs')->whereIn('Campaign', $campaignNames)->select('Affiliate_Id')->distinct()->get();
        $fromArchived   = DB::table('archived_call_logs')->whereIn('Campaign', $campaignNames)->select('Affiliate_Id')->distinct()->get();
        $fromCallLogs   = DB::table('ringba_call_logs')->whereIn('Campaign', $campaignNames)->select('Affiliate_Id')->distinct()->get();
        $fromExceptions = DB::table('exceptions')->whereIn('Campaign', $campaignNames)->select('Affiliate_Id')->distinct()->get();
        $data           = $fromBilled->merge($fromArchived)->merge($fromCallLogs)->merge($fromExceptions);
        $affiliateIds   = $data->pluck('Affiliate_Id')->unique()->toArray();

        $affiliates = Affiliate::whereIn('id', $ecommerceAffiliates)->orWhereIn('affiliate_id', $affiliateIds)->orderBy('affiliate_name')->get();

        foreach ($affiliates as $affiliate) {
            if (!empty($affiliate->email)) {
                $affiliateOptions[] = [
                    'label' => $affiliate->affiliate_name . (!empty($affiliate->market) ? " ({$affiliate->market})" : ''),
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
            $emails = ['shosen@bitcode.pro'];
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
