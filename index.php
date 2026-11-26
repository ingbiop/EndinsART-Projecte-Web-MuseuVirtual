<?php
$pageType       = 'dark';
$pageTitle      = 'EndinsART — Museu d\'Art Virtual';
$musicFile      = 'assets/music/acapulco - Jazeboo Soundcloud.mp3';
$bodyExtraClass = 'pag-inici';

include 'includes/header.php';
?>

<div class="fons-inici" aria-hidden="true">
  <div class="fons-inici__gra"></div>
  <div class="art-wall" id="art-wall"></div>
</div>

<main class="hero-stage" id="contingut-principal">
  <section class="hero-panel" aria-labelledby="hero-titol">
    <h1 class="hero-titol" id="hero-titol">EndinsART</h1>
    <h2 class="hero-subtitol">Museu Virtual Interactiu</h2>
    <p class="hero-copy">Un espai immersiu on l&rsquo;art digital cobra vida.</p>
    <a href="mapa.php" class="boto boto--cta" id="cta-entrar">
      Entra al Museu <span aria-hidden="true">→</span>
    </a>
  </section>
</main>

<!-- Overlay de la transició ticket -->
<div id="ticket-overlay" aria-hidden="true" role="dialog" aria-label="Entrada al museu">
  <div class="ticket-envoltori" id="ticket-envoltori">

    <div class="ticket-top" id="ticket-top">
      <div class="tkt-franja"></div>
      <div class="tkt-cos">
        <div class="tkt-fila">
          <span class="tkt-cap">Entrada General</span>
          <span class="tkt-ref">#0001</span>
        </div>
        <p class="tkt-titol">EndinsART</p>
        <p class="tkt-sub">Museu d'Art Virtual</p>
        <p class="tkt-desc">Explora sales interactives amb obres d'art digital, audioguies i experiències immersives.</p>
        <div class="tkt-fila tkt-fila--separada">
          <span id="tkt-data"></span>
          <span>Barcelona</span>
        </div>
      </div>
    </div>

    <div class="tkt-perf" aria-hidden="true">
      <span class="tkt-muesca tkt-muesca--e"></span>
      <span class="tkt-guio"></span>
      <span class="tkt-muesca tkt-muesca--d"></span>
    </div>

    <div class="ticket-bottom" id="ticket-bottom">
      <div class="tkt-stub">
        <div class="tkt-stub__head">
          <div>
            <div class="tkt-stub__brand">EndinsART</div>
            <div class="tkt-stub__eyebrow">Entrada general</div>
          </div>
          <span class="tkt-codi-barres tkt-codi-barres--fosc" aria-hidden="true"></span>
        </div>
        <div class="tkt-stub__meta">
          <p><span class="tkt-stub__meta-strong">Inclou:</span> 3 sales • Audioguies • Obres interactives</p>
          <p class="tkt-stub__meta-note">No caduca. Una entrada per persona.</p>
        </div>
      </div>
    </div>

  </div>
</div>

<script type="module" src="<?= htmlspecialchars(asset_url('js/main.js'), ENT_QUOTES, 'UTF-8') ?>"></script>
<script type="module" src="<?= htmlspecialchars(asset_url('js/home.js'), ENT_QUOTES, 'UTF-8') ?>"></script>

<?php include 'includes/footer.php'; ?>
