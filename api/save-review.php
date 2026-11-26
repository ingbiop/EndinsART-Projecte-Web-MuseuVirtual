<?php
// Desa una ressenya nova a la base de dades — EndinsART

header('Content-Type: application/json; charset=utf-8');

const NAME_MIN_LENGTH    = 2;
const NAME_MAX_LENGTH    = 100;  // coincideix amb reviews.name VARCHAR(100)
const COMMENT_MAX_LENGTH = 2000;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Mètode no permès.']);
    exit;
}

$cos   = file_get_contents('php://input');
$dades = json_decode($cos, true);

if (!is_array($dades)) {
    http_response_code(400);
    echo json_encode(['error' => 'Format de dades invàlid.']);
    exit;
}

$nom       = trim((string)($dades['name']    ?? ''));
$rating    = (int)($dades['rating']          ?? 0);
$comentari = trim((string)($dades['comment'] ?? ''));

$errors = [];
if (mb_strlen($nom) < NAME_MIN_LENGTH || mb_strlen($nom) > NAME_MAX_LENGTH) {
    $errors['name'] = sprintf('El nom ha de tenir entre %d i %d caràcters.', NAME_MIN_LENGTH, NAME_MAX_LENGTH);
}
if ($rating < 1 || $rating > 5) {
    $errors['rating'] = 'La valoració ha de ser entre 1 i 5.';
}
if ($comentari === '' || mb_strlen($comentari) > COMMENT_MAX_LENGTH) {
    $errors['comment'] = sprintf('El comentari ha de tenir entre 1 i %d caràcters.', COMMENT_MAX_LENGTH);
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['error' => 'Dades invàlides.', 'errors' => $errors]);
    exit;
}

require_once __DIR__ . '/../includes/db.php';

$stmt = $pdo->prepare(
    'INSERT INTO reviews (name, rating, comment) VALUES (:name, :rating, :comment)'
);
$stmt->execute([
    ':name'    => $nom,
    ':rating'  => $rating,
    ':comment' => $comentari,
]);

echo json_encode(['ok' => true, 'missatge' => 'Ressenya desada correctament.'], JSON_UNESCAPED_UNICODE);
