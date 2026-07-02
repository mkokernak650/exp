<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=vice-width,nitial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Insertion Order - Document</title>
    <style>
        @page {
            margin: 0;
        }

        body {
            margin: 0.5cm 1.1cm 1cm 1cm;
            font-size: 14px;
            font-family: 'Helvetica';
        }

        * {
            box-sizing: border-box;
        }

        .w-100 {
            width: 100%;
        }

        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }

        .consumerexp-heading .consumerexp-info {
            font-size: 14px;
        }

        .consumerexp-heading .consumerexp-info a {
            color: blueviolet;
        }

        .consumerexp-heading img {
            margin-left: -15px;
        }

        .io-table {
            margin-top: 15px;
        }

        .io-table table {
            border-collapse: collapse;
            width: 100%;
            border: 2px solid black;
            border-bottom: none;
        }

        .io-table th,
        .io-table td {
            border: 1px solid black;
            border-bottom: none;
            padding: 5px;
            text-align: left;
        }

        .io-details-table table {
            border-bottom: 2px solid black;
        }

        .io-details-table table th {
            text-align: center;
        }

        .io-details-table table td {
            font-size: 14px;
            text-align: center;
        }

        .io-terms {
            font-size: 12px;
        }

        .io-terms p.notice {
            border: 1px solid #888;
            padding: 8px;
            margin-top: 12px;
            background: #fafafa;
        }

        .io-footer {
            background-color: #1aa8a2;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
        }

        .io-footer p {
            font-size: 12px;
            color: white;
            text-align: center;
        }

        .cashbuy-section {
            margin-top: 15px;
        }

        .cashbuy-section h3 {
            margin: 8px 0;
            font-size: 14px;
        }

        .cashbuy-section table {
            border-collapse: collapse;
            width: 100%;
            border: 2px solid black;
        }

        .cashbuy-section th,
        .cashbuy-section td {
            border: 1px solid black;
            padding: 4px 6px;
            font-size: 12px;
            text-align: center;
        }

        .corp-section {
            margin-top: 10px;
            font-size: 12px;
        }

        .corp-section h4 {
            margin: 6px 0;
        }

        .corp-section ul {
            list-style: disc;
            padding-left: 20px;
        }

        .cancelled-stamp {
            position: fixed;
            top: 35%;
            left: 15%;
            width: 70%;
            text-align: center;
            font-size: 110px;
            font-weight: bold;
            color: #ff0000;
            opacity: 0.18;
            transform: rotate(-25deg);
            z-index: 9999;
            letter-spacing: 8px;
            pointer-events: none;
        }
    </style>
</head>

