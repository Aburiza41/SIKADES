<?php

namespace App\Http\Controllers\Web\Insert;

use App\Http\Controllers\Controller;
use App\Imports\TestImport;
use App\Models\Official;
use App\Models\Training;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class TrainingController extends Controller
{
    /**
     * Import and process training data from Excel file
     *
     * @return void
     */
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        try {
            $filePath = public_path('data/Data_Pelatihan.xlsx');
            if (!file_exists($filePath)) {
                throw new \Exception("Excel file not found at: {$filePath}");
            }

            $data = Excel::toCollection(new TestImport, $filePath)->first();

            if ($data->isEmpty()) {
                throw new \Exception("No data loaded from Excel file. Check TestImport class configuration.");
            }

            $result = $this->processImport($data);

            // Display results
            $this->displayResults($result);
        } catch (\Exception $e) {
            Log::error('Import failed: ' . $e->getMessage());
            echo "<h2>Error</h2><p>Import failed: {$e->getMessage()}</p>";
        }
    }

    /**
     * Process imported data
     *
     * @param \Illuminate\Support\Collection $data
     * @return array
     */
    protected function processImport($data)
    {
        $result = [
            'success_count' => 0,
            'failed_count' => 0,
            'not_found' => [
                'officials' => [],
                'trainings' => []
            ]
        ];

        foreach ($data as $index => $row) {
            // Normalize row keys to lowercase
            $row = collect($row)->mapWithKeys(function ($value, $key) {
                return [strtolower($key) => $value];
            })->toArray();

            // Stop looping if IDIdentitas is empty
            if (empty($row['ididentitas'])) {
                Log::warning("Stopping loop at row {$index}: Empty IDIdentitas detected");
                echo "Stopping loop at row {$index}: Empty IDIdentitas detected<br>";
                break;
            }

            try {
                // 1. Validate data
                $validationResult = $this->validateTrainingData($row);
                if (!$validationResult['valid']) {
                    $result['not_found']['officials'][] = [
                        'row' => $index,
                        'id_identitas' => $row['ididentitas'],
                        'reason' => $validationResult['reason']
                    ];
                    Log::warning("Failed at row {$index}: ID {$row['ididentitas']} - {$validationResult['reason']}");
                    echo "Failed at row {$index}: ID {$row['ididentitas']} - {$validationResult['reason']}<br>";
                    $result['failed_count']++;
                    continue;
                }

                // 2. Find Official
                $official = $this->findOfficial($row['ididentitas']);
                if (!$official) {
                    $result['not_found']['officials'][] = [
                        'row' => $index,
                        'id_identitas' => $row['ididentitas'],
                        'reason' => 'Official not found'
                    ];
                    Log::warning("Failed at row {$index}: ID {$row['ididentitas']} - Official not found");
                    echo "Failed at row {$index}: ID {$row['ididentitas']} - Official not found<br>";
                    $result['failed_count']++;
                    continue;
                }

                // 3. Find or Create Training
                $training = $this->findOrCreateTraining($row['idjenispelatihan'], $row['namapelatihan']);
                if (!$training) {
                    $result['not_found']['trainings'][] = [
                        'row' => $index,
                        'training' => $row['namapelatihan'],
                        'reason' => 'Training not found'
                    ];
                    Log::warning("Failed at row {$index}: ID {$row['ididentitas']} - Training not found for {$row['namapelatihan']}");
                    echo "Failed at row {$index}: ID {$row['ididentitas']} - Training not found for {$row['namapelatihan']}<br>";
                    $result['failed_count']++;
                    continue;
                }

                // 4. Insert Training Data
                $this->insertTrainingData($official, $training, $row);
                $result['success_count']++;
                Log::info("Success at row {$index}: ID {$row['ididentitas']} - Training data created successfully (Training: {$training->title}" . ($training->title === 'LAINNYA' ? ", Keterangan: {$row['idjenispelatihan']}" : ")"));
                echo "Success at row {$index}: ID {$row['ididentitas']} - Training data created successfully (Training: {$training->title}" . ($training->title === 'LAINNYA' ? ", Keterangan: {$row['idjenispelatihan']}" : ")") . "<br>";

            } catch (\Throwable $th) {
                Log::error("Error processing row {$index}: {$th->getMessage()}", [
                    'id_identitas' => $row['ididentitas'],
                    'data' => $row,
                    'official' => isset($official) ? $official->toArray() : null,
                    'training' => isset($training) ? $training->toArray() : null
                ]);
                echo "Failed at row {$index}: ID {$row['ididentitas']} - Error: {$th->getMessage()}<br>";
                $result['failed_count']++;
                continue;
            }
        }

        return $result;
    }

    /**
     * Validate training data from Excel
     *
     * @param array $data
     * @return array
     */
    protected function validateTrainingData($data)
    {
        if (empty($data['ididentitas'])) {
            return [
                'valid' => false,
                'reason' => 'Missing IDIdentitas'
            ];
        }

        if (empty($data['namapelatihan'])) {
            return [
                'valid' => false,
                'reason' => 'Missing NamaPelatihan'
            ];
        }

        return ['valid' => true];
    }

    /**
     * Find official by identity code
     *
     * @param string|null $idIdentitas
     * @return \App\Models\Official|null
     */
    protected function findOfficial($idIdentitas)
    {
        if (empty($idIdentitas)) {
            return null;
        }

        $cleanId = trim(preg_replace('/\s+/', '', $idIdentitas));
        return Official::where('code_ident', 'like', '%' . $cleanId . '%')->first();
    }

    /**
     * Find training based on type and name, fallback to Lainnya if not in predefined categories
     *
     * @param string|null $type
     * @param string|null $trainingName
     * @return \App\Models\Training|null
     */
    protected function findOrCreateTraining($type, $trainingName)
    {
        $title = $this->mapPelatihan($type);

        // If title is empty or not in predefined categories, fallback to LAINNYA
        if (empty($title) || $title === 'LAINNYA') {
            return Training::where('title', 'LAINNYA')->first();
        }

        // Check if the mapped title exists in the database
        return Training::where('title', $title)->first() ?? Training::where('title', 'LAINNYA')->first();
    }

    /**
     * Insert training data
     *
     * @param \App\Models\Official $official
     * @param \App\Models\Training $training
     * @param array $data
     * @return void
     */
    protected function insertTrainingData($official, $training, $data)
    {
        DB::enableQueryLog();
        try {
            DB::transaction(function () use ($official, $training, $data) {
                $tanggalSertifikat = $this->parseDateString($data['tanggalsertifikat'] ?? null);

                // Skip invalid certificate date (0000-00-00)
                if ($tanggalSertifikat && $tanggalSertifikat->format('Y-m-d') === '0000-00-00') {
                    $tanggalSertifikat = null;
                }

                $insertData = [
                    'official_id' => $official->id,
                    'training_id' => $training->id,
                    'nama' => trim($data['namapelatihan'] ?? '-') ?: '-',
                    'alamat' => trim($data['tempatpelatihan'] ?? null),
                    'penyelenggara' => trim($data['penyelenggara'] ?? null),
                    'nomor_sertifikat' => trim($data['nosertifikat'] ?? null),
                    'tanggal_sertifikat' => $tanggalSertifikat ? $tanggalSertifikat->format('Y-m-d') : null,
                    'keterangan' => $training->title === 'LAINNYA' ? trim($data['idjenispelatihan'] ?? '-') : trim($data['keteranganpelatihan'] ?? null),
                    'doc_scan' => trim($data['filesk'] ?? null),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];

                DB::table('official_trainings')->insert($insertData);
            });
        } catch (\Exception $e) {
            Log::error('Insert training data failed', [
                'error' => $e->getMessage(),
                'queries' => DB::getQueryLog(),
                'data' => $data,
                'official' => $official->toArray(),
                'training' => $training->toArray()
            ]);
            throw $e;
        }
    }

    /**
     * Parse date string with validation
     *
     * @param mixed $dateString
     * @return \Carbon\Carbon|null
     */
    protected function parseDateString($dateString)
    {
        if (empty($dateString) || $dateString === '0000-00-00') {
            return null;
        }

        $cleanDate = trim($dateString);

        try {
            // Handle Excel numeric date
            if (is_numeric($cleanDate)) {
                $date = Date::excelToDateTimeObject($cleanDate);
                return Carbon::instance($date);
            }

            // Handle string date
            $parsedDate = Carbon::parse($cleanDate);

            // Validate date range for MySQL
            if ($parsedDate->year < 1000 || $parsedDate->year > 9999) {
                return null;
            }

            return $parsedDate;
        } catch (\Exception $e) {
            Log::warning("Failed to parse date: {$cleanDate} - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Display import results
     *
     * @param array $result
     * @return void
     */
    protected function displayResults($result)
    {
        echo "<h2>Import Result</h2>";
        echo "<p>Success: {$result['success_count']}</p>";
        echo "<p>Failed: {$result['failed_count']}</p>";

        if (!empty($result['not_found']['officials'])) {
            echo "<h3>Officials not found:</h3><ul>";
            foreach ($result['not_found']['officials'] as $item) {
                echo "<li>Row {$item['row']}: {$item['id_identitas']} - {$item['reason']}</li>";
            }
            echo "</ul>";
        }

        if (!empty($result['not_found']['trainings'])) {
            echo "<h3>Trainings not found:</h3><ul>";
            foreach ($result['not_found']['trainings'] as $item) {
                echo "<li>Row {$item['row']}: {$item['training']} - {$item['reason']}</li>";
            }
            echo "</ul>";
        }
    }

    /**
     * Map training type
     *
     * @param mixed $value
     * @return string
     */
    private function mapPelatihan($value)
    {
        $value = strtolower(trim($value ?? ''));

        $mapping = [
            '7' => 'PELATIHAN / BIMTEK PENYUSUNAN RENSTRA DESA, RKP DESA DAN APBDESA',
            '8' => 'PELATIHAN / BIMTEK PEMBUATAN RPJMDES DAN RKPDES',
            '9' => 'PELATIHAN / BIMTEK PENGELOLAAN DAN PERTANGGUNGJAWABAN KEUANGAN DESA',
            '10' => 'PELATIHAN PENGELOLAAN KEUANGAN DESA BERBASIS SISKEUDES (PEMENDAGRI 20 TAHUN 2018)',
            '11' => 'BIMTEK PRIORITAS DANA DESA SERTA PENGELOLAAN KEUANGAN DESA',
            '12' => 'BIMTEK TENAGA TEKNIS BANTUAN SARANA DAN PRASARANA MELALUI ALOKASI DANA DESA',
            '13' => 'BIMTEK PELAPORAN ADD DAN BAGI HASIL PAJAK RETRIBUSI DAERAH',
            '14' => 'BIMBINGAN TEKNIS PENGELOLAAN KEUANGAN DESA (PERENCANAAN PELAKSANAAN, PENATAUSAHAAN, PELAPORAN, DAN PERTANGGUNGJAWABAN)',
            '15' => 'BIMTEK PERANAN PEMERINTAH DESA DALAM MENINGKATKAN PARTISIPASI MASYARAKAT DI DESA',
            '16' => 'BIMTEK PERENCANAAN PENGANGGARAN DESA',
            '17' => 'BIMTEK KEBIJAKAN PENGALOKASIAN DAN PENYALURAN DANA DESA',
            '18' => 'PELATIHAN / BIMTEK PENYUSUNAN PERENCANAAN PEMBANGUNAN DESA',
            '19' => 'PELATIHAN / BIMTEK PENINGKATAN KAPASITAS PEMERINTAH DESA DAN ANGGOTA BPD',
            '20' => 'BIMTEK PENINGKATAN KAPASISTAS PERANGKAT DESA',
            '21' => 'PELATIHAN KEPEMIMPINAN KEPALA DESA',
            '22' => 'BIMTEK TEKNIK PERCEPATAN PENATAAN KEWENANGAN BAGI KEPALA DESA DAN SEKRETARIS DESA',
            '23' => 'TEKNIK PENYUSUNAN PRODUK HUKUM DESA',
            '24' => 'PENCEGAHAN TINDAK PIDANA KORUPSI BAGI KADES DAN TPK',
            '25' => 'PENYAMAAN PERSEPSI UU NO. 6 TAHUN 2014',
            '26' => 'MASALAH DAN KONFLIK',
            '27' => 'TEKNIS PENGELOLAAN ASET DESA',
            '28' => 'PELATIHAN PENATAAN ADMINISTRASI DESA',
            '29' => 'PELATIHAN PEMBUATAN PROFIL DESA',
            '30' => 'PELATIHAN MANAJEMEN ASET DESA'
        ];

        return $mapping[$value] ?? 'LAINNYA';
    }
}
