<?php

namespace App\Models;

use App\Enums\DriverStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        "user_id",
        "employee_code",
        "license_number",
        "license_expiry",
        "status",
    ];

    protected function casts(): array
    {
        return [
            "status" => DriverStatus::class,
            "license_expiry" => "date",
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(BusAssignment::class);
    }

    public function activeAssignment(): ?BusAssignment
    {
        return $this->assignments()->where("is_active", true)->latest("assigned_at")->first();
    }

    public function vehicleLocations(): HasMany
    {
        return $this->hasMany(VehicleLocation::class);
    }
}
