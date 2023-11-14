<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IOLink extends Notification implements ShouldQueue
{
    use Queueable;

    protected $ioLink;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($ioLink, $ioType = null)
    {
        if ($ioType === 'ringba') {
            $this->ioLink = url('/') . '/insertion-order/ringba/public' . $ioLink;
        } else {
            $this->ioLink = url('/') . '/insertion-order/public' . $ioLink;
        }
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
            ->subject('ConsumerEXP Insertion Order')
            ->line('Please view the insertion order link')
            ->action('Insertion Order', $this->ioLink)
            ->line('Thank you.');
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
