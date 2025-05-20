<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ParentOfficial extends Model
{
    //
    use HasFactory;
    protected $table = 'parent_officials';
    protected $guarded = ['id'];
    protected $fillable = [
        'official_id',
        'hubungan',
        'nama',
        'tempat_lahir',
        'tanggal_lahir',
        'pekerjaan',
        'alamat',
        'rt',
        'rw',
        'no_telepon',
        'kode_pos',
        'province_code',
        'province_name',
        'regency_code',
        'regency_name',
        'district_code',
        'district_name',
        'village_code',
        'village_name',
    ];

}
