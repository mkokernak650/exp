<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\Affiliate;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
    public function all()
    {
        $results = Affiliate::all();
        dd($results);
    }

    public function getAffiliate(Request $request)
    {
        $api = new RingbaApiHelpers();
        $results = Affiliate::all();
        $affiliate_api = $api->getAffiliate();

        $aff_key = [];
        $aff_val = [];
        foreach ($results as $res) {
            array_push($aff_key, $res->affiliate_id);
            array_push($aff_val, $res->affiliate_name);
        }
        foreach ($affiliate_api as $api_aff_item) {
            if (!in_array($api_aff_item->Affiliate, $aff_val) || !in_array($api_aff_item->Affiliate_Id, $aff_key)) {
                $affiliateModel = new Affiliate();
                $affiliateModel->affiliate_id = $api_aff_item->id;
                $affiliateModel->affiliate_name = $api_aff_item->name;
                $affiliateModel->save();
            }
        }
    }
    public function update(Request $request)
    {
        $id = $request->id;
        $getAffiliate = Affiliate::find($id);
        $getAffiliate->affiliate_name = $request->affiliate_name;
        $getAffiliate->status = $request->status;
        $getAffiliate->email = $request->email;
        $getAffiliate->telephone = $request->telephone;
        $getAffiliate->address = $request->address;
        $getAffiliate->save();
    }

    public function updateStatus(Request $request)
    {
        $id = $request->id;
        $getAffiliate = Affiliate::find($id);
        $getAffiliate->status = $request->status;
        $getAffiliate->save();
    }
}
