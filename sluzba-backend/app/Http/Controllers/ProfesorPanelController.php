<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Predmet;
use App\Models\PrijavaIspita;
use App\Http\Resources\PredmetResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\PrijavaIspitaResource;

class ProfesorPanelController extends Controller
{
    // 1) Profesor vidi svoje predmete.
    public function mojiPredmeti()
    {
        if (auth()->user()->role !== 'profesor') {
            return response()->json(['error' => 'Pristup dozvoljen samo profesorima.'], 403);
        }

        $profesor = auth()->user()->profesor; // preko relacije user->profesor
        if (!$profesor) {
            return response()->json(['error' => 'Profesor nije povezan sa korisnikom.'], 422);
        }

        $predmeti = Predmet::where('profesor_id', $profesor->id)
            ->with('profesor')
            ->get();

        return PredmetResource::collection($predmeti);
    }

    // 2) Profesor vidi studente koji slušaju predmet.
    public function studentiNaPredmetu($predmetId)
    {
        if (auth()->user()->role !== 'profesor') {
            return response()->json(['error' => 'Pristup dozvoljen samo profesorima.'], 403);
        }

        $profesor = auth()->user()->profesor;
        if (!$profesor) {
            return response()->json(['error' => 'Profesor nije povezan sa korisnikom.'], 422);
        }

        $predmet = Predmet::with('users')->findOrFail($predmetId);

        // provera da je predmet njegov.
        if ((int)$predmet->profesor_id !== (int)$profesor->id) {
            return response()->json(['error' => 'Nemate pristup ovom predmetu.'], 403);
        }

        $studenti = $predmet->users()
            ->where('role', 'student')
            ->withPivot(['status_predavanja', 'upisano_u_godini'])
            ->get();

        return UserResource::collection($studenti);
    }

    // 3) Profesor vidi prijave ispita za svoj predmet.
    public function prijaveZaPredmet($predmetId)
    {
        if (auth()->user()->role !== 'profesor') {
            return response()->json(['error' => 'Pristup dozvoljen samo profesorima.'], 403);
        }

        $profesor = auth()->user()->profesor;
        if (!$profesor) {
            return response()->json(['error' => 'Profesor nije povezan sa korisnikom.'], 422);
        }

        $predmet = Predmet::findOrFail($predmetId);

        if ((int)$predmet->profesor_id !== (int)$profesor->id) {
            return response()->json(['error' => 'Nemate pristup ovom predmetu.'], 403);
        }

        $prijave = PrijavaIspita::with(['user', 'predmet'])
            ->where('predmet_id', $predmet->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return PrijavaIspitaResource::collection($prijave);
    }

    // 4) Profesor upisuje ocenu (umesto sluzbenika).
    public function upisiOcenu(Request $request, $prijavaId)
    {
        if (auth()->user()->role !== 'profesor') {
            return response()->json(['error' => 'Pristup dozvoljen samo profesorima.'], 403);
        }

        $profesor = auth()->user()->profesor;
        if (!$profesor) {
            return response()->json(['error' => 'Profesor nije povezan sa korisnikom.'], 422);
        }

        $validated = $request->validate([
            'ocena' => 'required|integer|min:5|max:10',
        ]);

        $prijava = PrijavaIspita::with(['predmet', 'user'])->findOrFail($prijavaId);

        // profesor sme da ocenjuje samo prijave za svoje predmete.
        if ((int)$prijava->predmet->profesor_id !== (int)$profesor->id) {
            return response()->json(['error' => 'Nemate pravo da ocenite ovu prijavu.'], 403);
        }

        $ocena = (int)$validated['ocena'];
        $status = ($ocena === 5) ? 'nepolozen' : 'polozen';

        $prijava->ocena = $ocena;
        $prijava->status = $status;
        $prijava->save();

        return response()->json([
            'message' => 'Ocena je uspešno upisana.',
            'prijava' => new PrijavaIspitaResource($prijava),
        ]);
    }
}