<?php
session_start();

if (!isset($_SESSION['visites_access'])) {
  $pageType  = 'expo';
  $pageTitle = 'Accés restringit — EndinsART';
  $expoTitle = '';
  include 'includes/header.php';
  ?>
  <main class="acces-negat-pagina">
    <div class="acces-negat">
      <div class="acces-negat__icona" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <p class="acces-negat__kicker">Accés restringit</p>
      <h1>Aquesta pàgina no és accessible directament.</h1>
      <p>El llibre de ressenyes s'obre en acabar la visita de la <strong>Sala&nbsp;3</strong>.</p>
      <a href="expo3.php" class="boto boto--primari">Visitar la Sala 3</a>
    </div>
  </main>
  <?php
  include 'includes/footer.php';
  exit;
}

$pageType  = 'expo';
$pageTitle = 'Llibre de Ressenyes — EndinsART';
$expoTitle = 'Llibre de Ressenyes';
$musicFile = 'assets/music/sigmamusicart-epic-cinematic-background-music-434442.mp3';

include 'includes/header.php';
?>

<main class="visites-main">
  <div class="visites-pag">

    <section class="visites-form-seccio" aria-labelledby="form-titol">
      <h2 id="form-titol">Deixa la teva ressenya</h2>

      <form id="forma-ressenya" novalidate>

        <div class="camp">
          <label for="nom">Nom</label>
          <input type="text" id="nom" name="nom"
                 required minlength="2" maxlength="100"
                 autocomplete="name"
                 aria-required="true"
                 aria-describedby="error-nom">
          <span class="camp__error" id="error-nom" role="alert" hidden></span>
        </div>

        <fieldset class="camp">
          <legend>Valoració</legend>
          <div class="estrelles-input" role="group" aria-label="Selecciona una valoració d'1 a 5 estrelles">
            <input type="radio" id="star5" name="rating" value="5" aria-label="5 estrelles">
            <label for="star5" title="5 — Excel·lent">★</label>
            <input type="radio" id="star4" name="rating" value="4" aria-label="4 estrelles">
            <label for="star4" title="4 — Molt bona">★</label>
            <input type="radio" id="star3" name="rating" value="3" aria-label="3 estrelles">
            <label for="star3" title="3 — Correcta">★</label>
            <input type="radio" id="star2" name="rating" value="2" aria-label="2 estrelles">
            <label for="star2" title="2 — Millorable">★</label>
            <input type="radio" id="star1" name="rating" value="1" aria-label="1 estrella">
            <label for="star1" title="1 — Fluixa">★</label>
          </div>
          <span class="camp__error" id="error-rating" role="alert" hidden></span>
        </fieldset>

        <div class="camp">
          <label for="comentari">Comentari</label>
          <textarea id="comentari" name="comentari"
                    rows="4" required maxlength="2000"
                    aria-required="true"
                    aria-describedby="error-comentari"
                    placeholder="Què t'ha semblat la visita?"></textarea>
          <span class="camp__error" id="error-comentari" role="alert" hidden></span>
        </div>

        <button type="submit" class="boto boto--primari js-boto-enviar">
          Enviar ressenya
        </button>

        <p class="ressenya-feedback js-feedback" aria-live="polite" hidden></p>

      </form>
    </section>

    <section class="visites-llista-seccio" aria-labelledby="llista-titol">
      <h2 id="llista-titol">Ressenyes</h2>

      <div class="visites-mitjana js-mitjana" aria-live="polite" aria-label="Valoració mitjana"></div>

      <div class="visites-llista js-llista" aria-live="polite" aria-label="Llista de ressenyes">
        <p class="visites-buit">Encara no hi ha ressenyes.</p>
      </div>
    </section>

  </div>
</main>

<script type="module" src="<?= htmlspecialchars(asset_url('js/main.js'), ENT_QUOTES, 'UTF-8') ?>"></script>
<script type="module" src="<?= htmlspecialchars(asset_url('js/visites.js'), ENT_QUOTES, 'UTF-8') ?>"></script>

<?php include 'includes/footer.php'; ?>
