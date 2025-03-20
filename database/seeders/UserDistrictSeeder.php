<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserDistrictSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate Admin Kecamatan Berdasarkan Data Kecamatan
        $districts = District::all();

        foreach ($districts as $district) {
            // Create User District
            $email = strtolower(str_replace(' ', '', $district->name_bps)) .$district->code_bps. '@sikades.kalbarprov.app';

            $user = User::factory()->create([
                'name' => 'Admin ' . $district->name_bps,
                'email' => $email,
                'role' => 'district',
            ]);

            // Insert into user_districts table
            DB::table('user_districts')->insert([
                'user_id' => $user->id,
                'district_id' => $district->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
