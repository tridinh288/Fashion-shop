# Chuyển ảnh tải lên sang Cloudinary — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ảnh do admin tải lên được cất trên Cloudinary; database (TiDB / MySQL local) chỉ giữ đường dẫn hoặc URL, không còn chứa nội dung ảnh.

**Architecture:** Tách phần "cất file" ra sau interface `ImageStorage` với hai bản cài đặt: `LocalImageStorage` (ổ đĩa `public`, dùng khi dev offline và khi chạy test/CI) và `CloudinaryImageStorage` (dùng trên Render, và ở local nếu muốn giống production). `UploadStore` giữ nguyên API tĩnh nên controller gần như không đổi. Cột `products.hinh_anh` và thiết lập `home_cover_*` chứa một trong hai dạng: đường dẫn tương đối cũ (`products/abc.png`, là ảnh mẫu nằm sẵn trong repo) hoặc URL Cloudinary đầy đủ. Frontend dùng một hàm `imageUrl()` để xử lý cả hai dạng. Ảnh cũ trong bảng `uploads` được một lệnh artisan đẩy lên Cloudinary; sau đó bảng `uploads` cùng mọi thứ phục vụ nó bị xoá.

**Tech Stack:** Laravel 11 (PHP 8.3), `cloudinary/cloudinary_php` ^3, PHPUnit 11, React 19 + Vite (web, admin), TiDB Serverless, Render.

**Spec:** Không có file spec riêng. Các quyết định đã chốt với người dùng trong hội thoại ngày 2026-09-15:
- Nguyên tắc: ảnh không nằm trong database. Bảng `uploads` (base64 trong `longText`) vi phạm và phải bỏ.
- Cloudinary chứa file ảnh; DB chỉ chứa đường dẫn / URL.
- Local có thể dùng Cloudinary (thư mục riêng) hoặc ổ đĩa; chọn bằng biến môi trường.
- Chuyển tiếp không làm vỡ ảnh cũ: giá trị bắt đầu bằng `http` dùng nguyên, còn lại ghép với `/storage/`.

## Global Constraints

- Mọi lệnh API chạy trong `C:\laragon\www\Fashion-Shop\fashionshop-api`. PHP của Laragon: `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe` (các bước dưới viết tắt là `php`).
- CI (`.github/workflows/ci.yml`) chạy test bằng `.env.example`, **không có** thông tin Cloudinary. Vì vậy mặc định `IMAGE_DRIVER=local`, và không test nào được gọi mạng.
- Không commit bí mật: `CLOUDINARY_URL` chỉ nằm trong `.env` (đã bị ignore) và trong Environment của Render.
- Comment trong code viết tiếng Việt, giọng văn giống code sẵn có (xem `app/Support/UploadStore.php`).
- Commit thẳng vào `main`, message tiếng Anh dạng câu như lịch sử repo (`Keep uploaded images after the server restarts`), kết thúc bằng dòng `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Ảnh mẫu trong `fashionshop-api/storage/app/public/products/*.png` (68 file, có trong git) **giữ nguyên**. Đó là asset tĩnh đóng gói trong Docker image, không nằm trong DB, nên không vi phạm nguyên tắc.
- Task 6 chỉ được làm **sau khi** Task 5 xác nhận bảng `uploads` trên TiDB đã rỗng.

## File Structure

| File | Trạng thái | Trách nhiệm |
|---|---|---|
| `fashionshop-api/app/Support/Images/ImageStorage.php` | Tạo | Interface: `store()` / `delete()` |
| `fashionshop-api/app/Support/Images/LocalImageStorage.php` | Tạo | Cất vào ổ đĩa `public`, trả đường dẫn tương đối |
| `fashionshop-api/app/Support/Images/CloudinaryImageStorage.php` | Tạo | Đẩy lên Cloudinary, trả `secure_url`; xoá theo public id |
| `fashionshop-api/app/Support/UploadStore.php` | Sửa | Thu nhỏ + kiểm dung lượng rồi giao cho `ImageStorage`; bỏ ghi bảng `uploads` |
| `fashionshop-api/app/Providers/AppServiceProvider.php` | Sửa | Chọn driver theo `config('services.images.driver')` |
| `fashionshop-api/config/services.php` | Sửa | Khối `images` và `cloudinary` |
| `fashionshop-api/.env.example` | Sửa | `IMAGE_DRIVER`, `CLOUDINARY_URL`, `CLOUDINARY_FOLDER` |
| `fashionshop-api/app/Console/Commands/MoveUploadsToCloudinary.php` | Tạo (Task 4), xoá (Task 6) | Chuyển ảnh trong bảng `uploads` sang kho ngoài |
| `fashionshop-api/tests/Fakes/FakeImageStorage.php` | Tạo | Kho giả cho test |
| `fashionshop-api/tests/Unit/UploadStoreTest.php` | Tạo | Test `UploadStore` |
| `fashionshop-api/tests/Unit/CloudinaryImageStorageTest.php` | Tạo | Test driver Cloudinary với API giả |
| `fashionshop-api/tests/Feature/MoveUploadsToCloudinaryTest.php` | Tạo (Task 4), xoá (Task 6) | Test lệnh chuyển |
| `fashionshop-web/src/utils/imageUrl.js` | Tạo | Đường dẫn/URL → `src` của ảnh |
| `fashionshop-admin/src/utils/imageUrl.js` | Tạo | Như trên cho admin |
| 7 file web + 4 file admin + `constants.js` | Sửa | Bỏ `IMG_BASE`, dùng `imageUrl()` |
| `fashionshop-api/database/migrations/2026_09_16_000000_drop_uploads_table.php` | Tạo (Task 6) | Xoá bảng `uploads` |
| `Upload.php`, `UploadController.php`, `RestoreUploads.php`, `routes/web.php`, `docker-entrypoint.sh`, `HomeCovers.php`, `Dockerfile`, `README.md`, `docs/architecture/*` | Sửa/xoá (Task 6) | Dọn phần phục vụ ảnh từ DB |

---

### Task 1: Tách kho ảnh ra sau interface, bỏ ghi base64 vào database

**Files:**
- Create: `fashionshop-api/app/Support/Images/ImageStorage.php`
- Create: `fashionshop-api/app/Support/Images/LocalImageStorage.php`
- Create: `fashionshop-api/tests/Fakes/FakeImageStorage.php`
- Create: `fashionshop-api/tests/Unit/UploadStoreTest.php`
- Modify: `fashionshop-api/app/Support/UploadStore.php` (phần đầu file tới hết `existing()`, dòng 1-112; `shrink()` và `encode()` giữ nguyên)
- Modify: `fashionshop-api/app/Providers/AppServiceProvider.php`
- Modify: `fashionshop-api/config/services.php`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `App\Support\Images\ImageStorage::store(string $bytes, string $mime, string $folder): string`, trả giá trị để lưu DB.
  - `App\Support\Images\ImageStorage::delete(string $ref): void`
  - `App\Support\UploadStore::isUrl(?string $ref): bool`
  - `App\Support\UploadStore::EXTENSIONS` (public const, mime → đuôi file)
  - `config('services.images.driver')`: `'local'` | `'cloudinary'`
  - `Tests\Fakes\FakeImageStorage` với các thuộc tính public `array $stored` (mỗi phần tử `['bytes','mime','folder','url']`) và `array $deleted`.

- [ ] **Step 1: Tạo kho giả cho test**

`fashionshop-api/tests/Fakes/FakeImageStorage.php`:

```php
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
```

- [ ] **Step 2: Viết test thất bại**

`fashionshop-api/tests/Unit/UploadStoreTest.php`:

```php
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

    public function test_unknown_driver_fails_loudly(): void
    {
        config(['services.images.driver' => 'cloudinray']);

        $this->expectException(\InvalidArgumentException::class);

        $this->app->make(ImageStorage::class);
    }
}
```

- [ ] **Step 3: Chạy test để thấy nó thất bại**

Run: `php artisan test --filter=UploadStoreTest`
Expected: FAIL. Lỗi dạng `Interface "App\Support\Images\ImageStorage" not found`.

- [ ] **Step 4: Tạo interface và driver local**

`fashionshop-api/app/Support/Images/ImageStorage.php`:

```php
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
```

`fashionshop-api/app/Support/Images/LocalImageStorage.php`:

```php
<?php

namespace App\Support\Images;

use App\Support\UploadStore;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Cất ảnh vào ổ đĩa public của máy đang chạy. Dùng khi dev không cần mạng và
 * khi chạy test. Không dùng trên Render vì ổ đĩa ở đó mất sau mỗi lần khởi động.
 */
