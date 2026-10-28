<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Route extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'routes';

    protected $fillable = [
        'name',
        'code',

        'origin',
        'origin_latitude',
        'origin_longitude',

        'destination',
        'destination_latitude',
        'destination_longitude',

        'distance_km',

        'description',
        'geometry',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'origin_latitude' => 'decimal:7',
            'origin_longitude' => 'decimal:7',

            'destination_latitude' => 'decimal:7',
            'destination_longitude' => 'decimal:7',

            'distance_km' => 'decimal:2',
            'geometry' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function stops(): HasMany
    {
        return $this->hasMany(
            RouteStop::class
        )->orderBy('stop_order');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(
            BusAssignment::class
        );
    }
}