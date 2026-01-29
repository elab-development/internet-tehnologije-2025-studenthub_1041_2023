<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PredmetUserResource extends JsonResource
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
            'naziv' => $this->naziv,
            'espb' => $this->espb,
            'godina' => $this->godina,
            'semestar' => $this->semestar,
            'profesor' => $this->profesor ? $this->profesor->ime . ' ' . $this->profesor->prezime : null,
            'pivot' => [
                'upisano_u_godini' => $this->pivot->upisano_u_godini ?? null,
                'status_predavanja' => $this->pivot->status_predavanja ?? null,
            ]
        ];
    
    }
}
