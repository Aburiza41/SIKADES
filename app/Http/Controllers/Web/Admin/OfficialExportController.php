<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Exports\AdminOfficialExport;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Excel;

class OfficialExportController extends Controller
{
    // Controller JSON
    function json() : \Illuminate\Http\JsonResponse {
        return response()->json([
            'status' => true,
        ]);
    }

    // Controller Excel
    function excel(Excel $excel, String $role) : \Symfony\Component\HttpFoundation\BinaryFileResponse {
        // dd($role);
        return $excel->download(new AdminOfficialExport( $role ), 'Pejabat_'.$role.'_'.Carbon::now()->format('d-m-Y').'.xlsx');
    }

    // Controller PDF
    function pdf() : \Illuminate\Http\JsonResponse {
        return response()->json([
            'status' => true,
        ]);
    }

}
