<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast only the minimum needed to move a marker on the map.
 * Sensitive fields (driver contact info, internal IDs beyond bus_id/trip_id)
 * are intentionally NOT included here.
 */
class VehicleLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $busId,
        public int $tripId,
        public float $latitude,
        public float $longitude,
        public string $recordedAt,
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel("fleet-tracking"),
        ];
    }

    public function broadcastAs(): string
    {
        return "VehicleLocationUpdated";
    }

    public function broadcastWith(): array
    {
        return [
            "bus_id" => $this->busId,
            "trip_id" => $this->tripId,
            "latitude" => $this->latitude,
            "longitude" => $this->longitude,
            "recorded_at" => $this->recordedAt,
        ];
    }
}
