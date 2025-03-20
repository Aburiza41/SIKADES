<?php

// app/Models/VillageDevelopment.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VillageDevelopment extends Model
{
    use HasFactory;

    protected $fillable = [
        'village_id',
        'program_pengembangan',
        'sumber_pendanaan',
        'indikator_keberhasilan',
        'year',
    ];

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}