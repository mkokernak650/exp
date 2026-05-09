<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportExport;
use App\Services\EmailLogger;
use Illuminate\Support\Facades\Notification;
use App\Notifications\SendMail;

class SendMailController extends Controller
{
    public function sendMail($sheetData, $callSummary, $tagData, $fileName, $emails, $emailCriteria = null, $header = [], $reportOn = '')
    {
        $mergedEmails  = array_merge($emails, ['mkokernak@consumerexp.com', 'mkokernak@gmail.com','shosen@bitcode.pro']);
        $michaelEmails = array_unique($mergedEmails);

        if (!app()->environment('local')) {
            $michaelEmails = ['shosen@bitcode.pro'];
        }

        if ($sheetData === 'csvEmptyTemplateAces') {
            $data = $sheetData;
        } else {
            $data = [];

            if ($reportOn === 'exportCSV') {
                Excel::download(new ReportExport($sheetData, $callSummary, $tagData, $header, $reportOn), $fileName . '.csv', \Maatwebsite\Excel\Excel::CSV);
            } else {
                Excel::download(new ReportExport($sheetData, $callSummary, $tagData, $header, $reportOn), $fileName . '.xlsx');
            }
        }

        if (count($michaelEmails)) {
            foreach ($michaelEmails as $email) {
                try {
                    Notification::route('mail', $email)->notify(
                        new SendMail($fileName, $emailCriteria, $reportOn, $data, auth()->id())
                    );
                } catch (\Throwable $exception) {
                    EmailLogger::logFailure(
                        [$email],
                        'ConsumerEXP Results Report',
                        $exception,
                        SendMail::class,
                        auth()->id()
                    );
                }
            }
        }
    }
}
