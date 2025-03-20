<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficialStatusLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'official_id',
        'status_sebelumnya',
        'status_baru',
        'user_id',
        'keterangan',
    ];

    public function official()
    {
        return $this->belongsTo(Official::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}