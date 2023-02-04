<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'firstname'    => ['required', 'max:20', 'string'],
            'lastname'     => ['required', 'max:20', 'string'],
            'email'        => ['required', 'max:255', 'string','unique:users'],
            'password'     => ['required', 'min:6', 'string', 'confirmed'],
        ];
    }
}
