<?php

namespace App\Http\Controllers;

use App\Imports\TestImport;
use App\Models\Village;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class TestController extends Controller
{
    public function index(Request $request)
    {
        // Config untuk handle data besar
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('Data_SIKADES.xlsx');

        // Baca data Excel dengan chunk
        $data = Excel::toCollection(new TestImport, $filePath)->first();
        $totalData = $data->count();
        $processed = 0;
        $successCount = 0;
        $failedData = [];

        foreach ($data as $row) {
            $processed++;

            // Update progress setiap 100 data
            if ($processed % 100 === 0) {
                $progress = round(($processed / $totalData) * 100, 2);
                echo "\n";
                echo "Processing: {$progress}% ({$processed}/{$totalData})\n";
                flush();
                ob_flush();
                echo "\n";
            }

            try {
                $village = Village::where('code_dagri', $this->convertVillageId($row['village_id']))->first();

                if (!$village) {
                    throw new \Exception("Village not found for code: {$row['village_id']}");
                }

                DB::table('officials')->insert([
                    'village_id' => $village->id ?? null,
                    'nik' => $row['nik'] ?? null,
                    'code_ident' => $row['id_ident'] ?? null,
                    'nipd' => $row['no_induk'] ?? null,
                    'nama_lengkap' => $row['nama_lengkap'] ?? null,
                    'gelar_depan' => $row['gelar_dpn'] ?? null,
                    'gelar_belakang' => $row['gelar_blkng'] ?? null,
                    'tempat_lahir' => $row['tmpt_lahir'] ?? null,
                    'tanggal_lahir' => Date::excelToDateTimeObject($row['tgl_lahir']) ?? null,
                    'jenis_kelamin' => $row['jenis_kelamin'] == 'Laki-laki' ? 'L' : 'P' ?? null,
                    'agama' => $row['agama'] ?? null,
                    'status_perkawinan' => $row['status_perkawinan'] ?? null,
                    'status' => 'daftar',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $successCount++;
            } catch (\Throwable $th) {
                // Simpan data yang gagal beserta errornya
                $failedData[] = [
                    'row_data' => $row->toArray(),
                    'error' => $th->getMessage()
                ];

                // Log error untuk debugging
                \Log::error("Failed to import row {$processed}: " . $th->getMessage());
            }

        }

        // Simpan data yang gagal ke file/log
        $this->saveFailedData($failedData);

        if (!empty($failedData)) {
            echo "\n\n<pre>=== DATA YANG GAGAL DIIMPORT ===\n";
            foreach ($failedData as $index => $failed) {
                echo "\n=== Row Gagal #" . ($index + 1) . " ===\n";
                echo "Error: " . $failed['error'] . "\n";
                echo "Data:\n";
                print_r($failed['row_data']);
            }
            echo "</pre>\n\n";
        }

        return response()->json([
            'status' => 'completed',
            'total_data' => $totalData,
            'processed' => $processed,
            'success_count' => $successCount,
            'failed_count' => count($failedData),
            'failed_samples' => array_slice($failedData, 0, 5) // Contoh beberapa data gagal
        ]);
    }

    private function saveFailedData(array $failedData)
    {
        if (!empty($failedData)) {
            $fileName = 'failed_imports_' . date('Ymd_His') . '.json';
            $filePath = storage_path('logs/' . $fileName);
            file_put_contents($filePath, json_encode($failedData, JSON_PRETTY_PRINT));
        }
    }

    private function convertVillageId($villageId)
    {
        if (empty($villageId)) return null;

        $villageStr = (string)$villageId;

        if (strlen($villageStr) !== 10) return null;

        return implode('.', [
            substr($villageStr, 0, 2),  // province
            substr($villageStr, 2, 2),  // regency
            substr($villageStr, 4, 2),  // district
            substr($villageStr, 6, 4)   // village
        ]);
    }
}
