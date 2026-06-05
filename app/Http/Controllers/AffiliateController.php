<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\Affiliate;
use App\Models\BroadcastGroupName;
use App\Models\Customer;
use App\Models\MsoName;
use App\Models\NetworkName;
use App\Models\TableDetails;
use App\Models\ZipcodeByTelevisionMarket;
use App\Services\CorporationService;
use App\Support\ReportTableSort;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AffiliateController extends Controller
{
    protected CorporationService $corporationService;

    public function __construct(CorporationService $corporationService)
    {
        $this->middleware('auth');
        $this->corporationService = $corporationService;
    }

    /**
     * Persist the corporations multi-select onto the affiliate_corporation pivot.
     * Accepts an array of [{type, id}, ...] (already JSON-decoded by the request).
     */
    protected function syncAffiliateCorporations(Affiliate $affiliate, $corporations): void
    {
        if (is_string($corporations)) {
            $corporations = json_decode($corporations, true) ?: [];
        }
        if (!is_array($corporations)) {
            return;
        }

        // Build desired pivot state per corporation type, then sync each side.
        $desired = [
            CorporationService::TYPE_BROADCAST_GROUP => [],
            CorporationService::TYPE_MSO             => [],
            CorporationService::TYPE_NETWORK         => [],
        ];
        foreach ($corporations as $row) {
            $type = $row['type'] ?? null;
            $id   = isset($row['id']) ? (int) $row['id'] : null;
            if (!$type || !$id || !array_key_exists($type, $desired)) {
                continue;
            }
            $desired[$type][$id] = $id;
        }

        $affiliate->broadcastGroups()->sync(array_values($desired[CorporationService::TYPE_BROADCAST_GROUP]));
        $affiliate->msos()->sync(array_values($desired[CorporationService::TYPE_MSO]));
        $affiliate->networks()->sync(array_values($desired[CorporationService::TYPE_NETWORK]));
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

        $allBroadcastGroupNames = BroadcastGroupName::select('broadcast_group_name')->active()->distinct()->get();
        $allMsoNames            = MsoName::select('mso_name')->active()->distinct()->get();
        $allNetworkNames        = NetworkName::select('network_name')->active()->distinct()->get();

        // Union picker list (id + type + name) for the new multi-corporation field.
        $allCorporations = $this->corporationService->all();

        return Inertia::render('Settings/AddAffiliate', compact(
            'allMarkets',
            'allBroadcastGroupNames',
            'allMsoNames',
            'allNetworkNames',
            'allCorporations'
        ));
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
            'zip_code'          => 'nullable',
            'website'           => 'nullable|url',
            'ownership_type'    => 'nullable',
            'ownership_name'    => 'nullable',
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

        $affiliate = Affiliate::create($request->except('corporations'));

        // Sync optional corporations multi-select from the new picker.
        $this->syncAffiliateCorporations($affiliate, $request->input('corporations'));

        return response()->json(['msg' => 'Successfully Added']);
    }

    public function affiliateReport()
    {
        $orderBy = [];
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

        $itemPerPage = request('itemPerPage', 10);

        $affiliateFieldMap = [
            'affiliate_id'   => 'affiliate_id',
            'affiliate_name' => 'affiliate_name',
            'ownership'      => 'ownership_type',
            'ownership_name' => 'ownership_name',
            'zip_code'       => 'zip_code',
            'website'        => 'website',
            'email'          => 'email',
            'telephone'      => 'telephone',
            'address'        => 'address',
        ];
        $affiliateAllowed = array_values($affiliateFieldMap);

        $filterByCustomerId = request('filterByCustomer');

        $allAffiliates = Affiliate::where('status', '=', '1')
            ->select()
            ->addSelect(DB::raw('(SELECT tv_households FROM t_v_households WHERE t_v_households.market = affiliates.market LIMIT 1) AS tv_households'))
            ->when(
                empty(request('sortField')) && !empty($orderBy),
                fn ($query) => $query->orderBy($orderByColumn, $orderByDirection)
            )
            ->when(!empty($filterByCustomerId), function ($query) use ($filterByCustomerId) {
                // Affiliates wired to a customer via ecommerce_affiliates pivot.
                $query->whereIn('id', function ($sub) use ($filterByCustomerId) {
                    $sub->from('ecommerce_affiliates')
                        ->select('affiliate_id')
                        ->where('customer_id', (int) $filterByCustomerId);
                });
            })
            ->tap(function ($query) use ($affiliateFieldMap, $affiliateAllowed) {
                $this->applyEloquentTableFilters($query, request('filteredValue'), $affiliateFieldMap, $affiliateAllowed);
            })
            ->when(!empty(request('sortField')) && !empty(request('sortOrder')), function ($query) {
                $sortField = request('sortField');
                $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
                $sortFieldMap = [
                    'affiliate_id' => 'affiliate_id', 'affiliate_name' => 'affiliate_name',
                    'ownership' => 'ownership_type', 'ownership_name' => 'ownership_name',
                    'zip_code' => 'zip_code', 'website' => 'website', 'tv_households' => 'tv_households',
                    'market' => 'market', 'email' => 'email', 'telephone' => 'telephone',
                    'address' => 'address', 'contact_name' => 'contact_name', 'contact_telephone' => 'contact_telephone',
                ];
                if (isset($sortFieldMap[$sortField])) {
                    $dbCol = $sortFieldMap[$sortField];
                    $sortableDbCols = array_values(array_unique(array_values($sortFieldMap)));
                    ReportTableSort::apply(
                        $query,
                        $dbCol,
                        $sortOrder,
                        $sortableDbCols,
                        ['tv_households']
                    );
                }
            })
            ->paginate($itemPerPage);

        // Flatten each row to a plain array, format tv_households, and attach existing
        // corporation links so the inline edit modal can preselect them in the multi-select picker.
        // Plain arrays avoid dynamic-attribute serialization quirks on the Affiliate model and
        // run before the request('page') short-circuit so paginated fetches include the same data.
        $allAffiliates->setCollection(
            $allAffiliates->getCollection()->map(function ($item) {
                $row = $item->toArray();
                if (isset($row['tv_households'])) {
                    $row['tv_households'] = number_format($row['tv_households']);
                }
                $row['corporations'] = $this->corporationService->corporationsOfAffiliate($item);
                return $row;
            })
        );

        if (request('page')) {
            return $allAffiliates;
        }

        $columnsData            = TableDetails::all()->pluck('column_details');
        $allBroadcastGroupNames = BroadcastGroupName::select('broadcast_group_name')->active()->distinct()->get();
        $allMsoNames            = MsoName::select('mso_name')->active()->distinct()->get();
        $allNetworkNames        = NetworkName::select('network_name')->active()->distinct()->get();
        $allCorporations        = $this->corporationService->all();

        $filterByCustomerInfo = null;
        if (!empty($filterByCustomerId)) {
            $customerModel = Customer::find((int) $filterByCustomerId);
            if ($customerModel) {
                $filterByCustomerInfo = [
                    'id'   => $customerModel->id,
                    'name' => $customerModel->customer_name,
                ];
            }
        }

        return Inertia::render('Settings/AffiliateReport', [
            'allAffiliates'          => $allAffiliates,
            'columnsData'            => $columnsData,
            'allMarkets'             => $allMarkets,
            'allBroadcastGroupNames' => $allBroadcastGroupNames,
            'allMsoNames'            => $allMsoNames,
            'allNetworkNames'        => $allNetworkNames,
            'allCorporations'        => $allCorporations,
            'filterByCustomer'       => $filterByCustomerInfo,
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

        $itemPerPage   = request('itemPerPage', 10);
        $archivedFieldMap = [
            'affiliate_id'   => 'affiliate_id',
            'affiliate_name' => 'affiliate_name',
            'ownership'      => 'ownership_type',
            'ownership_name' => 'ownership_name',
            'zip_code'       => 'zip_code',
            'website'        => 'website',
            'email'          => 'email',
            'telephone'      => 'telephone',
            'address'        => 'address',
        ];
        $archivedAllowed = array_values($archivedFieldMap);

        $query = Affiliate::where('status', '=', '0')
            ->tap(function ($query) use ($archivedFieldMap, $archivedAllowed) {
                $this->applyEloquentTableFilters($query, request('filteredValue'), $archivedFieldMap, $archivedAllowed);
            });

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortableColumns = [
                'affiliate_id' => 'affiliate_id',
                'affiliate_name' => 'affiliate_name',
                'ownership' => 'ownership_type',
                'ownership_name' => 'ownership_name',
                'zip_code' => 'zip_code',
                'website' => 'website',
                'market' => 'market',
                'email' => 'email',
                'telephone' => 'telephone',
                'address' => 'address',
                'contact_name' => 'contact_name',
                'contact_telephone' => 'contact_telephone',
            ];
            if (array_key_exists($sortField, $sortableColumns)) {
                $query->orderBy($sortableColumns[$sortField], $sortOrder);
            }
        }

        $allAffiliates = $query->paginate($itemPerPage);

        if (request('page')) {
            return $allAffiliates;
        }

        $columnsData            = TableDetails::all()->pluck('column_details');
        $allBroadcastGroupNames = BroadcastGroupName::select('broadcast_group_name')->active()->distinct()->get();
        $allMsoNames            = MsoName::select('mso_name')->active()->distinct()->get();
        $allNetworkNames        = NetworkName::select('network_name')->active()->distinct()->get();
        return Inertia::render('Settings/ArchivedAffiliates', [
            'allAffiliates'          => $allAffiliates,
            'columnsData'            => $columnsData,
            'allMarkets'             => $allMarkets,
            'allBroadcastGroupNames' => $allBroadcastGroupNames,
            'allMsoNames'            => $allMsoNames,
            'allNetworkNames'        => $allNetworkNames,
        ]);
    }

    public function edit(Request $request)
    {
        $request->validate([
            'zip_code' => 'nullable|string|max:20',
            'website'  => 'nullable|url',
        ]);

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
        $payload                 = $request->all();
        if (array_key_exists('zip_code', $payload)) {
            $data->zip_code = $payload['zip_code'];
        }
        if (array_key_exists('website', $payload)) {
            $data->website = $payload['website'];
        }
        $data->ownership_type    = $request->ownership_type;
        $data->ownership_name    = $request->ownership_name;
        $data->contact_name      = $request->contact_name;
        $data->contact_telephone = $request->contact_telephone;
        $result                  = $data->save();

        // Sync optional corporations multi-select from the new picker.
        $this->syncAffiliateCorporations($data, $request->input('corporations'));

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

    public function searchAffiliateZipCodes(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        if (strlen($search) > 15) {
            $search = substr($search, 0, 15);
        }

        $query = ZipcodeByTelevisionMarket::query()
            ->select('zip_code')
            ->whereNotNull('zip_code')
            ->where('zip_code', '!=', '');

        if ($search !== '') {
            $query->where('zip_code', 'like', $search . '%');
        }

        $codes = $query->distinct()
            ->orderBy('zip_code')
            ->limit(400)
            ->pluck('zip_code');

        return response()->json(['data' => $codes]);
    }
}
