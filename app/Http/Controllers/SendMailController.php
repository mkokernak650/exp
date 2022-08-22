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
        $michaelEmail = array_merge($emails, ['mkokernak@consumerexp.com', 'mkokernak@gmail.com', 'shuvomohajan@gmail.com']);

        if (app()->environment('local')) {
            $michaelEmail = ['test@gmail.com'];
        }

        Excel::download(new ReportExport($sheetData, $callSummary, $tagData), $fileName . '.xlsx');
        if (count($michaelEmail)) {
            foreach ($michaelEmail as $email) {
                Notification::route('mail', $email)->notify(new SendMail($fileName));
            }
        }
    }
}
