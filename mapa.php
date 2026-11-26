<?php
$pageType  = 'dark';
$pageTitle = 'Mapa — EndinsART';
$musicFile = 'assets/music/acapulco - Jazeboo Soundcloud.mp3';

include 'includes/header.php';
?>

<div id="page-entrada" class="page-entrada" aria-hidden="true"></div>

<main id="contingut-principal" class="mapa-main-viewport">
  <section class="mapa-seccio" aria-labelledby="mapa-titol">

    <div class="mapa-capçal">
      <div class="mapa-capçal__text">
        <h1 class="mapa-titol" id="mapa-titol">Mapa del Museu</h1>
        <p class="mapa-desc">Selecciona la sala que vols visitar.</p>
      </div>
    </div>

    <div class="mapa-layout">
      <div class="mapa-main">
        <div class="planol-scroll" role="region" aria-label="Plànol interactiu del museu">
          <div class="planol">

        <!-- Sala 3 — superior esquerra (col 1–2, fila 1) -->
        <a href="expo3.php" class="planol__sala" data-room="expo3"
           aria-label="Sala 3: Exposició Temporal, Art Institute of Chicago">
          <span class="planol__sala-num" aria-hidden="true">SALA 03</span>
          <span class="planol__sala-nom">Exposició Temporal</span>
          <span class="planol__sala-sub">8 obres · Art Institute of Chicago</span>
          <span class="planol__sala-cta" aria-hidden="true">Entrar →</span>
          <svg class="planol__check" aria-hidden="true" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </a>

        <!-- Sala 2 — superior dreta (col 3–4, fila 1) -->
        <a href="expo2.php" class="planol__sala" data-room="expo2"
           aria-label="Sala 2: Objectes Animats">
          <span class="planol__sala-num" aria-hidden="true">SALA 02</span>
          <span class="planol__sala-nom">Objectes Animats</span>
          <span class="planol__sala-sub">8 obres · Art clàssic animat</span>
          <span class="planol__sala-cta" aria-hidden="true">Entrar →</span>
          <svg class="planol__check" aria-hidden="true" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </a>

        <!-- Entrada — inferior esquerra (col 1, fila 2) -->
        <div class="planol__entrada" aria-hidden="true">
          <svg class="planol__pin" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
          </svg>
          <p class="planol__entrada-text">Vostè<br>està aquí</p>
        </div>

        <!-- Sala 1 — inferior dreta (col 2–4, fila 2) · cel·la irregular: 3/4 amplada -->
        <a href="expo1.php" class="planol__sala planol__sala--principal" data-room="expo1"
           aria-label="Sala 1: Art Digital Interactiu">
          <span class="planol__sala-num" aria-hidden="true">SALA 01</span>
          <span class="planol__sala-nom">Art Interactiu</span>
          <span class="planol__sala-sub">10 obres · Art contemporani</span>
          <span class="planol__sala-cta" aria-hidden="true">Entrar →</span>
          <svg class="planol__check" aria-hidden="true" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </a>

        <!-- Portes -->
        <!-- expo3 ↔ entrada: mur horitzontal a y=50%, centrat en col 1 (x=12.5%) -->
        <div class="planol__porta planol__porta--h planol__porta--expo3-entrada" aria-hidden="true">
          <div class="planol__porta__gap"></div>
          <div class="planol__porta__arc"></div>
        </div>

        <!-- entrada ↔ expo1: mur vertical a x=25%, centrat en fila 2 (y=75%) -->
        <div class="planol__porta planol__porta--v planol__porta--entrada-expo1" aria-hidden="true">
          <div class="planol__porta__gap"></div>
          <div class="planol__porta__arc"></div>
        </div>

        <!-- expo3 ↔ expo2: mur vertical a x=50%, centrat en fila 1 (y=25%) -->
        <div class="planol__porta planol__porta--v planol__porta--expo3-expo2" aria-hidden="true">
          <div class="planol__porta__gap"></div>
          <div class="planol__porta__arc"></div>
        </div>

        <!-- expo2 ↔ expo1: mur horitzontal a y=50%, centrat en cols 3–4 (x=75%) -->
        <div class="planol__porta planol__porta--h planol__porta--expo2-expo1" aria-hidden="true">
          <div class="planol__porta__gap"></div>
          <div class="planol__porta__arc"></div>
        </div>

          </div>
        </div>

        <div class="planol-peu">
          <div class="planol-llegenda" aria-hidden="true">
            <span class="planol-llegenda__item">
              <span class="planol-llegenda__mostra planol-llegenda__mostra--pendent"></span>
              Per visitar
            </span>
            <span class="planol-llegenda__item">
              <span class="planol-llegenda__mostra planol-llegenda__mostra--visitat"></span>
              Ja visitada
            </span>
          </div>
          <p class="mapa-progres js-progres" aria-live="polite" aria-atomic="true">
            Has visitat 0 de 3 sales
          </p>
        </div>
      </div>

      <aside class="mapa-sidebar" aria-labelledby="mapa-cerca-titol">
        <div class="cerca-panel">
          <p class="cerca-panel__eyebrow">Navegació ràpida</p>
          <h2 class="cerca-panel__titol" id="mapa-cerca-titol">Cerca d’obres</h2>
          <p class="cerca-panel__text">Busca per títol o artista i entra directament a la sala correcta.</p>

          <div class="cerca" role="search" aria-label="Cerca d'obres a la col·lecció">
            <div class="cerca__grup">
              <svg class="cerca__icona" aria-hidden="true" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <label for="cerca-input" class="visualment-ocult">Cerca per títol o artista</label>
              <input
                id="cerca-input"
                class="cerca__input js-cerca-input"
                type="search"
                placeholder="Busca per títol o artista…"
                autocomplete="off"
                spellcheck="false"
                aria-autocomplete="list"
                aria-controls="cerca-dropdown"
                aria-expanded="false"
              >
            </div>
            <div
              id="cerca-dropdown"
              class="cerca__dropdown"
              role="listbox"
              aria-label="Resultats de la cerca"
              hidden
            ></div>
          </div>
        </div>
      </aside>
    </div>

  </section>
</main>

<script type="module" src="<?= htmlspecialchars(asset_url('js/main.js'), ENT_QUOTES, 'UTF-8') ?>"></script>
<script type="module" src="<?= htmlspecialchars(asset_url('js/mapa.js'), ENT_QUOTES, 'UTF-8') ?>"></script>

<?php include 'includes/footer.php'; ?>
