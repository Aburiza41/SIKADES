<?php

namespace Database\Seeders;

use App\Models\Regency;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserRegencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate Admin Kabupaten Berdasarkan Data Kabupaten
        $regencies = Regency::all();

        foreach ($regencies as $regency) {
            // Create User Regency
            $email = strtolower(str_replace(' ', '', $regency->name_bps)) .$regency->code_bps. '@sikades.kalbarprov.app';

            $user = User::factory()->create([
                'name' => $regency->name_bps,
                'username' => strtolower(str_replace(' ', '', $regency->name_bps)) .$regency->code_bps,
                'email' => $email,
                'role' => 'regency',
            ]);

            // Insert into user_regencies table
            DB::table('user_regencies')->insert([
                'user_id' => $user->id,
                'regency_id' => $regency->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
