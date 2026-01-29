<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\UserResource;

class UserAuthController extends Controller
{
    // SK1: Registracija korisnika
    public function register(Request $request)
    {
        $validated = $request->validate([
            'ime' => 'required|string',
            'prezime' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string',
            'broj_indeksa' => 'required|string|unique:users',
            'godina_studija' => 'required|integer',
            'smer' => 'required|string|in:Informacione Tehnologije i Sistemi,
            Menadžment,Operacioni Menadžment',
        ]);

        $user = User::create([
            'ime' => $validated['ime'],
            'prezime' => $validated['prezime'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'broj_indeksa' => $validated['broj_indeksa'],
            'godina_studija' => $validated['godina_studija'],
            'smer' => $validated['smer'],
            'role' => 'student', // defaultna uloga, sluzbeni radnici se ne registruju
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registracija uspešna.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ], 201);
    }

    // SK2: Prijava korisnika
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Pogrešan email ili lozinka.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Prijava uspešna.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    // SK3: Odjava korisnika
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Odjava uspešna.'
        ]);
    }
}
