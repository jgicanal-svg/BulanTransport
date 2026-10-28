<?php

namespace App\Models;

use App\Enums\BusStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bus extends Model
{
    use HasFactory, SoftDeletes;

    public const MAX_CAPACITY = 100;

    protected $fillable = [
        "bus_number",
        "plate_number",
        "device_code",
        "model",
        "capacity",
        "status",
        "notes",
    ];

    protected function casts(): array
    {
        return [
            "status" => BusStatus::class,
            "capacity" => "integer",
        ];
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(BusAssignment::class);
    }

    public function vehicleLocations(): HasMany
    {
        return $this->hasMany(VehicleLocation::class);
    }

    public function latestLocation(): HasOne
    {
        return $this->hasOne(LatestVehicleLocation::class);
    }

    public function activeAssignment(): ?BusAssignment
    {
        return $this->assignments()->where("is_active", true)->latest("assigned_at")->first();
    }
}
