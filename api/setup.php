<?php
// Configura la base de dades per a EndinsART.
// Es pot executar tantes vegades com calgui: només crea allò que no existeix.

require_once __DIR__ . '/../includes/status-page.php';

$host  = 'localhost';
$user  = 'root';
$pass  = '';
$db    = 'endinsart_visites';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // 1. Connexió al servidor MySQL sense seleccionar cap base de dades.
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, $options);

    // 2. Crear la base de dades si no existeix.
    $dbExistsStmt = $pdo->prepare('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = :db');
    $dbExistsStmt->execute(['db' => $db]);
    $dbAlreadyExists = (bool) $dbExistsStmt->fetchColumn();

    if (!$dbAlreadyExists) {
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    }

    // 3. Reconnexió dins de la base de dades del projecte.
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, $options);

    // ── Taula reviews ────────────────────────────────────────────────────────

    $tableExistsStmt = $pdo->prepare('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :table');
    $tableExistsStmt->execute(['db' => $db, 'table' => 'reviews']);
    $tableAlreadyExists = (bool) $tableExistsStmt->fetchColumn();

    if (!$tableAlreadyExists) {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `reviews` (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                name       VARCHAR(100) NOT NULL,
                rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                comment    TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
    }

    // ── Sortida ──────────────────────────────────────────────────────────────

    $content = sprintf(
        '<p class="estat-panell__missatge estat-panell__missatge--ok">✔ Sistema preparat correctament.</p>
        <div class="estat-panell__llista">
          <p><strong>Base de dades</strong> <code>%s</code>: %s.</p>
          <p><strong>Taula <code>reviews</code></strong>: %s.</p>
        </div>
        <p class="estat-panell__accio"><a href="../index.php" class="boto boto--primari">Tornar a l\'inici</a></p>',
        htmlspecialchars($db, ENT_QUOTES, 'UTF-8'),
        $dbAlreadyExists ? 'ja existia' : 'creada ara',
        $tableAlreadyExists ? 'ja existia' : 'creada ara'
    );

    renderStatusPage('EndinsART — Configuració de la base de dades', $content, 'ok');

} catch (PDOException $e) {
    http_response_code(500);
    renderStatusPage(
        'EndinsART — Configuració de la base de dades',
        '<p class="estat-panell__missatge estat-panell__missatge--error">Error en preparar la base de dades. Comprova que XAMPP MySQL estigui actiu.</p>',
        'error'
    );
}
