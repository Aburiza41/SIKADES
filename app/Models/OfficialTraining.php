<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficialTraining extends Model
{
    // HasFactory
    protected $fillable = [
        'official_id',
        'training_id',
        'doc_scan',
        'nama',
        'keterangan',
        'mulai',
        'selesai',
    ];

    protected $hidden = [
        'id',
    ];

    // Relation
    public function official()
    {
        return $this->belongsTo(Official::class);
    }

    public function training()
    {
        return $this->belongsTo(Training::class);
    }
}
