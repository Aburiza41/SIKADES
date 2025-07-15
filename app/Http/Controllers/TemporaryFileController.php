<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TemporaryFileController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:2048', // 2MB max
            'type' => 'required|in:foto,doc_scan,other'
        ]);

        try {
            $file = $request->file('file');
            $path = $file->store('temp/' . $request->type, 'public');

            return response()->json([
                'success' => true,
                'path' => $path,
                'url' => \Illuminate\Support\Facades\Storage::url($path),
                'original_name' => $file->getClientOriginalName()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'path' => 'required|string'
        ]);

        try {
            Storage::disk('public')->delete($request->path);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
