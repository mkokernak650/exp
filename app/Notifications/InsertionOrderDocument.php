<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Barryvdh\DomPDF\Facade\Pdf;

class InsertionOrderDocument extends Notification implements ShouldQueue
{
    use Queueable;

    protected $billingDetails;
    protected $orderDetails;
    protected $subTotal;
    protected $ioFor;
    protected array $cashBuySpots;
    protected ?string $corpName;
    protected array $corpAffiliates;

    /**
     * @param  array  $billingDetails  base IO data (name, ioNo, status, etc.)
     * @param  array  $orderDetails    rows of the order details table
     * @param  float  $subTotal
     * @param  string $ioFor           'customer' or 'affiliate'
     * @param  array  $cashBuySpots    optional cash-buy schedule rows for the PDF
     * @param  string|null $corpName   corporation display name (corp IO only)
     * @param  array  $corpAffiliates  list of affiliates covered (corp IO only)
     */
    public function __construct(
        $billingDetails,
        $orderDetails,
        $subTotal,
        $ioFor,
        array $cashBuySpots = [],
        ?string $corpName = null,
        array $corpAffiliates = []
    ) {
        $this->billingDetails = $billingDetails;
        $this->orderDetails   = $orderDetails;
        $this->subTotal       = $subTotal;
        $this->ioFor          = $ioFor;
        $this->cashBuySpots   = $cashBuySpots;
        $this->corpName       = $corpName;
        $this->corpAffiliates = $corpAffiliates;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $ioNo = $this->billingDetails['ioNo'];
        $pdf  = Pdf::loadView(
            'insertion-order/insertion-order-document',
            [
                'billingDetails' => $this->billingDetails,
                'orderDetails'   => $this->orderDetails,
                'subTotal'       => $this->subTotal,
                'ioFor'          => $this->ioFor,
                'cashBuySpots'   => $this->cashBuySpots,
                'corpName'       => $this->corpName,
                'corpAffiliates' => $this->corpAffiliates,
            ]
        );

        return (new MailMessage)
            ->subject('ConsumerEXP Insertion Order Document')
            ->lineIf(
                ($this->billingDetails['status'] ?? '') === 'accepted',
                'ConsumerEXP insertion order final document.'
            )
            ->lineIf(
                ($this->billingDetails['status'] ?? '') === 'canceled',
                'This IO has been cancelled by ConsumerEXP.
                Please stop running the TV commercial as described in the attached PDF as soon as possible.
                Please contact ConsumerEXP with any questions or comments.'
            )
            ->line(($this->ioFor == 'customer' ? 'Customer ' : '') . 'Insertion Order NO: ' . $ioNo . '.')
            ->line('Please find the attached file.')
            ->attachData($pdf->output(), 'Insertion Order ' . $ioNo . '.pdf', ['mime' => 'application/pdf']);
    }

    public function toArray($notifiable)
    {
        return [];
    }
}
