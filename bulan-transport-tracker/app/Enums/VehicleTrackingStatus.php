<?php

namespace App\Enums;

/**
 * Derived, not stored. Computed from latest_vehicle_locations.recorded_at
 * against the thresholds in config/tracking.php.
 */
enum VehicleTrackingStatus: string
{
    case LIVE = "LIVE";
    case STALE = "STALE";
    case INACTIVE = "INACTIVE";
}
