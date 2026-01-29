<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class Predmet extends Model
{
    use HasFactory;
    protected $table = 'predmeti';

    protected $fillable = [
        'naziv',
        'espb',
        'godina',
        'obavezan',
        'semestar',
        'profesor_id'
    ];

    public function profesor()
    {
        return $this->belongsTo(Profesor::class, 'profesor_id');
    }

    public function studenti()
    {
        return $this->belongsToMany(User::class)
                    ->withPivot('status_predavanja', 'upisano_u_godini')
                    ->withTimestamps();
    }

    public function prijave()
    {
        return $this->hasMany(PrijavaIspita::class, 'predmet_id');
    }
}
