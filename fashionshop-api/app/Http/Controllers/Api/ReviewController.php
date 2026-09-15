<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($id)
    {
        $reviews = Review::with('user')
            ->where('product_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        $reviews->each(function ($review) {
            $review->review_date = $review->created_at;
        });

        return response()->json($reviews);
    }

    public function store(Request $request, $id)
        {
            $request->validate([
                'rating'  => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:5|max:500',
            ]);

        $review = Review::create([
        'product_id' => $id,
        'user_id'    => $request->user()->id,
        'rating'     => $request->rating,
        'comment'    => $request->comment,
    ]);     
        

    $review->load('user');
    $review->rating_text = $review->rating . ' sao';

            return response()->json(['message' => 'Đã gửi đánh giá', 'review' => $review], 201);
        }
}