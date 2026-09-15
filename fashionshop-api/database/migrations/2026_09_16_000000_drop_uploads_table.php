<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ảnh tải lên đã chuyển sang Cloudinary (lệnh uploads:to-cloudinary),
     * database chỉ còn giữ URL nên không cần bảng chứa nội dung ảnh nữa.
     */
    public function up(): void
    {
        Schema::dropIfExists('uploads');
    }

    public function down(): void
    {
        Schema::create('uploads', function (Blueprint $table) {
            $table->id();
            $table->string('path')->unique();
            $table->string('mime', 64);
            $table->unsignedInteger('size');
            $table->longText('data');
            $table->timestamps();
        });
    }
};
