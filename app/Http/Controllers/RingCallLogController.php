<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use Illuminate\Http\Request;
use App\Models\RingbaData;
use App\Models\MarketExcptions;
use App\Models\Market;
use App\Models\Customer;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;


class RingCallLogController extends Controller
{
    private $_ringba;
    private $_ringbaData;
    public function __construct()
    {
        $this->_ringba = new RingbaApiHelpers();
    }

    public function RingbaAuth()
    {
        dd($this->_ringba->getRingbaData());
    }

    public function dateWiseData(Request $request)
    {
        $get_past_days_range = null;
        $get_days_range = null;

        $start_date = date_create($request->startDate);
        $end_date = date_create($request->endDate);
        $current_date = date_create(date('m/d/Y'));

        $start_current_diff = date_diff($start_date, $current_date);
        $start_current_diff_result = $start_current_diff->format("%a");

        $start_end_diff = date_diff($start_date, $end_date);
        $start_end_diff_result = $start_end_diff->format("%a");

        if ($start_current_diff_result > 0) {
            $get_past_days_range = $start_current_diff_result;
        } else {
            $get_past_days_range = 1;
        }

        if ($start_end_diff_result > 0) {
            $get_days_range = $start_end_diff_result + 1;
        } else {
            $get_days_range = 1;
        }

        $params = [
            'dateRange' => [
                'past' => $get_past_days_range,
                'days' =>  $get_days_range,
            ],
            'timeSeries' => [
                'timeGroup' => 'hour'
            ],
            'callLog' => [
                'page' => 0,
                'pageSize' => 10000,
                'sort' => 'dtStamp',
                'sortDirection' => 'desc'
            ],
            'timezoneId' => 'Eastern Standard Time'
        ];

        $results = json_decode($this->_ringba->postRequest('calllogs/date', $params));
        $ringbaData = new RingbaData();
        $ringbaData->truncate();
        $data = [];
        $this->_ringbaData = $results->result->callLog->data;
        foreach ($this->_ringbaData as $data) {
            $ringbaData = new RingbaData();
            $ringbaData->columns = json_encode($data->columns);
            $ringbaData->events = json_encode($data->events);
            $ringbaData->tags = json_encode($data->tags);
            $ringbaData->save();
        }
        return Inertia::render(
            'Ringba/TempRingbaData',
            [
                'ringbaData' => $results->result->callLog->data,
                'flash' => [
                    'message' => fn () => $request->session()->get('Data Fetched Successfully')
                ],
            ]
        );
    }

    public function tempRingbaData()
    {
        $ringbaData =  RingbaData::all();
        return Inertia::render('Ringba/TempRingbaData', [
            'ringbaData' =>  $ringbaData
        ]);
    }

    public function addMarketException(Request $request)
    {
        MarketExcptions::create([
            'customer_id' => $request->customer,
            'market_id' => $request->market,
            'start_date' => $request->start_date,
        ]);
        return redirect::back()->with("success", "Successfully Submitted");
    }

    public function marketExceptionForm()
    {
        $allMarkets = Market::all();
        $allCustomers = Customer::all();
        return Inertia::render('Settings/MarketExceptionForm', [
            'allCustomers' => $allCustomers,
            'allMarkets' => $allMarkets
        ]);
    }


    public function marketExceptionReport()
    {
        $marketExceptions = DB::table('market_excptions')
            ->select(['market_excptions.id', 'market_excptions.start_date as start_date', 'customers.customer_name as customer', 'markets.market_name as market',])
            ->join('customers', 'customers.customer_ID', '=', 'market_excptions.customer_id')->join('Markets', 'markets.id', '=', 'market_excptions.market_id')
            ->get();

        return Inertia::render('Settings/MarketExceptionReport', [
            'marketExceptions' => $marketExceptions,
        ]);
    }

    public function addMarket(Request $request)
    {
        Market::create([
            'market_name' => $request->market,
        ]);
        return redirect::back()->with("success", "Successfully Submitted");
    }

    public function marketReport()
    {
        $allMarkets = Market::all();
        return Inertia::render('Settings/MarketReport', [
            'allMarkets' => $allMarkets,
        ]);
    }

    public function customerReport()
    {
        $allCustomers = Customer::all();
        return Inertia::render('Settings/CustomerReport', [
            'allCustomers' => $allCustomers,
        ]);
    }
}
