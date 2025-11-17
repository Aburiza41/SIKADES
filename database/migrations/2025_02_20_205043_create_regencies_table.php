<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('regencies', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->string('code_bps')->unique()->nullable();
            $table->string('name_bps')->nullable();
            $table->string('code_dagri')->unique()->nullable();
            $table->string('name_dagri')->nullable();
            $table->boolean('active')->default(false)->nullable();
            $table->string('code')->nullable();
            // $table->string('logo_path')->nullable(); // Store file path instead of longText
            $table->longText('description')->nullable();
            // $table->string('website')->nullable();
            $table->timestamps();
        });

        // Insert Dari Data Ini
        // $regencies = [
        //     [
        //         'code_bps' => '6101',
        //         'name_bps' => 'KABUPATEN BENGKAYANG',
        //         'code_dagri' => '6101',
        //         'name_dagri' => 'KABUPATEN BENGKAYANG',
        //         'code' => 'BENGKAYANG',
        //         'active' => true,
        //         'description' => 'Kabupaten Bengkayang terletak di Provinsi Kalimantan Barat, berbatasan dengan Kabupaten Sambas dan Malaysia.'
        //     ],
        //     [
        //         'code_bps' => '6102',
        //         'name_bps' => 'KABUPATEN KAPUAS HULU',
        //         'code_dagri' => '6102',
        //         'name_dagri' => 'KABUPATEN KAPUAS HULU',
        //         'code' => 'KAPUAS_HULU',
        //         'active' => true,
        //         'description' => 'Kabupaten Kapuas Hulu merupakan kabupaten terluas di Kalimantan Barat dengan banyak sungai dan hutan tropis.'
        //     ],
        //     [
        //         'code_bps' => '6103',
        //         'name_bps' => 'KABUPATEN KAYONG UTARA',
        //         'code_dagri' => '6103',
        //         'name_dagri' => 'KABUPATEN KAYONG UTARA',
        //         'code' => 'KAYONG_UTARA',
        //         'active' => true,
        //         'description' => 'Kabupaten Kayong Utara terkenal dengan pantai-pantai indah dan potensi pariwisata alamnya.'
        //     ],
        //     [
        //         'code_bps' => '6104',
        //         'name_bps' => 'KABUPATEN KETAPANG',
        //         'code_dagri' => '6104',
        //         'name_dagri' => 'KABUPATEN KETAPANG',
        //         'code' => 'KETAPANG',
        //         'active' => true,
        //         'description' => 'Kabupaten Ketapang memiliki garis pantai panjang dan kaya akan sumber daya alam laut.'
        //     ],
        //     [
        //         'code_bps' => '6105',
        //         'name_bps' => 'KABUPATEN KUBU RAYA',
        //         'code_dagri' => '6105',
        //         'name_dagri' => 'KABUPATEN KUBU RAYA',
        //         'code' => 'KUBU_RAYA',
        //         'active' => true,
        //         'description' => 'Kabupaten Kubu Raya berdekatan dengan Kota Pontianak dan memiliki peran strategis dalam ekonomi regional.'
        //     ],
        //     [
        //         'code_bps' => '6106',
        //         'name_bps' => 'KABUPATEN LANDAK',
        //         'code_dagri' => '6106',
        //         'name_dagri' => 'KABUPATEN LANDAK',
        //         'code' => 'LANDAK',
        //         'active' => true,
        //         'description' => 'Kabupaten Landak kaya akan budaya Dayak dan tradisi lokal yang masih terjaga.'
        //     ],
        //     [
        //         'code_bps' => '6107',
        //         'name_bps' => 'KABUPATEN MELAWI',
        //         'code_dagri' => '6107',
        //         'name_dagri' => 'KABUPATEN MELAWI',
        //         'code' => 'MELAWI',
        //         'active' => true,
        //         'description' => 'Kabupaten Melawi memiliki potensi pertanian dan perkebunan yang besar.'
        //     ],
        //     [
        //         'code_bps' => '6108',
        //         'name_bps' => 'KABUPATEN MEMPAWAH',
        //         'code_dagri' => '6108',
        //         'name_dagri' => 'KABUPATEN MEMPAWAH',
        //         'code' => 'MEMPAWAH',
        //         'active' => true,
        //         'description' => 'Kabupaten Mempawah terkenal dengan Keraton Mempawah dan warisan sejarahnya.'
        //     ],
        //     [
        //         'code_bps' => '6109',
        //         'name_bps' => 'KABUPATEN SAMBAS',
        //         'code_dagri' => '6109',
        //         'name_dagri' => 'KABUPATEN SAMBAS',
        //         'code' => 'SAMBAS',
        //         'active' => true,
        //         'description' => 'Kabupaten Sambas memiliki sejarah panjang sebagai kerajaan Islam tertua di Kalimantan.'
        //     ],
        //     [
        //         'code_bps' => '6110',
        //         'name_bps' => 'KABUPATEN SANGGAU',
        //         'code_dagri' => '6110',
        //         'name_dagri' => 'KABUPATEN SANGGAU',
        //         'code' => 'SANGGAU',
        //         'active' => true,
        //         'description' => 'Kabupaten Sanggau merupakan pusat pendidikan dan agama Katolik di Kalimantan Barat.'
        //     ],
        //     [
        //         'code_bps' => '6111',
        //         'name_bps' => 'KABUPATEN SEKADAU',
        //         'code_dagri' => '6111',
        //         'name_dagri' => 'KABUPATEN SEKADAU',
        //         'code' => 'SEKADAU',
        //         'active' => true,
        //         'description' => 'Kabupaten Sekadau memiliki potensi pertambangan dan pertanian yang menjanjikan.'
        //     ],
        //     [
        //         'code_bps' => '6112',
        //         'name_bps' => 'KABUPATEN SINTANG',
        //         'code_dagri' => '6112',
        //         'name_dagri' => 'KABUPATEN SINTANG',
        //         'code' => 'SINTANG',
        //         'active' => true,
        //         'description' => 'Kabupaten Sintang dikenal sebagai Kota Terpadu Kerajaan dan pusat perdagangan regional.'
        //     ]
        // ];

        // // Clear table dan reset auto increment
        // DB::table('regencies')->truncate();
        // DB::statement('ALTER TABLE regencies AUTO_INCREMENT = 1');

        // // Insert data dengan timestamp
        // foreach ($regencies as $regency) {
        //     DB::table('regencies')->insert(array_merge($regency, [
        //         'created_at' => Carbon::now(),
        //         'updated_at' => Carbon::now()
        //     ]));
        // }

        // Belongs to One
        Schema::create('user_regencies', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('regency_id')->constrained('regencies')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regencies');
        Schema::dropIfExists('user_regencies');
    }
};
