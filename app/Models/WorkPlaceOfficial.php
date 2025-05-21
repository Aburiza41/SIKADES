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

    // Relasi
    public function official()
    {
        return $this->belongsTo(Official::class, 'official_id');
    }

    public function village()
    {
        return $this->belongsTo(Village::class, 'village_id');
    }

    public function regency()
    {
        return $this->belongsTo(Regency::class, 'regency_id');
    }

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id');
    }
}
