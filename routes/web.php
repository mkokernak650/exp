<?php

use App\Http\Controllers\ArchivedCallLogController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\BilledCallLogController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MarketController;
use App\Http\Controllers\MarketExceptionController;
use App\Http\Controllers\PendingBillCallLogController;
use Illuminate\Support\Facades\Route;
use inertia\inertia;
use App\Http\Controllers\RingbaCallLogController;
use App\Http\Controllers\ZipcodeByTelevisionMarketController;
use App\Http\Controllers\ZipcodeDataController;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\HeaderUtils;
use App\Http\Helpers\RingbaApiHelpers;
use Whoops\Run;

// TODO Login and Log out controller
Route::get('/', [LoginController::class, 'showLoginform'])->name('login')->middleware('guest');
Route::post('/login', [LoginController::class, 'login'])->name('login.attempt')->middleware('guest');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
// Route::post('login')->name('login')->uses('Auth\LoginController@login');
// Auth::routes();

// TODO Home Controller
Route::get('/home', [HomeController::class, 'index'])->name('home');


//TODO Ringba call log contoroller
Route::get('/token-ringba', [RingbaCallLogController::class, 'RingbaAuth'])->name('token-ringba')->middleware('guest');

Route::post('/temp-ringba-data', [RingbaCallLogController::class, 'dateWiseData'])
        ->name('temp-ringba-data');

Route::get('/temp-ringba-data', [RingbaCallLogController::class, 'tempRingbaData'])
        ->name('tempringbadata');

Route::get('/temp-ringba-call-log', [RingbaCallLogController::class, 'ringbaCallLogs'])
        ->name('ringbaCallLogs');

Route::get('/call-logs-report', [RingbaCallLogController::class, 'callLogsReport'])
        ->name('call-logs-report');

// Route::post('/get-ringba-data', function ($id) {
// });
// Route::post('login')->name('login.attempt')->uses('Auth\LoginController@login')->middleware('guest');

// Route::get('/', function () {
//     return inertia::render('index');
// })->name('home');


Route::get('/get-ringba-data', function () {
        return inertia::render('Ringba/GetRingbaData');
})->name('getringbadata');



// TODO market exception controllet
Route::post('/add-market-exception', [MarketExceptionController::class, 'addMarketException'])
        ->name('add-market-exception');

Route::get('/market-exception-form', [MarketExceptionController::class, 'marketExceptionForm'])
        ->name('market-exception-form');

Route::get('/market-exception-report', [MarketExceptionController::class, 'marketExceptionReport'])
        ->name('market-exception-report');

Route::get('/market-exception', function () {
        return inertia::render('Settings/MarketException');
})->name('market-exception');

Route::get('/market-exception-export/{type}', [MarketExceptionController::class, 'export'])
        ->name('market.exception.export');

Route::post('/market-exception-import', [MarketExceptionController::class, 'import'])
        ->name('market.exception.import');


//TODO Market Controllet
Route::post('/store-market', [MarketController::class, 'addMarket'])->name('store-market');

Route::get('/market-report', [MarketController::class, 'marketReport'])->name('market-report');

Route::get('/add-market', function () {
        return inertia::render('Settings/AddMarket');
})->name('add-market');

Route::get('market-export/{type}', [MarketController::class, 'export'])->name('market.export');

Route::post('market-import', [MarketController::class, 'import'])->name('market.import');

Route::get('/market-data', function() {
        return inertia::render('Settings/Market');
})->name('market.data');

// TODO Customet Controller
Route::get('/customer-report', [CustomerController::class, 'customerReport'])
        ->name('customer-report');
Route::get('customer-export/{type}', [CustomerController::class, 'export'])->name('customer.export');

// TODO Archived Call log Controller for store test
/**
 * This is Route created temporary
 */

Route::post('/archived', [ArchivedCallLogController::class, 'store'])->name('add.arichived.bill.call');

Route::get('/archived-call-log-report', [ArchivedCallLogController::class, 'index'])
    ->name('archived-call-log-report');
        
Route::get('/pending-call-log-report', [PendingBillCallLogController::class, 'index'])
        ->name('pending-call-log-report');

Route::get('/archived-call-log-report', [ArchivedCallLogController::class, 'index'])
     ->name('archived-call-log-report');

/*====== temp route for check get data ===== */
Route::post('/pending', [PendingBillCallLogController::class, 'store'])
    ->name('add.pending.bill.call');
Route::get('/billed-call-log', [BilledCallLogController::class, 'store']);


//TODO ZipcodebyTelevisionMarketController
Route::get('/zipcode-television-market', [ZipcodeByTelevisionMarketController::class, 'index'])
    ->name('zipcode.television.market');
        
Route::post('/zipcode-television-market-import', [ZipcodeByTelevisionMarketController::class, 'import'])
    ->name('zipcode.television.market.import');

Route::get('/zipcode-television-market/{type}', [ZipcodeByTelevisionMarketController::class, 'export'])
        ->name('zipcode.television.market.export');

// TODO Zipcodedata Controller
Route::get('/zipcode-data', [ZipcodeDataController::class, 'index'])
        ->name('zipcode.data');
Route::post('zipcode-data-import', [ZipcodeDataController::class, 'import'])
        ->name('zipcode.data.import');
Route::get('/zipcode-data-export/{type}', [ZipcodeDataController::class, 'export'])
        ->name('zipcode.data.export');




// test route
Route::get('/getupdate/{id}', function ($id) {
    $api = new RingbaApiHelpers();
    $results = $api->updatAnnotation($id);
    dd($results);
});

Route::get('/getbyid/{id}', [RingbaCallLogController::class, 'updateData']);