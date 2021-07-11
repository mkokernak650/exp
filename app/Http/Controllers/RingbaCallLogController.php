<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\RingbaCallLog;
use Illuminate\Http\Request;
use App\Models\RingbaData;
use App\Models\Target;
use App\Models\MarketExcptions;
use App\Models\Market;
use App\Models\Customer;
use App\Models\ZipCodeData;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

class RingbaCallLogController extends Controller
{
    private $_ringba;
    private $_ringbaData;

    protected $get_dtStamp = null;
    protected $get_accountId = '';
    protected $get_campaignId = '';
    protected $get_campaignName = '';
    protected $get_affiliateId = '';
    protected $get_affiliateName = '';
    protected $get_number = '';
    protected $get_inboundCallId = '';
    protected $get_inboundPhoneNumber = '';
    protected $get_totalAmount = '';
    protected $get_targetName = '';
    protected $get_Target_Description = '';
    protected $get_targetId = '';
    protected $get_targetBuyerId = '';
    protected $get_targetBuyer = '';
    protected $get_timeToConnect = null;
    protected $get_callConnectionLength = null;
    protected $get_targetNumber = '';
    protected $get_recordingUrl = '';
    protected $get_conversionAmount = null;
    protected $get_callLengthInSeconds = null;
    protected $get_callCompletedDt = '';
    protected $get_payoutAmount = null;
    protected $get_profit = '';
    protected $get_duplicated_status = 'No';
    protected $get_source_hangup = '';
    protected $get_customer_name_id = null;
    protected $get_revenue = '';
    protected $get_annotations_tag = '';
    protected $has_annotations = 'NO';
    protected $get_call_log_status = 'Active';
    protected $get_call_qualification = 'Not Qualified';
    protected $get_city = "";
    protected $get_state = "";
    protected $get_zipcode = "";
    protected $get_market = "";
    protected $get_type = "";

    public function __construct()
    {
        $this->_ringba = new RingbaApiHelpers();
    }

    public function RingbaAuth()
    {
        dd($this->_ringba->getRingbaData());
    }

    public function ringbaCallLogs()
    {
        $ringbaMain = RingbaData::all();

        foreach ($ringbaMain as $row) {

            if ($row->columns) $this->columns($row->columns);
            if ($row->events) $this->events($row->events);
            if ($row->tags) $this->tags($row->tags);

            $ringbaCallLogs = new RingbaCallLog();
            $ringbaCallLogs->Call_Date_Time         = $this->get_dtStamp;
            $ringbaCallLogs->Call_Date              = date('d-M-Y', strtotime($this->get_dtStamp));
            $ringbaCallLogs->Campaign               = $this->get_campaignName;
            $ringbaCallLogs->Campaign_Id            = $this->get_campaignId;
            $ringbaCallLogs->Affiliate              = $this->get_affiliateName;
            $ringbaCallLogs->Affiliate_Id           = $this->get_affiliateId;
            $ringbaCallLogs->Inbound                = $this->get_inboundPhoneNumber;
            $ringbaCallLogs->Inbound_Id             = $this->get_inboundCallId;
            $ringbaCallLogs->Dialed                 = $this->get_number;
            $ringbaCallLogs->Time_To_Call           = $this->get_timeToConnect;
            $ringbaCallLogs->Account_Id             = $this->get_accountId;
            $ringbaCallLogs->Total_Cost             = $this->get_totalAmount;
            $ringbaCallLogs->payoutAmount           = $this->get_payoutAmount;
            $ringbaCallLogs->Conn_Duration          = $this->get_callConnectionLength;
            $ringbaCallLogs->call_Length_In_Seconds = $this->get_callLengthInSeconds;
            $ringbaCallLogs->Profit                 = $this->get_profit;
            $ringbaCallLogs->Target                 = $this->get_targetName;
            $ringbaCallLogs->Target_Description     = $this->get_Target_Description;
            $ringbaCallLogs->Revenue                = $this->get_revenue;
            $ringbaCallLogs->call_Logs_status       = $this->get_call_log_status;
            $ringbaCallLogs->Duplicate_Call         = $this->get_duplicated_status;
            $ringbaCallLogs->Source_Hangup          = $this->get_source_hangup;
            $ringbaCallLogs->City                   = $this->get_city;
            $ringbaCallLogs->State                  = $this->get_state;
            $ringbaCallLogs->Zipcode                = $this->get_zipcode;
            // $ringbaCallLogs->Market                 = $this->get_market;
            // $ringbaCallLogs->Type                   = $this->get_type;
            $ringbaCallLogs->Call_Qualification     = $this->get_call_qualification;
            $ringbaCallLogs->Recording_Url          = $this->get_recordingUrl;
            $ringbaCallLogs->Customer               = $this->get_customer_name_id;
            $ringbaCallLogs->Has_Annotation         = $this->has_annotations;
            $ringbaCallLogs->Annotation_Tag         = $this->get_annotations_tag;
            $ringbaCallLogs->save();
        }
    }

