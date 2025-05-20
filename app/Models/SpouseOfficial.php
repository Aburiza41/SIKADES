<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class SpouseOfficial extends Model
{
    //
    use HasFactory;
        protected $table = 'spouse_officials';
    protected $guarded = ['id'];
    protected $fillable = [
        'official_id',
        'hubungan',
        'nama',
        'tempat_lahir',
        'tanggal_lahir',
        'pekerjaan',
        'pendidikan_umum',
    ];
}
