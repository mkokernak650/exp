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
use Illuminate\Support\Facades\Auth;
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


//TODO Market Controllet
Route::post('/store-market', [MarketController::class, 'addMarket'])
        ->name('store-market');

Route::get('/market-report', [MarketController::class, 'marketReport'])
        ->name('market-report');

Route::get('/add-market', function () {
        return inertia::render('Settings/AddMarket');
})->name('add-market');


// TODO Customet Controller
Route::get('/customer-report', [CustomerController::class, 'customerReport'])
        ->name('customer-report');

// TODO Archived Call log Controller for store test
/**
 * This is Route created temporary
 */
Route::get('/archived', [ArchivedCallLogController::class, 'store']);

Route::get('/archived-call-log-report', [ArchivedCallLogController::class, 'index'])
        ->name('archived-call-log-report');

/*====== temp route for check get data ===== */
Route::post('/getData', [PendingBillCallLogController::class, 'store'])
        ->name('add.pending.bill.call');
Route::get('/billed-call-log', [BilledCallLogController::class, 'store']);