<body>
    @php
        $isCanceled = ($billingDetails['status'] ?? '') === 'canceled'
            || !empty($billingDetails['cancellationRequestedAt']);
        $spots      = $cashBuySpots ?? [];
        $corpName   = $corpName     ?? null;
        $corpAffiliates = $corpAffiliates ?? [];
    @endphp

    @if ($isCanceled)
        <div class="cancelled-stamp">CANCELLED</div>
    @endif

    <main>
        <div class="consumerexp-heading">
            <img src="images/logo.png" alt="consumer-exp-logo">
            <ul class="consumerexp-info">
                <li>650 Huntington Avenue, Floor 22M</li>
                <li>Boston, MA 02115</li>
                <li>Tel/Text: 617-874-4247</li>
                <li>FEIN: 83-2614795</li>
                <li><a href="mailto:info@consumerexp.com">info@consumerexp.com</a></li>
                <li><a href="https://www.consumerexp.com/">www.consumerexp.com</a></li>
            </ul>
        </div>
        <div class="io-table">
            <table class="w-100">
                <tbody>
                    <tr>
                        <td style="width:60%">
                            <ul>
                                <li>{{ $billingDetails['name'] }}</li>
                                <li>{{ $billingDetails['contactName'] }}</li>
                                <li>{{ $billingDetails['contactPhone'] }}</li>
                                <li>{{ $billingDetails['email'] }}</li>
                                <li>{{ $billingDetails['address'] ?? '' }}</li>
                            </ul>
                        </td>
                        <td style="width:40%">
                            {{ $ioFor == 'customer' ? 'THIS IS NOT A BILL' : 'THIS IS NOT AN INVOICE' }} <br>
                            {{ $ioFor == 'customer' ? 'Dub Order or Notification' : 'Traffic Instructions' }} <br><br>
                            {{ $ioFor == 'customer' ? 'Customer ' : '' }}Insertion Order NO:
                            {{ $billingDetails['ioNo'] }}
                            @if ($isCanceled)
                                <strong style="color:#c00">(CANCELLED)</strong>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td><b>BILL TO:</b></td>
                        <td><b>DATE:</b> {{ $billingDetails['date'] }}</td>
                    </tr>
                    <tr>
                        <td>{{ $billingDetails['address'] ?? '' }}</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <div class="io-details-table">
                <table class="w-100">
                    <thead>
                        <tr>
                            <th style="width:15%">Title Name</th>
                            <th style="width:35%">Description</th>
                            <th style="width:10%">Terms</th>
                            <th style="width:15%">800#</th>
                            <th style="width:15%">Coupon Code</th>
                            <th style="width:10%">
                                @php
                                    $payoutLabel = 'Affiliate Fee';
                                    if ($ioFor === 'customer') {
                                        $firstFeeKey = $orderDetails[0]['feeModeKey'] ?? 'payout_per_order';
                                        $payoutLabel = match($firstFeeKey) {
                                            'fixed_pct', 'tiered' => '% Net Sales',
                                            'cash_buy' => 'Rate',
                                            default => 'Payout',
                                        };
                                    }
                                @endphp
                                {{ $payoutLabel }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($orderDetails as $item)
                        <tr>
                            <td>{{ $item['titleName'] }}</td>
                            <td style="font-size:12px">
                                {{ $item['description'] ?? '' }}
                                @if (!empty($item['videoUrl']) && $ioFor === 'affiliate')
                                <br>
                                <a href="{{ $item['videoUrl'] }}" target="_blank" style="font-weight: bold">Download TV
                                    Commercial</a>
                                @endif
                            </td>
                            <td>{{ $item['term'] ?? '' }}</td>
                            <td>{{ $item['dialed'] }}</td>
                            <td>{{ $item['couponCode'] }}</td>
                            <td>
                                @if ($ioFor === 'customer' && in_array($item['feeModeKey'] ?? 'payout_per_order', ['fixed_pct', 'tiered']))
                                    {{ number_format($item['netPrice'], 2) }}%
                                @elseif ($ioFor === 'customer')
                                    ${{ number_format($item['netPrice'], 2) }}
                                @else
                                    ${{ number_format($item['netPrice'], 2) }}
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        @if (!empty($spots))
            <div class="cashbuy-section">
                <h3>Cash Buy Schedule</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Zone</th>
                            <th>Affiliate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($spots as $spot)
                            <tr>
                                <td>{{ $spot['date'] }}</td>
                                <td>{{ $spot['day_of_week'] }}</td>
                                <td>{{ $spot['time'] }}</td>
                                <td>{{ $spot['time_zone'] }}</td>
                                <td>{{ $spot['affiliate'] }}</td>
                                <td>${{ number_format((float) $spot['amount'], 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        @if (!empty($corpAffiliates))
            <div class="corp-section">
                <h4>This IO covers every affiliate of {{ $corpName ?? 'the corporation' }}:</h4>
                <ul>
                    @foreach ($corpAffiliates as $aff)
                        <li>{{ $aff['affiliate_name'] }}{{ !empty($aff['market']) ? ' — ' . $aff['market'] : '' }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="io-terms">
            @if ($ioFor === 'customer')
                <p>Customer pays on a per order, percentage of net sales, or per call rate according to terms of this insertion order. Net Sales means gross sales actually collected from customers, less returns, refunds, chargebacks, taxes, shipping and handling charges, discounts, credits, and other customer allowances.</p>
                <p>Customer pays via ACH bank processing according to periodic invoices generated or advance payments.</p>
                <p>Customer may provide an advance payment or retainer agreement depending upon agreement.</p>
                <p>Customer may be charged for dubs, for an agreed upon rate, (if they cannot supply dubs to the affiliates). Dub rate will include traffic charges and may include assignment of product codes and/or telephone numbers.</p>
                <p>ConsumerEXP will provide Customer log-in access to its vendor banking portal to view and download detailed bills, call or order logs, and track payments. Also, the Customer portal will provide consolidated statements of accounts and contain uploaded transaction and sales documents.</p>
                <p>Customer states that it owns the TV commercial(s) and that it has licensed the images, spokespeople, and music for the TV commercial(s). Furthermore, Customer attests that the TV commercial(s) do not knowingly violate the rights of any individual, company, state laws, or federal laws.</p>
                <p class="notice"><b>30-Day Cancellation Notice:</b> Either party may cancel this insertion order with thirty (30) days written notice. Sales will continue to be tracked through the cancellation effective date.</p>
            @else
                <p>ConsumerEXP pays according to terms of this insertion order. The company can provide agency of record (AOR) proof upon request.</p>
                <p>ConsumerEXP may provide a URL link to the TV commercial in this insertion order or by separate email.</p>
                <p>ConsumerEXP pays via ACH bank processing according to periodic sales reports to media outlet.</p>
                <p>ConsumerEXP will provide media outlet log-in access to its vendor banking portal to view and download detailed bills, call or order logs, and track payments.</p>
                <p>ConsumerEXP represents that it has required the companies that own the TV commercial(s) that they have licensed the images, spokespeople, and music for the TV commercial(s). Furthermore, ConsumerEXP has required the companies that own the TV commercial(s) contained in this insertion order to attest in its agreement with ConsumerEXP that the TV commercial(s) do not knowingly violate the rights of any individual, company, state laws, or federal laws.</p>
                <p>ConsumerEXP agrees to indemnify and hold media outlet harmless from any claims for damages (including reasonable attorney fees) based upon a claim that a commercial run by ConsumerEXP violates applicable federal or state law.</p>
                <p class="notice"><b>30-Day Cancellation Notice:</b> Either party may cancel this insertion order with thirty (30) days written notice. Sales will continue to be tracked through the cancellation effective date.</p>
            @endif
        </div>
        <div class="io-footer">
            <p>650 Huntington Avenue, Floor 22M | Boston, MA 02115 | Phone/Text: 617-874-4247 | www.consumerexp.com</p>
        </div>
    </main>
</body>

</html>
