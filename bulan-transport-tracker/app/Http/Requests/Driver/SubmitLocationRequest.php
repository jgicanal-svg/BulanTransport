<?php

namespace App\Http\Requests\Driver;

use Illuminate\Foundation\Http\FormRequest;

class SubmitLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isDriver() ?? false;
    }

    public function rules(): array
    {
        return [
            "latitude" => ["required", "numeric", "between:-90,90"],
            "longitude" => ["required", "numeric", "between:-180,180"],
            "accuracy" => ["nullable", "numeric", "min:0"],
            "speed" => ["nullable", "numeric", "min:0"],
            "heading" => ["nullable", "numeric", "between:0,360"],
            "altitude" => ["nullable", "numeric"],
            "recorded_at" => ["required", "date"],
        ];
    }
}
