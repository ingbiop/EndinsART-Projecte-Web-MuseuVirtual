<?php
$pageType       = 'dark';
$pageTitle      = 'Sobre el Projecte - EndinsART';
$bodyExtraClass = 'pag-sobre';

include 'includes/header.php';
?>

<main class="sobre-pagina">

  <section class="sobre-hero contenidor" aria-labelledby="sobre-titol">
    <div class="sobre-hero__copia">
      <p class="sobre-kicker">Projecte final &middot; CIFO La Violeta &middot; 2025&ndash;2026</p>
      <h1 id="sobre-titol">EndinsART &mdash; museu virtual d&rsquo;art digital i interactiu</h1>
      <ul class="sobre-llista sobre-llista--hero">
        <li>3 sales: 10 obres a la Sala 1, 8 obres a la Sala 2 i 8 obres a la Sala 3</li>
        <li>18 peces locals amb interaccions, animacions i renderitzats propis</li>
        <li>Audioguies amb Web Speech API configurades en catal&agrave;</li>
        <li>Mapa interactiu amb mem&ograve;ria de visita via <code>localStorage</code></li>
        <li>Llibre de visites amb MySQL i PDO</li>
        <li>7 m&ograve;duls JavaScript ES sense cap framework extern</li>
      </ul>
    </div>

    <aside class="sobre-hero__panell" aria-label="Dades del projecte">
      <p class="sobre-kicker">En xifres</p>
      <ul class="sobre-resum">
        <li class="sobre-resum__fila">
          <span class="sobre-resum__valor">3</span>
          <div>
            <strong>Sales</strong>
            <p>Art interactiu, Objectes Animats i exposici&oacute; temporal via API</p>
          </div>
        </li>
        <li class="sobre-resum__fila">
          <span class="sobre-resum__valor">26</span>
          <div>
            <strong>Obres</strong>
            <p>10 a la Sala 1, 8 a la Sala 2, 8 a la Sala 3</p>
          </div>
        </li>
        <li class="sobre-resum__fila">
          <span class="sobre-resum__valor">24h</span>
          <div>
            <strong>Cach&eacute;</strong>
            <p>Les obres de l&rsquo;API es desen localment 24 hores (pool rotatiu)</p>
          </div>
        </li>
        <li class="sobre-resum__fila">
          <span class="sobre-resum__valor">5</span>
          <div>
            <strong>Tecnologies</strong>
            <p>HTML &middot; CSS &middot; JS &middot; PHP &middot; MySQL</p>
          </div>
        </li>
      </ul>
    </aside>
  </section>

  <section class="sobre-tech contenidor" aria-labelledby="stack-titol">
    <div class="sobre-seccio-cap">
      <p class="sobre-kicker">Stack</p>
      <h2 id="stack-titol">Tecnologies</h2>
    </div>

    <div class="sobre-tech__grid">
      <article class="sobre-tech-card sobre-tech-card--html">
        <div class="sobre-tech-card__emblema">
          <img src="assets/imgs/logos/logo-HTML.png" alt="HTML5" width="96" height="96">
        </div>
        <h3>HTML5</h3>
        <p>Estructura sem&agrave;ntica, accessibilitat i <code>aria-*</code></p>
      </article>

      <article class="sobre-tech-card sobre-tech-card--css">
        <div class="sobre-tech-card__emblema">
          <img src="assets/imgs/logos/logo-CSS.png" alt="CSS3" width="96" height="96">
        </div>
        <h3>CSS3</h3>
        <p>Variables, Grid, Flexbox, animacions i disseny responsive mobile-first</p>
      </article>

      <article class="sobre-tech-card sobre-tech-card--js">
        <div class="sobre-tech-card__emblema">
          <img src="assets/imgs/logos/logo-JS.svg" alt="JavaScript" width="96" height="96">
        </div>
        <h3>JavaScript</h3>
        <p>7 m&ograve;duls ES, Canvas 2D, SVG, fetch async/await, Speech API i <code>localStorage</code></p>
      </article>

      <article class="sobre-tech-card sobre-tech-card--php">
        <div class="sobre-tech-card__emblema">
          <img src="assets/imgs/logos/logo-php.png" alt="PHP" width="96" height="96">
        </div>
        <h3>PHP</h3>
        <p>Plantilles reutilitzables, cach&eacute; d&rsquo;API i endpoints JSON</p>
      </article>

      <article class="sobre-tech-card sobre-tech-card--mysql">
        <div class="sobre-tech-card__emblema">
          <img src="assets/imgs/logos/MySQL-logo.png" alt="MySQL" width="96" height="96">
        </div>
        <h3>MySQL</h3>
        <p>Llibre de visites amb PDO i sent&egrave;ncies preparades</p>
      </article>
    </div>
  </section>

  <section class="sobre-panells contenidor" aria-label="Informaci&oacute; del projecte">
    <article class="sobre-panell">
      <p class="sobre-kicker">Sales</p>
      <h2>Exposicions</h2>
      <ul class="sobre-llista">
        <li><strong>Sala 1 &mdash; Art Interactiu:</strong> 10 obres amb color, comparadors, parallax, metaballs, zoom, puzzle i seguiment del cursor</li>
        <li><strong>Sala 2 &mdash; Objectes Animats:</strong> 8 peces amb CSS, canvas, SVG i renderitzats generatius</li>
        <li><strong>Sala 3 &mdash; Exposici&oacute; Temporal:</strong> 8 obres per visita obtingudes de l&rsquo;Art Institute of Chicago via API</li>
      </ul>
    </article>

    <article class="sobre-panell">
      <p class="sobre-kicker">Dades</p>
      <h2>Fonts d&rsquo;informaci&oacute;</h2>
      <ul class="sobre-llista">
        <li>Sala 1 i 2: JSON local (<code>data/expo1.json</code>, <code>data/expo2.json</code>)</li>
        <li>Sala 3: API Art Institute of Chicago + cach&eacute; local de 24h + selecci&oacute; rotativa de 8 obres</li>
        <li>Progr&eacute;s de visita: <code>localStorage</code></li>
        <li>Ressenyes: MySQL via PDO</li>
      </ul>
    </article>

    <article class="sobre-panell">
      <p class="sobre-kicker">M&ograve;duls JS</p>
      <h2>Arquitectura modular</h2>
      <ul class="sobre-llista">
        <li><code>api.js</code> &mdash; <code>getJSON</code> / <code>postJSON</code></li>
        <li><code>artwork-renderers.js</code> &mdash; escenes, animacions i interaccions de les obres</li>
        <li><code>modal.js</code> &mdash; focus trap i tancament per Escape</li>
        <li><code>storage.js</code> &mdash; seguiment de sales visitades</li>
        <li><code>audioguia.js</code> &mdash; s&iacute;ntesi de veu amb prefer&egrave;ncia per veu catalana</li>
        <li><code>reviews.js</code> &mdash; renderitzat de ressenyes i estrelles</li>
        <li><code>validation.js</code> &mdash; validaci&oacute; del formulari</li>
      </ul>
    </article>

    <article class="sobre-panell">
      <p class="sobre-kicker">Accessibilitat</p>
      <h2>Inclusi&oacute; des del codi</h2>
      <ul class="sobre-llista">
        <li>Estructura HTML5 sem&agrave;ntica</li>
        <li><code>aria-label</code>, <code>aria-live</code>, <code>role</code></li>
        <li>Navegaci&oacute; per teclat i focus trap als modals</li>
        <li>Suport per a <code>prefers-reduced-motion</code></li>
      </ul>
    </article>

    <article class="sobre-panell sobre-panell--autor">
      <p class="sobre-kicker">Autoria</p>
      <h2>&Iacute;ngrid Palomino P&eacute;rez</h2>
      <p>Curs de Confecci&oacute; i Publicaci&oacute; de P&agrave;gines Web &middot; CIFO La Violeta, Barcelona &middot; 2025&ndash;2026</p>
    </article>
  </section>

</main>

<script type="module" src="<?= htmlspecialchars(asset_url('js/main.js'), ENT_QUOTES, 'UTF-8') ?>"></script>

<?php include 'includes/footer.php'; ?>
