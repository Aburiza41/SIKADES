<?php

namespace Database\Factories;

use App\Models\Official;
use Illuminate\Database\Eloquent\Factories\Factory;

class OfficialFactory extends Factory
{
    protected $model = Official::class;

    public function definition()
    {
        return [
            'nik' => $this->faker->numerify('################'), // 16-digit NIK
            'no_kk' => $this->faker->numerify('################'), // 16-digit KK
            'nama' => $this->faker->name(),
            'jenis_kelamin' => $this->faker->randomElement(['L', 'P']),
            'tanggal_lahir' => $this->faker->date(),
            'tempat_lahir' => $this->faker->city(),
            'status_perkawinan' => $this->faker->randomElement(['Belum Menikah', 'Menikah', 'Cerai', 'Duda', 'Janda']),
            'agama' => $this->faker->randomElement(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']),
            'kewarganegaraan' => 'WNI',
            'pendidikan' => $this->faker->randomElement(['SD', 'SMP', 'SMA', 'Diploma', 'Sarjana', 'Magister', 'Doktor']),
            'pekerjaan' => $this->faker->jobTitle(),
            'jabatan' => $this->faker->randomElement(['Kepala Desa', 'Sekretaris', 'Bendahara', 'Staf Teknis']),
            'alamat' => $this->faker->streetAddress(),
            'rt' => $this->faker->numerify('00#'), // RT
            'rw' => $this->faker->numerify('00#'), // RW
            'code_regency' => $this->faker->numerify('####'),
            'name_regency' => $this->faker->city(),
            'code_district' => $this->faker->numerify('####'),
            'name_district' => $this->faker->city(),
            'code_village' => $this->faker->numerify('####'),
            'name_village' => $this->faker->city(),
            'no_hp' => $this->faker->phoneNumber(),
            'email' => $this->faker->unique()->safeEmail(),
            'foto_profil' => $this->faker->imageUrl(200, 200, 'people'),
            'status' => $this->faker->randomElement(['terdaftar', 'diproses', 'terverifikasi']),
            'user_village_id' => 1,
            'user_district_id' => 1,
            'user_regency_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
