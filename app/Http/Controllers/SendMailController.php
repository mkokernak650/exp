<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportExport;
use Illuminate\Support\Facades\Notification;
use App\Notifications\SendMail;

class SendMailController extends Controller
{
    public function sendMail($sheetData, $callSummary, $tagData, $fileName, $emails, $emailCriteria = null, $header)
    {
        $mergedEmails  = array_merge($emails, ['mkokernak@consumerexp.com', 'mkokernak@gmail.com', 'shoen@bitcode.pro']);
        $michaelEmails = array_unique($mergedEmails);
        // $michaelEmails = ['fahim@bitcode.pro'];
        if (app()->environment('local')) {
            // $michaelEmails = ['shosen@bitcode.pro'];
            $michaelEmails = ['fahimikbal97@gmail.com'];
        }

        Excel::download(new ReportExport($sheetData, $callSummary, $tagData, $header), $fileName . '.xlsx');
        if (count($michaelEmails)) {
            foreach ($michaelEmails as $email) {
                Notification::route('mail', $email)->notify(new SendMail($fileName, $emailCriteria));
            }
        }
    }
}
