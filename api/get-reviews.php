<?php
// Retorna totes les ressenyes amb mitjana i comptador — EndinsART

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

require_once __DIR__ . '/../includes/db.php';

$stmt    = $pdo->query('SELECT id, name, rating, comment, created_at FROM reviews ORDER BY created_at DESC');
$reviews = $stmt->fetchAll();

$count   = count($reviews);
$average = $count > 0
    ? round(array_sum(array_column($reviews, 'rating')) / $count, 1)
    : 0;

echo json_encode([
    'reviews' => $reviews,
    'average' => $average,
    'count'   => $count,
], JSON_UNESCAPED_UNICODE);
