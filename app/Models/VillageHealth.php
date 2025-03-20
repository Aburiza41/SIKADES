<?php
// app/Models/VillageHealth.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VillageHealth extends Model
{
    use HasFactory;

    protected $fillable = [
        'village_id',
        'jumlah_fasilitas_kesehatan',
        'jumlah_tenaga_kesehatan',
        'year',
    ];

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}