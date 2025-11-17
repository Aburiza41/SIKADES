<?php

namespace App\Exports;

use App\Models\Official;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class RegencyOfficialExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $role;
    protected $request;
    protected $regency;

    public function __construct($role, $request, $regency)
    {
        $this->role = $role;
        $this->request = $request;
        $this->regency = $regency;
    }

    public function collection(): Collection
    {
        $filters = json_decode($this->request->filters ?? '{}', true);

        $query = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies.study', 'positions.position', 'officialTrainings', 'officialOrganizations', 'position_current.position'])
            ->whereHas('village.district.regency', function ($q) {
                $q->where('id', $this->regency->id);
            })
            ->when($this->request->has('search') && $this->request->search !== '', function ($query) {
                $query->where(function ($q) {
                    $q->where('nama_lengkap', 'like', '%' . $this->request->search . '%')
                        ->orWhere('nik', 'like', '%' . $this->request->search . '%')
                        ->orWhere('nipd', 'like', '%' . $this->request->search . '%');
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
            ->when($this->role, function ($query) {
                $query->whereHas('position_current.position', function ($q) {
                    $q->where('slug', $this->role);
                });
            })
            ->orderBy(
                in_array($this->request->sort_field, ['id', 'nama_lengkap', 'nik', 'nipd', 'created_at', 'updated_at']) ? $this->request->sort_field : 'id',
                in_array(strtolower($this->request->sort_direction), ['asc', 'desc']) ? strtolower($this->request->sort_direction) : 'asc'
            );

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'NIK',
            'NIPD',
            'Nama Lengkap',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Status Perkawinan',
            'Agama',
            'Golongan Darah',
            'Pendidikan Terakhir',
            'Alamat',
            'Handphone',
            'Email',
            'BPJS Kesehatan',
            'BPJS Ketenagakerjaan',
            'NPWP',
            'Status',
            'Kecamatan',
            'Desa',
        ];
    }

    public function map($official): array
    {
        return [
            $official->nik,
            $official->nipd,
            $official->nama_lengkap,
            $official->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            $official->tempat_lahir,
            $official->tanggal_lahir,
            $official->status_perkawinan,
            $official->agama,
            $official->gol_darah,
            $official->identities->first()?->pendidikan_terakhir,
            $official->alamat,
            $official->handphone,
            $official->contacts->first()?->email,
            $official->bpjs_kesehatan,
            $official->bpjs_ketenagakerjaan,
            $official->npwp,
            $official->status,
            $official->village?->district?->name_dagri,
            $official->village?->name_dagri,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Style the header row
        $sheet->getStyle('A1:S1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1B5E20'], // Deep Forest Green
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);

        // Auto-size columns
        foreach (range('A', 'S') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return [];
    }
}
