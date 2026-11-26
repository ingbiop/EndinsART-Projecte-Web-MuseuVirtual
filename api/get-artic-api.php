<?php
// Obté obres de l'Art Institute of Chicago i les normalitza — EndinsART · Sala 3

header('Content-Type: application/json; charset=utf-8');

// ─── Pools d'obres (IDs de l'API de l'Art Institute of Chicago) ─────────────

const POOL_A = [
    129849, 8983,   8980,   8987,   8991,   9021,   65908,  65937,
    65916,  28560,  80607,  154235, 19339,  60812,  110507, 109926,
];

const POOL_B = [
    16568,  87088,  64818,  16571,  20684,  27992,  14655,  81558,
    61603,  14572,  111442, 61128,  16146,  14591,  11723,  16487,
    111436, 81512,
];

const POOL_C = [
    69780,  25865,  44018,  15401,  109780, 28849,  64724,  64729,
    72801,  56905,  71573,  60294,  118979,
];

const TITLE_OVERRIDES_CA = [
    '129849' => 'Cases a Murnau',
    '8983'   => 'Pintura amb troica',
    '8980'   => 'Paisatge amb dos àlbers',
    '8987'   => 'Pintura amb centre verd',
    '8991'   => 'Improvisació núm. 30 (canons)',
    '9021'   => 'El molí embruixat',
    '65908'  => 'La muntanya fosca',
    '65937'  => 'Paisatge núm. 3, Cash Entry Mines, Nou Mèxic',
    '65916'  => 'Moviment',
    '28560'  => 'El dormitori',
    '80607'  => 'Autoretrat',
    '154235' => 'La noia a la finestra',
    '19339'  => 'Arlesianes (Mistral)',
    '60812'  => 'Tehamana té molts pares o els avantpassats de Tehamana',
    '110507' => 'Al mar',
    '109926' => 'Paisatge: finestra amb vistes al bosc',

    '16568'  => 'Nenúfars',
    '87088'  => 'Estany de nenúfars',
    '64818'  => "Garberes de blat, final d'estiu",
    '16571'  => 'Arribada del tren de Normandia',
    '20684'  => 'Carrer de París; dia de pluja',
    '27992'  => 'Un diumenge a La Grande Jatte',
    '14655'  => 'Dues germanes (a la terrassa)',
    '81558'  => 'Acròbates al Circ Fernando',
    '61603'  => "Ballet a l'Òpera de París",
    '14572'  => 'La barreteria',
    '111442' => "El bany de l'infant",
    '61128'  => 'Al Moulin Rouge',
    '16146'  => 'Amazona (al Circ Fernando)',
    '14591'  => 'Dona llegint',
    '11723'  => 'Dona al tocador',
    '16487'  => 'La badia de Marsella',
    '111436' => 'El cistell de pomes',
    '81512'  => 'Lectura interrompuda',

    '69780'  => 'La font, Vila Torlonia, Frascati, Itàlia',
    '25865'  => "La xarxa de l'areng",
    '44018'  => 'Escena de croquet',
    '15401'  => 'A cal Mouquin',
    '109780' => "Amor d'hivern",
    '28849'  => 'Un parc urbà',
    '64724'  => 'La llar del bernat pescaire',
    '64729'  => 'Primera hora del matí, Tarpon Springs',
    '72801'  => 'Pres pel gel',
    '56905'  => 'Nocturn: blau i or — Southampton Water',
    '71573'  => 'Un dia de festa',
    '60294'  => 'Carrer de Nova York',
    '118979' => 'El Zocodover, Toledo, Espanya',
];

// ─── Traducció al català via MyMemory ─────────────────────────────────────

function isBadTranslationPayload(?string $text): bool {
    $value = mb_strtoupper(trim((string)$text));
    if ($value === '') return false;
    return str_contains($value, 'QUERY LENGTH LIMIT EXCEEDED')
        || str_contains($value, 'MYMEMORY WARNING');
}

function cleanTextField(?string $text, string $fallback = ''): string {
    $value = preg_replace('/\s+/u', ' ', trim((string)$text));
    if ($value === '' || isBadTranslationPayload($value)) return $fallback;
    return $value;
}

function normalizeDateCA(?string $text): string {
    $value = cleanTextField($text);
    if ($value === '') return '';

    $mesos = [
        'January' => 'gener',
        'February' => 'febrer',
        'March' => 'març',
        'April' => 'abril',
        'May' => 'maig',
        'June' => 'juny',
        'July' => 'juliol',
        'August' => 'agost',
        'September' => 'setembre',
        'October' => 'octubre',
        'November' => 'novembre',
        'December' => 'desembre',
    ];

    if (preg_match('/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})$/', $value, $matches)) {
        return sprintf('%d de %s de %s', (int)$matches[2], $mesos[$matches[1]], $matches[3]);
    }

    if (preg_match('/^c\.?\s*(\d{4})$/i', $value, $matches)) {
        return 'ca. ' . $matches[1];
    }

    return $value;
}

