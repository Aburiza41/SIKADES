<?php

namespace App\Imports\Officials;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class OfficialsImport implements ToCollection
{
    /**
    * @param Collection $collection
    */
    public function collection(Collection $collection)
    {
        //
    }
}
