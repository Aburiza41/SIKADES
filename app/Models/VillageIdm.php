<?php
// app/Models/VillageIdm.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VillageIdm extends Model
{
    use HasFactory;

    protected $fillable = [
        'village_id',
        'score_idm',
        'status_idm',
        'score_prodeskel',
        'score_epdeskel',
        'status',
        'classification',
        'year',
    ];

    // Relasi ke Village
    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}