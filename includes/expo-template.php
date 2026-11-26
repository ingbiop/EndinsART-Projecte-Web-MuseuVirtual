<main class="expo-pagina"
  data-room="<?= htmlspecialchars($roomId    ?? '') ?>"
  data-source="<?= htmlspecialchars($dataSource ?? '') ?>"
  data-exit="<?= htmlspecialchars($exitUrl    ?? 'mapa.php') ?>"
  data-hide-desc="<?= !empty($hideDescription) ? 'true' : 'false' ?>"
  aria-label="<?= htmlspecialchars($expoTitle ?? 'Exposició') ?>">

  <!-- Galeria: fletxes + marc + mat + imatge -->
  <div class="marc-envoltori" role="region" aria-label="<?= htmlspecialchars($expoTitle ?? 'Exposició') ?>">

    <button class="fletxa fletxa--anterior js-anterior" aria-label="Obra anterior" type="button" hidden aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>

    <div class="marc" id="marc-obra">
      <div class="mat">
        <div class="obra-escena js-obra-escena">
          <img id="obra-imatge" alt="" class="obra-imatge" hidden aria-hidden="true">
          <div class="obra-render js-obra-render" hidden aria-hidden="true"></div>
        </div>
      </div>
    </div>

    <button class="fletxa fletxa--seguent js-seguent" aria-label="Obra següent" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <polyline points="9 6 15 12 9 18"/>
      </svg>
    </button>

  </div>

  <!-- Placa informativa -->
  <div class="placa" id="placa">
    <div class="placa__superior">

      <button class="js-info-boto placa__info" aria-label="Més informació sobre l'obra" type="button">
        <div class="placa__text">
          <h2 id="obra-titol" class="placa__titol">—</h2>
          <p id="obra-artista" class="placa__artista"></p>
          <p id="obra-any" class="placa__any" hidden></p>
          <em class="obra-pista js-obra-pista" hidden></em>
        </div>
      </button>

      <button class="js-audio-boto placa__audio" aria-label="Escoltar audioguia" type="button">
        <img src="assets/imgs/ui/headphones.png" class="placa__auriculars" alt="" aria-hidden="true">
      </button>

    </div>
  </div>

  <!-- Punts de progrés -->
  <div class="punts-progres js-punts" role="list" aria-label="Progrés de l'exposició"></div>


</main>

<script type="module" src="<?= htmlspecialchars(asset_url('js/expo.js'), ENT_QUOTES, 'UTF-8') ?>"></script>