    private function columns($row)
    {
        $results = json_decode($row);
        foreach ($results as $item) {
            if ($item->name === 'dtStamp') {
                $this->get_dtStamp = $item->formattedValue;
            } else if ($item->name === 'accountId') {
                $this->get_accountId = $item->formattedValue;
            } else if ($item->name === 'campaignId') {
                $this->get_campaignId = $item->formattedValue;
            } else if ($item->name === 'campaignName') {
                $this->get_campaignName = $item->formattedValue;
            } else if ($item->name === 'affiliateId') {
                $this->get_affiliateId = $item->formattedValue;
            } else if ($item->name === 'affiliateName') {
                $this->get_affiliateName = $item->formattedValue;
            } else if ($item->name === 'number') {
                $this->get_number = $item->formattedValue;
            } else if ($item->name === 'inboundCallId') {
                $this->get_inboundCallId = $item->formattedValue;
            } else if ($item->name === 'inboundPhoneNumber') {
                $this->get_inboundPhoneNumber = $item->formattedValue;
                $this->zipCodeInfo($this->get_inboundPhoneNumber);
            } else if ($item->name === 'totalAmount') {
                $this->get_totalAmount = $item->formattedValue;
            } else if ($item->name === 'callCompletedDt') {
                $this->get_callCompletedDt = $item->formattedValue;
            } else if ($item->name === 'source') {
                $this->get_source_hangup = $item->formattedValue;
            } else if ($item->name === 'profit') {
                $this->get_profit = $item->formattedValue;
            } else if ($item->name === 'targetName') {
                $this->get_targetName = $item->formattedValue;
                // echo "uservdkljdofln = $this->get_targetName";
                if (!empty($this->get_targetName)) {
                    $targetsTable = new Target();
                    $result = $targetsTable->where('Ringba_Targets_Name', 'LIKE', "%{$item->formattedValue}%")->first();
                    if ($result) {
                        $this->get_Target_Description = $result->Description;
                        $this->get_customer_name_id = $result->Customer;
                    }
                }
            } else if ($item->name === 'targetId') {
                $this->get_targetId = $item->formattedValue;
            } else if ($item->name === 'targetBuyerId') {
                $this->get_targetBuyerId = $item->formattedValue;
            } else if ($item->name === 'targetBuyer') {
                $this->get_targetBuyer = $item->formattedValue;
            } else if ($item->name === 'timeToConnect') {
                $this->get_timeToConnect = $item->formattedValue;
            } else if ($item->name === 'callConnectionLength') {
                $this->get_callConnectionLength = $item->formattedValue;
            } else if ($item->name === 'targetNumber') {
                $this->get_targetNumber = $item->formattedValue;
            } else if ($item->name === 'recordingUrl') {
                $this->get_recordingUrl = '<a href="' . $item->formattedValue . '" target="_blank"> Recording URL</a>';
            } else if ($item->name === 'conversionAmount') {
                $this->get_conversionAmount = $item->formattedValue;
            } else if ($item->name === 'callLengthInSeconds') {
                $this->get_callLengthInSeconds = $item->formattedValue;
            } else if ($item->name === 'payoutAmount') {
                $this->get_payoutAmount = $item->formattedValue;
            } else if ($item->name === 'revenue') {
                $this->get_revenue = $item->formattedValue;
            }
        }
    }
    private function events($row)
    {
        $results = json_decode($row);
        foreach ($results as $item) {
            if ($item->name === 'DuplicateCall') {
                $this->get_duplicated_status = "Yes";
                return;
            }
        }
    }
    private function tags($row)
    {
        $results = json_decode($row);
        foreach ($results as $item) {
            if ($item->tagType === 'Annotations') {
                $this->has_annotations = 'Yes';
                $this->get_annotations_tag = $item->tagName;
                return;
            }
        }
    }

    // get Zip Code info via NPANXX number
    private function zipCodeInfo($inboundPhoneNumber)
    {
        $npanxx_number  = substr($inboundPhoneNumber, 1, 6);
        $zipCodeDb      = new ZipCodeData();
        $result         = $zipCodeDb->select(['ZipCode', 'State', 'City'])
                                    ->where('NPANXX', '=', $npanxx_number)
                                    ->first();
        if ($result) {
            $this->get_zipcode = $result->ZipCode;
            $this->get_state = $result->State;
            $this->get_city = $result->City;
        }
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

        $results = $this->_ringba->getDataDateWise($params);
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

        // for transfer all data in Ring call log report table;
        $this->ringbaCallLogs();

        // return Inertia::render(
        //     'Ringba/TempRingbaData',
        //     [
        //         'ringbaData' => $results->result->callLog->data,
        //         'flash' => [
        //             'message' => fn () => $request->session()->get('Data Fetched Successfully')
        //         ],
        //     ]
        // );
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
            ->join('customers', 'customers.customer_ID', '=', 'market_excptions.customer_id')->join('markets', 'markets.id', '=', 'market_excptions.market_id')
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


    public function callLogsReport()
    {
        $allCallLogs = RingbaCallLog::all();
        return Inertia::render('Ringba/callLogsReport', [
            'allCallLogs' => $allCallLogs,
        ]);
    }
}
