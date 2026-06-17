<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Affiliate;
use App\Models\BroadcastGroupName;
use App\Models\MsoName;
use App\Models\NetworkName;
use App\Models\TableDetails;
use App\Services\CorporationService;
use Illuminate\Validation\Rule;

class CorporationController extends Controller
{
    protected CorporationService $corporationService;

    public function __construct(CorporationService $corporationService)
    {
        $this->middleware('auth');
        $this->corporationService = $corporationService;
    }

    /**
     * Union list of all corporations across the 3 tables.
     * Used by the picker dropdown on IO create + Home Shopping report.
     * GET /corporations/picker
     */
    public function pickerList(Request $request)
    {
        $activeOnly = $request->boolean('active_only', true);
        return response()->json([
            'data' => $this->corporationService->all($activeOnly),
        ]);
    }

    /**
     * List affiliates linked to a specific corporation.
     * GET /corporations/{type}/{id}/affiliates
     */
    public function corporationAffiliates(Request $request, string $type, int $id)
    {
        abort_unless(array_key_exists($type, CorporationService::TYPE_TO_MODEL), 404);

        $activeOnly = $request->boolean('active_only', true);
        $affiliates = $this->corporationService->affiliatesOf($type, $id, $activeOnly);

        return response()->json([
            'data' => $affiliates->map(fn(Affiliate $a) => [
                'id'             => $a->id,
                'affiliate_name' => $a->affiliate_name,
                'market'         => $a->market,
            ])->values(),
        ]);
    }

    /**
     * Attach an affiliate to a corporation. Idempotent.
     * POST /corporations/attach
     */
    public function attachAffiliate(Request $request)
    {
        $data = $request->validate([
            'affiliate_id'     => ['required', Rule::exists('affiliates', 'id')],
            'corporation_type' => ['required', Rule::in(array_keys(CorporationService::TYPE_TO_MODEL))],
            'corporation_id'   => ['required', 'integer'],
        ]);

        $affiliate = Affiliate::findOrFail($data['affiliate_id']);
        $this->corporationService->attach($affiliate, $data['corporation_type'], (int) $data['corporation_id']);

        return response()->json(['success' => true]);
    }

    /**
     * Detach an affiliate from a corporation.
     * POST /corporations/detach
     */
    public function detachAffiliate(Request $request)
    {
        $data = $request->validate([
            'affiliate_id'     => ['required', Rule::exists('affiliates', 'id')],
            'corporation_type' => ['required', Rule::in(array_keys(CorporationService::TYPE_TO_MODEL))],
            'corporation_id'   => ['required', 'integer'],
        ]);

        $affiliate = Affiliate::findOrFail($data['affiliate_id']);
        $this->corporationService->detach($affiliate, $data['corporation_type'], (int) $data['corporation_id']);

        return response()->json(['success' => true]);
    }

    /**
     * Preview an IO/report selection — given a corporation pick + "apply to all"
     * checkbox state + optional manual affiliate picks, return the final
     * affiliate id list the IO/report will scope to.
     * POST /corporations/resolve-selection
     */
    public function resolveSelection(Request $request)
    {
        $data = $request->validate([
            'corporation_type'        => ['nullable', Rule::in(array_keys(CorporationService::TYPE_TO_MODEL))],
            'corporation_id'          => ['nullable', 'integer'],
            'apply_to_all_affiliates' => ['nullable', 'boolean'],
            'affiliate_ids'           => ['nullable', 'array'],
            'affiliate_ids.*'         => ['integer'],
        ]);

        $ids = $this->corporationService->resolveSelection($data);

        return response()->json([
            'data' => [
                'affiliate_ids' => $ids->values()->all(),
                'count'         => $ids->count(),
            ],
        ]);
    }

    // Broadcast Group Names

    public function broadcastGroupNamesForm()
    {
        return Inertia::render('Settings/AddBroadcastGroupName');
    }

    public function storeBroadcastGroupName(Request $request)
    {
        $exists = BroadcastGroupName::where('broadcast_group_name', $request->broadcast_group_name)->count();
        if ($exists > 0) {
            return response()->json(['msg' => 'Broadcast Group Name already exists']);
        }

        $result = BroadcastGroupName::create($this->contactPayload($request, [
            'broadcast_group_name' => $request->broadcast_group_name,
        ]));

        if ($result) {
            return response()->json(['msg' => 'Successfully added']);
        } else {
            return response()->json(['msg' => 'An internal error occurred']);
        }
    }

