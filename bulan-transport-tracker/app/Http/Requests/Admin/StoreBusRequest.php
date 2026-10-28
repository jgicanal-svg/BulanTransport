<?php

namespace App\Http\Requests\Admin;

use App\Models\Bus;
use Illuminate\Foundation\Http\FormRequest;

class StoreBusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        if (
            ! $this->filled('capacity') &&
            ! $this->has('capacity')
        ) {
            $this->merge([
                'capacity' => Bus::MAX_CAPACITY,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'bus_number' => [
                'required',
                'string',
                'max:30',
                'unique:buses,bus_number',
            ],
            'plate_number' => [
                'required',
                'string',
                'max:20',
                'unique:buses,plate_number',
            ],
            'device_code' => [
                'nullable',
                'string',
                'max:30',
                'unique:buses,device_code',
            ],
            'model' => [
                'nullable',
                'string',
                'max:100',
            ],
            'capacity' => [
                'required',
                'integer',
                'min:1',
                'max:' . Bus::MAX_CAPACITY,
            ],
            'status' => [
                'required',
                'in:ACTIVE,INACTIVE,MAINTENANCE',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'capacity.required' =>
                'The passenger capacity is required.',
            'capacity.integer' =>
                'The passenger capacity must be a whole number.',
            'capacity.min' =>
                'The passenger capacity must be at least 1.',
            'capacity.max' =>
                'A bus can carry a maximum of 100 passengers.',
        ];
    }
}