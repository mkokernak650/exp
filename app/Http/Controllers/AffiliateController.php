<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\Affiliate;
use App\Models\TableDetails;
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AffiliateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function addAffiliateForm()
    {
        $customMarkets = [
            (object) ['market' => 'Third Party Provider'],
            (object) ['market' => 'Connected TV'],
            (object) ['market' => 'International'],
            (object) ['market' => 'Nationwide'],
            (object) ['market' => 'Regional']
        ];

        $markets    = ZipcodeByTelevisionMarket::select('market')->distinct()->orderBy('market')->get();
        $allMarkets = array_merge($customMarkets, $markets->toarray());

        return Inertia::render('Settings/AddAffiliate', compact('allMarkets'));
    }

    public function all()
    {
        Affiliate::all();
    }

    public function getAffiliate(Request $request)
    {
        $api           = new RingbaApiHelpers();
        $results       = Affiliate::all();
        $affiliate_api = $api->getAffiliate();

        $aff_key = [];
        $aff_val = [];
        foreach ($results as $res) {
            array_push($aff_key, $res->affiliate_id);
            array_push($aff_val, $res->affiliate_name);
        }
        foreach ($affiliate_api as $api_aff_item) {
            if (!in_array($api_aff_item->Affiliate, $aff_val) || !in_array($api_aff_item->Affiliate_Id, $aff_key)) {
                $affiliateModel                 = new Affiliate();
                $affiliateModel->affiliate_id   = $api_aff_item->id;
                $affiliateModel->affiliate_name = $api_aff_item->name;
                $affiliateModel->save();
            }
        }
    }

    public function update(Request $request)
    {
        $id                           = $request->id;
        $getAffiliate                 = Affiliate::find($id);
        $getAffiliate->affiliate_name = $request->affiliate_name;
        $getAffiliate->status         = $request->status;
        $getAffiliate->email          = $request->email;
        $getAffiliate->telephone      = $request->telephone;
        $getAffiliate->address        = $request->address;
        $getAffiliate->save();
    }

    public function updateStatus(Request $request)
    {
        $id                   = $request->id;
        $getAffiliate         = Affiliate::find($id);
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

        $request->validate([
            'affiliate_id'      => 'required',
            'affiliate_name'    => 'required',
            'email'             => 'nullable',
            'telephone'         => 'nullable',
            'address'           => 'nullable',
            'market'            => 'required',
            'contact_name'      => 'nullable',
            'contact_telephone' => 'nullable'
        ]);

        $affiliateName      = explode(' ', $request->affiliate_name);
        $firstFourLetters   = substr($affiliateName[0], 0, 4);
        $matchingAffiliates = Affiliate::where('affiliate_name', 'LIKE', $firstFourLetters . '%')->pluck('affiliate_name');

        if ($matchingAffiliates->count() > 0) {
            $matchingAffiliateNames = implode(', ', $matchingAffiliates->toArray());
            $matchFound             = "Similar like affiliate(s) found: {$matchingAffiliateNames}";

            return response()->json(['msg' => $matchFound], 206);
        }

        Affiliate::create($request->all());

        return response()->json(['msg' => 'Successfully Added']);
    }

    public function affiliateReport()
    {
        if (request('orderBy')) {
            $orderBy          = explode('@', request('orderBy'));
            $orderByColumn    = $orderBy[0];
            $orderByDirection = $orderBy[1];
        }

        $customMarkets = [
            (object) ['market' => 'Third Party Provider'],
            (object) ['market' => 'Connected TV'],
            (object) ['market' => 'International'],
            (object) ['market' => 'Nationwide'],
            (object) ['market' => 'Regional']
        ];

        $markets    = ZipcodeByTelevisionMarket::select('market')->distinct()->orderBy('market')->get();
        $allMarkets = array_merge($customMarkets, $markets->toarray());

        $allAffiliates = Affiliate::where('status', '=', '1')
            ->select()
            ->addSelect(DB::raw('(SELECT tv_households FROM t_v_households WHERE t_v_households.market = affiliates.market LIMIT 1) AS tv_households'))
            ->when(
                !empty($orderBy),
                fn ($query) => $query->orderBy($orderByColumn, $orderByDirection)
            )
            ->get();

        $allAffiliates->transform(function ($item) {
            if (isset($item->tv_households)) {
                $item->tv_households = number_format($item->tv_households);
            }

            return $item;
        });

        if (request('type') === 'orderBy') {
            return $allAffiliates;
        }

        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render('Settings/AffiliateReport', [
            'allAffiliates' => $allAffiliates,
            'columnsData'   => $columnsData,
            'allMarkets'    => $allMarkets,
        ]);
    }

    public function archivedAffiliates()
    {
        $customMarkets = [
            (object) ['market' => 'Third Party Provider'],
            (object) ['market' => 'Connected TV'],
            (object) ['market' => 'International'],
            (object) ['market' => 'Nationwide'],
            (object) ['market' => 'Regional']
        ];

        $markets    = ZipcodeByTelevisionMarket::select('market')->distinct()->orderBy('market')->get();
        $allMarkets = array_merge($customMarkets, $markets->toarray());

        $allAffiliates = Affiliate::where('status', '=', '0')->get();
        $columnsData   = TableDetails::all()->pluck('column_details');
        return Inertia::render('Settings/ArchivedAffiliates', [
            'allAffiliates' => $allAffiliates,
            'columnsData'   => $columnsData,
            'allMarkets'    => $allMarkets,
        ]);
    }

    public function edit(Request $request)
    {
        $id                      = $request->id;
        $userFullName            = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail               = auth()->user()->email;
        $data                    = Affiliate::find($request->id);
        $data->affiliate_id      = $request->affiliate_id;
        $data->affiliate_name    = $request->affiliate_name;
        $data->email             = $request->email;
        $data->telephone         = $request->telephone;
        $data->address           = $request->address;
        $data->market            = $request->market;
        $data->contact_name      = $request->contact_name;
        $data->contact_telephone = $request->contact_telephone;
        $result                  = $data->save();

        if ($result) {
            activity('Affiliate')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
                ->log("An Item has been updated");
            return response()->json(['msg' => 'Successfully Edited', 'status_code' => 200,]);
        } else {
            return response()->json(['msg' => 'Editing Failed', 'status_code' => 500]);
        }
    }

    public function moveArchive(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;

        if (is_array($ids)) {
            $i = 0;
            while ($i < $idsCount) {
                $dataById         = Affiliate::find($ids[$i]);
                $dataById->status = '0';
                $result           = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            activity('Affiliate')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been archived");
            return response()->json(['msg' => 'Data moved to Archive successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
        }
    }

    public function activeAffiliate(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;

        if (is_array($ids)) {
            $i = 0;
            while ($i < $idsCount) {
                $dataById         = Affiliate::find($ids[$i]);
                $dataById->status = '1';
                $result           = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            activity('Affiliate')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been activated");
            return response()->json(['msg' => 'Affiliate active successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'active failed', 'status_code' => 500]);
        }
    }

    public function delete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = false;
        $i            = 0;

        while ($i < $idsCount) {
            $result = Affiliate::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Affiliate')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
