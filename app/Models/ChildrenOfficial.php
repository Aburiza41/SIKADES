<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChildrenOfficial extends Model
{
    //
    use HasFactory;
    protected $table = 'child_officials';
    protected $guarded = [];
    protected $fillable = [
        'official_id',
        'nama',
        'tempat_lahir',
        'tanggal_lahir',
        'pendidikan_umum',
        'pekerjaan',
        'status',
    ];
}
