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
            activity('Campaign')->event('created')
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
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result = Annotation::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
