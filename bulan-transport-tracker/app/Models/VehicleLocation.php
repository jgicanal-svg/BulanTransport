<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleLocation extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        "trip_id",
        "bus_id",
        "driver_id",
        "latitude",
        "longitude",
        "accuracy",
        "speed",
        "heading",
        "altitude",
        "recorded_at",
        "received_at",
    ];

    protected function casts(): array
    {
        return [
            "latitude" => "decimal:7",
            "longitude" => "decimal:7",
            "recorded_at" => "datetime",
            "received_at" => "datetime",
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
