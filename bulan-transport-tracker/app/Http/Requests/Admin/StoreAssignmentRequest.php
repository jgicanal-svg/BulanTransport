<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            "driver_id" => ["required", "exists:drivers,id"],
            "bus_id" => ["required", "exists:buses,id"],
            "route_id" => ["required", "exists:routes,id"],
        ];
    }
}
