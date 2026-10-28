<?php

namespace App\Enums;

enum BusStatus: string
{
    case ACTIVE = "ACTIVE";
    case INACTIVE = "INACTIVE";
    case MAINTENANCE = "MAINTENANCE";
}
