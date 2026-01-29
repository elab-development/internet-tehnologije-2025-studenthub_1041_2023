<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PredmetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
         return [
            'id'=> $this->id, 
            'naziv' => $this->naziv,
            'espb' => $this->espb,
            'godina' => $this->godina,
            'obavezan' => $this->obavezan ? 'Obavezan' : 'Izborni',
            'semestar' => $this->semestar,
            'profesor' => [
                'ime' => $this->profesor->ime,
                'prezime' => $this->profesor->prezime,
            ],
        ];
    }
}
