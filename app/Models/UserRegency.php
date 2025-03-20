<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRegency extends Model
{
    //
    protected $table = 'user_regencies';
    protected $fillable = ['user_id', 'regency_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function regency()
    {
        return $this->belongsTo(Regency::class);
    }
}
