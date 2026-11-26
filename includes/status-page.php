<?php

require_once __DIR__ . '/assets.php';

if (!function_exists('renderStatusPage')) {
    function renderStatusPage(string $title, string $contentHtml, string $variant = 'ok'): void
    {
        $allowedVariants = ['ok', 'error', 'neutral'];
        $safeVariant = in_array($variant, $allowedVariants, true) ? $variant : 'neutral';
        ?>
<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700&family=Cormorant+Garamond:wght@500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= htmlspecialchars(asset_url('css/style.css'), ENT_QUOTES, 'UTF-8') ?>">
</head>
<body class="pag-expo">
  <main class="estat-pagina">
    <section class="estat-panell estat-panell--<?= htmlspecialchars($safeVariant, ENT_QUOTES, 'UTF-8') ?>">
      <h1 class="estat-panell__titol"><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></h1>
      <?= $contentHtml ?>
    </section>
  </main>
</body>
</html>
<?php
    }
}
