<?php

use App\Http\Controllers\ArchivedCallLogController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\HomeController;
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


//TODO Ringba call log contoroller
Route::get('/token-ringba', [RingbaCallLogController::class, 'RingbaAuth'])->name('token-ringba')->middleware('guest');

Route::post('/temp-ringba-data', [RingbaCallLogController::class, 'dateWiseData'])
        ->name('temp-ringba-data')
        ->middleware('auth');
// Route::post('/get-ringba-data', function ($id) {
// });
// Route::post('login')->name('login.attempt')->uses('Auth\LoginController@login')->middleware('guest');

// Route::get('/', function () {
//     return inertia::render('index');
// })->name('home');


Route::get('/get-ringba-data', function () {
    return inertia::render('Ringba/GetRingbaData');
})->name('getringbadata')->middleware('auth');

Route::get('/market-exception-report', [RingbaCallLogController::class, 'marketExceptionReport'])
        ->name('market-exception-report')
        ->middleware('auth');

Route::get('/market-exception-form', [RingbaCallLogController::class, 'marketExceptionForm'])
        ->name('market-exception-form')
        ->middleware('auth');

Route::post('/add-market-exception', [RingbaCallLogController::class, 'addMarketException'])
        ->name('add-market-exception')
        ->middleware('auth');

Route::get('/add-market', function () {
    return inertia::render('Settings/AddMarket');
})->name('add-market')->middleware('auth');

//TODO marker
Route::post('/store-market', [RingbaCallLogController::class, 'addMarket'])
        ->name('store-market')
        ->middleware('auth');

Route::get('/market-report', [RingbaCallLogController::class, 'marketReport'])
        ->name('market-report')
        ->middleware('auth');

Route::get('/customer-report', [RingbaCallLogController::class, 'customerReport'])
        ->name('customer-report')
        ->middleware('auth');

Route::get('/market-exception', function () {
    return inertia::render('Settings/MarketException');
})->name('market-exception');

Route::get('/temp-ringba-data', [RingbaCallLogController::class, 'tempRingbaData'])
        ->name('tempringbadata')
        ->middleware('auth');

Route::get('/temp-ringba-call-log', [RingbaCallLogController::class, 'ringbaCallLogs'])
        ->name('ringbaCallLogs')
        ->middleware('auth');

Route::get('/call-logs-report', [RingbaCallLogController::class, 'callLogsReport'])
        ->name('call-logs-report')
        ->middleware('auth');



Route::get('/home', [HomeController::class, 'index'])->name('home');

// TODO Archived Call log Controller for store test
/**
 * This is Route created temporary
 */
Route::get('/archived', [ArchivedCallLogController::class, 'store']);

Route::get('/archived-call-log-report', [ArchivedCallLogController::class, 'index'])
        ->name('archived-call-log-report')
        ->middleware('auth');
