<?php require_once __DIR__ . '/assets.php'; ?>
<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="EndinsART — Museu d'Art Virtual. Explora sales interactives amb obres d'art digitals, audioguies i molt més.">
  <title><?= htmlspecialchars($pageTitle ?? 'EndinsART') ?></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700&family=Cormorant+Garamond:wght@500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
  <?php if ($pageType === 'expo'): ?>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&icon_names=logout" rel="stylesheet">
  <?php endif; ?>
  <link rel="stylesheet" href="<?= htmlspecialchars(asset_url('css/style.css'), ENT_QUOTES, 'UTF-8') ?>">
</head>
<body class="<?= ($pageType === 'expo') ? 'pag-expo' : 'pag-fosca' ?><?= !empty($bodyExtraClass) ? ' ' . htmlspecialchars($bodyExtraClass) : '' ?>">

<?php if ($pageType !== 'expo'): ?>
<!-- ── Header fosc (inici / mapa / sobre) ── -->
<header class="capçalera capçalera--fosca" role="banner">

  <a href="index.php" class="logo" aria-label="EndinsART — Inici">EndinsART</a>

  <nav class="capçalera__nav" aria-label="Navegació principal">
    <a href="index.php">Inici</a>
    <a href="mapa.php">Mapa</a>
    <a href="about.php">Sobre el Projecte</a>
  </nav>

  <div class="capçalera__accions">
    <?php if (!empty($musicFile)): ?>
    <audio id="musica" src="<?= htmlspecialchars($musicFile) ?>" preload="auto" autoplay playsinline loop></audio>
    <?php endif; ?>

    <button class="js-hamburguesa" aria-expanded="false" aria-label="Obrir menú" aria-controls="nav-mobile" type="button">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>
  </div>

  <nav class="capçalera__nav-mobile" id="nav-mobile" aria-label="Menú mòbil">
    <a href="index.php">Inici</a>
    <a href="mapa.php">Mapa</a>
    <a href="about.php">Sobre el Projecte</a>
  </nav>

</header>

<?php else: ?>
<!-- ── Header exposició (expo1 / expo2 / expo3 / llibre-visites) ── -->
<header class="capçalera capçalera--expo" role="banner">

  <a href="index.php" class="boto-icona" aria-label="Inici">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </a>

  <h1 class="capçalera__titol"><?= htmlspecialchars($expoTitle ?? $pageTitle ?? 'EndinsART') ?></h1>

  <a href="mapa.php" class="boto-icona js-nav-mapa" aria-label="Mapa del museu">
    <svg class="js-nav-map-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
    <span class="material-symbols-outlined js-nav-exit-icon" hidden aria-hidden="true">logout</span>
  </a>

  <?php if (!empty($musicFile)): ?>
  <audio id="musica" src="<?= htmlspecialchars($musicFile) ?>" preload="none" autoplay playsinline loop></audio>
  <?php endif; ?>

</header>
<?php endif; ?>
