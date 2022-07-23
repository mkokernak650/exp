<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportExport;
use Illuminate\Support\Facades\Notification;
use App\Notifications\SendMail;

class SendMailController extends Controller
{
    public function sendMail($sheetData, $callSummary, $tagData, $columns, $fileName, $emails)
    {
        $michaelEmail = ['mkokernak@consumerexp.com', 'mkokernak@gmail.com', 'mdshakhawathosen122@gmail.com'];
        Excel::download(new ReportExport($sheetData, $callSummary, $tagData, $columns), $fileName . '.xlsx');
        if (count($michaelEmail)) {
            foreach ($michaelEmail as $email) {
                Notification::route('mail', $email)->notify(new SendMail($fileName));
            }
        }
    }
}
