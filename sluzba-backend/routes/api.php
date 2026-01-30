<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserAuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PredmetController;
use App\Http\Controllers\PrijavaIspitaController;
use App\Http\Controllers\PdfExportController;
use App\Http\Controllers\ProfesorController;

Route::post('/register', [UserAuthController::class, 'register']);
Route::post('/login', [UserAuthController::class, 'login']);


// Grupisana ruta za autentifikovane korisnike
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserAuthController::class, 'logout']);
    
    Route::get('/profesori', [ProfesorController::class, 'index']);

   //Student rute
    Route::prefix('student')->group(function () {
        Route::get('/predmeti/dostupni', [PredmetController::class, 'dostupniPredmeti']);
        Route::get('/predmeti/upisani', [PredmetController::class, 'upisaniPredmeti']);
        Route::get('/predmeti/upisani/{id}', [PredmetController::class, 'show']);
        Route::post('/prijave', [PrijavaIspitaController::class, 'store']);
        Route::put('/prijave/{id}', [PrijavaIspitaController::class, 'update']); 
        Route::delete('/prijave/{id}', [PrijavaIspitaController::class, 'destroy']); 
        Route::get('/prijave', [PrijavaIspitaController::class, 'mojePrijave']); 
        Route::get('/metrike', [PrijavaIspitaController::class, 'studentMetrike']);
        Route::get('/pdf', [PdfExportController::class, 'eksportuj']);
    });

    // Službeni radnik rute
    Route::prefix('sluzbenik')->group(function () {
        Route::get('/studenti', [UserController::class, 'index']);
        Route::resource('/predmeti', PredmetController::class)->only(['index', 'update']);
        Route::get('/prijave', [PrijavaIspitaController::class, 'index']);
        Route::patch('/prijave/{id}/ocena', [PrijavaIspitaController::class, 'updateOcena']);
    });

});
  

