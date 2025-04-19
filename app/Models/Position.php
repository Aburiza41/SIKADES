<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    /** @use HasFactory<\Database\Factories\PositionFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'min',
        'level',
        'parent_id',
    ];

    public function officials()
    {
        return $this->hasMany(PositionOfficial::class);
    }
}
