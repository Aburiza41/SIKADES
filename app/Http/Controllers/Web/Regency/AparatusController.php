<?php
namespace App\Http\Controllers\Web\Regency;

use App\Http\Controllers\Controller;
use App\Models\Regency;
use App\Models\Village;
use App\Models\OfficialTraining;
use App\Models\OfficialOrganization;
use App\Models\Training;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AparatusController extends Controller
{
    public function index()
    {
        $regency = Auth::user()->user_regency->regency()->with([
            'districts.villages.officials.officialTrainings.training',
            'districts.villages.officials.officialOrganizations',
            'districts.villages.officials.officialAddresses',
            'districts.villages.officials.officialContacts',
            'districts.villages.officials.officialIdentities',
        ])->first();

        foreach ($regency->districts as $district) {
            $villages = $district->villages;
            $officials = $villages->flatMap->officials;

            // Status administrasi pejabat
            $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
            $statuses = array_map(function ($status) use ($officials) {
                return $officials->where('status', $status)->count();
            }, $statusOptions);

            // Hitung kelengkapan data
            $completeDataCount = $officials->filter(function ($official) {
                return $official->officialAddresses()->exists() &&
                       $official->officialContacts()->exists() &&
                       $official->officialIdentities()->exists();
            })->count();
            $dataCompleteness = $officials->count() > 0
                ? round(($completeDataCount / $officials->count()) * 100, 2)
                : 0;

            // Hitung keikutsertaan pelatihan (khususnya pelatihan pemerintah, ID 7–30)
            $trainingOfficials = $officials->filter(function ($official) {
                return $official->officialTrainings()->whereHas('training', function ($query) {
                    $query->whereBetween('id', [7, 30]); // Pelatihan pemerintah
                })->exists();
            })->count();
            $trainingParticipationRate = $officials->count() > 0
                ? round(($trainingOfficials / $officials->count()) * 100, 2)
                : 0;

            // Hitung keikutsertaan organisasi
            $organizationOfficials = $officials->filter(function ($official) {
                return $official->officialOrganizations()->exists();
            })->count();
            $organizationParticipationRate = $officials->count() > 0
                ? round(($organizationOfficials / $officials->count()) * 100, 2)
                : 0;

            // Hitung tingkat keaktifan keseluruhan (pelatihan atau organisasi)
            $activeOfficials = $officials->filter(function ($official) {
                return $official->officialTrainings()->exists() ||
                       $official->officialOrganizations()->exists();
            })->count();
            $activityRate = $officials->count() > 0
                ? round(($activeOfficials / $officials->count()) * 100, 2)
                : 0;

            // Tentukan kategori keaktifan (tinggi, sedang, rendah)
            $activityLevel = $this->getActivityLevel($activityRate);

            // Dasar perhitungan untuk tooltip
            $calculationBasis = [
                'training_participation' => [
                    'value' => $trainingParticipationRate,
                    'basis' => "Persentase dihitung sebagai (jumlah pejabat yang mengikuti pelatihan pemerintah / total pejabat) * 100. Pelatihan pemerintah mencakup pelatihan dengan ID 7–30 di tabel trainings."
                ],
                'organization_participation' => [
                    'value' => $organizationParticipationRate,
                    'basis' => "Persentase dihitung sebagai (jumlah pejabat yang mengikuti organisasi / total pejabat) * 100."
                ],
                'activity_rate' => [
                    'value' => $activityRate,
                    'basis' => "Persentase dihitung sebagai (jumlah pejabat yang mengikuti pelatihan atau organisasi / total pejabat) * 100."
                ],
                'data_completeness' => [
                    'value' => $dataCompleteness,
                    'basis' => "Persentase dihitung sebagai (jumlah pejabat dengan data lengkap di tabel official_addresses, official_contacts, dan official_identities / total pejabat) * 100."
                ]
            ];

            // Tambahkan data ke district
            $district->villages_count = $villages->count();
            $district->officials_count = $officials->count();
            $district->officials_statuses = $statuses;
            $district->data_completeness = $dataCompleteness;
            $district->training_participation_rate = $trainingParticipationRate;
            $district->organization_participation_rate = $organizationParticipationRate;
            $district->activity_rate = $activityRate;
            $district->activity_level = $activityLevel;
            $district->calculation_basis = $calculationBasis;
        }

        return Inertia::render('Regency/Aparatus/Page', [
            'districts' => $regency->districts
        ]);
    }

    public function district(string $id)
    {
        $villages = Village::where('district_id', $id)
            ->with([
                'officials.officialTrainings.training',
                'officials.officialOrganizations.organization',
                'officials.officialAddresses',
                'officials.officialContacts',
                'officials.officialIdentities',
                'officials.positionOfficials.position'
            ])->get();

        // Data global untuk seluruh kecamatan
        $globalData = [
            'total_officials' => 0,
            'total_villages' => $villages->count(),
            'avg_data_completeness' => 0,
            'avg_training_participation' => 0,
            'avg_organization_participation' => 0,
            'avg_activity_rate' => 0,
            'status_distribution' => [0, 0, 0, 0],
            'activity_level_distribution' => ['Tinggi' => 0, 'Sedang' => 0, 'Rendah' => 0],
            'top_global_officials_training' => [],
            'top_global_officials_organization' => [],
            'top_global_positions_training' => [],
            'top_global_positions_organization' => [],
            'top_global_trainings' => [],
            'top_global_organizations' => [],
            'village_rankings' => [],
            'gender_distribution' => ['L' => 0, 'P' => 0, 'Lainnya' => 0],
            'education_distribution' => [],
            'marital_status_distribution' => [],
            'age_distribution' => ['<25' => 0, '25-35' => 0, '36-45' => 0, '46-55' => 0, '>55' => 0]
        ];

        $allOfficials = collect();
        $allTrainings = collect();
        $allOrganizations = collect();
        $positionTrainingCountsGlobal = [];
        $positionOrganizationCountsGlobal = [];
        $trainingCountsGlobal = [];
        $organizationCountsGlobal = [];
        $educationCounts = [];
        $maritalStatusCounts = [];

        foreach ($villages as $village) {
            $officials = $village->officials;

            // Handle empty officials case
            if ($officials->isEmpty()) {
                $village->officials_count = 0;
                $village->officials_statuses = [0, 0, 0, 0];
                $village->data_completeness = 0;
                $village->training_participation_rate = 0;
                $village->organization_participation_rate = 0;
                $village->activity_rate = 0;
                $village->activity_level = 'Rendah';
                $village->calculation_basis = [];
                $village->most_active_officials = [];
                $village->inactive_officials = [];
                $village->officials_list = [];
                $village->top_officials_by_training = [];
                $village->top_officials_by_organization = [];
                $village->top_positions_by_training = [];
                $village->top_positions_by_organization = [];
                $village->top_trainings = [];
                $village->top_organizations = [];
                $village->gender_distribution = ['L' => 0, 'P' => 0, 'Lainnya' => 0];
                $village->education_distribution = [];
                $village->marital_status_distribution = [];
                $village->age_distribution = ['<25' => 0, '25-35' => 0, '36-45' => 0, '46-55' => 0, '>55' => 0];
                continue;
            }

            $allOfficials = $allOfficials->concat($officials);

            // Status administrasi pejabat
            $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
            $statuses = array_map(function ($status) use ($officials) {
                return $officials->where('status', $status)->count();
            }, $statusOptions);

            // Hitung kelengkapan data
            $completeDataCount = $officials->filter(function ($official) {
                return $official->officialAddresses()->exists() &&
                    $official->officialContacts()->exists() &&
                    $official->officialIdentities()->exists();
            })->count();
            $dataCompleteness = round(($completeDataCount / $officials->count()) * 100, 2);

            // Hitung keikutsertaan pelatihan pemerintah (ID 7–30)
            $trainingOfficials = $officials->filter(function ($official) {
                return $official->officialTrainings()->whereHas('training', function ($query) {
                    $query->whereBetween('id', [7, 30]);
                })->exists();
            })->count();
            $trainingParticipationRate = round(($trainingOfficials / $officials->count()) * 100, 2);

            // Hitung keikutsertaan organisasi
            $organizationOfficials = $officials->filter(function ($official) {
                return $official->officialOrganizations()->exists();
            })->count();
            $organizationParticipationRate = round(($organizationOfficials / $officials->count()) * 100, 2);

            // Hitung tingkat keaktifan keseluruhan
            $activeOfficials = $officials->filter(function ($official) {
                return $official->officialTrainings()->exists() ||
                    $official->officialOrganizations()->exists();
            })->count();
            $activityRate = round(($activeOfficials / $officials->count()) * 100, 2);

            // Tentukan kategori keaktifan
            $activityLevel = $this->getActivityLevel($activityRate);

            // Analisis demografi
            $genderDistribution = ['L' => 0, 'P' => 0, 'Lainnya' => 0];
            $educationDistribution = [];
            $maritalStatusDistribution = [];
            $ageDistribution = ['<25' => 0, '25-35' => 0, '36-45' => 0, '46-55' => 0, '>55' => 0];

            foreach ($officials as $official) {
                // Distribusi gender
                $gender = $official->jenis_kelamin ?? 'Lainnya';
                $genderDistribution[$gender]++;

                // Distribusi pendidikan
                $education = $official->officialIdentities->pendidikan_terakhir ?? 'Tidak diketahui';
                if (!isset($educationDistribution[$education])) {
                    $educationDistribution[$education] = 0;
                }
                $educationDistribution[$education]++;

                // Distribusi status perkawinan
                $maritalStatus = $official->status_perkawinan ?? 'Lainnya';
                if (!isset($maritalStatusDistribution[$maritalStatus])) {
                    $maritalStatusDistribution[$maritalStatus] = 0;
                }
                $maritalStatusDistribution[$maritalStatus]++;

                // Distribusi usia
                if ($official->tanggal_lahir) {
                    $age = Carbon::parse($official->tanggal_lahir)->age;
                    if ($age < 25) $ageDistribution['<25']++;
                    elseif ($age <= 35) $ageDistribution['25-35']++;
                    elseif ($age <= 45) $ageDistribution['36-45']++;
                    elseif ($age <= 55) $ageDistribution['46-55']++;
                    else $ageDistribution['>55']++;
                }
            }

            // Analisis pejabat: paling aktif dan tidak aktif
            $mostActiveOfficials = $officials->map(function ($official) {
                $govTrainingCount = $official->officialTrainings()->whereHas('training', function ($query) {
                    $query->whereBetween('id', [7, 30]);
                })->count();

                $currentPosition = $official->positionCurrent;

                return [
                    'id' => $official->id,
                    'nama_lengkap' => $official->nama_lengkap,
                    'status' => $official->status,
                    'position' => $currentPosition && $currentPosition->position
                        ? $currentPosition->position->title
                        : 'Tidak ada jabatan',
                    'government_training_count' => $govTrainingCount,
                    'organization_count' => $official->officialOrganizations()->count(),
                    'pendidikan_terakhir' => $official->officialIdentities
                        ? $official->officialIdentities->pendidikan_terakhir
                        : 'Tidak diketahui',
                    'status_perkawinan' => $official->status_perkawinan,
                    'jenis_kelamin' => $official->jenis_kelamin,
                ];
            })->sortByDesc('government_training_count')->take(5)->values()->toArray();

            $inactiveOfficials = $officials->filter(function ($official) {
                return !$official->officialTrainings()->whereHas('training', function ($query) {
                    $query->whereBetween('id', [7, 30]);
                })->exists();
            })->map(function ($official) {
                $currentPosition = $official->positionCurrent;

                return [
                    'id' => $official->id,
                    'nama_lengkap' => $official->nama_lengkap,
                    'status' => $official->status,
                    'position' => $currentPosition && $currentPosition->position
                        ? $currentPosition->position->title
                        : 'Tidak ada jabatan',
                    'government_training_count' => 0,
                    'organization_count' => $official->officialOrganizations()->count(),
                    'pendidikan_terakhir' => $official->officialIdentities
                        ? $official->officialIdentities->pendidikan_terakhir
                        : 'Tidak diketahui',
                    'status_perkawinan' => $official->status_perkawinan,
                    'jenis_kelamin' => $official->jenis_kelamin,
                ];
            })->take(5)->values()->toArray();

            // Daftar pejabat lengkap
            $officialsList = $officials->map(function ($official) {
                $currentPosition = $official->positionCurrent;

                return [
                    'id' => $official->id,
                    'nama_lengkap' => $official->nama_lengkap,
                    'status' => $official->status,
                    'position' => $currentPosition && $currentPosition->position
                        ? $currentPosition->position->title
                        : 'Tidak ada jabatan',
                    'government_training_count' => $official->officialTrainings()->whereHas('training', function ($query) {
                        $query->whereBetween('id', [7, 30]);
                    })->count(),
                    'government_trainings' => $official->officialTrainings()
                        ->whereHas('training', function ($query) {
                            $query->whereBetween('id', [7, 30]);
                        })
                        ->with('training')
                        ->get()
                        ->map(function ($training) {
                            return [
                                'title' => $training->training->title,
                                'nomor_sertifikat' => $training->nomor_sertifikat,
                                'tanggal_sertifikat' => $training->tanggal_sertifikat,
                                'penyelenggara' => $training->penyelenggara,
                            ];
                        })->toArray(),
                    'organization_count' => $official->officialOrganizations()->count(),
                    'organizations' => $official->officialOrganizations()->with('organization')->get()->map(function ($org) {
                        return [
                            'title' => $org->organization->title,
                            'posisi' => $org->posisi,
                            'mulai' => $org->mulai,
                            'selesai' => $org->selesai,
                        ];
                    })->toArray(),
                    'data_complete' => $official->officialAddresses()->exists() &&
                                    $official->officialContacts()->exists() &&
                                    $official->officialIdentities()->exists(),
                    'pendidikan_terakhir' => $official->officialIdentities
                        ? $official->officialIdentities->pendidikan_terakhir
                        : 'Tidak diketahui',
                    'status_perkawinan' => $official->status_perkawinan,
                    'jenis_kelamin' => $official->jenis_kelamin,
                    'tanggal_lahir' => $official->tanggal_lahir,
                ];
            })->values()->toArray();

            // ANALISIS BARU: Top Pejabat, Jabatan, dan Pelatihan/Organisasi
            // Top 10 pejabat berdasarkan jumlah pelatihan
            $topOfficialsByTraining = $officials->map(function ($official) {
                $govTrainingCount = $official->officialTrainings()->whereHas('training', function ($query) {
                    $query->whereBetween('id', [7, 30]);
                })->count();

                $currentPosition = $official->positionCurrent;

                return [
                    'nama_lengkap' => $official->nama_lengkap,
                    'position' => $currentPosition && $currentPosition->position
                        ? $currentPosition->position->title
                        : 'Tidak ada jabatan',
                    'training_count' => $govTrainingCount,
                    'organization_count' => $official->officialOrganizations()->count(),
                ];
            })->sortByDesc('training_count')->take(10)->values()->toArray();

            // Top 10 pejabat berdasarkan jumlah organisasi
            $topOfficialsByOrganization = $officials->map(function ($official) {
                $orgCount = $official->officialOrganizations()->count();

                $currentPosition = $official->positionCurrent;

                return [
                    'nama_lengkap' => $official->nama_lengkap,
                    'position' => $currentPosition && $currentPosition->position
                        ? $currentPosition->position->title
                        : 'Tidak ada jabatan',
                    'training_count' => $official->officialTrainings()->whereHas('training', function ($query) {
                        $query->whereBetween('id', [7, 30]);
                    })->count(),
                    'organization_count' => $orgCount,
                ];
            })->sortByDesc('organization_count')->take(10)->values()->toArray();

            // Top 5 jabatan berdasarkan jumlah pelatihan
            $positionTrainingCounts = [];
            foreach ($officials as $official) {
                $currentPosition = $official->positionCurrent;
                if ($currentPosition && $currentPosition->position) {
                    $positionTitle = $currentPosition->position->title;
                    $trainingCount = $official->officialTrainings()->whereHas('training', function ($query) {
                        $query->whereBetween('id', [7, 30]);
                    })->count();

                    if (!isset($positionTrainingCounts[$positionTitle])) {
                        $positionTrainingCounts[$positionTitle] = 0;
                    }
                    $positionTrainingCounts[$positionTitle] += $trainingCount;

                    // Untuk data global
                    if (!isset($positionTrainingCountsGlobal[$positionTitle])) {
                        $positionTrainingCountsGlobal[$positionTitle] = 0;
                    }
                    $positionTrainingCountsGlobal[$positionTitle] += $trainingCount;
                }
            }

            $topPositionsByTraining = collect($positionTrainingCounts)
                ->map(function ($count, $position) {
                    return ['position' => $position, 'training_count' => $count];
                })
                ->sortByDesc('training_count')
                ->take(5)
                ->values()
                ->toArray();

            // Top 5 jabatan berdasarkan jumlah organisasi
            $positionOrganizationCounts = [];
            foreach ($officials as $official) {
                $currentPosition = $official->positionCurrent;
                if ($currentPosition && $currentPosition->position) {
                    $positionTitle = $currentPosition->position->title;
                    $orgCount = $official->officialOrganizations()->count();

                    if (!isset($positionOrganizationCounts[$positionTitle])) {
                        $positionOrganizationCounts[$positionTitle] = 0;
                    }
                    $positionOrganizationCounts[$positionTitle] += $orgCount;

                    // Untuk data global
                    if (!isset($positionOrganizationCountsGlobal[$positionTitle])) {
                        $positionOrganizationCountsGlobal[$positionTitle] = 0;
                    }
                    $positionOrganizationCountsGlobal[$positionTitle] += $orgCount;
                }
            }

            $topPositionsByOrganization = collect($positionOrganizationCounts)
                ->map(function ($count, $position) {
                    return ['position' => $position, 'organization_count' => $count];
                })
                ->sortByDesc('organization_count')
                ->take(5)
                ->values()
                ->toArray();

            // Top 3 pelatihan yang paling banyak diikuti
            $trainingCounts = [];
            foreach ($officials as $official) {
                $trainings = $official->officialTrainings()
                    ->whereHas('training', function ($query) {
                        $query->whereBetween('id', [7, 30]);
                    })
                    ->with('training')
                    ->get();

                foreach ($trainings as $training) {
                    $trainingTitle = $training->training->title;
                    if (!isset($trainingCounts[$trainingTitle])) {
                        $trainingCounts[$trainingTitle] = 0;
                    }
                    $trainingCounts[$trainingTitle]++;

                    // Untuk data global
                    if (!isset($trainingCountsGlobal[$trainingTitle])) {
                        $trainingCountsGlobal[$trainingTitle] = 0;
                    }
                    $trainingCountsGlobal[$trainingTitle]++;
                }
            }

            $topTrainings = collect($trainingCounts)
                ->map(function ($count, $training) {
                    return ['training' => $training, 'count' => $count];
                })
                ->sortByDesc('count')
                ->take(3)
                ->values()
                ->toArray();

            // Top 3 organisasi yang paling banyak diikuti
            $organizationCounts = [];
            foreach ($officials as $official) {
                $organizations = $official->officialOrganizations()->with('organization')->get();

                foreach ($organizations as $org) {
                    $orgTitle = $org->organization->title;
                    if (!isset($organizationCounts[$orgTitle])) {
                        $organizationCounts[$orgTitle] = 0;
                    }
                    $organizationCounts[$orgTitle]++;

                    // Untuk data global
                    if (!isset($organizationCountsGlobal[$orgTitle])) {
                        $organizationCountsGlobal[$orgTitle] = 0;
                    }
                    $organizationCountsGlobal[$orgTitle]++;
                }
            }

            $topOrganizations = collect($organizationCounts)
                ->map(function ($count, $organization) {
                    return ['organization' => $organization, 'count' => $count];
                })
                ->sortByDesc('count')
                ->take(3)
                ->values()
                ->toArray();

            // Kumpulkan data untuk analisis global
            $globalData['total_officials'] += $officials->count();
            $globalData['avg_data_completeness'] += $dataCompleteness;
            $globalData['avg_training_participation'] += $trainingParticipationRate;
            $globalData['avg_organization_participation'] += $organizationParticipationRate;
            $globalData['avg_activity_rate'] += $activityRate;

            // Distribusi status
            foreach ($statuses as $index => $count) {
                $globalData['status_distribution'][$index] += $count;
            }

            // Distribusi level aktivitas
            $globalData['activity_level_distribution'][$activityLevel]++;

            // Distribusi demografi global
            foreach ($genderDistribution as $gender => $count) {
                $globalData['gender_distribution'][$gender] += $count;
            }

            foreach ($educationDistribution as $education => $count) {
                if (!isset($educationCounts[$education])) {
                    $educationCounts[$education] = 0;
                }
                $educationCounts[$education] += $count;
            }

            foreach ($maritalStatusDistribution as $status => $count) {
                if (!isset($maritalStatusCounts[$status])) {
                    $maritalStatusCounts[$status] = 0;
                }
                $maritalStatusCounts[$status] += $count;
            }

            foreach ($ageDistribution as $ageGroup => $count) {
                $globalData['age_distribution'][$ageGroup] += $count;
            }

            // Ranking desa
            $globalData['village_rankings'][] = [
                'village_id' => $village->id,
                'village_name' => $village->name_bps,
                'officials_count' => $officials->count(),
                'data_completeness' => $dataCompleteness,
                'training_participation_rate' => $trainingParticipationRate,
                'organization_participation_rate' => $organizationParticipationRate,
                'activity_rate' => $activityRate,
                'activity_level' => $activityLevel,
                'score' => ($dataCompleteness + $trainingParticipationRate + $organizationParticipationRate + $activityRate) / 4
            ];

            // Tambahkan data ke village
            $village->officials_count = $officials->count();
            $village->officials_statuses = $statuses;
            $village->data_completeness = $dataCompleteness;
            $village->training_participation_rate = $trainingParticipationRate;
            $village->organization_participation_rate = $organizationParticipationRate;
            $village->activity_rate = $activityRate;
            $village->activity_level = $activityLevel;
            $village->calculation_basis = $calculationBasis ?? [];
            $village->most_active_officials = $mostActiveOfficials;
            $village->inactive_officials = $inactiveOfficials;
            $village->officials_list = $officialsList;
            $village->top_officials_by_training = $topOfficialsByTraining;
            $village->top_officials_by_organization = $topOfficialsByOrganization;
            $village->top_positions_by_training = $topPositionsByTraining;
            $village->top_positions_by_organization = $topPositionsByOrganization;
            $village->top_trainings = $topTrainings;
            $village->top_organizations = $topOrganizations;
            $village->gender_distribution = $genderDistribution;
            $village->education_distribution = $educationDistribution;
            $village->marital_status_distribution = $maritalStatusDistribution;
            $village->age_distribution = $ageDistribution;
        }

        // Hitung rata-rata global
        if ($globalData['total_villages'] > 0) {
            $globalData['avg_data_completeness'] = round($globalData['avg_data_completeness'] / $globalData['total_villages'], 2);
            $globalData['avg_training_participation'] = round($globalData['avg_training_participation'] / $globalData['total_villages'], 2);
            $globalData['avg_organization_participation'] = round($globalData['avg_organization_participation'] / $globalData['total_villages'], 2);
            $globalData['avg_activity_rate'] = round($globalData['avg_activity_rate'] / $globalData['total_villages'], 2);
        }

        // Data pendidikan global
        $globalData['education_distribution'] = $educationCounts;
        $globalData['marital_status_distribution'] = $maritalStatusCounts;

        // Top officials global
        $globalOfficialsTraining = $allOfficials->map(function ($official) {
            $govTrainingCount = $official->officialTrainings()->whereHas('training', function ($query) {
                $query->whereBetween('id', [7, 30]);
            })->count();

            $currentPosition = $official->positionCurrent;

            return [
                'nama_lengkap' => $official->nama_lengkap,
                'village_name' => $official->village->name_bps,
                'position' => $currentPosition && $currentPosition->position
                    ? $currentPosition->position->title
                    : 'Tidak ada jabatan',
                'training_count' => $govTrainingCount,
                'organization_count' => $official->officialOrganizations()->count(),
            ];
        })->sortByDesc('training_count')->take(10)->values()->toArray();

        $globalOfficialsOrganization = $allOfficials->map(function ($official) {
            $orgCount = $official->officialOrganizations()->count();

            $currentPosition = $official->positionCurrent;

            return [
                'nama_lengkap' => $official->nama_lengkap,
                'village_name' => $official->village->name_bps,
                'position' => $currentPosition && $currentPosition->position
                    ? $currentPosition->position->title
                    : 'Tidak ada jabatan',
                'training_count' => $official->officialTrainings()->whereHas('training', function ($query) {
                    $query->whereBetween('id', [7, 30]);
                })->count(),
                'organization_count' => $orgCount,
            ];
        })->sortByDesc('organization_count')->take(10)->values()->toArray();

        $globalData['top_global_officials_training'] = $globalOfficialsTraining;
        $globalData['top_global_officials_organization'] = $globalOfficialsOrganization;

        // Top positions global
        $globalData['top_global_positions_training'] = collect($positionTrainingCountsGlobal)
            ->map(function ($count, $position) {
                return ['position' => $position, 'training_count' => $count];
            })
            ->sortByDesc('training_count')
            ->take(5)
            ->values()
            ->toArray();

        $globalData['top_global_positions_organization'] = collect($positionOrganizationCountsGlobal)
            ->map(function ($count, $position) {
                return ['position' => $position, 'organization_count' => $count];
            })
            ->sortByDesc('organization_count')
            ->take(5)
            ->values()
            ->toArray();

        // Top trainings and organizations global
        $globalData['top_global_trainings'] = collect($trainingCountsGlobal)
            ->map(function ($count, $training) {
                return ['training' => $training, 'count' => $count];
            })
            ->sortByDesc('count')
            ->take(5)
            ->values()
            ->toArray();

        $globalData['top_global_organizations'] = collect($organizationCountsGlobal)
            ->map(function ($count, $organization) {
                return ['organization' => $organization, 'count' => $count];
            })
            ->sortByDesc('count')
            ->take(5)
            ->values()
            ->toArray();

        // Sort village rankings
        usort($globalData['village_rankings'], function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return Inertia::render('Regency/Aparatus/Show', [
            'villages' => $villages,
            'globalData' => $globalData
        ]);
    }

    /**
     * Menentukan kategori tingkat keaktifan berdasarkan activity_rate
     */
    private function getActivityLevel($activityRate)
    {
        if ($activityRate >= 70) {
            return 'Tinggi';
        } elseif ($activityRate >= 40) {
            return 'Sedang';
        } else {
            return 'Rendah';
        }
    }
}
