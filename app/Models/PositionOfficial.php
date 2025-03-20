<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PositionOfficial extends Model
{
    use HasFactory;

    protected $fillable = [
        'position_id',
        'official_id',
        'penetap',
        'nomor_sk',
        'tanggal_sk',
        'file_sk',
        'mulai',
        'selesai',
        'keterangan',
    ];

    public function official()
    {
        return $this->belongsTo(Official::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }
}