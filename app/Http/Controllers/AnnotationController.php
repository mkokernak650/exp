<?php

namespace App\Http\Controllers;

use App\Models\Annotation;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnotationController extends Controller
{
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
        $allCampaigns = Campaign::all();
        return Inertia::render('Settings/Annotation/AnnotationCreate', compact('allCampaigns'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'annotation_name' => ['required', 'string'],
            'campaign_id' => ['required', 'string']
        ]);

        if (Annotation::where($validated)->first()) {
            return response()->json(['msg' => 'Annotation Already Exist in this Campaign.']);
        }
        Annotation::create($validated);

        return response()->json(['msg' => 'Annotation Added.']);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
