<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Imports\Officials\OfficialsImport;
use Illuminate\Http\Request;

// use App\Exports\AdminOfficialExport;
use App\Models\Official;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

// use Maatwebsite\Excel\Facades\Excel;

class OfficialImportController extends Controller
{
    // Controller Excel
    function excel(Request $request, String $role)
    {
        // dd($request->all(), $role);
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120' // 5MB
        ]);

        try {
            $file = $request->file('file');

            // Menggunakan Laravel Excel untuk mengimport
            $import = new OfficialsImport($role);
            $data = Excel::toArray($import, $file);
            // dd($data);

            // $data[0] berisi array dari sheet pertama
            return response()->json([
                'success' => true,
                'data' => $data[0],
                'role' => $role,
                'message' => 'File berhasil diproses'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

}
