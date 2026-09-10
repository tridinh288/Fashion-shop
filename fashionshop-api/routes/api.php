<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\UserAddressController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\HomeCoverController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\ContactController as AdminContactController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AdminAuthController;

$products = '/products';
$productById = '/products/{id}';
$orders = '/orders';

// ==================== PUBLIC ROUTES ====================
Route::prefix('v1')->group(function () use ($products, $productById, $orders) {

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Products
    Route::get($products, [ProductController::class, 'index']);
    Route::get($productById, [ProductController::class, 'show']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);

    // Reviews (public - xem)
    Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);

    // Contact
    Route::post('/contacts', [ContactController::class, 'store']);

// ==================== USER ROUTES (cần login) ====================
    Route::middleware('auth:sanctum')->group(function () use ($orders) {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);

        // Profile
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::put('/profile/password', [ProfileController::class, 'changePassword']);

        // Addresses
        Route::get('/addresses', [UserAddressController::class, 'index']);
        Route::post('/addresses', [UserAddressController::class, 'store']);
        Route::delete('/addresses/{id}', [UserAddressController::class, 'destroy']);
        Route::patch('/addresses/{id}/default', [UserAddressController::class, 'setDefault']);

        // Cart
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::patch('/cart/{id}', [CartController::class, 'update']);
        Route::delete('/cart/{id}', [CartController::class, 'destroy']);

        // Orders
        Route::get($orders, [OrderController::class, 'index']);
        Route::post($orders, [OrderController::class, 'store']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::patch('/orders/{id}/cancel', [OrderController::class, 'cancel']);

        // Reviews (auth - viết)
        Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
    });

// ==================== ADMIN ROUTES ====================
    // Admin login (public)
    // Ảnh bìa bộ sưu tập ngoài trang chủ (công khai)
    Route::get('/home-covers', [HomeController::class, 'covers']);

    Route::post('/admin/login', [AdminAuthController::class, 'login']);

    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () use ($products, $productById, $orders) {

        // Admin logout
        Route::post('/logout', [AdminAuthController::class, 'logout']);

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Products
        Route::get($products, [AdminProductController::class, 'index']);
        Route::post($products, [AdminProductController::class, 'store']);
        Route::post($productById, [AdminProductController::class, 'update']);
        Route::delete($productById, [AdminProductController::class, 'destroy']);

        // Ảnh bìa trang chủ
        Route::get('/home-covers', [HomeCoverController::class, 'show']);
        Route::post('/home-covers', [HomeCoverController::class, 'update']);
        Route::delete('/home-covers/{slot}', [HomeCoverController::class, 'destroy']);

        // Orders
        Route::get($orders, [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        // Users
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);

        // Reviews
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::patch('/reviews/{id}/reply', [AdminReviewController::class, 'reply']);
        Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

        // Contacts
        Route::get('/contacts', [AdminContactController::class, 'index']);
        Route::patch('/contacts/{id}/status', [AdminContactController::class, 'updateStatus']);
    });
});