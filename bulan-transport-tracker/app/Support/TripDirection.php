<?php

namespace App\Support;

use App\Models\BusAssignment;
use App\Models\Trip;

class TripDirection
{
    public static function reverseForNextTrip(BusAssignment $assignment, ?Trip $activeTrip = null): bool
    {
        $completedOrStarted = $assignment->trips()->count();
        // An active trip is already included in the count. Its direction was
        // decided before it started; the following trip uses the opposite one.
        return ($completedOrStarted - ($activeTrip ? 1 : 0)) % 2 === 1;
    }

    public static function name(BusAssignment $assignment, ?Trip $activeTrip = null): string
    {
        $route = $assignment->route;
        if (! $route) {
            return 'No assigned route';
        }
        $origin = $route->origin;
        $destination = $route->destination;
        if (! $origin || ! $destination) {
            return $route->name;
        }
        return self::reverseForNextTrip($assignment, $activeTrip)
            ? "$destination - $origin" : "$origin - $destination";
    }
}
