<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\DeleteCutomEmailFile::class,
        \App\Console\Commands\RunScheduledEcommerceReports::class,
        \App\Console\Commands\RunScheduledHomeShoppingReports::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {

        $timezone = 'America/New_York';

        $schedule->command('activitylog:clean')->timezone($timezone)->dailyAt('07:00');
        $schedule->command('getdata:daily')->timezone($timezone)->dailyAt('07:05');
        $schedule->command('schedule:delete-custom-email-files')->timezone($timezone)->weeklyOn(0, '07:10');
        $schedule->command('reports:run-scheduled-ecommerce')->timezone($timezone)->dailyAt('07:15');
        $schedule->command('reports:run-scheduled-home-shopping')->timezone($timezone)->dailyAt('07:20');
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
