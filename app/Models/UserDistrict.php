<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDistrict extends Model
{
    //
    protected $table = 'user_districts';
    protected $fillable = ['user_id', 'district_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id');
    }
}
