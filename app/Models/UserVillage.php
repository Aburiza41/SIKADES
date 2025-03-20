<?php
// app/Models/UserVillage.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserVillage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'village_id',
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}