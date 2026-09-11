<?php

use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Ảnh tải lên. Chỉ chạy khi file không còn trên đĩa, xem UploadController.
Route::get('/storage/{path}', UploadController::class)
    ->where('path', '[A-Za-z0-9._/-]+')
    ->name('uploads.show');
