<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'fullname', 'phone', 'address',
        'payment', 'total', 'status'
    ];

    /** Trạng thái được phép chuyển sang, từ mỗi trạng thái hiện tại */
    public const TRANSITIONS = [
        'pending'   => ['shipping', 'cancelled'],
        'shipping'  => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => [],
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function details() {
        return $this->hasMany(OrderDetail::class);
    }

    public function canTransitionTo(string $status): bool
    {
        return in_array($status, self::TRANSITIONS[$this->status] ?? [], true);
    }

    /**
     * Trả hàng về kho khi đơn bị huỷ.
     *
     * Chỉ gọi đúng một lần cho mỗi đơn: "cancelled" là trạng thái cuối, không
     * chuyển đi đâu được nữa, nên không có đường nào hoàn kho hai lần.
     */
    public function restoreStock(): void
    {
        foreach ($this->details()->get() as $detail) {
            Product::where('id', $detail->product_id)
                ->increment('so_luong', $detail->quantity);
        }
    }
}
