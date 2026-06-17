<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IOLink extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $ioLink;

    /**
     * @param  string  $ioLink     Query-string portion of the IO public URL, including ?io=... &type=... &t=<token>
     * @param  string  $ioType     'ringba' for pay-per-call IO; default = home-shopping IO
     */
    public function __construct(string $ioLink, ?string $ioType = null)
    {
        $base = url('/') . ($ioType === 'ringba'
            ? '/insertion-order/ringba/public'
            : '/insertion-order/public');

        $this->ioLink = $base . $ioLink;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('ConsumerEXP Insertion Order')
            ->line('Please review and approve the attached insertion order.')
            ->action('Review and Approve', $this->ioLink)
            ->line('Either party may cancel this insertion order with thirty (30) days written notice. Sales will continue to be tracked through the cancellation effective date.')
            ->line('Thank you.');
    }

    public function toArray($notifiable): array
    {
        return [];
    }
}
