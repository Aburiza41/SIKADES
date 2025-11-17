<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Position;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function getPositions(Request $request)
    {
        $positions = Position::select('id', 'name', 'level', 'parent_id')
            ->when($request->filled('level_lt'), function ($query) use ($request) {
                $query->where('level', '<', $request->level_lt);
            })
            ->orderBy('level')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $positions
        ]);
    }
}
