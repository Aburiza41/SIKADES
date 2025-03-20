<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfficialContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'official_id',
        'handphone',
        'email',
    ];

    public function official()
    {
        return $this->belongsTo(Official::class);
    }
}