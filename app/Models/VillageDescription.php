<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VillageDescription extends Model
{
    //
    // Schema::create('village_descriptions', function (Blueprint $table) {
    //     $table->id(); // Primary key
    //     $table->foreignId('village_id')->constrained('villages')->onDelete('cascade');
    //     $table->string('score_idm')->nullable();
    //     $table->string('status_idm')->nullable();
    //     $table->string('score_prodeskel')->nullable();
    //     $table->string('score_epdeskel')->nullable(); //
    //     $table->string('status')->nullable(); // Status Pengembangan
    //     $table->longText('classification')->nullable(); // Klasifikasi
    //     // Years Unique
    //     $table->string('year')->unique();
    //     $table->timestamps();
    // });

    protected $fillable = [
        'village_id',
        'score_idm',
        'status_idm',
        'score_prodeskel',
        'score_epdeskel',
        'status',
        'classification',
        'year',
        'created_at',
        'updated_at',
    ];

    // Relation
    public function village()
    {
        return $this->belongsTo(Village::class, 'village_id', 'id');
    }
}
