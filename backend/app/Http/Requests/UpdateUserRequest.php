<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'  => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'string',
                'email',
                'lowercase',
                Rule::unique('users')->ignore($this->route('user')),
            ],
            'password' => [
                'sometimes',
                'string',
                'min:12',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[!@#$%^&*()\-_+=]/',
            ],
            'role' => ['sometimes', 'string', Rule::in(['admin', 'doctor', 'nurse', 'receptionist'])],
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
