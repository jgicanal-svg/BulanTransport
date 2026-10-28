<?php

namespace App\Models;

use App\Enums\TripStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        "bus_assignment_id",
        "started_at",
        "ended_at",
        "status",
        "start_latitude",
        "start_longitude",
        "end_latitude",
        "end_longitude",
        "last_location_at",
    ];

    protected function casts(): array
    {
        return [
            "status" => TripStatus::class,
            "started_at" => "datetime",
            "ended_at" => "datetime",
            "last_location_at" => "datetime",
        ];
    }

    public function busAssignment(): BelongsTo
    {
        return $this->belongsTo(BusAssignment::class);
    }

    public function vehicleLocations(): HasMany
    {
        return $this->hasMany(VehicleLocation::class);
    }

    public function isActive(): bool
    {
        return $this->status === TripStatus::ACTIVE;
    }
}
