<?php
// app/Models/VillageInfrastructure.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VillageInfrastructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'village_id',
        'rumah_tangga_listrik',
        'rumah_tangga_air_bersih',
        'kondisi_jalan',
        'year',
    ];

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}