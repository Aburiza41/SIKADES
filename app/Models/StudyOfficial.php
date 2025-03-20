<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyOfficial extends Model
{
    use HasFactory;

    protected $fillable = [
        'official_id',
        'study_id',
        'nama_sekolah',
        'alamat_sekolah',
        'jurusan',
        'tahun_masuk',
        'tahun_keluar',
        'dokumen',
    ];

    public function official()
    {
        return $this->belongsTo(Official::class);
    }

    public function study()
    {
        return $this->belongsTo(Study::class);
    }
}