<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\Users\UsersImport;
use App\Models\User;
use App\Models\Regency;
use App\Models\Village;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserImportController extends Controller
{
    // Controller Excel
    function excel(Request $request)
    {
        // Validate the request
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120' // 5MB
        ]);

        try {
            $file = $request->file('file');

            // Use Laravel Excel to import
            $import = new UsersImport();
            $data = Excel::toArray($import, $file);

            // Admin
            $admin = $data[0];
            $this->adminFunc($admin);

            // Regency
            $regency = $data[1];
            $this->regencyFunc($regency);

            // Village
            $village = $data[2];
            $this->villageFunc($village);

            // Return success response
            return response()->json([
                'success' => true,
                'data' => $data[0],
                'message' => 'File berhasil diproses'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    // Function to import admin data
    function adminFunc($data)
    {
        // Extract headers from the first row
        $headers = $data[0];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($data as $k => $row) {
            // Skip header row
            if ($k == 0) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Map data to database columns
            $userData = [
                'name' => $row[0],
                'username' => $row[1],
                'avatar' => $row[2],
                'email' => $row[3],
                'password' => Hash::make($row[4]),
            ];

            // Try to insert data into the database
            try {
                User::create($userData);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k,
                    "error" => $th->getMessage(),
                    "data" => $row,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            Log::error('Errors during data insertion:', $errors);
        }
    }

    // Function to import regency data
    function regencyFunc($data)
    {
        // Extract headers from the first row
        $headers = $data[0];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($data as $k => $row) {
            // Skip header row
            if ($k == 0) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Map data to database columns
            $regencyData = [
                'name' => $row[5],
                'code' => $row[6],
            ];

            // Try to insert data into the database
            try {
                Regency::create($regencyData);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k,
                    "error" => $th->getMessage(),
                    "data" => $row,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            Log::error('Errors during data insertion:', $errors);
        }
    }

    // Function to import village data
    function villageFunc($data)
    {
        // Extract headers from the first row
        $headers = $data[0];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($data as $k => $row) {
            // Skip header row
            if ($k == 0) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Map data to database columns
            $villageData = [
                'name' => $row[9],
                'code' => $row[10],
            ];

            // Try to insert data into the database
            try {
                Village::create($villageData);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k,
                    "error" => $th->getMessage(),
                    "data" => $row,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            Log::error('Errors during data insertion:', $errors);
        }
    }
}
