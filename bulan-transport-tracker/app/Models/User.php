<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'contact_number',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /*
     * Include full_name when User is converted to JSON
     * and sent to React through Inertia.
     */
    protected $appends = [
        'full_name',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
        ];
    }

    public function driver(): HasOne
    {
        return $this->hasOne(Driver::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function isDriver(): bool
    {
        return $this->role === UserRole::DRIVER;
    }

    public function isPassenger(): bool
    {
        return $this->role === UserRole::PASSENGER;
    }

    public function getFullNameAttribute(): string
    {
        return trim(
            $this->first_name
            .' '
            .($this->middle_name
                ? $this->middle_name.' '
                : '')
            .$this->last_name
        );
    }
}