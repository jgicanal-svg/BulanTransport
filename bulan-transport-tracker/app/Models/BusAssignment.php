<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        "driver_id",
        "bus_id",
        "route_id",
        "assigned_at",
        "ended_at",
        "is_active",
    ];

    protected function casts(): array
    {
        return [
            "assigned_at" => "datetime",
            "ended_at" => "datetime",
            "is_active" => "boolean",
        ];
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    public function activeTrip(): ?Trip
    {
        return $this->trips()->where("status", "ACTIVE")->latest("started_at")->first();
    }
}
