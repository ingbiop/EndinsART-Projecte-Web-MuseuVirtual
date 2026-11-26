<?php
// Proxy d'imatges de l'Art Institute of Chicago — EndinsART
//
// El servidor IIIF de l'AIC respon 403 (Cloudflare) a les peticions anònimes
// del navegador. Aquest script les descarrega des de PHP identificant-se amb la
// capçalera AIC-User-Agent, les desa a data/img-cache/ i les serveix localment.
//
// Ús: api/artic-image.php?id=<image_id>&w=<amplada>

const IIIF_BASE      = 'https://www.artic.edu/iiif/2';
const CACHE_DIR      = __DIR__ . '/../data/img-cache/';
const ALLOWED_WIDTHS = [200, 400, 600, 843, 1686];
const DEFAULT_WIDTH  = 843;
const CACHE_MAX_AGE  = 604800; // 7 dies

function failWith(int $status): void
{
    http_response_code($status);
    exit;
}

function serveImage(string $path): void
{
    header('Content-Type: image/jpeg');
    header('Content-Length: ' . filesize($path));
    header('Cache-Control: public, max-age=' . CACHE_MAX_AGE);
    readfile($path);
    exit;
}

function downloadImage(string $url): ?string
{
    $context = stream_context_create(['http' => [
        'timeout'       => 15,
        'ignore_errors' => true,
        'header'        => "User-Agent: Mozilla/5.0 (compatible; EndinsART/1.0)\r\n"
                         . "AIC-User-Agent: EndinsART-projecte-escolar\r\n",
    ]]);

    $body = @file_get_contents($url, false, $context);
    if ($body === false) {
        return null;
    }

    $statusLine = $http_response_header[0] ?? '';
    $isJpeg     = str_starts_with($body, "\xFF\xD8\xFF");

    return (str_contains($statusLine, ' 200') && $isJpeg) ? $body : null;
}

$imageId = (string) ($_GET['id'] ?? '');
$width   = (int) ($_GET['w'] ?? DEFAULT_WIDTH);

if (!preg_match('/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/', $imageId)) {
    failWith(400);
}

if (!in_array($width, ALLOWED_WIDTHS, true)) {
    $width = DEFAULT_WIDTH;
}

$cachePath = CACHE_DIR . "{$imageId}-{$width}.jpg";

if (is_file($cachePath)) {
    serveImage($cachePath);
}

$image = downloadImage(IIIF_BASE . "/{$imageId}/full/{$width},/0/default.jpg");
if ($image === null) {
    failWith(502);
}

if (!is_dir(CACHE_DIR)) {
    mkdir(CACHE_DIR, 0775, true);
}
file_put_contents($cachePath, $image);

serveImage($cachePath);
