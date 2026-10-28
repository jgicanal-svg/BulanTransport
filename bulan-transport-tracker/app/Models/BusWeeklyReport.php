<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusWeeklyReport extends Model
{
    protected $fillable = ['bus_id', 'driver_id', 'iso_year', 'iso_week', 'reason', 'remarks'];
}
