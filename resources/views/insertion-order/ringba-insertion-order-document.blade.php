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
    </style>
</head>

<body>
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
                            {{ $ioFor == 'customer' ? 'THIS IS NOT A BILL' : 'THIS IS NOT AN INVOICE' }} <br><br>
                            {{ $ioFor == 'customer' ? 'Customer ' : '' }}Insertion Order NO:
                            {{ $billingDetails['ioNo'] }}
                            {{ $billingDetails['status'] == 'canceled' ? ' (Canceled)' : '' }}
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
                            <th style="width:20%">Title Name</th>
                            <th style="width:40%">Description</th>
                            <th style="width:10%">Terms</th>
                            <th style="width:20%">Phone</th>
                            <th style="width:10%">{{$ioFor === 'customer' ? 'Payout' : 'Affiliate Fee'}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ $orderDetails['titleName'] }}</td>
                            <td style="font-size:12px">
                                {{ $orderDetails['description'] ?? '' }}
                            </td>
                            <td>{{ $orderDetails['term'] ?? '' }}</td>
                            <td>{{ $orderDetails['phone'] }}</td>
                            <td>{{ number_format($orderDetails['netPrice'], 2) }}</td>
                        </tr>
                        {{-- <tr>
                            <td colspan="3" rowspan="3" style="textAlign:center">Thank You</td>
                            <th>Sub Total</th>
                            <td>${{ number_format($orderDetails['netPrice'], 2) }}</td>
                        </tr>
                        <tr>
                            <th>Discount</th>
                            <td>-</td>
                        </tr>
                        <tr>
                            <th>Grand Total</th>
                            <td>${{ number_format($orderDetails['netPrice'], 2) }}</td>
                        </tr> --}}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="io-terms">
            <p>{{ $ioFor === 'customer' ? 'Customer' : 'ConsumerEXP' }} pays according to terms of this insertion
                order.
            </p>
            {!! $ioFor === 'customer'
            ? '<p>Customer pays via ACH bank processing according to periodic sales reports to media outlet. Customer
                may provide an advance payment or retainer agreement.</p>'
            : '<p>A link to the dub will be contained within this insertion order or sent by separate email.</p>' .
            '<p>ConsumerEXP pays via ACH bank processing according to periodic sales reports to media outlet.</p>' !!}
            <p>
                ConsumerEXP will provide {{ $ioFor === 'customer' ? 'Customer' : 'media outlet' }} log-in access to its
                vendor banking portal to view and download detailed bills, call or order logs,
                and track payments. Also, the {{ $ioFor === 'customer' ? 'Customer' : 'vendor' }} portal will provide
                consolidated statements of accounts and contain uploaded transaction and sales documents.
            </p>
            {!! $ioFor === 'customer'
            ? '<p>The customer attests that it owns the TV commercial(s) and that they have licensed the images,
                spokespeople, and music for the TV commercial(s). Furthermore,
                the customer attests that the TV commercial(s) do not knowingly violate the rights of any individual,
                company, state laws, or federal laws.</p>'
            : '<p>ConsumerEXP agrees to indemnify and hold media outlet harmless from any claims for damages (including
                reasonable attorney fees)
                based upon a claim that a commercial run by ConsumerEXP violates applicable federal or state law.</p>'
            !!}
            {!! $ioFor === 'customer'
            ? '<p>ConsumerEXP and media outlet agree that insertion order, or titles in the insertion order, can be
                cancelled with as mentioned in this insertion order.</p>'
            : '<p>ConsumerEXP and media outlet agree that insertion order, or titles in the insertion order, can be
                cancelled with based upon the terms of this insertion order.</p>' !!}
            {!! $ioFor === 'customer'
            ? '<p>Customer may be charged for dubs, if they cannot supply dubs, as per agreement.</p>'
            : '' !!}
        </div>
        <div class="io-footer">
            <p>650 Huntington Avenue, Floor 22M | Boston, MA 02115 | Phone/Text: 617-874-4247 | www.consumerexp.com</p>
        </div>
    </main>
</body>

</html>