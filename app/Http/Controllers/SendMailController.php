<?php

namespace App\Http\Controllers;

use Mail;

class SendMailController extends Controller
{
    public function SendMail()
    {
        $emails=["mdshakhawathosen122@gmail.com","hitmanagent800@gmail.com"];
        if (count($emails)) {
            foreach ($emails as $email) {
                $data["email"] = $email;
                $data["title"] = "Affiliate report";
                $data["body"] = "This is test mail with attachment";
 
                $files = [
            public_path('images/avatar_2.png'),
        ];
  
                Mail::send('mail.test', $data, function ($message) use ($data, $files) {
                    $message->to($data["email"])
                    ->subject($data["title"]);
 
                    foreach ($files as $file) {
                        $message->attach($file);
                    }
                });
                echo "Mail send successfully !!";
            }
        }
    }
}
