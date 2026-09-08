<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('cart_table_v2') && !Schema::hasTable('cart')) {
            Schema::rename('cart_table_v2', 'cart');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('cart') && !Schema::hasTable('cart_table_v2')) {
            Schema::rename('cart', 'cart_table_v2');
        }
    }
};
