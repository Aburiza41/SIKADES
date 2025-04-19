<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

use App\Exports\Sheets\Admin\Officials\AllOfficialsSheet;

class AdminOfficialExport implements WithMultipleSheets
{
    use Exportable;

    private $role;
    private $request;

    public function __construct(String $role, Object $request) {
        $this->role = $role;
        $this->request = $request;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function sheets() : array
    {
        // return \App\Models\Official::all();
        return [
            new AllOfficialsSheet( $this->role, $this->request ),
        ];
    }
}
