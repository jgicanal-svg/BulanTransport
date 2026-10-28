<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRouteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $route =
            $this->route('route');

        return [
            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'code' => [
                'nullable',
                'string',
                'max:30',

                Rule::unique(
                    'routes',
                    'code'
                )->ignore($route->id),
            ],

            'origin' => [
                'required',
                'string',
                'max:150',
            ],

            'origin_latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'origin_longitude' => [
                'required',
                'numeric',
                'between:-180,180',
            ],

            'destination' => [
                'required',
                'string',
                'max:150',
            ],

            'destination_latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'destination_longitude' => [
                'required',
                'numeric',
                'between:-180,180',
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'is_active' => [
                'boolean',
            ],

            'geometry' => [
                'nullable',
                'array',
            ],

            'stops' => [
                'nullable',
                'array',
            ],

            'stops.*.name' => [
                'required_with:stops',
                'string',
                'max:150',
            ],

            'stops.*.latitude' => [
                'required_with:stops',
                'numeric',
                'between:-90,90',
            ],

            'stops.*.longitude' => [
                'required_with:stops',
                'numeric',
                'between:-180,180',
            ],

            'stops.*.stop_order' => [
                'required_with:stops',
                'integer',
                'min:0',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'origin_latitude.required' =>
                'Starting latitude is required.',

            'origin_longitude.required' =>
                'Starting longitude is required.',

            'destination_latitude.required' =>
                'Destination latitude is required.',

            'destination_longitude.required' =>
                'Destination longitude is required.',
        ];
    }
}