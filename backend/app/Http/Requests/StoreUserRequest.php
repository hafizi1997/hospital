<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'lowercase', 'unique:users'],
            'password' => [
                'required',
                'string',
                'min:12',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[!@#$%^&*()\-_+=]/',
            ],
            'role' => ['required', 'string', Rule::in(['admin', 'doctor', 'nurse', 'receptionist'])],
        ];
    }

    public function messages(): array
    {
        return [
            'password.min'   => 'Password must be at least 12 characters.',
            'password.regex' => 'Password must contain an uppercase letter, a number, and a special character.',
        ];
    }
}
