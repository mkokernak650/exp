<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BroadcastGroupName;
use App\Models\MsoName;
use App\Models\NetworkName;
use App\Models\TableDetails;

class CorporationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
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

        $result = BroadcastGroupName::create([
            'broadcast_group_name' => $request->broadcast_group_name,
        ]);

        if ($result) {
            return response()->json(['msg' => 'Successfully added']);
        } else {
            return response()->json(['msg' => 'An internal error occurred']);
        }
    }

    public function broadcastGroupNamesReport()
    {
        $itemPerPage            = request('itemPerPage', 10);
        $allBroadcastGroupNames = BroadcastGroupName::paginate($itemPerPage);

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

        $result = MsoName::create([
            'mso_name' => $request->mso_name,
        ]);

        if ($result) {
            return response()->json(['msg' => 'Successfully added']);
        } else {
            return response()->json(['msg' => 'An internal error occurred']);
        }
    }

    public function msoNamesReport()
    {
        $itemPerPage = request('itemPerPage', 10);
        $allMsoNames = MsoName::paginate($itemPerPage);

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
        $data->mso_name = $request->mso_name;
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

        $result = NetworkName::create([
            'network_name' => $request->network_name,
        ]);

        if ($result) {
            return response()->json(['msg' => 'Successfully added']);
        } else {
            return response()->json(['msg' => 'An internal error occurred']);
        }
    }

    public function networkNamesReport()
    {
        $itemPerPage     = request('itemPerPage', 10);
        $allNetworkNames = NetworkName::paginate($itemPerPage);

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
        $data->network_name = $request->network_name;
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
