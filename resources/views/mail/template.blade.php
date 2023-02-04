<!DOCTYPE html>
<html>
<head>
    <style>
        p{
            box-sizing: border-box;
    font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';
    font-size: 16px;
    line-height: 1.5em;
    margin-top: 0;
    text-align: left;
    line-height: 15px;
    margin-bottom: 5px;
        }
   .credential-mail .action-btn a{
    border-radius: 4px;
    color: #fff;
    display: inline-block;
    overflow: hidden;
    text-decoration: none;
    background-color: #2d3748;
    border-bottom: 8px solid #2d3748;
    border-left: 18px solid #2d3748;
    border-right: 18px solid #2d3748;
    border-top: 8px solid #2d3748;

}
.info{
    margin-bottom: 15px;
}
.greeting, .user-access, .action-btn{
    margin-bottom: 20px;
}


.action-btn{
    display: flex;
    column-gap: 10px;
}

</style>
</head>
<body>
    <div class="credential-mail">
        <div class="greeting">
            <p>Hi {{ $userData['firstname'] }},</p>
        </div>

        <div class="info">
            <p>Here's the access credentials of ConsumerExp. You can log in to ConsumerExp by this credential.</p>
        </div>

       <div class="user-access">
           <p><b>Email</b> : {{$userData['email']}}</p>
           <p><b>Password</b> : {{$userData['password']}}</p>
       </div>

        <div class="action-btn">
            <a href="http://consumerexp-ringba.test/">Log In</a>
        </div>
        <p>Regards,</p>
        <p>ConsumerExp</p>
    </div>
</body>
</html>