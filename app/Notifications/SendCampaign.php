<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class SendCampaign extends Notification implements ShouldQueue
{
    use Queueable;

    protected $message;
    protected $topMessage;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($message, $topMessage)
    {
        $this->message    = $message;
        $this->topMessage = $topMessage;
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
        return (new MailMessage)
            ->subject('ConsumerEXP Campaigns')
            ->greeting(' ')
            ->line(new HtmlString('<img src="https://consumer-test.bitcode.pro/images/logo.png" alt="ConuserEXP Logo">'))
            ->lineIf(!empty($this->topMessage), new HtmlString($this->topMessage))
            ->line(new HtmlString($this->message));
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
