<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use Illuminate\Http\Request;

class RingCallLogController extends Controller
{

    public function RingbaAuth()
    {
        $ringba = new RingbaApiHelpers();
        dd( $ringba->getCampaings());
    }
}
