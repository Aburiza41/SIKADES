<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Http\Controllers\Web\Insert\UserController;
use App\Http\Controllers\Web\Insert\IdentityController;
use App\Http\Controllers\Web\Insert\WorkPlaceController;
use App\Http\Controllers\Web\Insert\PositionController;
use App\Http\Controllers\Web\Insert\OrganizationController;
use App\Http\Controllers\Web\Insert\StudyController;
use App\Http\Controllers\Web\Insert\TrainingController;
use App\Http\Controllers\Web\Insert\ParentController;
use App\Http\Controllers\Web\Insert\SpouseController;
use App\Http\Controllers\Web\Insert\ChildController;

class ExcelDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting Excel Data Import...');

        $controllers = [
            UserController::class,
            IdentityController::class,
            WorkPlaceController::class,
            PositionController::class,
            OrganizationController::class,
            StudyController::class,
            TrainingController::class,
            SpouseController::class,
            ChildController::class,
        ];

        foreach ($controllers as $controllerClass) {
            $this->command->info("Importing from " . class_basename($controllerClass) . "...");
            try {
                app($controllerClass)->index();
                $this->command->info("Finished importing from " . class_basename($controllerClass));
            } catch (\Exception $e) {
                $this->command->error("Failed importing from " . class_basename($controllerClass) . ": " . $e->getMessage());
            }
        }

        // Handle ParentController specifically since it requires a parameter
        $parents = ['Ayah', 'Ibu'];
        foreach ($parents as $parent) {
            $this->command->info("Importing from ParentController ({$parent})...");
            try {
                app(ParentController::class)->index($parent);
                $this->command->info("Finished importing from ParentController ({$parent})");
            } catch (\Exception $e) {
                $this->command->error("Failed importing from ParentController ({$parent}): " . $e->getMessage());
            }
        }

        $this->command->info('Excel Data Import Completed!');
    }
}
