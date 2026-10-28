<?php

use Illuminate\Support\Facades\Broadcast;

/*
 * The fleet-tracking channel is intentionally public (not private/presence):
 * both authenticated Admin users and anonymous Commuter visitors need to
 * receive live marker updates. No sensitive data is broadcast on it
 * (see App\Events\VehicleLocationUpdated::broadcastWith()).
 */
