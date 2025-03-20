<?php

// app/Models/VillageDemographic.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VillageDemographic extends Model
{
    use HasFactory;

    protected $fillable = [
        'village_id',
        'jumlah_penduduk',
        'jumlah_laki_laki',
        'jumlah_perempuan',
        'jumlah_kepala_keluarga',
        'jumlah_anak_anak',
        'jumlah_remaja',
        'jumlah_dewasa',
        'jumlah_lansia',
        'year',
    ];

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}