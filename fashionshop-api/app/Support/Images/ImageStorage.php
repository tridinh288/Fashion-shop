<?php

namespace App\Support\Images;

/**
 * Nơi cất file ảnh. Database chỉ giữ giá trị mà store() trả về, không bao giờ
 * giữ nội dung ảnh.
 */
interface ImageStorage
{
    /**
     * Cất ảnh và trả về giá trị để lưu vào database: đường dẫn tương đối
     * ("products/abc.png") với kho local, URL đầy đủ với kho ngoài.
     */
    public function store(string $bytes, string $mime, string $folder): string;

    /** Xoá ảnh mà chính kho này đã cất. Giá trị không thuộc kho thì bỏ qua. */
    public function delete(string $ref): void;
}
