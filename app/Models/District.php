<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class District extends Model
{
    use HasFactory;

    /**
     * Kolom yang dapat diisi secara massal.
     *
     * @var array
     */
    protected $fillable = [
        'regency_id',
        'code_bps',
        'name_bps',
        'code_dagri',
        'name_dagri',
        'active',
        'code',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Relasi ke model Regency.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function regency()
    {
        return $this->belongsTo(Regency::class);
    }

    // Village
    public function villages()
    {
        return $this->hasMany(Village::class);
    }
}
