<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficialIdentity extends Model
{
    use HasFactory;

    // Tabel
    protected $table = 'official_identities';

    protected $fillable = [
        'official_id',
        'gol_darah',
        'pendidikan_terakhir',
        'bpjs_kesehatan',
        'bpjs_ketenagakerjaan',
        'npwp',
    ];

    public function official()
    {
        return $this->belongsTo(Official::class);
    }
}
