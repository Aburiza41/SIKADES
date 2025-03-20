<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficialAddress extends Model
{
    // Tabel
    protected $table = 'official_addresses';

    use HasFactory;

    protected $fillable = [
        'official_id',
        'alamat',
        'rt',
        'rw',
        'province_code',
        'province_name',
        'regency_code',
        'regency_name',
        'district_code',
        'district_name',
        'village_code',
        'village_name',
    ];

    public function official()
    {
        return $this->belongsTo(Official::class);
    }
}