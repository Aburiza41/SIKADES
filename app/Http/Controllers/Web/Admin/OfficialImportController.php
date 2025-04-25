<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// use App\Exports\AdminOfficialExport;
use App\Models\Official;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class OfficialImportController extends Controller
{
    // Controller JSON
    function json(Request $request, String $role)
    {
    }

    // Controller Excel
    function excel(Request $request, String $role)
    {

    }

    // Controller PDF
    function pdf(Request $request, string $role)
    {
    }
}
