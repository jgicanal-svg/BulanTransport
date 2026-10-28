<?php

return [
    // Seconds since last update for a bus to be considered LIVE.
    "live_threshold_seconds" => env("TRACKING_LIVE_THRESHOLD", 60),

    // Seconds since last update (while trip is ACTIVE) before a bus is STALE.
    "stale_threshold_seconds" => env("TRACKING_STALE_THRESHOLD", 180),

    // Beyond this, or with no active trip, a bus is INACTIVE.
    "inactive_threshold_seconds" => env("TRACKING_INACTIVE_THRESHOLD", 600),

    // Reject incoming GPS points whose recorded_at is older than this many seconds.
    "max_point_age_seconds" => env("TRACKING_MAX_POINT_AGE", 120),

    // Minimum meters of movement OR seconds elapsed before a point is persisted,
    // to avoid storing every GPS jitter event.
    "min_movement_meters" => env("TRACKING_MIN_MOVEMENT_METERS", 15),
    "min_interval_seconds" => env("TRACKING_MIN_INTERVAL_SECONDS", 5),

    // Rate limit for the location ingestion endpoint (attempts per minute per driver).
    "ingestion_rate_limit_per_minute" => env("TRACKING_RATE_LIMIT", 120),
];
