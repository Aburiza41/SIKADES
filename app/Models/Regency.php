<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Regency extends Model
{
    use HasFactory;

    /**
     * Kolom yang dapat diisi secara massal.
     *
     * @var array
     */
    protected $fillable = [
        'code_bps',
        'name_bps',
        'code_dagri',
        'name_dagri',
        'code'
        // 'logo',
        // 'description',
        // 'website',
    ];

    // Relation
    public function districts()
    {
        return $this->hasMany(District::class);
    }

    public function user_regencies()
    {
        return $this->hasMany(UserRegency::class);
    }
}
