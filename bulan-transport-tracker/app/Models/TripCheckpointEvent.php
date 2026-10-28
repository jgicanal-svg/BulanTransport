<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TripCheckpointEvent extends Model
{
    protected $fillable = [
        'trip_id',
        'bus_id',
        'checkpoint_name',
        'latitude',
        'longitude',
        'entered_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'entered_at' => 'datetime',
        ];
    }
}