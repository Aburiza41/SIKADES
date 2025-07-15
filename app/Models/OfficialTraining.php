<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OfficialTraining extends Model
{
    use HasFactory;

    protected $table = 'official_trainings';

    // HasFactory
    protected $fillable = [
        'training_id',
        'official_id',
        'nama',
        'alamat',
        // 'pelatihan',
        'penyelenggara',
        'nomor_sertifikat',
        'tanggal_sertifikat',
        'doc_scan',
        'keterangan',
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
