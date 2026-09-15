<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
    $request->validate([
    'fullname' => 'required|string|min:2|max:255',
    'email'    => 'required|email',
    'message'  => 'required|string|min:10|max:1000',
    ]);

    Contact::create($request->only('fullname', 'email', 'message'));

    return response()->json([
        'message' => 'Email liên hệ đã được gửi thành công',
        'token' => null
    ], 201);

    }
}