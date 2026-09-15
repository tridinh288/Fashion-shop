<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Setting;
use App\Models\Upload;
use App\Support\Images\ImageStorage;
use App\Support\Images\LocalImageStorage;
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
        $this->app->bind(ImageStorage::class, fn () => new LocalImageStorage());

        $this->artisan('uploads:to-cloudinary')->assertFailed();

        $this->assertSame(2, Upload::count());
    }
}
