<?php
// app/Models/VillageInstitution.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VillageInstitution extends Model
{
    use HasFactory;

    // Table
    protected $table = 'village_institutions';

    protected $fillable = [
        'village_id',
        'jumlah_lembaga_desa',
        'jumlah_kegiatan_lembaga',
        'year',
    ];

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}
