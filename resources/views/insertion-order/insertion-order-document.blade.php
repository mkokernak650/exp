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
            margin: 0.5cm 1cm 1cm 1cm;
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
            height: 60px;
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
            <img src="{{ url('/images/logo.png') }}" alt="consumer-exp-logo"></img>
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
                                <li>{{ $billingDetails['contactName'] }}</li>
                                <li>{{ $billingDetails['contactPhone'] }}</li>
                                <li>{{ $billingDetails['email'] }}</li>
                                <li>{{ $billingDetails['address'] ?? '' }}</li>
                            </ul>
                        </td>
                        <td style="width:40%">
                            Insertion Order NO: {{ $billingDetails['ioNo'] }}
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
                            <th style="width:10%">Net Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($orderDetails as $item)
                            <tr>
                                <td>{{ $item['titleName'] }}</td>
                                <td style="font-size:12px">
                                    {{ $item['description'] ?? '' }} <a
                                        href="{{ $item['videoUrl'] ?? '' }}">{{ $item['videoUrl'] ?? '' }}</a>
                                </td>
                                <td>{{ $item['term'] ?? '' }}</td>
                                <td>{{ $item['dialed'] }}</td>
                                <td>{{ $item['couponCode'] }}</td>
                                <td>{{ number_format($item['netPrice'], 2) }}</td>
                            </tr>
                        @endforeach
                        <tr>
                            <td colspan="4" rowspan="3" style="textAlign:center">Thank You</td>
                            <th>Sub Total</th>
                            <td>${{ number_format($subTotal, 2) }}</td>
                        </tr>
                        <tr>
                            <th>Discount</th>
                            <td>-</td>
                        </tr>
                        <tr>
                            <th>Grand Total</th>
                            <td>${{ number_format($subTotal, 2) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="io-terms">
            <p>ConsumerEXP pays according to terms of this insertion order. The company can provide agency of record
                (AOR)
                proof upon request.</p>
            <p>ConsumerEXP pays via ACH bank processing according to periodic sales reports to media outlet.</p>
            <p>
                ConsumerEXP will provide media outlet log-in access to its vendor banking portal to view and download
                detailed bills, call or order logs,
                and track payments. Also, the vendor portal will provide consolidated statements of accounts and contain
                uploaded transaction and sales documents.
            </p>
            <p>
                ConsumerEXP represents that it has required the companies that own the TV commercial(s) that they have
                licensed the images, spokespeople, and
                music for the TV commercial(s).Furthermore, ConsumerEXP has required the companies that own the TV
                commercial(s) contained in this insertion
                order to attest in its agreement with ConsumerEXP that the TV commercial(s) do not knowingly violate the
                rights of any individual, company,
                state laws, or federal laws.
            </p>
            <p>
                ConsumerEXP agrees to indemnify and hold media outlet harmless from any claims for damages (including
                reasonable attorney fees) based upon a claim
                that a commercial run by ConsumerEXP violates applicable federal or state law.
            </p>
            <p>ConsumerEXP and media outlet agree that insertion order, or titles in the insertion order, can be
                cancelled
                with two weeks advance notice.</p>
        </div>
        <div class="io-footer">
            <p>650 Huntington Avenue, Floor 22M | Boston, MA 02115 | Phone/Text: 617-874-4247 | www.consumerexp.com</p>
        </div>
    </main>
</body>

</html>
