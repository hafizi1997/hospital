<?php

namespace App\Services;

use App\Models\User;

class UserService
{
    public function create(array $data): User
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
        ]);

        $user->assignRole($data['role']);

        return $user->load('roles');
    }

    public function update(User $user, array $data): User
    {
        $user->update(array_filter([
            'name'     => $data['name'] ?? null,
            'email'    => $data['email'] ?? null,
            'password' => $data['password'] ?? null,
        ], fn ($v) => $v !== null));

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return $user->fresh(['roles']);
    }
}
