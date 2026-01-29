<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Resources\UserResource;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Dozvoljeno samo službenom radniku
        if (auth()->user()->role !== 'sluzbenik') {
            return response()->json(['error' => 'Pristup dozvoljen samo službenim radnicima.'], 403);
        }

        $perPage = $request->input('per_page', 10); 
        $studenti = User::where('role', 'student')
                        ->orderBy('prezime')
                        ->paginate($perPage);

        return UserResource::collection($studenti);
    }
}
