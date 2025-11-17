<?php

namespace App\Http\Controllers\Web\Regency;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Exports\RegencyOfficialExport;
use App\Models\Official;
use App\Models\Regency;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class OfficialExportController extends Controller
{
    // Controller JSON
    function json(Request $request, String $role): \Illuminate\Http\Response|\Symfony\Component\HttpFoundation\StreamedResponse
    {
        try {
            Log::info('Request parameters:', $request->all());

            $user = Auth::user();
            $regency = Regency::where('id', $user->user_regency->regency_id)->first();

            if (!$regency) {
                abort(403, 'Regency not found');
            }

            $filters = json_decode($request->filters ?? '{}', true);

            $officials = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies.study', 'positions.position', 'officialTrainings', 'officialOrganizations', 'position_current.position'])
                ->whereHas('village.district.regency', function ($q) use ($regency) {
                    $q->where('id', $regency->id);
                })
                ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
                    $query->where(function ($q) use ($request) {
                        $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                            ->orWhere('nik', 'like', '%' . $request->search . '%')
                            ->orWhere('niad', 'like', '%' . $request->search . '%');
                    });
                })
                ->when(!empty($filters['kecamatan']), function ($query) use ($filters) {
                    $query->whereHas('village.district', function ($q) use ($filters) {
                        $q->where('id', $filters['kecamatan']);
                    });
                })
                ->when(!empty($filters['desa']), function ($query) use ($filters) {
                    $query->where('village_id', $filters['desa']);
                })
                ->when(!empty($filters['education']), function ($query) use ($filters) {
                    $query->whereHas('identities', function ($q) use ($filters) {
                        $q->where('pendidikan_terakhir', $filters['education']);
                    });
                })
                ->when($role, function ($query) use ($role) {
                    $query->whereHas('position_current.position', function ($q) use ($role) {
                        $q->where('slug', $role);
                    });
                })
                ->orderBy(
                    in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
                    in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
                )
                ->get();

            $current_page = $request->page ?? 1;
            $officials = $officials->skip(($current_page - 1) * ($request->per_page ?? 10))->take($request->per_page ?? 10)->values();

            // Generate filename with request parameters
            $role = strtoupper(str_replace('-', '_', $role));
            $filename = 'Pejabat_' . $role . '_Halaman_' . $current_page . '_' . Carbon::now()->format('d_M_Y') . '.json';

            return response()->streamDownload(function () use ($officials) {
                echo json_encode($officials, JSON_PRETTY_PRINT);
            }, $filename, [
                'Content-Type' => 'application/json',
            ]);
        } catch (\Throwable $th) {
            Log::error('JSON Export Error: ' . $th->getMessage());
            abort(500, 'Failed to generate JSON');
        }
    }

    // Controller Excel
    function excel(Request $request, String $role): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $user = Auth::user();
        // dd($user->user_regency->regency_id);
        $regency = Regency::where('id', $user->user_regency->regency_id)->first();
        // dd($regency);
        // if (!$regency) {
        //     abort(403, 'Regency not found');
        // }

        // Generate filename with request parameters
        $current_page = $request->page ?? 1;
        $role = strtoupper(str_replace('-', '_', $role));
        $filename = 'Pejabat_' . $role . '_Halaman_' . $current_page . '_' . Carbon::now()->format('d_M_Y') . '.xlsx';

        return Excel::download(new RegencyOfficialExport($role, $request, $regency), $filename);
    }

    // Controller PDF
    function pdf(Request $request, string $role): Response
    {
        try {
            Log::info('Request parameters:', $request->all());

            $user = Auth::user();
            $regency = Regency::where('id', $user->user_regency->regency_id)->first();

            if (!$regency) {
                abort(403, 'Regency not found');
            }

            $filters = json_decode($request->filters ?? '{}', true);

            $officials = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies.study', 'positions.position', 'officialTrainings', 'officialOrganizations', 'position_current.position'])
                ->whereHas('village.district.regency', function ($q) use ($regency) {
                    $q->where('id', $regency->id);
                })
                ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
                    $query->where(function ($q) use ($request) {
                        $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                            ->orWhere('nik', 'like', '%' . $request->search . '%')
                            ->orWhere('niad', 'like', '%' . $request->search . '%');
                    });
                })
                ->when(!empty($filters['kecamatan']), function ($query) use ($filters) {
                    $query->whereHas('village.district', function ($q) use ($filters) {
                        $q->where('id', $filters['kecamatan']);
                    });
                })
                ->when(!empty($filters['desa']), function ($query) use ($filters) {
                    $query->where('village_id', $filters['desa']);
                })
                ->when(!empty($filters['education']), function ($query) use ($filters) {
                    $query->whereHas('identities', function ($q) use ($filters) {
                        $q->where('pendidikan_terakhir', $filters['education']);
                    });
                })
                ->when($role, function ($query) use ($role) {
                    $query->whereHas('position_current.position', function ($q) use ($role) {
                        $q->where('slug', $role);
                    });
                })
                ->orderBy(
                    in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
                    in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
                )
                ->get();

            $current_page = $request->page ?? 1;
            $officials = $officials->skip(($current_page - 1) * ($request->per_page ?? 10))->take($request->per_page ?? 10)->values();

            // Generate filename with request parameters
            $role = strtoupper(str_replace('-', '_', $role));
            $filename = 'Pejabat_' . $role . '_Halaman_' . $current_page . '_' . Carbon::now()->format('d_M_Y') . '.pdf';

            return Pdf::loadView('pdf.officials', [
                'title' => 'Daftar Pejabat - ' . ucfirst($role),
                'officials' => $officials,
                'tanggal' => now()->format('d F Y'),
            ])
                ->setPaper('a4', 'landscape')
                ->download($filename);
        } catch (\Exception $e) {
            Log::error('PDF Export Error: ' . $e->getMessage());
            abort(500, 'Failed to generate PDF');
        }
    }
}
