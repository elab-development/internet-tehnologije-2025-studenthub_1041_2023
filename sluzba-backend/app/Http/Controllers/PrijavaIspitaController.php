<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PrijavaIspita;
use App\Http\Resources\PrijavaIspitaResource;

class PrijavaIspitaController extends Controller
{
    public function index()
    {
        if (auth()->user()->role !== 'sluzbenik') {
            return response()->json(['error' => 'Pristup dozvoljen samo službenim radnicima.'], 403);
        }

        $perPage = 10;
        $prijave = PrijavaIspita::with(['user', 'predmet'])->paginate($perPage);

        return PrijavaIspitaResource::collection($prijave);
    }


    public function updateOcena(Request $request, $id)
    {
        if (auth()->user()->role !== 'sluzbenik') {
            return response()->json(['error' => 'Pristup dozvoljen samo službenim radnicima'], 403);
        }

        $request->validate([
            'ocena' => 'required|integer|between:5,10',
            'status' => 'required|string|in:polozen,nepolozen',
        ]);

        $prijava = PrijavaIspita::findOrFail($id);


        $prijava->ocena = $request->ocena;
        $prijava->status = $request->status;
        $prijava->save();

        return response()->json([
            'message' => "Ocena je uspešno azurirana",
            'prijava' => new PrijavaIspitaResource($prijava->load(['user', 'predmet']))
        ]);
    }

    public function mojePrijave()
    {
        if (auth()->user()->role !== 'student') {
            return response()->json(['error' => 'Pristup dozvoljen samo studentima.'], 403);
        }

        $prijave = PrijavaIspita::with(['predmet', 'user'])
            ->where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->get();

        return PrijavaIspitaResource::collection($prijave);
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'student') {
            return response()->json(['error' => 'Pristup dozvoljen samo studentima.'], 403);
        }

        $request->validate([
            'predmet_id' => 'required|exists:predmeti,id',
            'rok' => 'required|integer|between:1,6',
        ]);

        $user = auth()->user();
        $predmetId = $request->predmet_id;

        // Proveri da li studentsluša taj predmet (pivot)
        $slusa = $user->predmeti()->where('predmet_id', $predmetId)->exists();

        if (! $slusa) {
            return response()->json(['error' => 'Ne možete prijaviti ispit iz predmeta koji ne slušate.'], 403);
        }

        // Broj prijave se generiše na osnovu prethodnih prijava za taj predmet
        $postojecih = PrijavaIspita::where('user_id', $user->id)->where('predmet_id', $predmetId)->count();

        $redosled = PrijavaIspita::where('user_id', $user->id)->where('predmet_id', $predmetId)->count() + 1;
  
        $prijava = PrijavaIspita::create([
            'user_id' => $user->id,
            'predmet_id' => $predmetId,
            'rok' => $request->rok,
            'broj_prijave' => $redosled,
            'status' => 'prijavljen',
            'ocena' => null,
        ]);

        return response()->json([
            'message' => 'Ispit uspešno prijavljen.',
            'prijava' => new PrijavaIspitaResource($prijava->load('user', 'predmet'))
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (auth()->user()->role !== 'student') {
            return response()->json(['error' => 'Pristup dozvoljen samo studentima.'], 403);
        }

        $request->validate([
            'rok' => 'required|integer|between:1,6',
        ]);

        $user = auth()->user();

        $prijava = PrijavaIspita::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'prijavljen')
            ->first();

        if (! $prijava) {
            return response()->json(['error' => 'Prijava ne postoji ili nije moguće izmeniti.'], 404);
        }

        $prijava->rok = $request->rok;
        $prijava->save();

        return response()->json([
            'message' => 'Rok za prijavu uspešno izmenjen.',
            'prijava' => new PrijavaIspitaResource($prijava->load('user', 'predmet'))
        ]);
    }

    public function destroy($id)
    {
        if (auth()->user()->role !== 'student') {
            return response()->json(['error' => 'Pristup dozvoljen samo studentima.'], 403);
        }

        $user = auth()->user();

        $prijava = PrijavaIspita::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'prijavljen')
            ->first();

        if (! $prijava) {
            return response()->json(['error' => 'Prijava ne postoji ili nije moguće poništiti.'], 404);
        }

        $prijava->delete();

        return response()->json(['message' => 'Prijava uspešno poništena.']);
    }

    public function studentMetrike()
    {
        if (auth()->user()->role !== 'student') {
            return response()->json(['error' => 'Pristup dozvoljen samo studentima.'], 403);
        }

        $user = auth()->user();

        // Predmeti koje sluša student (pivot)
        $predmetiIds = $user->predmeti()->pluck('predmeti.id')->toArray();

        // Sve prijave za te predmete
        $prijave = PrijavaIspita::where('user_id', $user->id)
                                ->whereIn('predmet_id', $predmetiIds)
                                ->get();

        $ukupnoPrijava = $prijave->count();
        $polozeni = $prijave->where('ocena', '>=', 6)->count();
        $nepolozeni = $prijave->where('ocena', 5)->count();
        $neocenjeni = $prijave->whereNull('ocena')->count();

        $prosecnaOcena = $prijave->whereNotNull('ocena')->avg('ocena');

        // Grupisanje po ispitnom roku
        $poRoku = $prijave->groupBy('rok')->map->count();

        // Grupisanje po godini
        $poGodini = $prijave->groupBy(function ($item) {
            return \Carbon\Carbon::parse($item->created_at)->format('Y');
        })->map->count();

        // Najviše puta prijavljivan predmet
        $najcesciPredmet = $prijave->groupBy('predmet_id')
            ->map->count()
            ->sortDesc()
            ->keys()
            ->first();

        $najcesciNaziv = null;
        $najcesciBroj = 0;

        if ($najcesciPredmet) {
            $najcesciNaziv = \App\Models\Predmet::find($najcesciPredmet)?->naziv;
            $najcesciBroj = $prijave->where('predmet_id', $najcesciPredmet)->count();
        }

        // Broj predmeta koje sluša
        $brojPredmeta = count($predmetiIds);

        // Broj desetki
        $brojDesetki = $prijave->where('ocena', 10)->count();

        // Broj ispita položenih iz prvog puta
        $polozeniIzPrvog = $prijave->where('ocena', '>=', 6)->filter(function ($p) use ($prijave) {
            $ukupnoZaPredmet = $prijave->where('predmet_id', $p->predmet_id);
            return $ukupnoZaPredmet->count() === 1;
        })->count();

        return response()->json([
            'ukupno_prijava' => $ukupnoPrijava,
            'polozeni' => $polozeni,
            'nepolozeni' => $nepolozeni,
            'neocenjeni' => $neocenjeni,
            'prosecna_ocena' => round($prosecnaOcena, 2),
            'po_rokovima' => $poRoku,
            'po_godinama' => $poGodini,
            'najcesce_prijavljivan_predmet' => $najcesciNaziv,
            'najcesce_prijava_broj' => $najcesciBroj,
            'broj_predmeta_koje_slusa' => $brojPredmeta,
            'broj_desetki' => $brojDesetki,
            'polozeni_iz_prvog' => $polozeniIzPrvog
        ]);
    }

    


}
