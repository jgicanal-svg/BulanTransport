<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'max:100',
                "regex:/^[\pL\s'-]+$/u",
            ],

            'middle_name' => [
                'nullable',
                'string',
                'max:100',
                "regex:/^[\pL\s'-]+$/u",
            ],

            'last_name' => [
                'required',
                'string',
                'max:100',
                "regex:/^[\pL\s'-]+$/u",
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'contact_number' => [
                'required',
                'digits:11',
                'regex:/^09\d{9}$/',
                'unique:users,contact_number',
            ],

            'password' => [
                'required',
                'confirmed',

                // Require at least 8 characters, a letter, a number, and a symbol.
                Password::min(8)
                    ->letters()
                    ->numbers()
                    ->symbols(),
            ],

            'employee_code' => [
                'nullable',
                'string',
                'max:50',
                'unique:drivers,employee_code',
            ],

            'license_number' => [
                'nullable',
                'string',
                'max:50',
                'unique:drivers,license_number',
            ],

            'license_expiry' => [
                'nullable',
                'date',
                'after_or_equal:today',
            ],

            'status' => [
                'required',
                'in:ACTIVE,INACTIVE',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' =>
                'First name is required.',

            'first_name.regex' =>
                'First name may contain letters, spaces, hyphens, and apostrophes only.',

            'middle_name.regex' =>
                'Middle name may contain letters, spaces, hyphens, and apostrophes only.',

            'last_name.required' =>
                'Last name is required.',

            'last_name.regex' =>
                'Last name may contain letters, spaces, hyphens, and apostrophes only.',

            'email.required' =>
                'Email address is required.',

            'email.email' =>
                'Please enter a valid email address.',

            'email.unique' =>
                'This email address is already being used.',

            'contact_number.required' =>
                'Contact number is required.',

            'contact_number.digits' =>
                'Contact number must contain exactly 11 digits.',

            'contact_number.regex' =>
                'Use a valid Philippine mobile number starting with 09.',

            'contact_number.unique' =>
                'This contact number is already being used.',

            'password.required' =>
                'Password is required.',

            'password.confirmed' =>
                'Password confirmation does not match.',

            'employee_code.unique' =>
                'This employee code is already assigned to another driver.',

            'license_number.unique' =>
                'This license number is already assigned to another driver.',

            'license_expiry.after_or_equal' =>
                'The driver license is already expired. Please enter a valid expiry date.',

            'status.required' =>
                'Driver status is required.',
        ];
    }
}