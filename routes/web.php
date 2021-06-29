<?php

use Illuminate\Support\Facades\Route;
use inertia\inertia;
use App\Http\Controllers\LogController;


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

Route::get('/', function () {
    return inertia::render('index');
})->name('home');

Route::post('login')->name('login')->uses('Auth\LoginController@login');
