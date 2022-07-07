<?php

namespace App\Console\Commands;

use App\Http\Controllers\RingbaCallLogController;
use App\Http\Controllers\TargetController;
use Illuminate\Console\Command;

class GetRingbaDataDaily extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'getdata:daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get Ringba Data Daily';

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
        TargetController::getAllTarget();
        TargetController::getAllCustomers();
        $ringba = new RingbaCallLogController();
        $ringba->getRingbaDataByScheduler();
    }
}
