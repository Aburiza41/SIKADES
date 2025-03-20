<?php
// app/Models/VillageEducation.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VillageEducation extends Model
{
    use HasFactory;

    // Table
    protected $table = 'village_educations';



    protected $fillable = [
        'village_id',
        'jumlah_penduduk_sd',
        'jumlah_penduduk_smp',
        'jumlah_penduduk_sma',
        'jumlah_penduduk_pt',
        'jumlah_fasilitas_pendidikan',
        'year',
    ];

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}