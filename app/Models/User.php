<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Has Role
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function user_regency()
    {
        return $this->hasOne(UserRegency::class, 'user_id');
    }

    public function user_district()
    {
        return $this->hasOne(UserDistrict::class, 'user_id');
    }

    public function user_village()
    {
        return $this->hasOne(UserVillage::class, 'user_id');
    }

    public function statusLogs()
    {
        return $this->hasMany(OfficialStatusLog::class);
    }
}