function normalizePlaceCA(?string $text): string {
    $value = cleanTextField($text);
    if ($value === '') return '';

    $corrections = [
        // Anglès → Català (fallback si la traducció automàtica falla)
        'United States' => 'Estats Units',
        'France'        => 'França',
        'Germany'       => 'Alemanya',
        'Netherlands'   => 'Països Baixos',
        'Norway'        => 'Noruega',
        'Switzerland'   => 'Suïssa',
        'Russia'        => 'Rússia',
        'Austria'       => 'Àustria',
        'Belgium'       => 'Bèlgica',
        'England'       => 'Anglaterra',
        'United Kingdom'=> 'Regne Unit',
        'Spain'         => 'Espanya',
        'Italy'         => 'Itàlia',
        'Denmark'       => 'Dinamarca',
        'Sweden'        => 'Suècia',
        'Scotland'      => 'Escòcia',
        'Mexico'        => 'Mèxic',
        'Japan'         => 'Japó',
        'China'         => 'Xina',
        'Greece'        => 'Grècia',
        'Poland'        => 'Polònia',
        'Hungary'       => 'Hongria',
        'Czech Republic'=> 'República Txeca',
        'Romania'       => 'Romania',
        // Castellà → Català
        'Alemania'      => 'Alemanya',
        'Espana'        => 'Espanya',
        'España'        => 'Espanya',
        'Francia'       => 'França',
        'Italia'        => 'Itàlia',
        'Paises Bajos'  => 'Països Baixos',
        'Países Bajos'  => 'Països Baixos',
        'Països baixos' => 'Països Baixos',
        'Estados Unidos'=> 'Estats Units',
        'Suiza'         => 'Suïssa',
        'Reino Unido'   => 'Regne Unit',
    ];

    return $corrections[$value] ?? $value;
}

function normalizeStyleCA(?string $text): string {
    $value = cleanTextField($text);
    if ($value === '') return '';

    $corrections = [
        'Modernism'               => 'Modernisme',
        'Impressionism'           => 'Impressionisme',
        'Post-Impressionism'      => 'Post-impressionisme',
        'Expressionism'           => 'Expressionisme',
        'Surrealism'              => 'Surrealisme',
        'Symbolism'               => 'Simbolisme',
        'Romanticism'             => 'Romanticisme',
        'Realism'                 => 'Realisme',
        'Cubism'                  => 'Cubisme',
        'Fauvism'                 => 'Fauvisme',
        'Abstract Expressionism'  => 'Expressionisme abstracte',
        'Neoclassicism'           => 'Neoclassicisme',
        'Baroque'                 => 'Barroc',
        'Renaissance'             => 'Renaixement',
        'Naturalism'              => 'Naturalisme',
        'Minimalism'              => 'Minimalisme',
        'Pop Art'                 => 'Pop Art',
        'Art Nouveau'             => 'Art Nouveau',
        'Art Deco'                => 'Art Déco',
    ];

    return $corrections[$value] ?? $value;
}

function normalizeDescriptionCA(?string $text): string {
    $value = cleanTextField($text);
    if (preg_match('/^Art Institute of Chicago\.?$/i', $value)) return '';
    return $value;
}

// Extreu l'image_id (UUID) d'una URL IIIF d'artic.edu o d'una URL ja convertida.
function extractImageId(string $imageUrl): string {
    return preg_match('/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/', $imageUrl, $m)
        ? $m[0]
        : '';
}