    /**
     * Merge the four optional corporation-contact fields into the create/update payload so
     * the same shape is reused across BroadcastGroup / MSO / Network controllers.
     */
    protected function contactPayload(Request $request, array $base): array
    {
        return array_merge($base, [
            'contact_name'    => $request->input('contact_name'),
            'contact_title'   => $request->input('contact_title'),
            'contact_email'   => $request->input('contact_email'),
            'contact_address' => $request->input('contact_address'),
        ]);
    }

    public function broadcastGroupNamesReport()
    {
        $itemPerPage = request('itemPerPage', 10);
        $fieldMap = ['broadcast_group_name' => 'broadcast_group_name'];
        $allowed  = ['broadcast_group_name'];

        $query = BroadcastGroupName::query()
            ->with(['affiliates' => fn($q) => $q->select('affiliates.id', 'affiliates.affiliate_name', 'affiliates.market')])
            ->tap(function ($query) use ($fieldMap, $allowed) {
                $this->applyEloquentTableFilters($query, request('filteredValue'), $fieldMap, $allowed);
            });

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortableColumns = ['broadcast_group_name'];
            if (in_array($sortField, $sortableColumns)) {
                $query->orderBy($sortField, $sortOrder);
            }
        }

        $allBroadcastGroupNames = $query->paginate($itemPerPage);

        // Surface affiliates_count + a slimmed affiliates list on each row for the drill-down view.
        $allBroadcastGroupNames->getCollection()->transform(function ($row) {
            $row->affiliates_count = $row->affiliates->count();
            $row->affiliates_list  = $row->affiliates->map(fn($a) => [
                'id'             => $a->id,
                'affiliate_name' => $a->affiliate_name,
                'market'         => $a->market,
            ])->values();
            unset($row->affiliates);
            return $row;
        });

