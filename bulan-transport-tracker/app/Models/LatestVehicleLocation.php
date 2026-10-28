<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LatestVehicleLocation extends Model
{
    public $incrementing = false;
    protected $primaryKey = "bus_id";
    public $timestamps = false;

    protected $fillable = [
        "bus_id",
        "trip_id",
        "driver_id",
        "latitude",
        "longitude",
        "accuracy",
        "speed",
        "heading",
        "recorded_at",
        "received_at",
        "updated_at",
    ];

    protected function casts(): array
    {
        return [
            "latitude" => "decimal:7",
            "longitude" => "decimal:7",
            "recorded_at" => "datetime",
            "received_at" => "datetime",
            "updated_at" => "datetime",
        ];
    }

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
