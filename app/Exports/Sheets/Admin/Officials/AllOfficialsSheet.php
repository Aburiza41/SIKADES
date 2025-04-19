<?php

namespace App\Exports\Sheets\Admin\Officials;

use App\Models\Official;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class AllOfficialsSheet implements FromQuery, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize  {

    private $role;
    private $index = 0;

    public function __construct($role) {
        $this->role = $role;
    }

    public function query()
    {
        $officials = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies.study', 'positions.position', 'officialOrganizations', 'position_current.position'])
            ->when($this->role, function ($query) {
                $query->whereHas('position_current.position', function ($q) {
                    $q->where('slug', $this->role); // Filter berdasarkan position->slug
                });
            })
            ->orderBy('id', 'asc');


        return $officials;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Pejabat',
            'Jabatan',
            'NIK',
            'Alamat',
            'Tanggal Mulai',
            'Tanggal Selesai',
            'Status'
        ];
    }

    public function map($official): array
    {
        $this->index++;
        return [
            $this->index,
            $official->name,
            $official->nik,
            $official->niad ,
            $official->address,
            $official->created_at->format('d/m/Y'),
            $official->updated_at->format('d/m/Y'),
            $official->status
        ];
    }

    public function styles($sheet)
    {
        return [
            // Style header row
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => '4285F4']
                ]
            ],
            // Format NIK column as text
            'D' => [
                'numberFormat' => [
                    'formatCode' => '@'
                ]
            ],
            // Format date columns
            'F:G' => [
                'numberFormat' => [
                    'formatCode' => 'dd/mm/yyyy'
                ]
            ]
        ];
    }

    public function title(): string
    {
        return ucfirst((str_replace('_', ' ', $this->role)));
    }
}
