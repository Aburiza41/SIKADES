<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithLimit;

class TestImport implements ToCollection, WithHeadingRow, WithLimit
{
    public function limit(): int
    {
        return 50000; // 1 header row + 10 data rows
    }

    public function collection(Collection $collection)
    {
        // Process your 10 data rows here
        // $collection will contain exactly 11 rows (1 header + 10 data)
        return $collection;
    }

    public function headingRow(): int
    {
        return 1; // Header is in row 1
    }
}
