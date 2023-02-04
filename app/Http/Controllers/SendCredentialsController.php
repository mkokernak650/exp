<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\SendCredentialsToUser;

class SendCredentialsController extends Controller
{
    public function sendMail($credentials)
    {
        $userMail = $credentials['email'];
        if (app()->environment('local')) {
            $userMail = ['shosen@bitcode.pro'];
        }

        if ($userMail) {
            Notification::route('mail', $userMail)->notify(
                new SendCredentialsToUser($credentials)
            );
        }
    }
}
