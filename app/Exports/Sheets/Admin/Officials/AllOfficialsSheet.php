<?php

namespace App\Exports\Sheets\Admin\Officials;

use App\Models\Official;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AllOfficialsSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    private $role;
    private $request;
    private $index = 0;

    public function __construct($role, $request)
    {
        $this->role = $role;
        $this->request = $request;
    }

    public function collection()
    {
        $query = Official::with([
                'village.district.regency',
                'addresses',
                'contacts',
                'identities',
                'studies.study',
                'positions.position',
                'officialTrainings',
                'officialOrganizations',
                'position_current.position'
            ])
            ->when($this->request->search, function ($query) {
                $query->where(function ($q) {
                    $q->where('nama_lengkap', 'like', '%'.$this->request->search.'%')
                      ->orWhere('nik', 'like', '%'.$this->request->search.'%')
                      ->orWhere('niad', 'like', '%'.$this->request->search.'%');
                });
            })
            ->when($this->request->filters, function ($query) {
                $query->whereHas('identities', function ($q) {
                    $q->where('pendidikan', $this->request->filters);
                });
            })
            ->when($this->role, function ($query) {
                $query->whereHas('position_current.position', function ($q) {
                    $q->where('slug', $this->role);
                });
            })
            ->orderBy(
                $this->request->sort_field ?? 'id',
                $this->request->sort_direction ?? 'asc'
            );

        // If you need pagination (not recommended for exports)
        if ($this->request->per_page) {
            return $query->paginate($this->request->per_page)->getCollection();
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Lengkap',
            'NIK',
            'NIAD',
            'Jabatan',
            'Alamat',
            'Tanggal Dibuat',
            'Tanggal Diupdate',
            'Status'
        ];
    }

    public function map($official): array
    {
        return [
            ++$this->index,
            $official->nama_lengkap ?? '-',
            "'" . ($official->nik ?? '-'), // Prepend with ' to preserve leading zeros
            "'" . ($official->niad ?? '-'),
            $official->position_current->position->name ?? '-',
            $official->addresses->first()->alamat_lengkap ?? '-',
            $official->created_at?->format('d/m/Y') ?? '-',
            $official->updated_at?->format('d/m/Y') ?? '-',
            $official->status ? 'Aktif' : 'Non-Aktif'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [ // Header row
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4285F4']
                ]
            ],
            'C:D' => [ // NIK and NIAD columns as text
                'numberFormat' => [
                    'formatCode' => '@'
                ]
            ],
            'G:H' => [ // Date columns
                'numberFormat' => [
                    'formatCode' => 'dd/mm/yyyy'
                ]
            ]
        ];
    }

    public function title(): string
    {
        return ucfirst(str_replace('_', ' ', $this->role));
    }
}
