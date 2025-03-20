<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficialOrganization extends Model
{
    // HasFactory
    protected $fillable = [
        'official_id',
        'organization_id',
        'doc_scan',
        'nama',
        'posisi',
        'keterangan',
    ];

    protected $hidden = [
        'id',
    ];

    // Relation
    public function official()
    {
        return $this->belongsTo(Official::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }


}