        if (request('page')) {
            return $allBroadcastGroupNames;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/BroadcastGroupNames', [
            'allBroadcastGroupNames' => $allBroadcastGroupNames,
            'columnsData'            => $columnsData,
        ]);
    }

    public function broadcastGroupNameEdit(Request $request)
    {
        $data = BroadcastGroupName::find($request->id);
        $data->broadcast_group_name = $request->broadcast_group_name;
        $data->contact_name         = $request->input('contact_name');
        $data->contact_title        = $request->input('contact_title');
        $data->contact_email        = $request->input('contact_email');
        $data->contact_address      = $request->input('contact_address');
        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Successfully Edited', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Editing Failed', 'status_code' => 500]);
        }
    }

    public function broadcastGroupNamesDelete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;
        $i            = 0;

        while ($i < $idsCount) {
            $result = $result && BroadcastGroupName::where('id', $ids[$i])->delete() > 0;
            $i++;
        }

        if ($result) {
            activity('Broadcast Group Names')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function broadcastGroupNameStatusUpdate(Request $request)
    {
        $data = BroadcastGroupName::find($request->rowId);
        if ($request->value == 1) {
            $data->status = 0;
        } else {
            $data->status = 1;
        }
        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Updated Successfully.'], 201);
        }
    }

    // MSO Names

    public function msoNamesForm()
    {
        return Inertia::render('Settings/AddMsoName');
    }

    public function storeMsoName(Request $request)
    {
        $exists = MsoName::where('mso_name', $request->mso_name)->count();
        if ($exists > 0) {
            return response()->json(['msg' => 'MSO Name already exists']);
        }

        $result = MsoName::create($this->contactPayload($request, [
            'mso_name' => $request->mso_name,
        ]));

        if ($result) {
            return response()->json(['msg' => 'Successfully added']);
        } else {
            return response()->json(['msg' => 'An internal error occurred']);
        }
    }

    public function msoNamesReport()
    {
        $itemPerPage = request('itemPerPage', 10);
        $fieldMap = ['mso_name' => 'mso_name'];
        $allowed  = ['mso_name'];

        $query = MsoName::query()
            ->with(['affiliates' => fn($q) => $q->select('affiliates.id', 'affiliates.affiliate_name', 'affiliates.market')])
            ->tap(function ($query) use ($fieldMap, $allowed) {
                $this->applyEloquentTableFilters($query, request('filteredValue'), $fieldMap, $allowed);
            });

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortableColumns = ['mso_name'];
            if (in_array($sortField, $sortableColumns)) {
                $query->orderBy($sortField, $sortOrder);
            }
        }

        $allMsoNames = $query->paginate($itemPerPage);

        $allMsoNames->getCollection()->transform(function ($row) {
            $row->affiliates_count = $row->affiliates->count();
            $row->affiliates_list  = $row->affiliates->map(fn($a) => [
                'id'             => $a->id,
                'affiliate_name' => $a->affiliate_name,
                'market'         => $a->market,
            ])->values();
            unset($row->affiliates);
            return $row;
        });

        if (request('page')) {
            return $allMsoNames;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/MsoNames', [
            'allMsoNames' => $allMsoNames,
            'columnsData' => $columnsData,
        ]);
    }

    public function msoNameEdit(Request $request)
    {
        $data = MsoName::find($request->id);
        $data->mso_name        = $request->mso_name;
        $data->contact_name    = $request->input('contact_name');
        $data->contact_title   = $request->input('contact_title');
        $data->contact_email   = $request->input('contact_email');
        $data->contact_address = $request->input('contact_address');
        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Successfully Edited', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Editing Failed', 'status_code' => 500]);
        }
    }

    public function msoNamesDelete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;
        $i            = 0;

        while ($i < $idsCount) {
            $result = $result && MsoName::where('id', $ids[$i])->delete() > 0;
            $i++;
        }

        if ($result) {
            activity('MSO Names')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function msoNameStatusUpdate(Request $request)
    {
        $data = MsoName::find($request->rowId);
        if ($request->value == 1) {
            $data->status = 0;
        } else {
            $data->status = 1;
        }
        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Updated Successfully.'], 201);
        }
    }

    // Network Names

    public function networkNamesForm()
    {
        return Inertia::render('Settings/AddNetworkName');
    }

    public function storeNetworkName(Request $request)
    {
        $exists = NetworkName::where('network_name', $request->network_name)->count();
        if ($exists > 0) {
            return response()->json(['msg' => 'Network Name already exists']);
        }

        $result = NetworkName::create($this->contactPayload($request, [
            'network_name' => $request->network_name,
        ]));

        if ($result) {
            return response()->json(['msg' => 'Successfully added']);
        } else {
            return response()->json(['msg' => 'An internal error occurred']);
        }
    }

    public function networkNamesReport()
    {
        $itemPerPage = request('itemPerPage', 10);
        $fieldMap = ['network_name' => 'network_name'];
        $allowed  = ['network_name'];

        $query = NetworkName::query()
            ->with(['affiliates' => fn($q) => $q->select('affiliates.id', 'affiliates.affiliate_name', 'affiliates.market')])
            ->tap(function ($query) use ($fieldMap, $allowed) {
                $this->applyEloquentTableFilters($query, request('filteredValue'), $fieldMap, $allowed);
            });

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortableColumns = ['network_name'];
            if (in_array($sortField, $sortableColumns)) {
                $query->orderBy($sortField, $sortOrder);
            }
        }

        $allNetworkNames = $query->paginate($itemPerPage);

        $allNetworkNames->getCollection()->transform(function ($row) {
            $row->affiliates_count = $row->affiliates->count();
            $row->affiliates_list  = $row->affiliates->map(fn($a) => [
                'id'             => $a->id,
                'affiliate_name' => $a->affiliate_name,
                'market'         => $a->market,
            ])->values();
            unset($row->affiliates);
            return $row;
        });

        if (request('page')) {
            return $allNetworkNames;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/NetworkNames', [
            'allNetworkNames' => $allNetworkNames,
            'columnsData'     => $columnsData,
        ]);
    }

    public function networkNameEdit(Request $request)
    {
        $data = NetworkName::find($request->id);
        $data->network_name    = $request->network_name;
        $data->contact_name    = $request->input('contact_name');
        $data->contact_title   = $request->input('contact_title');
        $data->contact_email   = $request->input('contact_email');
        $data->contact_address = $request->input('contact_address');
        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Successfully Edited', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Editing Failed', 'status_code' => 500]);
        }
    }

    public function networkNamesDelete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;
        $i            = 0;

        while ($i < $idsCount) {
            $result = $result && NetworkName::where('id', $ids[$i])->delete() > 0;
            $i++;
        }

        if ($result) {
            activity('Network Names')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function networkNameStatusUpdate(Request $request)
    {
        $data = NetworkName::find($request->rowId);
        if ($request->value == 1) {
            $data->status = 0;
        } else {
            $data->status = 1;
        }
        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Updated Successfully.'], 201);
        }
    }
}
