<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class Profesor extends Model
{
    use HasFactory;
    protected $table = 'profesori';

    protected $fillable = [
        'ime',
        'prezime',
        'zvanje',
        'email',
        'kabinet',
        'napomena'
    ];

    public function predmeti()
    {
        return $this->hasMany(Predmet::class, 'profesor_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
