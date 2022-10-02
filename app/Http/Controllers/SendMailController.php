<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportExport;
use Illuminate\Support\Facades\Notification;
use App\Notifications\SendMail;

class SendMailController extends Controller
{
    public function sendMail($sheetData, $callSummary, $tagData, $fileName, $emails)
    {
        $mergedEmails = array_merge($emails, ['mkokernak@consumerexp.com', 'mkokernak@gmail.com', 'mdshakhawathosen122@gmail.com']);
        $michaelEmails = array_unique($mergedEmails);
        if (app()->environment('local')) {
            $michaelEmails = ['mdshakhawathosen122@gmail.com'];
        }

        Excel::download(new ReportExport($sheetData, $callSummary, $tagData), $fileName . '.xlsx');
        if (count($michaelEmails)) {
            foreach ($michaelEmails as $email) {
                Notification::route('mail', $email)->notify(new SendMail($fileName));
            }
        }
    }
}
