<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class PrijavaIspita extends Model
{
    use HasFactory;
    protected $table = 'prijave_ispita';

    protected $fillable = [
        'user_id',
        'predmet_id',
        'rok',
        'broj_prijave',
        'ocena',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function predmet()
    {
        return $this->belongsTo(Predmet::class, 'predmet_id');
    }
}
