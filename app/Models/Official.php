<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Official extends Model
{
    //
    use HasFactory;

    protected $fillable = [
        'village_id',
        'nik',
        'niad',
        'nama_lengkap',
        'gelar_depan',
        'gelar_belakang',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'status_perkawinan',
        'agama',
        'status',
        'user_village_id',
        'user_district_id',
        'user_regency_id',
    ];


    protected $hidden = [
        'id',
    ];

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function officialTrainings()
    {
        return $this->hasMany(OfficialTraining::class);
    }

    public function officialStudies()
    {
        return $this->hasMany(OfficialStudy::class);
    }

    public function positionOfficial()
    {
        return $this->hasMany(PositionOfficial::class);
    }

    public function officialOrganizations()
    {
        return $this->hasMany(OfficialOrganization::class);
    }

    public function userVillage()
    {
        return $this->belongsTo(Village::class, 'user_village_id');
    }

    public function userDistrict()
    {
        return $this->belongsTo(District::class, 'user_district_id');
    }

    public function userRegency()
    {
        return $this->belongsTo(Regency::class, 'user_regency_id');
    }


    public function addresses()
    {
        return $this->hasOne(OfficialAddress::class);
    }

    public function contacts()
    {
        return $this->hasOne(OfficialContact::class);
    }

    public function identities()
    {
        return $this->hasOne(OfficialIdentity::class);
    }

    public function studies()
    {
        return $this->hasMany(StudyOfficial::class);
    }

    public function positions()
    {
        return $this->hasMany(PositionOfficial::class);
    }

    public function statusLogs()
    {
        return $this->hasMany(OfficialStatusLog::class);
    }


}
