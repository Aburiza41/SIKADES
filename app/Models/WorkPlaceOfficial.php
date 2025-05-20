<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
class WorkPlaceOfficial extends Model
{
    //
    use HasFactory;

    protected $table = 'work_officials';
    protected $guarded = [];
    protected $fillable = [
        'official_id',
        'alamat',
        'rt',
        'rw',
        'kode_pos',
        'village_id',
        'regency_id',
        'district_id',
    ];
}
