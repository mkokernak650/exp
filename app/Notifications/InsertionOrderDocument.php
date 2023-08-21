<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InsertionOrderDocument extends Notification implements ShouldQueue
{
    use Queueable;

    protected $billingDetails;
    protected $orderDetails;
    protected $subTotal;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($billingDetails, $orderDetails, $subTotal)
    {
        $this->billingDetails = $billingDetails;
        $this->orderDetails   = $orderDetails;
        $this->subTotal       = $subTotal;
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
        $pdf = app('dompdf.wrapper')
            ->loadView(
                'insertion-order/insertion-order-document',
                ['billingDetails' => $this->billingDetails, 'orderDetails' => $this->orderDetails, 'subTotal' => $this->subTotal]
            );

        return (new MailMessage)
            ->subject('ConsumerEXP Insertion Order Document')
            ->line('ConsumerEXP insertion order final document.')
            ->line('Please find the attached file.')
            ->attachData($pdf->output(), 'io-pdf.pdf', ['mime' => 'application/pdf',]);
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
