<?php

namespace App\Console\Commands;

use App\Http\Controllers\RingbaCallLogController;
use Illuminate\Console\Command;

class GetCallLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'getcalllog:daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get Call Logs Daily';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    public function scheduleTimezone()
    {
        return "Asia/Dhaka";
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ringba = new RingbaCallLogController();
        $ringba->getCallLogsScheduler();
    }
}
