<?php
// app/Models/Village.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Village extends Model
{
    use HasFactory;

    protected $fillable = [
        'district_id',
        'code_bps',
        'name_bps',
        'code_dagri',
        'name_dagri',
        'logo_path',
        'description',
        'website',
    ];

    // Relasi ke District
    public function district()
    {
        return $this->belongsTo(District::class);
    }

    // Relasi ke Official
    public function officials()
    {
        return $this->hasMany(Official::class);
    }

    // Relasi ke VillageDemographic
    public function villageDemographics()
    {
        return $this->hasMany(VillageDemographic::class);
    }

    // Relasi ke VillageEconomy
    public function villageEconomy()
    {
        return $this->hasMany(VillageEconomy::class);
    }

    // Relasi ke VillageInfrastructure
    public function villageInfrastructure()
    {
        return $this->hasMany(VillageInfrastructure::class);
    }

    // Relasi ke VillageEducation
    public function villageEducation()
    {
        return $this->hasMany(VillageEducation::class);
    }

    // Relasi ke VillageHealth
    public function villageHealth()
    {
        return $this->hasMany(VillageHealth::class);
    }

    // Relasi ke VillageEnvironment
    public function villageEnvironment()
    {
        return $this->hasMany(VillageEnvironment::class);
    }

    // Relasi ke VillageInstitutions
    public function villageInstitution()
    {
        return $this->hasMany(VillageInstitution::class);
    }

    // Relasi ke VillageDevelopment
    public function villageDevelopment()
    {
        return $this->hasMany(VillageDevelopment::class);
    }

    // Relasi ke VillageIdm
    public function villageIdm()
    {
        return $this->hasMany(VillageIdm::class);
    }

    public function villageIdmLatest()
    {
        return $this->hasOne(VillageIdm::class)->latest();
    }

    // Relasi ke UserVillage
    public function userVillages()
    {
        return $this->hasMany(UserVillage::class);
    }
}
