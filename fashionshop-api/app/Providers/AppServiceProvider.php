<?php

namespace App\Providers;

use App\Support\Images\CloudinaryImageStorage;
use App\Support\Images\ImageStorage;
use App\Support\Images\LocalImageStorage;
use Cloudinary\Cloudinary;
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
                'local'      => new LocalImageStorage(),
                'cloudinary' => new CloudinaryImageStorage(
                    (new Cloudinary(config('services.cloudinary.url')
                        ?: throw new InvalidArgumentException('IMAGE_DRIVER=cloudinary nhưng chưa đặt CLOUDINARY_URL')))->uploadApi(),
                    (string) config('services.cloudinary.folder'),
                ),
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
