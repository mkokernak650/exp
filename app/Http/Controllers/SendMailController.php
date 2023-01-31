<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportExport;
use Illuminate\Support\Facades\Notification;
use App\Notifications\SendMail;

class SendMailController extends Controller
{
    public function sendMail($sheetData, $callSummary, $tagData, $fileName, $emails, $emailCriteria = null)
    {
        // $mergedEmails = array_merge($emails, ['mkokernak@consumerexp.com', 'mkokernak@gmail.com', 'shoen@bitcode.pro']);
        // $michaelEmails = array_unique($mergedEmails);
        $michaelEmails = ['shosen@bitcode.pro', 'fahim@bitcode.pro'];
        if (app()->environment('local')) {
            $michaelEmails = ['hitmanagent800@gmail.com'];
        }

        Excel::download(new ReportExport($sheetData, $callSummary, $tagData), $fileName . '.xlsx');
        if (count($michaelEmails)) {
            foreach ($michaelEmails as $email) {
                Notification::route('mail', $email)->notify(new SendMail($fileName, $emailCriteria));
            }
        }
    }
}
