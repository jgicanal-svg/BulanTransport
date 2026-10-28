<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $driver = $this->route("driver");
        $userId = $driver->user_id;

        return [
            "first_name" => [
                "required",
                "string",
                "max:100",
                "regex:/^[\pL\s]+$/u",
            ],
            "middle_name" => [
                "nullable",
                "string",
                "max:100",
                "regex:/^[\pL\s]+$/u",
            ],
            "last_name" => [
                "required",
                "string",
                "max:100",
                "regex:/^[\pL\s]+$/u",
            ],
            "email" => [
                "required",
                "email",
                "max:255",
                Rule::unique("users", "email")->ignore($userId),
            ],
            "contact_number" => [
                "required",
                "digits:11",
                "regex:/^09\d{9}$/",
                Rule::unique("users", "contact_number")->ignore($userId),
            ],
            "employee_code" => [
                "nullable",
                "string",
                "max:50",
                Rule::unique("drivers", "employee_code")
                    ->ignore($driver->id),
            ],
            "license_number" => [
                "nullable",
                "string",
                "max:50",
                Rule::unique("drivers", "license_number")
                    ->ignore($driver->id),
            ],
            "license_expiry" => [
                "nullable",
                "date",
            ],
            "status" => [
                "required",
                "in:ACTIVE,INACTIVE",
            ],
        ];
    }

    public function messages(): array
    {
        return [
            "first_name.regex" =>
                "The first name may contain letters and spaces only.",

            "middle_name.regex" =>
                "The middle name may contain letters and spaces only.",

            "last_name.regex" =>
                "The last name may contain letters and spaces only.",
        ];
    }
}