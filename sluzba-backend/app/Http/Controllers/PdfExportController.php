<?php

namespace App\Http\Controllers;

use App\Models\PrijavaIspita;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfExportController extends Controller
{
    public function eksportuj()
    {
        if (auth()->user()->role !== 'student') {
            return response()->json(['error' => 'Pristup dozvoljen samo studentima.'], 403);
        }

        $student = auth()->user();

        $prijave = PrijavaIspita::with('predmet')
                    ->where('user_id', $student->id)
                    ->get();

        $prosek = $prijave->whereNotNull('ocena')->avg('ocena');
        $polozeni = $prijave->where('ocena', '>=', 6)->count();

        $pdf = Pdf::loadView('pdf.izvestaj', [
            'student' => $student,
            'prijave' => $prijave,
            'prosek' => $prosek,
            'polozeni' => $polozeni,
        ]);

        return $pdf->download('izvestaj-studenta.pdf');
    }
}
