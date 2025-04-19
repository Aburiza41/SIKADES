<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

use App\Exports\Sheets\Admin\Officials\AllOfficialsSheet;

class AdminOfficialExport implements WithMultipleSheets
{
    use Exportable;

    private $role;

    public function __construct(String $role) {
        $this->role = $role;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function sheets() : array
    {
        // return \App\Models\Official::all();
        return [
            new AllOfficialsSheet( $this->role )
        ];
    }
}
