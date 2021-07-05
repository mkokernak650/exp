<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use inertia\inertia;
use App\Http\Controllers\LogController;
use App\Http\Controllers\RingCallLogController;
use Illuminate\Support\Facades\Auth;
use Whoops\Run;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/token-ringba', [RingCallLogController::class, 'RingbaAuth'])->name('token-ringba')->middleware('guest');

Route::get('/', [LoginController::class, 'showLoginform'])->name('login')->middleware('guest');
Route::post('/login', [LoginController::class, 'login'])->name('login.attempt')->middleware('guest');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
// Route::post('login')->name('login.attempt')->uses('Auth\LoginController@login')->middleware('guest');

// Route::get('/', function () {
//     return inertia::render('index');
// })->name('home');



Route::get('/get-ringba-data', function () {
    return inertia::render('Ringba/GetRingbaData');
})->name('getringbadata');

Route::get('/call-logs-report', function () {
    return inertia::render('Ringba/CallLogsReport');
})->name('call-logs-report');

Route::get('/temp-ringba-data', function () {
    return inertia::render('Ringba/TempRingbaData');
})->name('tempringbadata');


// Route::post('login')->name('login')->uses('Auth\LoginController@login');

// Auth::routes();

Route::get('/home', [HomeController::class, 'index'])->name('home');
