<?php

// app/Models/VillageEnvironment.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VillageEnvironment extends Model
{
    use HasFactory;

    protected $fillable = [
        'village_id',
        'luas_wilayah',
        'jenis_penggunaan_lahan',
        'kondisi_lingkungan',
        'year',
    ];

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}