function normalizeArtworkRecord(array $artwork): array {
    $id = (string)($artwork['id'] ?? '');
    $title  = cleanTextField($artwork['title'] ?? '', 'Sense títol');
    $artist = cleanTextField($artwork['artist'] ?? '', 'Artista desconegut');
    $year   = normalizeDateCA($artwork['year'] ?? '');
    $origin = normalizePlaceCA($artwork['origin'] ?? '');
    $medium = cleanTextField($artwork['medium'] ?? '');
    $style  = normalizeStyleCA(cleanTextField($artwork['style'] ?? ''));
    $description = normalizeDescriptionCA($artwork['description'] ?? '');
    $shortDescription = normalizeDescriptionCA($artwork['shortDescription'] ?? '');

    if ($shortDescription === '') {
        $shortDescription = $description !== ''
            ? mb_strimwidth($description, 0, 120, '…')
            : '';
    }

    if (isset(TITLE_OVERRIDES_CA[$id])) {
        $title = TITLE_OVERRIDES_CA[$id];
    }

    // Les imatges es serveixen pel proxy local (artic.edu bloqueja el hotlinking).
    $imageId = extractImageId((string)($artwork['image'] ?? ''));
    $artwork['imageId'] = $imageId;
    $artwork['image']   = $imageId !== '' ? "api/artic-image.php?id={$imageId}&w=" . IMAGE_WIDTH : '';

    $artwork['title'] = $title;
    $artwork['artist'] = $artist;
    $artwork['year'] = $year;
    $artwork['origin'] = $origin;
    $artwork['medium'] = $medium;
    $artwork['style'] = $style;
    $artwork['description'] = $description;
    $artwork['shortDescription'] = $shortDescription;
    $audioParts = [$title . ', de ' . $artist];
    if ($year !== '')   $audioParts[] = $year;
    if ($origin !== '') $audioParts[] = 'Lloc d\'origen: ' . $origin;
    if ($medium !== '') $audioParts[] = 'Tècnica: ' . $medium;
    if ($style !== '')  $audioParts[] = 'Moviment artístic: ' . $style;
    $artwork['audioText'] = implode('. ', $audioParts) . '.';
    unset($artwork['category']);

    return $artwork;
}

function datasetHasBadTranslations(array $items): bool {
    foreach ($items as $item) {
        if (!is_array($item)) continue;
        foreach (['title', 'origin', 'medium', 'style', 'description', 'shortDescription', 'audioText'] as $field) {
            if (isBadTranslationPayload($item[$field] ?? null)) return true;
        }
    }
    return false;
}

function cacheMatchesPool(array $items, array $expectedIds): bool {
    if (empty($items) || empty($expectedIds)) return false;
    $allowed = array_fill_keys(array_map('strval', $expectedIds), true);

    foreach ($items as $item) {
        if (!is_array($item)) return false;
        $id = (string)($item['id'] ?? '');
        if ($id === '' || !isset($allowed[$id])) return false;
    }

    return true;
}

function translateToCA(string $text): string {
    if (trim($text) === '') return $text;
    $input = mb_substr($text, 0, 480); // MyMemory free tier limit is 500 chars
    $url = 'https://api.mymemory.translated.net/get?q='
         . urlencode($input) . '&langpair=en|ca';
    $ctx = stream_context_create(['http' => ['timeout' => 6, 'ignore_errors' => true]]);
    $res = @file_get_contents($url, false, $ctx);
    if (!$res) return $input;
    $json = json_decode($res, true);
    $translated = $json['responseData']['translatedText'] ?? '';
    if ($translated === '' || isBadTranslationPayload($translated)) {
        return $input;
    }
    return cleanTextField($translated, $input);
}

// Les imatges es serveixen pel proxy local (api/artic-image.php): el servidor
// IIIF de l'AIC bloqueja les peticions anònimes del navegador (403 Cloudflare).
function toLocalImageUrl(array $artwork): array {
    $image = (string)($artwork['image'] ?? '');
    if (preg_match('#/iiif/2/([0-9a-f-]{36})/#', $image, $matches)) {
        $artwork['imageId'] = $matches[1];
        $artwork['image']   = 'api/artic-image.php?id=' . $matches[1] . '&w=843';
    }
    return $artwork;
}

// ─── Configuració ─────────────────────────────────────────────────────────

const POOLS = ['a' => POOL_A, 'b' => POOL_B, 'c' => POOL_C];

const BASE_URL        = 'https://api.artic.edu/api/v1';
const BASE_IMG        = 'https://www.artic.edu/iiif/2';
const IMAGE_WIDTH     = 843;
const CAMPS           = 'id,title,artist_title,date_display,place_of_origin,medium_display,style_title,image_id,description,is_public_domain';
const ARTWORKS_VISIT  = 8;
const CACHE_TTL       = 86400; // 24h en segons
const CACHE_DIR       = __DIR__ . '/../data/';

// ─── Selecció aleatòria de pool (prioritza les que tenen caché vàlida) ──────

$poolKeys = array_keys(POOLS);

$cachedPoolKeys = array_filter($poolKeys, function($key) {
    $file = CACHE_DIR . "artic-cache-pool-{$key}.json";
    if (!file_exists($file)) return false;
    $raw = json_decode(file_get_contents($file), true);
    return is_array($raw) && isset($raw['timestamp']) && (time() - $raw['timestamp']) < CACHE_TTL;
});

$availableKeys = !empty($cachedPoolKeys) ? array_values($cachedPoolKeys) : $poolKeys;
$chosenKey     = $availableKeys[array_rand($availableKeys)];
$poolIds       = POOLS[$chosenKey];

