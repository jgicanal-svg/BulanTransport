<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterPassengerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[\pL\s]+$/u',
            ],
            'middle_name' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[\pL\s]+$/u',
            ],
            'last_name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[\pL\s]+$/u',
            ],
            'email' => [
                'required',
                'string',
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
                Password::min(8)
                    ->letters()
                    ->numbers()
                    ->symbols(),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.regex' =>
                'First name may only contain letters and spaces.',
            'middle_name.regex' =>
                'Middle name may only contain letters and spaces.',
            'last_name.regex' =>
                'Last name may only contain letters and spaces.',
            'contact_number.regex' =>
                'Contact number must be 11 digits and start with 09.',
        ];
    }
}