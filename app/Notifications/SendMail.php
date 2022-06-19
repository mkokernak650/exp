<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\File;

class SendMail extends Notification implements ShouldQueue
{
    use Queueable;
    protected $fileName;
    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($fileName)
    {
        $this->fileName = $fileName;
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
        if (file_exists(storage_path('framework'). DIRECTORY_SEPARATOR . "laravel-excel")) {
            $allFiles= File::allFiles(storage_path('framework'). DIRECTORY_SEPARATOR ."laravel-excel");
            $latest_ctime = 0;
            $latest_filename = '';
            foreach ($allFiles as $file) {
                if (is_file($file) && filectime($file) > $latest_ctime) {
                    $latest_ctime = filectime($file);
                    $latest_filename = $file;
                }
            }
            $filePath=$latest_filename->getPathname();
            return (new MailMessage)
                        ->subject('ConsumerEXP Results Report')
                        ->line('Please find the attached results report for the campaign.')
                        ->line('Thank you')->attach($filePath, [
                            'as' => $this->fileName.'.xlsx',
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
