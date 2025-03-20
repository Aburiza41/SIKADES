<?php
// app/Models/VillageEconomy.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VillageEconomy extends Model
{
    use HasFactory;

    protected $fillable = [
        'village_id',
        'jumlah_keluarga_miskin',
        'tingkat_pengangguran',
        'mata_pencaharian_utama',
        'year',
    ];

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}