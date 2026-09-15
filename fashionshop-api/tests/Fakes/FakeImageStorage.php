<?php

namespace Tests\Fakes;

use App\Support\Images\ImageStorage;

/** Kho ảnh giả: ghi nhớ những gì được cất / xoá, trả về URL kiểu Cloudinary */
class FakeImageStorage implements ImageStorage
{
    /** @var list<array{bytes: string, mime: string, folder: string, url: string}> */
    public array $stored = [];

    /** @var list<string> */
    public array $deleted = [];

    public function store(string $bytes, string $mime, string $folder): string
    {
        $url = 'https://res.cloudinary.com/demo/image/upload/v1/test/' . $folder . '/' . count($this->stored) . '.png';

        $this->stored[] = compact('bytes', 'mime', 'folder', 'url');

        return $url;
    }

    public function delete(string $ref): void
    {
        $this->deleted[] = $ref;
    }
}
