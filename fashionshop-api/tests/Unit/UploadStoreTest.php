<?php

namespace Tests\Unit;

use App\Support\Images\ImageStorage;
use App\Support\UploadStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Fakes\FakeImageStorage;
use Tests\TestCase;

class UploadStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_local_driver_writes_to_public_disk_and_returns_relative_path(): void
    {
        config(['services.images.driver' => 'local']);
        Storage::fake('public');

        $path = UploadStore::put(UploadedFile::fake()->image('ao.png', 40, 40), 'products');

        $this->assertMatchesRegularExpression('#^products/[A-Za-z0-9]{40}\.png$#', $path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_put_hands_bytes_to_bound_storage_and_returns_its_url(): void
    {
        Storage::fake('public');
        $kho = new FakeImageStorage();
        $this->app->instance(ImageStorage::class, $kho);

        $ref = UploadStore::put(UploadedFile::fake()->image('ao.png', 40, 40), 'covers');

        $this->assertSame('https://res.cloudinary.com/demo/image/upload/v1/test/covers/0.png', $ref);
        $this->assertCount(1, $kho->stored);
        $this->assertSame('image/png', $kho->stored[0]['mime']);
        $this->assertSame('covers', $kho->stored[0]['folder']);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_delete_sends_urls_to_storage_and_removes_relative_paths_from_disk(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('products/cu.png', 'x');
        $kho = new FakeImageStorage();
        $this->app->instance(ImageStorage::class, $kho);

        UploadStore::delete('https://res.cloudinary.com/demo/image/upload/v1/fs/products/abc.png');
        UploadStore::delete('products/cu.png');
        UploadStore::delete(null);

        $this->assertSame(['https://res.cloudinary.com/demo/image/upload/v1/fs/products/abc.png'], $kho->deleted);
        Storage::disk('public')->assertMissing('products/cu.png');
    }

    public function test_existing_keeps_urls_and_paths_still_on_disk(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('covers/con.png', 'x');

        $con_song = UploadStore::existing([
            'https://res.cloudinary.com/demo/image/upload/v1/fs/covers/a.png',
            'covers/con.png',
            'covers/mat.png',
            null,
        ]);

        $this->assertEqualsCanonicalizing(
            ['https://res.cloudinary.com/demo/image/upload/v1/fs/covers/a.png', 'covers/con.png'],
            $con_song
        );
    }

    public function test_uploads_table_is_gone(): void
    {
        $this->assertFalse(\Illuminate\Support\Facades\Schema::hasTable('uploads'));
    }

    public function test_storage_route_no_longer_serves_from_database(): void
    {
        // storage/{path} vẫn còn route storage.local có sẵn của Laravel (cần URL có chữ ký), nên kiểm theo tên
        $ten = collect(\Illuminate\Support\Facades\Route::getRoutes()->getRoutes())->map->getName();

        $this->assertNotContains('uploads.show', $ten);
    }

    public function test_unknown_driver_fails_loudly(): void
    {
        config(['services.images.driver' => 'cloudinray']);

        $this->expectException(\InvalidArgumentException::class);

        $this->app->make(ImageStorage::class);
    }
}
