<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

    //  API Auth ===============
Route::middleware(['verify.api.token'])->group(function () {


    // Receipt
    Route::prefix("/receipt")->group(function(){
        Route::get('/list', [ReceiptController::class, 'index']);
        Route::post('/store', [ReceiptController::class, 'store']);
        Route::get('/show/{id}', [ReceiptController::class, 'show']);
        Route::post('/update', [ReceiptController::class, 'update']);
        Route::post('/delete', [ReceiptController::class, 'destroy']);
    });

    // Customer
    Route::prefix("/customer")->group(function(){
        Route::get('/list', [CustomerController::class, 'index']);
        Route::post('/store', [CustomerController::class, 'store']);
        Route::get('/show/{id}', [CustomerController::class, 'show']);
        Route::post('/update', [CustomerController::class, 'update']);
        Route::post('/delete', [CustomerController::class, 'destroy']);
    });


    // Invoices
    Route::prefix("/invoice")->group(function(){
        Route::get('/list', [InvoiceController::class, 'index']);
        Route::post('/store', [InvoiceController::class, 'store']);
        Route::get('/show/{id}', [InvoiceController::class, 'show']);
        Route::post('/update', [InvoiceController::class, 'update']);
        Route::post('/delete', [InvoiceController::class, 'destroy']);
    });


    // User
    Route::prefix("/user")->group(function(){
        Route::get('/list', [UserController::class, 'index']);
        Route::post('/store', [UserController::class, 'store']);
        Route::get('/show/{id}', [UserController::class, 'show']);
        Route::post('/login', [UserController::class, 'logIn']);
        Route::post('/update', [UserController::class, 'update']);
        Route::post('/delete', [UserController::class, 'destroy']);
        Route::post('/update-password', [UserController::class, 'updatePassword']);
    });

});
