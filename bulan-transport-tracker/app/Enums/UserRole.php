<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'ADMIN';
    case DRIVER = 'DRIVER';
    case PASSENGER = 'PASSENGER';
}