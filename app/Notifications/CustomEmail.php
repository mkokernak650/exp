<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class CustomEmail extends Notification implements ShouldQueue
{
    use Queueable;

    protected $subject;
    protected $message;
    protected $attachments;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($subject, $message, $attachments)
    {
        $this->subject     = $subject;
        $this->message     = $message;
        $this->attachments = $attachments;
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
        $mail = (new MailMessage)
            ->subject($this->subject)
            ->greeting(' ')
            ->line(new HtmlString(nl2br(e($this->message))));

        if (!empty($this->attachments)) {
            foreach ($this->attachments as $attachment) {
                $mail->attach($attachment['filePath'], ['as' => $attachment['fileName']]);
            }
        }

        return $mail;
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
