<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;
use Symfony\Component\Mime\Email;

class SendMail extends Notification implements ShouldQueue
{
    use Queueable;

    protected $fileName;
    protected $emailCriteria;
    protected $reportOn;
    protected $fileExt;
    protected $data;
    protected $userId;
    protected $emailLogType;
    protected $filePath;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($fileName, $emailCriteria, $reportOn, $data, $userId = null, $emailLogType = null, $filePath = null)
    {
        $this->fileName      = $fileName;
        $this->emailCriteria = $emailCriteria;
        $this->reportOn      = $reportOn;
        $this->fileExt       = $reportOn === 'exportCSV' ? '.csv' : '.xlsx';
        $this->data          = $data;
        $this->userId        = $userId;
        $this->emailLogType  = $emailLogType;
        $this->filePath      = $filePath;
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
        if ($this->data === 'csvEmptyTemplateAces') {
            $filePath = public_path('CSVFile/emptyCSVFile.csv');
        } elseif ($this->filePath && file_exists($this->filePath)) {
            $filePath = $this->filePath;
        } else {
            return;
        }

        return (new MailMessage)
            ->subject('ConsumerEXP Results Report')
            ->line(new HtmlString($this->emailCriteria != null ? "**Report on:**<br><br> {$this->emailCriteria}" : ''))
            ->line('Please find the attached results report for the campaign.')
            ->line('Thank you')->attach($filePath, [
                'as' => $this->fileName . $this->fileExt,
            ])
            ->withSymfonyMessage(function (Email $message) {
                if ($this->userId) {
                    $message->getHeaders()->addTextHeader('X-Consumerexp-User-Id', (string) $this->userId);
                }
                if ($this->emailLogType) {
                    $message->getHeaders()->addTextHeader('X-Consumerexp-Email-Log-Type', (string) $this->emailLogType);
                }
            });
    }

    public function failed(\Throwable $exception): void
    {
        if ($this->filePath && file_exists($this->filePath)) {
            @unlink($this->filePath);
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
