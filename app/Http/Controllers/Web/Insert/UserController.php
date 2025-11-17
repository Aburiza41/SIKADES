<?php

namespace App\Http\Controllers\Web\Insert;
use App\Http\Controllers\Controller;
use App\Imports\TestImport;
use App\Models\User;
use App\Models\Village;
use App\Models\Regency;
use App\Models\District;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class UserController extends Controller
{
    /**
     * Import users from Excel file and process them.
     *
     * @return void
     */
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('data/Data_User.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath)->first();

        $success_count = 0;
        $failed_count = 0;
        $not_found = [
            'users' => [],
            'villages' => [],
            'regencies' => [],
        ];

        foreach ($data as $k_user => $v_user) {
            $v_user = $v_user->toArray();
            // Stop looping if ID is empty
            if (empty($v_user['id'])) {
                echo "Stopping loop at row {$k_user}: Empty ID detected for username {$v_user['username']} (Name: {$v_user['nama']})<br>";
                break;
            }

            try {
                $validationResult = $this->validateUserData($v_user);
                if (!$validationResult['valid']) {
                    $not_found['users'][] = [
                        'row' => $k_user,
                        'username' => $v_user['username'] ?? 'Unknown',
                        'reason' => $validationResult['reason'],
                    ];
                    echo "Failed at row {$k_user}: Username {$v_user['username']} (Name: {$v_user['nama']}) - {$validationResult['reason']}<br>";
                    $failed_count++;
                    continue;
                }

                $village = null;
                $email = $validationResult['email'];
                if ($validationResult['role'] === 'village') {
                    $village = $this->findVillage($v_user['village'] ?? null);
                    if (!$village) {
                        Log::warning("Village not found for row {$k_user}", [
                            'village_code' => $v_user['village'] ?? 'Unknown',
                        ]);
                        $not_found['villages'][] = [
                            'row' => $k_user,
                            'village_code' => $v_user['village'] ?? 'Unknown',
                        ];
                        echo "Failed at row {$k_user}: Username {$v_user['username']} (Name: {$v_user['nama']}) - Village not found: {$v_user['village']}<br>";
                        $failed_count++;
                        continue;
                    }
                }

                $regency = null;
                if ($validationResult['role'] === 'regency') {
                    $regency = $this->findRegency($v_user['regency'] ?? null);
                    if (!$regency) {
                        $not_found['regencies'][] = [
                            'row' => $k_user,
                            'regency_code' => $v_user['regency'] ?? 'Unknown',
                        ];
                        echo "Failed at row {$k_user}: Username {$v_user['username']} (Name: {$v_user['nama']}) - Regency not found: {$v_user['regency']}<br>";
                        $failed_count++;
                        continue;
                    }
                }

                $this->insertUser($v_user, $validationResult['role'], $village, $regency, $email, $validationResult['username']);
                $success_count++;
                // echo "Success at row {$k_user}: Username {$v_user['username']} (Name: {$v_user['nama']}) - User created successfully<br>";
            } catch (\Throwable $th) {
                Log::error("Error processing row {$k_user}: {$th->getMessage()}", [
                    'data' => $v_user,
                    'village' => $village ? $village->toArray() : null,
                    'regency' => $regency ? $regency->toArray() : null,
                ]);
                echo "Failed at row {$k_user}: Username {$v_user['username']} (Name: {$v_user['nama']}) - Error: {$th->getMessage()}<br>";
                $failed_count++;
            }
        }

        // Display not found data
        $this->displayNotFound($not_found);

        // Display results
        // return view('import.results', compact('success_count', 'failed_count', 'not_found'));
    }

    /**
     * Validate user data from Excel.
     *
     * @param array $data
     * @return array
     */
    protected function validateUserData($data)
    {
        $baseUsername = strtolower(trim($data['username'] ?? ''));
        $username = $baseUsername;
        $email = $username . '@sikades.com';

        if (empty($data['nama']) || empty($data['username']) || empty($data['password'])) {
            return [
                'valid' => false,
                'reason' => 'Missing required fields: ' . implode(', ', array_filter([
                    empty($data['nama']) ? 'name' : null,
                    empty($data['username']) ? 'username' : null,
                    empty($data['password']) ? 'password' : null,
                ])),
            ];
        }

        $roleMapping = [
            'desa' => 'village',
            'superadmin' => 'admin',
            'kabupaten' => 'regency',
        ];
        $role = $roleMapping[strtolower($data['level'] ?? '')] ?? strtolower($data['level'] ?? '');
        $validRoles = ['admin', 'regency', 'village'];

        if (!in_array($role, $validRoles)) {
            return ['valid' => false, 'reason' => "Invalid role: {$role}"];
        }

        // Handle duplicate usernames
        $attempt = 0;
        while (User::where('username', $username)->exists()) {
            $attempt++;
            if ($attempt > 100) {
                return ['valid' => false, 'reason' => "Cannot generate unique username for: {$baseUsername}"];
            }
            $randomSuffix = str_pad(mt_rand(0, 99), 2, '0', STR_PAD_LEFT);
            $username = $baseUsername . $randomSuffix;
            $email = $username . '@sikades.com'; // Default email for non-village roles
        }

        // Generate final email for village or regency roles
        if ($role === 'village') {
            $village = $this->findVillage($data['village'] ?? null);
            if ($village) {
                $baseEmail = strtolower(str_replace(' ', '', $village->name_bps)) . $village->code_bps . '@sikades.com';
                $email = $baseEmail;
                $attempt = 0;
                while (User::where('email', $email)->exists()) {
                    $attempt++;
                    if ($attempt > 100) {
                        return ['valid' => false, 'reason' => "Cannot generate unique email for: {$baseEmail}"];
                    }
                    $randomSuffix = str_pad(mt_rand(0, 99), 2, '0', STR_PAD_LEFT);
                    $email = $baseEmail . $randomSuffix;
                }
            }
        } elseif ($role === 'regency') {
            $regency = $this->findRegency($data['regency'] ?? null);
            if ($regency) {
                $baseEmail = strtolower(str_replace(' ', '', $regency->name_bps)) . '@sikades.com';
                $email = $baseEmail;
                $attempt = 0;
                while (User::where('email', $email)->exists()) {
                    $attempt++;
                    if ($attempt > 100) {
                        return ['valid' => false, 'reason' => "Cannot generate unique email for: {$baseEmail}"];
                    }
                    $randomSuffix = str_pad(mt_rand(0, 99), 2, '0', STR_PAD_LEFT);
                    $email = $baseEmail . $randomSuffix;
                }
            }
        }

        if (User::where('email', $email)->exists()) {
            return ['valid' => false, 'reason' => "Email already exists: {$email}"];
        }

        if (isset($data['status']) && !in_array($data['status'], ['0', '1'])) {
            return ['valid' => false, 'reason' => "Invalid status: {$data['status']}"];
        }

        return [
            'valid' => true,
            'role' => $role,
            'username' => $username,
            'email' => $email
        ];
    }

    /**
     * Format village or regency code to XX.XX.XX.XXXX format.
     *
     * @param mixed $code
     * @return string|null
     */
    protected function formatKode($code)
    {
        if (!is_numeric($code) || strlen($code) !== 10) {
            return null;
        }

        return sprintf(
            "%s.%s.%s.%s",
            substr($code, 0, 2),
            substr($code, 2, 2),
            substr($code, 4, 2),
            substr($code, 6, 4)
        );
    }

    /**
     * Find village by BPS or DAGRI code.
     *
     * @param mixed $villageCode
     * @return \App\Models\Village|null
     */
    protected function findVillage($villageCode)
    {
        if (empty($villageCode) || $villageCode === '0') {
            return null;
        }

        $cleanCode = trim($villageCode);
        $formattedCode = $this->formatKode($cleanCode);

        $village = Village::with('district.regency')
            ->where('code_bps', $cleanCode)
            ->orWhere('code_dagri', $cleanCode)
            ->orWhere('code', $cleanCode)
            ->when($formattedCode, function ($query) use ($formattedCode) {
                return $query->orWhere('code_bps', $formattedCode)
                             ->orWhere('code_dagri', $formattedCode)
                             ->orWhere('code', $formattedCode);
            })
            ->first();

        // If village not found, try to parse the code and create/find related district/regency
        if (!$village && strlen($cleanCode) === 10) {
            $village = $this->parseAndCreateVillage($cleanCode);
        }

        return $village;
    }

    /**
     * Parse village code and create/find related district and regency if needed.
     *
     * @param string $villageCode
     * @return \App\Models\Village|null
     */
    protected function parseAndCreateVillage($villageCode)
    {
        // Parse codes: 6112072001 -> Regency: 6112, District: 611207, Village: 6112072001
        $regencyCode = substr($villageCode, 0, 4); // 6112
        $districtCode = substr($villageCode, 0, 6); // 611207
        $villageCodeFull = $villageCode; // 6112072001

        // Find or create regency
        $regency = Regency::where('code_bps', $regencyCode)
            ->orWhere('code_dagri', $regencyCode)
            ->orWhere('code', $regencyCode)
            ->first();

        if (!$regency) {
            // Create regency if not exists
            // $regency = Regency::create([
            //     'code_bps' => $regencyCode,
            //     'name_bps' => 'Kabupaten ' . $regencyCode, // Placeholder name
            //     'code' => $regencyCode,
            //     'active' => true,
            // ]);
            Log::info("Created regency: {$regencyCode}");
        }

        // Find or create district
        $district = District::where('code_bps', $districtCode)
            ->orWhere('code_dagri', $districtCode)
            ->orWhere('code', $districtCode)
            ->first();

        if (!$district) {
            // Create district if not exists
            $district = District::create([
                'regency_id' => $regency->id,
                'code_bps' => $districtCode,
                'name_bps' => 'Kecamatan ' . $districtCode, // Placeholder name
                'code' => $districtCode,
                'active' => true,
            ]);
            Log::info("Created district: {$districtCode}");
        }

        // Find or create village
        $village = Village::where('code_bps', $villageCodeFull)
            ->orWhere('code_dagri', $villageCodeFull)
            ->orWhere('code', $villageCodeFull)
            ->first();

        if (!$village) {
            // Create village if not exists
            // $village = Village::create([
            //     'district_id' => $district->id,
            //     'code_bps' => $villageCodeFull,
            //     'name_bps' => 'Desa ' . $villageCodeFull, // Placeholder name
            //     'code' => $villageCodeFull,
            //     'active' => true,
            // ]);
            Log::info("Created village: {$villageCodeFull}");
        }

        return $village->load('district.regency');
    }

    /**
     * Find regency by BPS or DAGRI code.
     *
     * @param mixed $regencyCode
     * @return \App\Models\Regency|null
     */
    protected function findRegency($regencyCode)
    {
        if (empty($regencyCode) || $regencyCode === '0') {
            return null;
        }

        $cleanCode = trim($regencyCode);
        return Regency::where('code_bps', $cleanCode)
            ->orWhere('code_dagri', $cleanCode)
            ->orWhere('code', $cleanCode)
            ->first();
    }

    /**
     * Insert user and their relations into the database using Eloquent.
     *
     * @param array $data
     * @param string $role
     * @param \App\Models\Village|null $village
     * @param \App\Models\Regency|null $regency
     * @param string $email
     * @param string $username
     * @return void
     */
    protected function insertUser($data, $role, $village = null, $regency = null, $email, $username)
    {
        DB::enableQueryLog();
        try {
            DB::transaction(function () use ($data, $role, $village, $regency, $email, $username) {
                $user = User::create([
                    'name' => trim($data['nama']),
                    'username' => str_replace(' ', '', $username),
                    'email' => $email,
                    'avatar' => $data['avatar'] ?? null,
                    'password' => Hash::make(trim($data['password'])),
                    'role' => $role,
                ]);

                Log::debug('User model details', [
                    'class' => get_class($user),
                    'methods' => get_class_methods($user),
                    'has_villages' => method_exists($user, 'villages'),
                    'has_regencies' => method_exists($user, 'regencies'),
                ]);

                if ($role === 'village' && $village) {
                    if (!method_exists($user, 'villages')) {
                        throw new \Exception('villages relationship missing in User model');
                    }
                    $user->villages()->attach($village->id);
                    $village->update(['active' => true]);

                    if ($village->district) {
                        $village->district->update(['active' => true]);
                    }

                    if ($village->district && $village->district->regency) {
                        $village->district->regency->update(['active' => true]);
                    }
                }

                if ($role === 'regency' && $regency) {
                    if (!method_exists($user, 'regencies')) {
                        throw new \Exception('regencies relationship missing in User model');
                    }
                    $user->regencies()->attach($regency->id);
                    $regency->update(['active' => true]);
                }
            });
        } catch (\Throwable $th) {
            Log::error('Insert user failed', [
                'error' => $th->getMessage(),
                'queries' => DB::getQueryLog(),
                'data' => $data,
                'village' => $village ? $village->toArray() : null,
                'regency' => $regency ? $regency->toArray() : null,
            ]);
            throw $th;
        }
    }

    /**
     * Display data that was not found during processing.
     *
     * @param array $not_found
     * @return void
     */
    protected function displayNotFound($not_found)
    {
        if (!empty($not_found['users'])) {
            echo "<h3>Users not found or invalid:</h3><ul>";
            foreach ($not_found['users'] as $item) {
                echo "<li>Row {$item['row']}: {$item['username']} ({$item['reason']})</li>";
            }
            echo "</ul>";
        }

        if (!empty($not_found['villages'])) {
            echo "<h3>Villages not found:</h3><ul>";
            foreach ($not_found['villages'] as $item) {
                echo "<li>Row {$item['row']}: {$item['village_code']}</li>";
            }
            echo "</ul>";
        }

        if (!empty($not_found['regencies'])) {
            echo "<h3>Regencies not found:</h3><ul>";
            foreach ($not_found['regencies'] as $item) {
                echo "<li>Row {$item['row']}: {$item['regency_code']}</li>";
            }
            echo "</ul>";
        }
    }
}
