<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DeleteCutomEmailFile extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedule:delete-custom-email-files';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete custom email files older than 7 days from the storage folder.';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $files = Storage::files('customEmailFile');

        foreach ($files as $file) {
            $modifiedAt   = Storage::lastModified($file);
            $modifiedDate = Carbon::createFromTimestamp($modifiedAt);
            $diffInDays   = Carbon::now()->diffInDays($modifiedDate);

            if ($diffInDays >= 7) {
                Storage::delete($file);
            }
        }
    }
}
