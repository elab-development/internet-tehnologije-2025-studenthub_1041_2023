<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Predmet;
use App\Http\Resources\PredmetResource;
use App\Http\Resources\PredmetUserResource;

class PredmetController extends Controller
{
    public function index()
    {
        if (auth()->user()->role !== 'sluzbenik') {
            return response()->json(['error' => 'Pristup dozvoljen samo službenim radnicima.'], 403);
        }

         $perPage = 10;  // broj po stranici
         $predmeti = Predmet::with('profesor')->paginate($perPage);

        return PredmetResource::collection($predmeti);
    }

    public function update(Request $request, $id)
    {
        if (auth()->user()->role !== 'sluzbenik') {
            return response()->json(['error' => 'Pristup dozvoljen samo službenim radnicima.'], 403);
        }

        $validated = $request->validate([
            'naziv' => 'sometimes|string|max:255',
            'espb' => 'sometimes|integer',
            'godina' => 'sometimes|integer|between:1,6',
            'obavezan' => 'sometimes|boolean',
            'semestar' => 'sometimes|integer|between:1,2',
            'profesor_id' => 'sometimes|exists:profesori,id'
        ]);

        $predmet = \App\Models\Predmet::findOrFail($id);
        $predmet->update($validated);

        return response()->json([
            'message' => 'Predmet je uspešno ažuriran.',
            'predmet' => new \App\Http\Resources\PredmetResource($predmet)
        ]);
    }

    //ovogodisnji dostupni predmeti - na osnovu godine koje je student
    public function dostupniPredmeti()
    {
        if (auth()->user()->role !== 'student') {
            return response()->json(['error' => 'Pristup dozvoljen samo studentima.'], 403);
        }

        $predmeti = Predmet::where('godina', auth()->user()->godina_studija)
                            ->with('profesor')
                            ->get();

        return PredmetResource::collection($predmeti);
    }

    //sve koje slusa trenutno, tj upisano je
    public function upisaniPredmeti()
    {
        if (auth()->user()->role !== 'student') {
            return response()->json(['error' => 'Pristup dozvoljen samo studentima.'], 403);
        }

        $predmeti = auth()->user()->predmeti()->with('profesor')->get();

        return PredmetUserResource::collection($predmeti);
    }

    //prikaz detalja predmeta
    public function show($id)
    {
        if (auth()->user()->role !== 'student') {
            return response()->json(['error' => 'Pristup dozvoljen samo studentima.'], 403);
        }

        $predmet = auth()->user()->predmeti()->with('profesor')->findOrFail($id);

        return new PredmetUserResource($predmet);
    }

}
