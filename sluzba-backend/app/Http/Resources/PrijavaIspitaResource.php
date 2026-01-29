<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrijavaIspitaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rok' => $this->rok,
            'broj_prijave' => $this->broj_prijave,
            'status' => $this->status,
            'ocena' => $this->ocena,
            'user' => [
                'ime' => $this->user->ime,
                'prezime' => $this->user->prezime,
                'broj_indeksa' => $this->user->broj_indeksa,
            ],
            'predmet' => [
                'naziv' => $this->predmet->naziv,
                'godina' => $this->predmet->godina,
                'semestar' => $this->predmet->semestar,
                'profesor_id' => $this->predmet->profesor_id,
            ],
        ];
    
    }
}
