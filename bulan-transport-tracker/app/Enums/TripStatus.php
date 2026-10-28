<?php

namespace App\Enums;

enum TripStatus: string
{
    case PENDING = "PENDING";
    case ACTIVE = "ACTIVE";
    case COMPLETED = "COMPLETED";
    case CANCELLED = "CANCELLED";
}
