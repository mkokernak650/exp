<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\File;
use Illuminate\Support\HtmlString;

class SendMail extends Notification implements ShouldQueue
{
    use Queueable;

    protected $fileName;
    protected $emailCriteria;
    protected $reportOn;
    protected $fileExt;
    protected $data;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($fileName, $emailCriteria, $reportOn, $data)
    {
        $this->fileName      = $fileName;
        $this->emailCriteria = $emailCriteria;
        $this->reportOn      = $reportOn;
        $this->fileExt       = $reportOn === 'exportCSV' ? '.csv' : '.xlsx';
        $this->data          = $data;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        if (file_exists(storage_path('framework') . DIRECTORY_SEPARATOR . 'laravel-excel')) {
            if ($this->data === 'csvEmptyTemplateAces') {
                $filePath = public_path('CSVFile\emptyCSVFile.csv');
            } else {
                $allFiles = File::allFiles(storage_path('framework') . DIRECTORY_SEPARATOR . 'laravel-excel');
                $latest_ctime = 0;
                $latest_filename = '';
                foreach ($allFiles as $file) {
                    if (is_file($file) && filectime($file) > $latest_ctime) {
                        $latest_ctime = filectime($file);
                        $latest_filename = $file;
                    }
                }
                $filePath = $latest_filename->getPathname();
            }

            return (new MailMessage)
                ->subject('ConsumerEXP Results Report')
                ->line(new HtmlString($this->emailCriteria != null ? "**Report on:**<br><br> {$this->emailCriteria}" : ''))
                ->line('Please find the attached results report for the campaign.')
                ->line('Thank you')->attach($filePath, [
                    'as' => $this->fileName . $this->fileExt,
                ]);
        }
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
