<?php
namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\Affiliate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AffiliateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function addAffiliateForm()
    {
        return Inertia::render('Settings/AddAffiliate');
    }

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

    public function storeAffiliate(Request $request)
    {
        $existData = Affiliate::where([
            ['affiliate_id', '=', $request->affiliate_id],
            ['affiliate_name', '=', $request->affiliate_name],
            ['email', '=', $request->email],
            ['telephone', '=', $request->telephone],
            ['address', '=', $request->address]
        ])->count();
        if ($existData > 0) {
            return response()->json(['msg' => 'Cutomer already exists']);
        }
        Affiliate::create([
            'affiliate_id'   => $request->affiliate_id,
            'affiliate_name' => $request->affiliate_name,
            'email'          => $request->email,
            'telephone'      => $request->telephone,
            'address'        => $request->address,
        ]);
        return response()->json(['msg' => 'Successfully Added']);
    }

    public function affiliateReport()
    {
        $allAffiliates = Affiliate::where('status', '=', '1')->get();
        return Inertia::render('Settings/AffiliateReport', [
            'allAffiliates' => $allAffiliates,
        ]);
    }

    public function archivedAffiliates()
    {
        $allAffiliates = Affiliate::where('status', '=', '0')->get();
        return Inertia::render('Settings/ArchivedAffiliates', [
            'allAffiliates' => $allAffiliates,
        ]);
    }

    public function edit(Request $request)
    {
        $data = Affiliate::find($request->id);
        $data->affiliate_id = $request->affiliate_id;
        $data->affiliate_name = $request->affiliate_name;
        $data->email = $request->email;
        $data->telephone = $request->telephone;
        $data->address = $request->address;
        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Successfully Edited', 'status_code' => 200, ]);
        } else {
            return response()->json(['msg' => 'Editing Failed', 'status_code' => 500]);
        }
    }

    public function moveArchive(Request $request)
    {
        $result = true;
        $ids = $request->selectedRowIds;

        if (is_array($ids)) {
            $i = 0;
            while ($i < count($ids)) {
                $dataById = Affiliate::find($ids[$i]);
                $dataById->status = '0';
                $result = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            return response()->json(['msg' => 'Data moved to Archive successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
        }
    }

    public function activeAffiliate(Request $request)
    {
        $result = true;
        $ids = $request->selectedRowIds;

        if (is_array($ids)) {
            $i = 0;
            while ($i < count($ids)) {
                $dataById = Affiliate::find($ids[$i]);
                $dataById->status = '1';
                $result = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            return response()->json(['msg' => 'Affiliate active successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'active failed', 'status_code' => 500]);
        }
    }

    public function delete(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result = Affiliate::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
