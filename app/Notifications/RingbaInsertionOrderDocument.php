<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Barryvdh\DomPDF\Facade\Pdf;

class RingbaInsertionOrderDocument extends Notification implements ShouldQueue
{
    use Queueable;

    protected $billingDetails;
    protected $orderDetails;
    protected $ioFor;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($billingDetails, $orderDetails, $ioFor)
    {
        $this->billingDetails = $billingDetails;
        $this->orderDetails   = $orderDetails;
        $this->ioFor          = $ioFor;
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
        $ioNo = $this->billingDetails['ioNo'];
        $pdf  = Pdf::loadView(
            'insertion-order/ringba-insertion-order-document',
            ['billingDetails' => $this->billingDetails, 'orderDetails' => $this->orderDetails, 'ioFor' => $this->ioFor]
        );

        return (new MailMessage)
            ->subject('ConsumerEXP Insertion Order Document (Pay Per Call)')
            ->lineIf(
                $this->billingDetails['status'] == 'accepted',
                'ConsumerEXP insertion order (Pay Per Call) final document.'
            )
            ->lineIf(
                $this->billingDetails['status'] == 'canceled',
                'This IO has been cancelled by ConsumerEXP. 
                Please stop running the TV commercial as described in the attached PDF as soon as possible.  
                Please contact ConsumerEXP with any questions or comments.'
            )
            ->line(($this->ioFor == 'customer' ? 'Customer ' : '') . 'Insertion Order NO: ' . $ioNo . '.')
            ->line('Please find the attached file.')
            ->attachData($pdf->output(), 'Insertion Order ' . $ioNo . '.pdf', ['mime' => 'application/pdf',]);
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
