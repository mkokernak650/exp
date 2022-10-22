<?php

namespace App\Http\Controllers;

use App\Models\Annotation;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnotationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $allCampaigns = Campaign::active()->get();
        return Inertia::render('Settings/Annotation/AnnotationCreate', compact('allCampaigns'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'annotation_name' => ['required', 'string'],
            'campaign_id'     => ['required', 'string']
        ]);

        $msg = 'Annotation Added.';

        if (Annotation::where($validated)->first()) {
            $msg = 'Annotation Already Exist in this Campaign.';
            return response()->json(['msg' => $msg]);
        }

        $result = Annotation::create($validated);

        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $id           = $result->id;

        if ($result) {
            activity('Campaign annotations')->event('created')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
                ->log("annotation created");
        }

        return response()->json(['msg' => $msg]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function delete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;
        $i            = 0;

        while ($i < $idsCount) {
            $result = Annotation::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Campaign annotations')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
