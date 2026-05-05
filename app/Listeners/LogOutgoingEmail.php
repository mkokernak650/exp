<?php

namespace App\Listeners;

use App\Services\EmailLogger;
use Illuminate\Mail\Events\MessageSent;

class LogOutgoingEmail
{
    public function handle(MessageSent $event): void
    {
        EmailLogger::logSent($event);
    }
}