// ─── Caché per pool ────────────────────────────────────────────────────────

$cacheFile = CACHE_DIR . "artic-cache-pool-{$chosenKey}.json";

$cached = null;
$cachedFallback = null;
if (file_exists($cacheFile)) {
    $raw = json_decode(file_get_contents($cacheFile), true);
    if (is_array($raw) && isset($raw['timestamp']) && (time() - $raw['timestamp']) < CACHE_TTL) {
        $rawData = $raw['data'] ?? [];
        $cacheMatchesExpectedPool = cacheMatchesPool($rawData, $poolIds);
        if ($cacheMatchesExpectedPool) {
            $cachedFallback = array_map('normalizeArtworkRecord', $rawData);
        }
        if ($cacheMatchesExpectedPool && !datasetHasBadTranslations($rawData)) {
            $cached = $cachedFallback;
        }
    }
}

// ─── Fetch de la pool si la caché és invàlida ─────────────────────────────

if ($cached === null) {
    $fetched = [];

    foreach ($poolIds as $id) {
        $url     = BASE_URL . "/artworks/{$id}?fields=" . CAMPS;
        $context = stream_context_create(['http' => [
            'timeout'       => 8,
            'ignore_errors' => true,
            'header'        => "User-Agent: Mozilla/5.0 (compatible; EndinsART/1.0)\r\n"
                             . "AIC-User-Agent: EndinsART-projecte-escolar\r\n",
        ]]);
        $resposta = @file_get_contents($url, false, $context);
        if ($resposta === false) continue;

        $json = json_decode($resposta, true);
        $obra = $json['data'] ?? null;
        if (!$obra || empty($obra['image_id']) || $obra['is_public_domain'] !== true) continue;

        $imageUrl = BASE_IMG . "/{$obra['image_id']}/full/" . IMAGE_WIDTH . ",/0/default.jpg";
        $desc     = isset($obra['description'])
            ? strip_tags((string)$obra['description'])
            : '';

        $titleCA  = translateToCA($obra['title']           ?? '');
        $descCA   = translateToCA($desc);
        $styleCA  = translateToCA($obra['style_title']     ?? '');
        $mediumCA = translateToCA($obra['medium_display']  ?? '');
        $originCA = translateToCA($obra['place_of_origin'] ?? '');

        $fetched[] = [
            'id'          => (string)($obra['id'] ?? ''),
            'title'       => $titleCA  ?: ($obra['title'] ?? 'Sense títol'),
            'artist'      => $obra['artist_title'] ?? 'Artista desconegut',
            'year'        => $obra['date_display'] ?? '',
            'origin'      => $originCA,
            'medium'      => $mediumCA,
            'style'       => $styleCA,
            'image'       => $imageUrl,
            'description' => $descCA,
            'shortDescription' => mb_strimwidth($descCA ?: 'Art Institute of Chicago.', 0, 120, '…'),
            'audioText'   => ($titleCA ?: ($obra['title'] ?? 'Obra'))
                             . ', per ' . ($obra['artist_title'] ?? 'artista desconegut')
                             . ($obra['date_display'] ? '. ' . $obra['date_display'] . '.' : ''),
        ];
    }

    if (!empty($fetched)) {
        $fetched = array_map('normalizeArtworkRecord', $fetched);
        file_put_contents($cacheFile, json_encode([
            'timestamp' => time(),
            'data'      => $fetched,
        ], JSON_UNESCAPED_UNICODE), LOCK_EX);
        $cached = $fetched;
    } elseif ($cachedFallback !== null) {
        $cached = $cachedFallback;
    }
}

// ─── Fallback global: qualsevol altra pool amb caché vàlida ─────────────────

if (empty($cached)) {
    foreach ($poolKeys as $fallbackKey) {
        if ($fallbackKey === $chosenKey) continue;
        $fallbackFile = CACHE_DIR . "artic-cache-pool-{$fallbackKey}.json";
        if (!file_exists($fallbackFile)) continue;
        $fbRaw = json_decode(file_get_contents($fallbackFile), true);
        if (!is_array($fbRaw) || empty($fbRaw['data'])) continue;
        $cached = array_map('normalizeArtworkRecord', $fbRaw['data']);
        break;
    }
}

// ─── Selecció aleatòria d'obres de la pool ─────────────────────────────

if (empty($cached)) {
    echo json_encode([]);
    exit;
}

shuffle($cached);
$result = array_map('toLocalImageUrl', array_slice($cached, 0, ARTWORKS_VISIT));

echo json_encode(array_values($result), JSON_UNESCAPED_UNICODE);
