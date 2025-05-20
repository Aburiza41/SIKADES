<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficialStudy extends Model
{
    // Table Name
    protected $table = 'study_officials';

    protected $fillable = [
        // 'study_id',
        'official_id',
        'pendidikan_umum',
        'nama_sekolah',
        'alamat_sekolah',
        'tanggal',
        'nomor_ijazah',
        'dokumen',
    ];

}
