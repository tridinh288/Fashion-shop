<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ảnh do quản trị viên tải lên, lưu thẳng trong database.
     *
     * Máy chủ triển khai (Render) dùng ổ đĩa tạm: mỗi lần container ngủ rồi
     * bật lại, mọi file ghi lúc chạy đều biến mất trong khi bản ghi trỏ tới
     * chúng vẫn còn. Giữ luôn nội dung file ở đây để ảnh sống cùng dữ liệu.
     *
     * Nội dung lưu dạng base64 trong cột text để chạy được trên cả MySQL,
     * TiDB lẫn SQLite mà không phải đụng tới kiểu blob riêng của từng hệ.
     */
    public function up(): void
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

    public function down(): void
    {
        Schema::dropIfExists('uploads');
    }
};
