<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    $database = [
        'connected' => false,
        'connection' => config('database.default'),
        'database' => config('database.connections.'.config('database.default').'.database'),
        'error' => null,
    ];

    try {
        DB::connection()->getPdo();
        DB::select('select 1');

        $database['connected'] = true;
    } catch (\Throwable $exception) {
        $database['error'] = $exception->getMessage();
    }

    return response()->json([
        'status' => $database['connected'] ? 'ok' : 'degraded',
        'service' => config('app.name'),
        'environment' => app()->environment(),
        'database' => $database,
        'timestamp' => now()->toISOString(),
    ], $database['connected'] ? 200 : 503);
});
