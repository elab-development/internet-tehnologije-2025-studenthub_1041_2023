<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profesor;
use App\Http\Resources\ProfesorResource;

class ProfesorController extends Controller
{
    public function index()
    {
        $profesori = Profesor::all();
        // Vrati kolekciju profesora kao resurs
        return ProfesorResource::collection($profesori);
    }
}