<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BusCheckpointReached implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $busId,
        public int $tripId,
        public string $busNumber,
        public string $driverName,
        public string $checkpoint,
        public float $latitude,
        public float $longitude,
        public float $distanceKm,
        public string $recordedAt,
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('fleet-tracking'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'BusCheckpointReached';
    }

    public function broadcastWith(): array
    {
        return [
            'bus_id' => $this->busId,
            'trip_id' => $this->tripId,
            'bus_number' => $this->busNumber,
            'driver_name' => $this->driverName,
            'checkpoint' => $this->checkpoint,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'distance_km' => $this->distanceKm,
            'recorded_at' => $this->recordedAt,
        ];
    }
}