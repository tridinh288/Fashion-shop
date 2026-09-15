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
            'services.images.driver'     => 'cloudinary',
            'services.cloudinary.url'    => 'cloudinary://123:secret@demo',
            'services.cloudinary.folder' => 'fashionshop-dev',
        ]);

        $this->assertInstanceOf(CloudinaryImageStorage::class, $this->app->make(ImageStorage::class));
    }
}
