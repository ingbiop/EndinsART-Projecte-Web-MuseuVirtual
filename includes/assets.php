<?php

if (!function_exists('asset_url')) {
    function asset_url(string $relativePath): string
    {
        $webPath = ltrim(str_replace('\\', '/', $relativePath), '/');
        $filePath = __DIR__ . '/../' . str_replace('/', DIRECTORY_SEPARATOR, $webPath);
        $version = is_file($filePath) ? filemtime($filePath) : time();

        return $webPath . '?v=' . $version;
    }
}