class LocalImageStorage implements ImageStorage
{
    public function store(string $bytes, string $mime, string $folder): string
    {
        $path = $folder . '/' . Str::random(40) . '.' . (UploadStore::EXTENSIONS[$mime] ?? 'jpg');

        Storage::disk('public')->put($path, $bytes);

        return $path;
    }

    public function delete(string $ref): void
    {
        if (! UploadStore::isUrl($ref)) {
            Storage::disk('public')->delete($ref);
        }
    }
}
```

- [ ] **Step 5: Thêm cấu hình và binding**

`fashionshop-api/config/services.php`: thêm ngay trước `];` cuối file:

```php
    // Kho ảnh tải lên: "local" (ổ đĩa public) hoặc "cloudinary"
    'images' => [
        'driver' => env('IMAGE_DRIVER', 'local'),
    ],
```

`fashionshop-api/app/Providers/AppServiceProvider.php`: thay toàn bộ file:

```php
<?php

namespace App\Providers;

use App\Support\Images\ImageStorage;
use App\Support\Images\LocalImageStorage;
use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // bind thay vì singleton để test đổi driver bằng config() là có hiệu lực
        $this->app->bind(ImageStorage::class, function () {
            $driver = config('services.images.driver');

            return match ($driver) {
                'local' => new LocalImageStorage(),
                default => throw new InvalidArgumentException("IMAGE_DRIVER không hợp lệ: {$driver}"),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
```

- [ ] **Step 6: Sửa `UploadStore`**

Trong `fashionshop-api/app/Support/UploadStore.php`, thay đoạn từ dòng 1 tới hết hàm `existing()` (dòng 112) bằng đoạn dưới. `shrink()` và `encode()` phía sau giữ nguyên.

```php
<?php

namespace App\Support;

use App\Models\Upload;
use App\Support\Images\ImageStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/**
 * Nơi cất ảnh tải lên.
 *
 * Ảnh được thu nhỏ cho vừa trần dung lượng rồi giao cho kho ảnh đang cấu hình
 * (xem App\Support\Images). Database chỉ giữ giá trị kho trả về: đường dẫn
 * tương đối như "products/abc.png" hoặc URL đầy đủ của Cloudinary.
 *
 * Bảng uploads chỉ còn được đọc cho những ảnh cũ chưa chuyển đi, xem lệnh
 * uploads:to-cloudinary.
 */
class UploadStore
{
    /** Cạnh dài nhất giữ lại sau khi thu nhỏ */
    public const MAX_EDGE = 2000;

    /** Trần dung lượng một ảnh sau khi nén, giữ trang cửa hàng tải nhanh */
    public const MAX_BYTES = 3 * 1024 * 1024;

    /** Đuôi file theo kiểu ảnh, dùng cho tên file sinh ra */
    public const EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    /**
     * Cất một ảnh vừa tải lên và trả về giá trị để lưu vào database.
     *
     * @param  string  $field  Tên trường, chỉ dùng để báo lỗi cho đúng chỗ
     */
    public static function put(UploadedFile $file, string $folder, string $field = 'file'): string
    {
        $mime  = $file->getMimeType() ?: 'image/jpeg';
        $bytes = self::shrink(file_get_contents($file->getRealPath()), $mime);

        if (strlen($bytes) > self::MAX_BYTES) {
            throw ValidationException::withMessages([
                $field => 'Ảnh quá nặng, hãy dùng ảnh nhẹ hơn hoặc kích thước nhỏ hơn',
            ]);
        }

        return app(ImageStorage::class)->store($bytes, $mime, $folder);
    }

    /** Giá trị là URL đầy đủ (ảnh trên kho ngoài) chứ không phải đường dẫn trên đĩa */
    public static function isUrl(?string $ref): bool
    {
        return $ref !== null && preg_match('#^https?://#i', $ref) === 1;
    }

    /**
     * Xoá một ảnh. Dọn ảnh chỉ là việc phụ nên kho ngoài lỗi thì ghi log chứ
     * không làm hỏng thao tác của quản trị viên.
     */
    public static function delete(?string $ref): void
    {
        if (! $ref) {
            return;
        }

        if (self::isUrl($ref)) {
            rescue(fn () => app(ImageStorage::class)->delete($ref));
            return;
        }

        Upload::where('path', $ref)->delete();
        Storage::disk('public')->delete($ref);
    }

    /** Ảnh còn xem được không */
    public static function exists(?string $ref): bool
    {
        return self::existing([$ref]) !== [];
    }

    /**
     * Lọc ra những ảnh còn xem được. URL của kho ngoài được coi là còn; đường
     * dẫn thì phải còn trên đĩa hoặc còn trong bảng uploads cũ.
     *
     * @param  list<string|null>  $refs
     * @return list<string>
     */
    public static function existing(array $refs): array
    {
        $refs = array_values(array_unique(array_filter($refs)));

        $found = array_values(array_filter($refs, [self::class, 'isUrl']));
        $paths = array_values(array_diff($refs, $found));

        if (! $paths) {
            return $found;
        }

        $trong_db = Upload::whereIn('path', $paths)->pluck('path')->all();

        foreach ($paths as $path) {
            if (in_array($path, $trong_db, true) || Storage::disk('public')->exists($path)) {
                $found[] = $path;
            }
        }

        return $found;
    }
```

Xác nhận không còn `use Illuminate\Support\Str;` thừa: `Str` giờ chỉ dùng trong `LocalImageStorage`.

- [ ] **Step 7: Chạy test mới**

Run: `php artisan test --filter=UploadStoreTest`
Expected: PASS (5 tests).

- [ ] **Step 8: Chạy toàn bộ test**

Run: `php artisan test`
Expected: tất cả PASS, kể cả `WhiteBoxQuanLySanPhamTest::test_wb10_store_with_image` và `test_wb11_update_with_image` (dùng `Storage::fake('public')` với driver mặc định `local`).

- [ ] **Step 9: Commit**

```bash
git add fashionshop-api/app/Support/Images fashionshop-api/app/Support/UploadStore.php fashionshop-api/app/Providers/AppServiceProvider.php fashionshop-api/config/services.php fashionshop-api/tests/Fakes fashionshop-api/tests/Unit/UploadStoreTest.php
git commit -m "Stop copying uploaded images into the database"
```

---

### Task 2: Driver Cloudinary

**Files:**
- Modify: `fashionshop-api/composer.json`, `fashionshop-api/composer.lock` (qua `composer require`)
- Create: `fashionshop-api/app/Support/Images/CloudinaryImageStorage.php`
- Create: `fashionshop-api/tests/Unit/CloudinaryImageStorageTest.php`
- Modify: `fashionshop-api/app/Providers/AppServiceProvider.php`
- Modify: `fashionshop-api/config/services.php`
- Modify: `fashionshop-api/.env.example`

**Interfaces:**
- Consumes: `ImageStorage`, `config('services.images.driver')` từ Task 1.
- Produces:
  - `App\Support\Images\CloudinaryImageStorage::__construct(\Cloudinary\Api\Upload\UploadApi $api, string $rootFolder)`
  - `CloudinaryImageStorage::publicId(string $url): ?string` (static)
  - `config('services.cloudinary.url')`, `config('services.cloudinary.folder')`
  - Biến môi trường: `IMAGE_DRIVER`, `CLOUDINARY_URL`, `CLOUDINARY_FOLDER`

- [ ] **Step 1: Cài SDK**

Run: `composer require cloudinary/cloudinary_php:^3`
Expected: cài thành công, `composer.json` có `"cloudinary/cloudinary_php": "^3.x"`.

Mở `vendor/cloudinary/cloudinary_php/src/Api/ApiResponse.php` và kiểm tra chữ ký constructor. Test ở Step 2 dùng `new ApiResponse($body, $headers)`. Nếu chữ ký khác, sửa lời gọi trong test cho khớp. Mở thêm `src/Api/Upload/UploadApi.php` (và trait `UploadTrait`/`DeleteTrait` nếu `upload`/`destroy` nằm ở đó) để chắc chắn class không `final`, vì Mockery cần mock được nó.

- [ ] **Step 2: Viết test thất bại**

`fashionshop-api/tests/Unit/CloudinaryImageStorageTest.php`:

```php
<?php

namespace Tests\Unit;

use App\Support\Images\CloudinaryImageStorage;
use App\Support\Images\ImageStorage;
use Cloudinary\Api\ApiResponse;
use Cloudinary\Api\Upload\UploadApi;
use Mockery;
use Tests\TestCase;

class CloudinaryImageStorageTest extends TestCase
{
    public function test_store_uploads_data_uri_into_root_folder_and_returns_secure_url(): void
    {
        $api = Mockery::mock(UploadApi::class);
        $api->shouldReceive('upload')
            ->once()
            ->with(
                'data:image/png;base64,' . base64_encode('PNGDATA'),
                Mockery::on(fn (array $o) => $o['folder'] === 'fashionshop-dev/products' && $o['resource_type'] === 'image')
            )
            ->andReturn(new ApiResponse(['secure_url' => 'https://res.cloudinary.com/demo/image/upload/v17/fashionshop-dev/products/x1.png'], []));

        $url = (new CloudinaryImageStorage($api, 'fashionshop-dev'))->store('PNGDATA', 'image/png', 'products');

        $this->assertSame('https://res.cloudinary.com/demo/image/upload/v17/fashionshop-dev/products/x1.png', $url);
    }

    public function test_delete_destroys_by_public_id(): void
    {
        $api = Mockery::mock(UploadApi::class);
        $api->shouldReceive('destroy')->once()->with('fashionshop-dev/products/x1', Mockery::type('array'));

        (new CloudinaryImageStorage($api, 'fashionshop-dev'))
            ->delete('https://res.cloudinary.com/demo/image/upload/v17/fashionshop-dev/products/x1.png');
    }

    public function test_delete_ignores_values_that_are_not_cloudinary_urls(): void
    {
        $api = Mockery::mock(UploadApi::class);
        $api->shouldNotReceive('destroy');

        $kho = new CloudinaryImageStorage($api, 'fashionshop-dev');
        $kho->delete('products/abc.png');
        $kho->delete('https://example.com/a.png');
    }

    public function test_public_id_parsing(): void
    {
        $this->assertSame('a/b/c', CloudinaryImageStorage::publicId('https://res.cloudinary.com/demo/image/upload/v1/a/b/c.webp'));
        $this->assertSame('c', CloudinaryImageStorage::publicId('https://res.cloudinary.com/demo/image/upload/c.jpg'));
        $this->assertNull(CloudinaryImageStorage::publicId('products/c.jpg'));
    }

    public function test_cloudinary_driver_requires_url(): void
    {
        config(['services.images.driver' => 'cloudinary', 'services.cloudinary.url' => null]);

        $this->expectException(\InvalidArgumentException::class);

        $this->app->make(ImageStorage::class);
    }

    public function test_cloudinary_driver_is_bound_when_configured(): void
    {
        config([
            'services.images.driver'    => 'cloudinary',
            'services.cloudinary.url'   => 'cloudinary://123:secret@demo',
            'services.cloudinary.folder' => 'fashionshop-dev',
        ]);

        $this->assertInstanceOf(CloudinaryImageStorage::class, $this->app->make(ImageStorage::class));
    }
}
```

- [ ] **Step 3: Chạy test để thấy nó thất bại**

Run: `php artisan test --filter=CloudinaryImageStorageTest`
Expected: FAIL. Lỗi `Class "App\Support\Images\CloudinaryImageStorage" not found`.

- [ ] **Step 4: Viết driver**

`fashionshop-api/app/Support/Images/CloudinaryImageStorage.php`:

```php
<?php

namespace App\Support\Images;

use Cloudinary\Api\Upload\UploadApi;

/**
 * Cất ảnh trên Cloudinary. Database chỉ giữ secure_url; ảnh sống độc lập với
 * ổ đĩa tạm của Render và được phát qua CDN của Cloudinary.
 */
class CloudinaryImageStorage implements ImageStorage
{
    /**
     * @param  string  $rootFolder  Thư mục gốc tách môi trường, ví dụ "fashionshop-dev" / "fashionshop-prod"
     */
    public function __construct(
        private UploadApi $api,
        private string $rootFolder,
    ) {
    }

    public function store(string $bytes, string $mime, string $folder): string
    {
        $ket_qua = $this->api->upload('data:' . $mime . ';base64,' . base64_encode($bytes), [
            'folder'          => trim($this->rootFolder . '/' . $folder, '/'),
            'resource_type'   => 'image',
            'unique_filename' => true,
            'overwrite'       => false,
        ]);

        return $ket_qua['secure_url'];
    }

    public function delete(string $ref): void
    {
        $id = self::publicId($ref);

        if ($id !== null) {
            $this->api->destroy($id, ['resource_type' => 'image', 'invalidate' => true]);
        }
    }

    /** Lấy public id từ URL Cloudinary, null nếu không phải URL của Cloudinary */
    public static function publicId(string $url): ?string
    {
        return preg_match('#^https://res\.cloudinary\.com/[^/]+/image/upload/(?:v\d+/)?(.+)\.[A-Za-z0-9]+$#', $url, $m) === 1
            ? $m[1]
            : null;
    }
}
```

- [ ] **Step 5: Cấu hình và binding**

`fashionshop-api/config/services.php`: thêm dưới khối `images`:

```php
    'cloudinary' => [
        // Dạng cloudinary://<api_key>:<api_secret>@<cloud_name>, lấy ở trang Dashboard của Cloudinary
        'url'    => env('CLOUDINARY_URL'),
        'folder' => env('CLOUDINARY_FOLDER', 'fashionshop'),
    ],
```

`fashionshop-api/app/Providers/AppServiceProvider.php`: thêm `use` và nhánh `cloudinary` trong `match`:

```php
use App\Support\Images\CloudinaryImageStorage;
use Cloudinary\Cloudinary;
```

```php
            return match ($driver) {
                'local'      => new LocalImageStorage(),
                'cloudinary' => new CloudinaryImageStorage(
                    (new Cloudinary(config('services.cloudinary.url')
                        ?: throw new InvalidArgumentException('IMAGE_DRIVER=cloudinary nhưng chưa đặt CLOUDINARY_URL')))->uploadApi(),
                    (string) config('services.cloudinary.folder'),
                ),
                default => throw new InvalidArgumentException("IMAGE_DRIVER không hợp lệ: {$driver}"),
            };
```

`fashionshop-api/.env.example`: thêm ngay dưới dòng `FILESYSTEM_DISK=local`:

```dotenv
# Kho ảnh tải lên: local (ổ đĩa, chạy offline) hoặc cloudinary
IMAGE_DRIVER=local
# CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
# CLOUDINARY_FOLDER=fashionshop-dev
```

- [ ] **Step 6: Chạy test**

Run: `php artisan test --filter=CloudinaryImageStorageTest`
Expected: PASS (6 tests).

Run: `php artisan test`
Expected: tất cả PASS.

- [ ] **Step 7: Thử thật với Cloudinary (thủ công, cần tài khoản)**

Trong `fashionshop-api/.env` (không commit), đặt `IMAGE_DRIVER=cloudinary`, `CLOUDINARY_URL=...` và `CLOUDINARY_FOLDER=fashionshop-dev`. Sau đó chạy:

```bash
php artisan config:clear
php artisan tinker --execute="\$u = app(App\Support\Images\ImageStorage::class)->store(file_get_contents('storage/app/public/products/quantayongxuongnam.png'), 'image/png', 'smoke'); echo \$u, PHP_EOL; app(App\Support\Images\ImageStorage::class)->delete(\$u); echo 'deleted';"
```

Expected: in ra một URL `https://res.cloudinary.com/<cloud>/image/upload/v.../fashionshop-dev/smoke/....png`, mở được trên trình duyệt trước khi lệnh xoá chạy, rồi in `deleted`.

- [ ] **Step 8: Commit**

```bash
git add fashionshop-api/composer.json fashionshop-api/composer.lock fashionshop-api/app/Support/Images/CloudinaryImageStorage.php fashionshop-api/app/Providers/AppServiceProvider.php fashionshop-api/config/services.php fashionshop-api/.env.example fashionshop-api/tests/Unit/CloudinaryImageStorageTest.php
git commit -m "Store uploaded images on Cloudinary when IMAGE_DRIVER says so"
```

---

### Task 3: Frontend hiểu cả đường dẫn cũ lẫn URL Cloudinary

**Files:**
- Create: `fashionshop-web/src/utils/imageUrl.js`
- Create: `fashionshop-admin/src/utils/imageUrl.js`
- Modify (web): `src/components/ui/ProductCard.jsx:7,11`, `src/pages/Home.jsx:17,179,196,223,250`, `src/pages/ProductDetail.jsx:20,107`, `src/pages/Cart.jsx:11,129`, `src/pages/Checkout.jsx:15,169`, `src/pages/OrderDetail.jsx:10,66`
- Modify (admin): `src/utils/constants.js:14`, `src/pages/Products.jsx:8,63,161`, `src/pages/Reviews.jsx:6,76`, `src/pages/OrderDetail.jsx:8,74`, `src/pages/HomeCovers.jsx:6,133`

**Interfaces:**
- Consumes: giá trị `hinh_anh` / `covers[slot].path` từ API, là đường dẫn tương đối hoặc URL `https://`.
- Produces: `imageUrl(ref: string | null | undefined): string | null`

Frontend không có bộ test tự động (chỉ `lint` và `build` trong CI), nên task này kiểm chứng bằng grep, lint, build và xem thử trên trình duyệt.

- [ ] **Step 1: Tạo helper cho web**

`fashionshop-web/src/utils/imageUrl.js`:

```js
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/**
 * Đổi giá trị ảnh từ API thành src cho <img>.
 * Ảnh mới là URL Cloudinary đầy đủ thì dùng nguyên; ảnh mẫu cũ là đường dẫn
 * tương đối trên API thì ghép với /storage/.
 */
export function imageUrl(ref) {
  if (!ref) return null;
  return /^https?:\/\//i.test(ref) ? ref : `${API_URL}/storage/${ref}`;
}
```

- [ ] **Step 2: Tạo helper cho admin**

`fashionshop-admin/src/utils/imageUrl.js`: nội dung giống hệt Step 1.

- [ ] **Step 3: Thay các chỗ dùng trong web**

Mỗi file: xoá dòng `const IMG_BASE = ...`, thêm import, thay biểu thức.

`src/components/ui/ProductCard.jsx`: import `import { imageUrl } from "../../utils/imageUrl";`

```jsx
  const imgSrc = product.hinh_anh
    ? imageUrl(product.hinh_anh)
    : "https://placehold.co/600x760/f4f4f5/a1a1aa?text=Chưa+có+ảnh";
```

`src/pages/ProductDetail.jsx`: import `import { imageUrl } from "../utils/imageUrl";`

```jsx
  const imgSrc = product.hinh_anh
    ? imageUrl(product.hinh_anh)
    : "https://placehold.co/500x600?text=No+Image";
```

`src/pages/Cart.jsx`: import `import { imageUrl } from "../utils/imageUrl";`

```jsx
                const img = item.product?.hinh_anh
                  ? imageUrl(item.product.hinh_anh)
                  : "https://placehold.co/80x80?text=SP";
```

`src/pages/Checkout.jsx`: import `import { imageUrl } from "../utils/imageUrl";`

```jsx
                const img = item.product?.hinh_anh
                  ? imageUrl(item.product.hinh_anh)
                  : "https://placehold.co/60x60?text=SP";
```

`src/pages/OrderDetail.jsx`: import `import { imageUrl } from "../utils/imageUrl";`

```jsx
          const img = item.product?.hinh_anh
            ? imageUrl(item.product.hinh_anh)
            : "https://placehold.co/64x64?text=SP";
```

`src/pages/Home.jsx`: import `import { imageUrl } from "../utils/imageUrl";`. Bốn chỗ cần thay:

```jsx
                  src={imageUrl(adminCover("hero").path)}
```
```jsx
                    src={imageUrl(heroProduct.hinh_anh)}
```
```jsx
                  src={imageUrl(p.hinh_anh)}
```
```jsx
                    src={imageUrl(covers[c.gioiTinh])}
```

- [ ] **Step 4: Thay các chỗ dùng trong admin**

`src/utils/constants.js`: xoá dòng 14 `export const IMG_BASE = ...`.

`src/pages/Products.jsx`: đổi `import { IMG_BASE } from "../utils/constants";` thành `import { imageUrl } from "../utils/imageUrl";`

```jsx
    setPreview(p.hinh_anh ? imageUrl(p.hinh_anh) : null);
```
```jsx
                        src={p.hinh_anh ? imageUrl(p.hinh_anh) : "https://placehold.co/40x40?text=SP"}
```

`src/pages/Reviews.jsx`: đổi import như trên.

```jsx
                    src={r.product?.hinh_anh ? imageUrl(r.product.hinh_anh) : "https://placehold.co/48x48?text=SP"}
```

`src/pages/OrderDetail.jsx`: đổi `import { ORDER_STATUS, IMG_BASE } from "../utils/constants";` thành `import { ORDER_STATUS } from "../utils/constants";` và thêm `import { imageUrl } from "../utils/imageUrl";`

```jsx
          const img = item.product?.hinh_anh
            ? imageUrl(item.product.hinh_anh)
            : "https://placehold.co/56x56?text=SP";
```

`src/pages/HomeCovers.jsx`: đổi import thành `import { imageUrl } from "../utils/imageUrl";`

```jsx
    pending[key]?.preview || (covers[key]?.path ? imageUrl(covers[key].path) : null);
```

- [ ] **Step 5: Kiểm tra không sót**

Run (từ `C:\laragon\www\Fashion-Shop`): `git grep -n "IMG_BASE" -- fashionshop-web/src fashionshop-admin/src`
Expected: không có kết quả.

- [ ] **Step 6: Lint và build**

Run: `cd fashionshop-web && npm run lint && npm run build`
Expected: lint không lỗi, build xong.

Run: `cd fashionshop-admin && npm run build`
Expected: build xong.

- [ ] **Step 7: Xem thử trên trình duyệt**

Chạy API (`php artisan serve`), web (`npm run dev`) và admin (`npm run dev`) với `.env` API đặt `IMAGE_DRIVER=cloudinary`. Kiểm tra:
1. Trang chủ và trang sản phẩm vẫn hiện ảnh mẫu cũ, link dạng `http://127.0.0.1:8000/storage/products/...`.
2. Trong admin, sửa một sản phẩm và tải ảnh mới. Ảnh xem trước và ảnh trong bảng hiện đúng, link dạng `https://res.cloudinary.com/...` (xem qua DevTools → Elements).
3. Trang sản phẩm đó bên web cũng hiện ảnh Cloudinary.
4. Trong admin → Ảnh trang chủ, tải ảnh hero. Trang chủ web hiện ảnh mới.

- [ ] **Step 8: Commit**

```bash
git add fashionshop-web/src fashionshop-admin/src
git commit -m "Let the storefront and admin show images hosted outside the API"
```

---

### Task 4: Lệnh chuyển ảnh cũ từ bảng `uploads` sang Cloudinary

**Files:**
- Create: `fashionshop-api/app/Console/Commands/MoveUploadsToCloudinary.php`
- Create: `fashionshop-api/tests/Feature/MoveUploadsToCloudinaryTest.php`

**Interfaces:**
- Consumes: `ImageStorage`, `LocalImageStorage` (Task 1), `Tests\Fakes\FakeImageStorage` (Task 1), `App\Models\Upload::bytes()`, `App\Models\Setting`, `App\Models\Product`.
- Produces: lệnh `php artisan uploads:to-cloudinary {--dry-run}`.

- [ ] **Step 1: Viết test thất bại**

`fashionshop-api/tests/Feature/MoveUploadsToCloudinaryTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Setting;
use App\Models\Upload;
use App\Support\Images\ImageStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Fakes\FakeImageStorage;
use Tests\TestCase;

class MoveUploadsToCloudinaryTest extends TestCase
{
    use RefreshDatabase;

    private FakeImageStorage $kho;

    protected function setUp(): void
    {
        parent::setUp();

        $this->kho = new FakeImageStorage();
        $this->app->instance(ImageStorage::class, $this->kho);

        Upload::create(['path' => 'products/cu.png', 'mime' => 'image/png', 'size' => 7, 'data' => base64_encode('PNGDATA')]);
        Upload::create(['path' => 'covers/hero.jpg', 'mime' => 'image/jpeg', 'size' => 7, 'data' => base64_encode('JPGDATA')]);

        Product::create(['ten_sp' => 'Áo A', 'gia' => 1000, 'so_luong' => 1, 'gioi_tinh' => 1, 'hinh_anh' => 'products/cu.png']);
        Product::create(['ten_sp' => 'Áo B', 'gia' => 1000, 'so_luong' => 1, 'gioi_tinh' => 1, 'hinh_anh' => 'products/cu.png']);
        Product::create(['ten_sp' => 'Áo mẫu', 'gia' => 1000, 'so_luong' => 1, 'gioi_tinh' => 1, 'hinh_anh' => 'products/quantayongxuongnam.png']);

        Setting::put('home_cover_hero', 'covers/hero.jpg');
        Setting::put('home_cover_hero_pos', '50% 50%');
    }

    public function test_moves_every_upload_and_rewrites_references(): void
    {
        $this->artisan('uploads:to-cloudinary')->assertSuccessful();

        $this->assertCount(2, $this->kho->stored);
        $this->assertSame('PNGDATA', $this->kho->stored[0]['bytes']);
        $this->assertSame('products', $this->kho->stored[0]['folder']);
        $this->assertSame('image/jpeg', $this->kho->stored[1]['mime']);
        $this->assertSame('covers', $this->kho->stored[1]['folder']);

        $url_sp = $this->kho->stored[0]['url'];
        $this->assertSame(2, Product::where('hinh_anh', $url_sp)->count());
        $this->assertSame('products/quantayongxuongnam.png', Product::where('ten_sp', 'Áo mẫu')->value('hinh_anh'));

        $this->assertSame($this->kho->stored[1]['url'], Setting::get('home_cover_hero'));
        $this->assertSame('50% 50%', Setting::get('home_cover_hero_pos'));

        $this->assertSame(0, Upload::count());
    }

    public function test_running_twice_does_not_upload_again(): void
    {
        $this->artisan('uploads:to-cloudinary')->assertSuccessful();
        $this->artisan('uploads:to-cloudinary')->assertSuccessful();

        $this->assertCount(2, $this->kho->stored);
    }

    public function test_dry_run_changes_nothing(): void
    {
        $this->artisan('uploads:to-cloudinary', ['--dry-run' => true])->assertSuccessful();

        $this->assertSame([], $this->kho->stored);
        $this->assertSame(2, Upload::count());
        $this->assertSame(2, Product::where('hinh_anh', 'products/cu.png')->count());
    }

    public function test_refuses_to_run_with_local_driver(): void
    {
        // bind() tự bỏ instance giả đã gắn trong setUp()
        $this->app->bind(ImageStorage::class, fn () => new \App\Support\Images\LocalImageStorage());

        $this->artisan('uploads:to-cloudinary')->assertFailed();

        $this->assertSame(2, Upload::count());
    }
}
```

- [ ] **Step 2: Chạy test để thấy nó thất bại**

Run: `php artisan test --filter=MoveUploadsToCloudinaryTest`
Expected: FAIL. Lỗi dạng `The command "uploads:to-cloudinary" does not exist.`

- [ ] **Step 3: Viết lệnh**

`fashionshop-api/app/Console/Commands/MoveUploadsToCloudinary.php`:

```php
<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Setting;
use App\Models\Upload;
use App\Support\Images\ImageStorage;
use App\Support\Images\LocalImageStorage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Chuyển ảnh đang nằm trong bảng uploads sang kho ảnh ngoài.
 *
 * Với mỗi ảnh: tải lên kho, đổi mọi chỗ trỏ tới đường dẫn cũ (sản phẩm, ảnh
 * trang chủ) sang URL mới, rồi xoá dòng trong uploads. Dòng nào đã xong thì
 * không còn trong bảng, nên chạy lại chỉ xử lý phần còn sót.
 */
class MoveUploadsToCloudinary extends Command
{
    protected $signature = 'uploads:to-cloudinary {--dry-run : Chỉ liệt kê, không tải lên và không ghi database}';

    protected $description = 'Chuyển ảnh trong bảng uploads sang Cloudinary và cập nhật đường dẫn';

    public function handle(ImageStorage $kho): int
    {
        if ($kho instanceof LocalImageStorage) {
            $this->error('IMAGE_DRIVER đang là local. Đặt IMAGE_DRIVER=cloudinary và CLOUDINARY_URL rồi chạy lại.');
            return self::FAILURE;
        }

        $chay_thu = (bool) $this->option('dry-run');
        $xong = 0;
        $loi = 0;

        Upload::query()->orderBy('id')->chunkById(20, function ($lo) use ($kho, $chay_thu, &$xong, &$loi) {
            foreach ($lo as $upload) {
                $so_sp = Product::where('hinh_anh', $upload->path)->count();
                $so_cai_dat = Setting::where('value', $upload->path)->count();

                $this->line(sprintf('  %-60s %d sản phẩm, %d ảnh trang chủ', $upload->path, $so_sp, $so_cai_dat));

                if ($chay_thu) {
                    continue;
                }

                try {
                    $url = $kho->store($upload->bytes(), $upload->mime, dirname($upload->path));

                    DB::transaction(function () use ($upload, $url) {
                        Product::where('hinh_anh', $upload->path)->update(['hinh_anh' => $url]);
                        Setting::where('value', $upload->path)->update(['value' => $url]);
                        $upload->delete();
                    });

                    $this->line("    → {$url}");
                    $xong++;
                } catch (\Throwable $e) {
                    $loi++;
                    $this->warn("    lỗi: {$e->getMessage()}");
                }
            }
        });

        if ($chay_thu) {
            $this->comment('Chạy thử, chưa tải lên và chưa ghi gì. Bỏ --dry-run để áp dụng.');
            return self::SUCCESS;
        }

        $this->info("Đã chuyển {$xong} ảnh" . ($loi ? ", lỗi {$loi} ảnh (chạy lại để thử tiếp)" : ''));

        return $loi ? self::FAILURE : self::SUCCESS;
    }
}
```

- [ ] **Step 4: Chạy test**

Run: `php artisan test --filter=MoveUploadsToCloudinaryTest`
Expected: PASS (4 tests).

Run: `php artisan test`
Expected: tất cả PASS.

- [ ] **Step 5: Commit**

```bash
git add fashionshop-api/app/Console/Commands/MoveUploadsToCloudinary.php fashionshop-api/tests/Feature/MoveUploadsToCloudinaryTest.php
git commit -m "Add a command that moves stored uploads out to Cloudinary"
```

---

### Task 5: Triển khai và chuyển dữ liệu production (thủ công, người dùng làm)

Không sửa code. Đây là trạm kiểm soát trước Task 6.

- [ ] **Step 1: Chuẩn bị Cloudinary**

Tạo tài khoản tại cloudinary.com (gói Free), vào Dashboard và copy **API Environment variable** (`CLOUDINARY_URL=cloudinary://...`).

- [ ] **Step 2: Đặt biến môi trường trên Render**

Service API trên Render → Environment, thêm:
- `IMAGE_DRIVER=cloudinary`
- `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`
- `CLOUDINARY_FOLDER=fashionshop-prod`

- [ ] **Step 3: Push và chờ deploy**

Run: `git push origin main`
Expected: CI xanh, Render deploy xong. Mở admin production, tải thử ảnh cho một sản phẩm. Ảnh phải có URL `res.cloudinary.com/.../fashionshop-prod/products/...`.

- [ ] **Step 4: Chạy lệnh chuyển với database TiDB**

Render gói Free không có Shell, nên chạy từ máy local với cấu hình trỏ vào TiDB. Sao lưu `fashionshop-api/.env` thành `.env.backup`, rồi trong `.env` đặt `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `MYSQL_ATTR_SSL_CA` giống hệt Environment trên Render, cùng 3 biến Cloudinary ở Step 2. Sau đó chạy:

```bash
php artisan config:clear
php artisan uploads:to-cloudinary --dry-run
php artisan uploads:to-cloudinary
```

Expected: bản chạy thử liệt kê từng ảnh kèm số chỗ dùng; bản chạy thật in `Đã chuyển N ảnh` và không có lỗi. Nếu có lỗi, chạy lại lệnh cho tới khi hết lỗi.

- [ ] **Step 5: Xác nhận**

```bash
php artisan tinker --execute="echo DB::table('uploads')->count(), PHP_EOL, DB::table('products')->where('hinh_anh', 'like', 'http%')->count(), PHP_EOL, DB::table('settings')->where('key', 'like', 'home_cover_%')->whereNotIn('key', ['home_cover_hero_fit','home_cover_hero_pos','home_cover_nam_fit','home_cover_nam_pos','home_cover_nu_fit','home_cover_nu_pos'])->pluck('value');"
```

Expected: dòng 1 là `0`; dòng 2 là số sản phẩm có ảnh tự tải lên; dòng 3 là URL `https://res.cloudinary.com/...` hoặc `null`.

Mở web production: trang chủ, ảnh hero và các sản phẩm đều hiện ảnh.

Khôi phục `.env` từ `.env.backup` và chạy `php artisan config:clear`.

---

### Task 6: Dọn bảng `uploads` và mọi thứ phục vụ ảnh từ database

Chỉ làm khi Task 5 Step 5 cho kết quả `uploads = 0`.

**Files:**
- Create: `fashionshop-api/database/migrations/2026_09_16_000000_drop_uploads_table.php`
- Delete: `fashionshop-api/app/Models/Upload.php`, `fashionshop-api/app/Http/Controllers/UploadController.php`, `fashionshop-api/app/Console/Commands/RestoreUploads.php`, `fashionshop-api/app/Console/Commands/MoveUploadsToCloudinary.php`, `fashionshop-api/tests/Feature/MoveUploadsToCloudinaryTest.php`
- Modify: `fashionshop-api/app/Support/UploadStore.php`, `fashionshop-api/routes/web.php`, `fashionshop-api/docker-entrypoint.sh`, `fashionshop-api/app/Support/HomeCovers.php:60-62`, `fashionshop-api/Dockerfile:3`, `fashionshop-api/tests/Unit/UploadStoreTest.php`, `README.md`, `docs/architecture/runtime.architecture.json:44`, `docs/architecture/runtime-architecture.html`

**Interfaces:**
- Consumes: tất cả từ Task 1–2.
- Produces: `UploadStore::existing()` không còn đọc DB; route `/storage/{path}` không còn (file tĩnh trong `public/storage` vẫn được phục vụ qua symlink).

- [ ] **Step 1: Viết test thất bại**

Thêm vào `fashionshop-api/tests/Unit/UploadStoreTest.php`:

```php
    public function test_uploads_table_is_gone(): void
    {
        $this->assertFalse(\Illuminate\Support\Facades\Schema::hasTable('uploads'));
    }

    public function test_storage_route_no_longer_serves_from_database(): void
    {
        $this->assertFalse(\Illuminate\Support\Facades\Route::has('uploads.show'));
    }
```

Run: `php artisan test --filter=UploadStoreTest`
Expected: FAIL ở 2 test mới.

- [ ] **Step 2: Migration xoá bảng**

`fashionshop-api/database/migrations/2026_09_16_000000_drop_uploads_table.php`:

```php
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
```

- [ ] **Step 3: Xoá file phục vụ ảnh từ DB**

```bash
git rm fashionshop-api/app/Models/Upload.php fashionshop-api/app/Http/Controllers/UploadController.php fashionshop-api/app/Console/Commands/RestoreUploads.php fashionshop-api/app/Console/Commands/MoveUploadsToCloudinary.php fashionshop-api/tests/Feature/MoveUploadsToCloudinaryTest.php
```

`fashionshop-api/routes/web.php`: thay toàn bộ file:

```php
<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
```

`fashionshop-api/docker-entrypoint.sh`: xoá 3 dòng cuối trước `exec`:

```sh
# Ổ đĩa của container là tạm, mỗi lần dựng lại là sạch. Ảnh quản trị viên tải
# lên được cất trong database nên ghi chúng ra đĩa lại trước khi mở cổng.
php artisan uploads:restore --no-interaction || true
```

- [ ] **Step 4: Bỏ phần đọc bảng `uploads` trong `UploadStore`**

Trong `fashionshop-api/app/Support/UploadStore.php`:
- Xoá `use App\Models\Upload;`.
- Trong docblock đầu class, xoá đoạn "Bảng uploads chỉ còn được đọc cho những ảnh cũ chưa chuyển đi, xem lệnh uploads:to-cloudinary."
- Trong `delete()`, xoá dòng `Upload::where('path', $ref)->delete();`.
- Thay `existing()` bằng:

```php
    /**
     * Lọc ra những ảnh còn xem được. URL của kho ngoài được coi là còn; đường
     * dẫn tương đối thì phải còn trên đĩa.
     *
     * @param  list<string|null>  $refs
     * @return list<string>
     */
    public static function existing(array $refs): array
    {
        $refs = array_values(array_unique(array_filter($refs)));

        return array_values(array_filter(
            $refs,
            fn (string $ref) => self::isUrl($ref) || Storage::disk('public')->exists($ref)
        ));
    }
```

- [ ] **Step 5: Sửa comment đã lỗi thời**

`fashionshop-api/app/Support/HomeCovers.php`: thay comment ở dòng 60-62 bằng:

```php
        // Ảnh tải lên trước khi có kho ảnh ngoài chỉ nằm trên ổ đĩa tạm của
        // máy chủ, khởi động lại là mất. Bỏ qua những đường dẫn đã hỏng để
        // trang chủ quay về dùng ảnh sản phẩm thay vì hiện ô ảnh vỡ.
```

`fashionshop-api/Dockerfile` dòng 3 (lưu file dạng UTF-8): thay bằng

```dockerfile
# GD để thu nhỏ ảnh tải lên trước khi đẩy lên kho ảnh, xem App\Support\UploadStore
```

- [ ] **Step 6: Cập nhật tài liệu**

Run (từ `C:\laragon\www\Fashion-Shop`): `git grep -n -i "uploads table\|bảng uploads\|uploads:restore" -- README.md docs fashionshop-api/app fashionshop-api/routes fashionshop-api/docker-entrypoint.sh`

Với mỗi kết quả:
- `docs/architecture/runtime.architecture.json:44`: đổi `"Uploaded images stored in the uploads table"` thành `"Uploaded images hosted on Cloudinary, the database keeps only URLs"` và `"Container disk is only a rebuildable image cache"` thành `"Container disk only holds the bundled sample images"`.
- `docs/architecture/runtime-architecture.html`: sửa các thẻ `<li>` có cùng hai câu đó cho khớp.
- `README.md`: sửa câu nói ảnh lưu trong database. Trong khối `.env` của API (quanh dòng 387), thêm:

```dotenv
IMAGE_DRIVER=cloudinary          # hoặc local để chạy offline
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_FOLDER=fashionshop-dev
```

  và thêm `Cloudinary` vào bảng hạ tầng triển khai (quanh dòng 891): `| Ảnh | Cloudinary | Database chỉ lưu URL |`.

Run lại lệnh grep ở trên. Expected: không còn kết quả nào (ngoại trừ file migration lịch sử, vốn không nằm trong phạm vi grep).

- [ ] **Step 7: Chạy toàn bộ test và kiểm tra không còn tham chiếu**

Run: `php artisan test`
Expected: tất cả PASS, kể cả 2 test mới ở Step 1.

Run: `git grep -n "Upload::\|UploadController\|App\\\\Models\\\\Upload\b" -- fashionshop-api/app fashionshop-api/routes fashionshop-api/tests`
Expected: không có kết quả.

- [ ] **Step 8: Commit và deploy**

```bash
git add -A fashionshop-api README.md docs/architecture
git commit -m "Drop the uploads table now that images live on Cloudinary"
git push origin main
```

Sau khi Render deploy xong: mở web production và kiểm tra ảnh hero, ảnh sản phẩm tự tải lên, ảnh mẫu đều hiện; log khởi động không còn dòng `uploads:restore`. Với TiDB, kiểm tra `SHOW TABLES LIKE 'uploads'` trả về rỗng.
