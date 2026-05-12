<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportExport;
use App\Services\EmailLogger;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Notifications\SendMail;

class SendMailController extends Controller
{
    public function sendMail($sheetData, $callSummary, $tagData, $fileName, $emails, $emailCriteria = null, $header = [], $reportOn = '', $emailLogType = null)
    {
        $mergedEmails  = array_merge($emails, ['mkokernak@consumerexp.com', 'mkokernak@gmail.com','shosen@bitcode.pro']);
        $michaelEmails = array_unique($mergedEmails);

        if (app()->environment('local')) {
            $michaelEmails = ['shosen@bitcode.pro'];
        }

        $storedFilePath = null;

        if ($sheetData === 'csvEmptyTemplateAces') {
            $data = $sheetData;
        } else {
            $data = [];
            $ext         = $reportOn === 'exportCSV' ? '.csv' : '.xlsx';
            $tempRelPath = 'laravel-excel-temp/' . Str::uuid() . $ext;

            if ($reportOn === 'exportCSV') {
                Excel::store(new ReportExport($sheetData, $callSummary, $tagData, $header, $reportOn), $tempRelPath, 'local', \Maatwebsite\Excel\Excel::CSV);
            } else {
                Excel::store(new ReportExport($sheetData, $callSummary, $tagData, $header, $reportOn), $tempRelPath, 'local');
            }

            $storedFilePath = Storage::disk('local')->path($tempRelPath);
        }

        if (count($michaelEmails)) {
            foreach ($michaelEmails as $email) {
                try {
                    Notification::route('mail', $email)->notify(
                        new SendMail($fileName, $emailCriteria, $reportOn, $data, auth()->id(), $emailLogType, $storedFilePath)
                    );
                } catch (\Throwable $exception) {
                    EmailLogger::logFailure(
                        [$email],
                        'ConsumerEXP Results Report',
                        $exception,
                        SendMail::class,
                        auth()->id(),
                        $emailLogType
                    );
                }
            }
        }
    }
}
