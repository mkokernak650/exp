<?php

namespace App\Http\Controllers;

use App\Exports\CustomerExport;
use App\Imports\CustomerImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Customer;
use App\Models\EcommerceSale;
use App\Models\InsertionOrder;
use App\Models\TableDetails;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function addCustomerForm()
    {
        return Inertia::render('Settings/AddCustomer');
    }

    public function customerReport()
    {
        $itemPerPage = request('itemPerPage', 10);
        $fieldMap = [
            'customer'  => 'customer_name',
            'email'     => 'email',
            'telephone' => 'telephone',
        ];
        $allowed = array_values($fieldMap);

        $allCustomers = Customer::where('status', '=', '1')
            ->tap(function ($query) use ($fieldMap, $allowed) {
                $this->applyEloquentTableFilters($query, request('filteredValue'), $fieldMap, $allowed);
            })
            ->when(!empty(request('sortField')) && !empty(request('sortOrder')), function ($query) {
                $sortField = request('sortField');
                $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
                $sortFieldMap = [
                    'customer' => 'customer_name', 'email' => 'email', 'telephone' => 'telephone',
                    'address' => 'address', 'contact_name' => 'contact_name', 'contact_telephone' => 'contact_telephone',
                ];
                if (isset($sortFieldMap[$sortField])) {
                    $query->orderBy($sortFieldMap[$sortField], $sortOrder);
                }
            })
            // affiliate_count must match the AffiliateReport filter, which restricts to
            // active (status=1) affiliates only — so the displayed number equals the rows
            // shown after clicking the link.
            ->selectRaw('customers.*, (
                SELECT COUNT(DISTINCT ea.affiliate_id)
                FROM ecommerce_affiliates ea
                INNER JOIN affiliates a ON a.id = ea.affiliate_id
                WHERE ea.customer_id = customers.id
                  AND a.status = 1
            ) AS affiliate_count, (
                SELECT COUNT(DISTINCT cmp.id)
                FROM ecommerce_campaigns cmp
                WHERE cmp.customer_id = customers.id
                   OR cmp.id IN (
                       SELECT campaign_id
                       FROM ecommerce_affiliates
                       WHERE ecommerce_affiliates.customer_id = customers.id
                   )
            ) AS campaign_count')
            ->paginate($itemPerPage);

        if (request('page')) {
            return $allCustomers;
        }

        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render('Settings/CustomerReport', [
            'allCustomers' => $allCustomers,
            'columnsData'  => $columnsData
        ]);
    }

    public function archivedCustomers()
    {
        $itemPerPage = request('itemPerPage', 10);
        $fieldMap = [
            'customer'  => 'customer_name',
            'email'     => 'email',
            'telephone' => 'telephone',
        ];
        $allowed = array_values($fieldMap);

        $query = Customer::where('status', '=', '0')
            ->tap(function ($query) use ($fieldMap, $allowed) {
                $this->applyEloquentTableFilters($query, request('filteredValue'), $fieldMap, $allowed);
            });

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortableColumns = [
                'customer' => 'customer_name',
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

        $allCustomers = $query->paginate($itemPerPage);

        if (request('page')) {
            return $allCustomers;
        }

        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render('Settings/ArchivedCustomers', [
            'allCustomers' => $allCustomers,
            'columnsData'  => $columnsData
        ]);
    }



    public function storeCustomer(Request $request)
    {
        $nameExists = Customer::where('customer_name', $request->customer)->count();

        if ($nameExists > 0) {
            return response()->json(["msg" => "Cutomer name already exists"]);
        }

        $existData = Customer::where('customer_name', $request->customer)->where('email', $request->email)->where('telephone', $request->telephone)->where('address', $request->address)->count();

        if ($existData > 0) {
            return response()->json(["msg" => "Cutomer already exists"]);
        }

        Customer::create([
            'customer_name'     => $request->customer,
            'email'             => $request->email,
            'telephone'         => $request->telephone,
            'address'           => $request->address,
            'contact_name'      => $request->contact_name,
            'contact_telephone' => $request->contact_telephone,
        ]);

        return response()->json(["msg" => "Successfully Added"]);
    }

    public function import(Request $request)
    {
        Excel::import(new CustomerImport, $request->importfile);
        return back()->with('Successfully import!');
    }

    public function export($type)
    {
        // get request
        Excel::download(new CustomerExport,  'Customers.' . $type);
        return back()->with('Export successfully');
    }

    public function edit(Request $request)
    {
        $request->validate(['customer' => 'required']);

        $id                      = $request->id;
        $userFullName            = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail               = auth()->user()->email;
        $data                    = Customer::find($request->id);
        $data->customer_name     = $request->customer;
        $data->email             = $request->email;
        $data->telephone         = $request->telephone;
        $data->address           = $request->address;
        $data->contact_name      = $request->contact_name;
        $data->contact_telephone = $request->contact_telephone;
        $result                  = $data->save();

        if ($result) {
            activity('Customer')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
                ->log("An Item has been updated");
            return response()->json(["msg" => "Successfully Edited", "status_code" => 200,]);
        } else {
            return response()->json(["msg" => "Editing Failed", "status_code" => 500]);
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
                $dataById         = Customer::find($ids[$i]);
                $dataById->status = "0";
                $result           = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            activity('Customer')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been archived");
            return response()->json(["msg" => "Data moved to Archive successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "moving failed", "status_code" => 500]);
        }
    }
    public function activeCustomer(Request $request)
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
                $dataById         = Customer::find($ids[$i]);
                $dataById->status = "1";
                $result           = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            activity('Customer')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been activated");
            return response()->json(["msg" => "Customer active successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "active failed", "status_code" => 500]);
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
            $result =  Customer::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Customer')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }

    /**
     * Per-customer roster: every IO with status, attached affiliates, accepted/canceled dates,
     * and a sales rollup scoped to the IO window. Zero-sale rows are surfaced so technical
     * issues (e.g. station off-air) become visible.
     */
    public function roster(Customer $customer)
    {
        $ios = InsertionOrder::with(['attachedAffiliates:id,affiliate_name,market', 'affiliate:id,affiliate_name,market'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('created_at')
            ->get();

        $rows = [];
        foreach ($ios as $io) {
            $affiliateRows = $this->resolveAffiliatesForIO($io);
            if (empty($affiliateRows)) {
                $affiliateRows = [['id' => null, 'affiliate_name' => '(none)', 'market' => null]];
            }

            foreach ($affiliateRows as $aff) {
                $sales = $this->salesRollup($customer->id, $aff['id'], $io);

                $rows[] = [
                    'io_id'             => $io->id,
                    'io_no'             => 'IO-' . str_pad($io->id, 3, 0, STR_PAD_LEFT),
                    'status'            => $io->status,
                    'affiliate'         => $aff['affiliate_name'],
                    'market'            => $aff['market'],
                    'accepted_at'       => optional($io->accepted_at)->format('Y-m-d'),
                    'canceled_at'       => optional($io->canceled_at)->format('Y-m-d'),
                    'created_at'        => $io->created_at?->format('Y-m-d'),
                    'gross_sales'       => $sales['gross_sales'],
                    'returns_amount'    => $sales['returns_amount'],
                    'net_sales'         => $sales['net_sales'],
                    'sale_count'        => $sales['sale_count'],
                    'return_count'      => $sales['return_count'],
                    'has_activity'      => $sales['sale_count'] + $sales['return_count'] > 0,
                    'key'               => $io->id . '-' . ($aff['id'] ?? 'none'),
                ];
            }
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Customers/CustomerRoster', [
            'customer'    => $customer->only(['id', 'customer_name', 'email', 'telephone']),
            'rows'        => $rows,
            'columnsData' => $columnsData,
        ]);
    }

    /**
     * Expand the attached affiliates pivot, single-FK affiliate, and corporation affiliates
     * into a flat list. Skips duplicates.
     */
    protected function resolveAffiliatesForIO(InsertionOrder $io): array
    {
        $out = [];
        $seen = [];

        $push = function ($id, $name, $market) use (&$out, &$seen) {
            $key = (string) ($id ?? $name);
            if (isset($seen[$key])) return;
            $seen[$key] = true;
            $out[] = ['id' => $id, 'affiliate_name' => $name, 'market' => $market];
        };

        if ($io->affiliate) {
            $push($io->affiliate->id, $io->affiliate->affiliate_name, $io->affiliate->market);
        }
        foreach ($io->attachedAffiliates as $a) {
            $push($a->id, $a->affiliate_name, $a->market);
        }

        $corp = $io->corporation();
        if ($corp) {
            foreach ($corp->affiliates()->select('affiliates.id', 'affiliates.affiliate_name', 'affiliates.market')->get() as $a) {
                $push($a->id, $a->affiliate_name, $a->market);
            }
        }

        return $out;
    }

    /**
     * Aggregate sales for a (customer, affiliate) inside the IO's accepted_at..canceled_at window.
     * If accepted_at is null we use the IO creation date as the window start; if canceled_at is
     * null the window is open-ended.
     */
    protected function salesRollup(int $customerId, ?int $affiliateId, InsertionOrder $io): array
    {
        if (!$affiliateId) {
            return $this->emptyRollup();
        }

        $start = $io->accepted_at ?: $io->created_at;
        $end   = $io->canceled_at;

        $row = DB::table('ecommerce_sales')
            ->join('ecommerce_affiliates', function ($j) {
                $j->on('ecommerce_affiliates.dialed', '=', 'ecommerce_sales.dialed')
                  ->orOn('ecommerce_affiliates.coupon_code', '=', 'ecommerce_sales.coupon_code');
            })
            ->where('ecommerce_sales.customer_id', $customerId)
            ->where('ecommerce_affiliates.affiliate_id', $affiliateId)
            ->when($start, fn($q) => $q->where('ecommerce_sales.order_at', '>=', $start))
            ->when($end,   fn($q) => $q->where('ecommerce_sales.order_at', '<=', $end))
            ->selectRaw('
                COALESCE(SUM(CASE WHEN ecommerce_sales.record_kind = "SALE" THEN ecommerce_sales.total ELSE 0 END), 0) AS gross_sales,
                COALESCE(SUM(CASE WHEN ecommerce_sales.record_kind = "RETURN" THEN ecommerce_sales.total ELSE 0 END), 0) AS returns_amount,
                COALESCE(SUM(ecommerce_sales.total), 0) AS net_sales,
                COUNT(CASE WHEN ecommerce_sales.record_kind = "SALE" THEN 1 END) AS sale_count,
                COUNT(CASE WHEN ecommerce_sales.record_kind = "RETURN" THEN 1 END) AS return_count
            ')
            ->first();

        return [
            'gross_sales'    => (float) ($row->gross_sales ?? 0),
            'returns_amount' => (float) ($row->returns_amount ?? 0),
            'net_sales'      => (float) ($row->net_sales ?? 0),
            'sale_count'     => (int) ($row->sale_count ?? 0),
            'return_count'   => (int) ($row->return_count ?? 0),
        ];
    }

    protected function emptyRollup(): array
    {
        return ['gross_sales' => 0.0, 'returns_amount' => 0.0, 'net_sales' => 0.0, 'sale_count' => 0, 'return_count' => 0];
    }
}
