# EndinsART — Museu virtual d'art digital i interactiu

© 2026 Íngrid Palomino Pérez  
Projecte final del Curs de Confecció i Publicació de Pàgines Web 2025–2026 · CIFO La Violeta, Barcelona

---

## Descripció

**EndinsART** és un museu virtual construït sense frameworks, amb navegació entre sales, obres interactives, audioguies en català, mapa de visita i llibre de ressenyes.

Repositori: <https://github.com/ingbiop/EndinsART>

---

## En xifres

| Element | Valor |
|---|---|
| Sales | 3 |
| Obres totals | 26 |
| Sala 1 | 10 obres |
| Sala 2 | 8 obres |
| Sala 3 | 8 obres per visita (API) |
| Pools API | 3 (A, B, C) · 47 obres disponibles |
| Mòduls JS | 8 a `js/modules/` |
| Caché API | 24 h per pool |
| Stack | HTML · CSS · JS · PHP · MySQL |

---

## Flux de navegació

```text
index.php
  ↓
mapa.php
  ├─→ expo1.php  (Sala 1 · 10 obres)  → última obra → mapa.php
  ├─→ expo2.php  (Sala 2 · 8 obres)   → última obra → mapa.php
  └─→ expo3.php  (Sala 3 · 8 obres)   → última obra → llibre-visites.php

about.php  →  pàgina tècnica del projecte
```

---

## Sales

### Sala 1 — Art Interactiu · `data/expo1.json`

| Obra | Interacció |
|---|---|
| Composició Nº II | selector de color |
| Nena amb Globus | efecte shred |
| Nit i Dia | comparador dia/nit |
| El Caminant sobre el Mar de Boira | parallax de 3 capes |
| Esferes de Vida | metaballs |
| Retrat de Mae West | zoom i pan |
| El Fill de l'Home | arrossegable |
| El Bes | puzzle |
| Retrat de la Reina | seguiment de mirada |
| La Persistència de la Memòria | vidre que revela la imatge |

### Sala 2 — Objectes Animats · `data/expo2.json`

| Obra | Interacció |
|---|---|
| Construcció Perpètua | cub de Rubik animat en CSS |
| Horitzó de tinta | vaixells sobre l'aigua (pintura xinesa) |
| Pulsacions cromàtiques | gotes de pintura sobre canvas |
| La caiguda del genet | cavall i crani animats amb CSS |
| Ones paramètriques | corba de Bézier amb soroll de Perlin |
| Hipnosi | engranatges planetaris en SVG |
| Remolins | partícules sobre un camp de fluxos |
| Topografia del Buit | anells topogràfics amb filtre SVG |

Tècniques: CSS pur · Canvas 2D · SVG · animació procedural · renderitzat generatiu

### Sala 3 — Exposició Temporal · `api/get-artic-api.php`

Cada visita selecciona aleatòriament una pool. El backend normalitza els camps al català i en retorna 8 obres. La caché de 24 h per pool redueix les peticions a l'API externa.

Les imatges passen pel proxy local `api/artic-image.php`: el servidor d'imatges de l'Art Institute of Chicago respon 403 (Cloudflare) a les peticions anònimes del navegador, de manera que PHP les descarrega identificant-se amb la capçalera `AIC-User-Agent` i les desa a `data/img-cache/`.

| Pool | Temàtica |
|---|---|
| A | Expressionisme i avantguarda europea |
| B | Impressionisme i postimpressionisme europeu |
| C | Modernisme i paisatgisme americà |

---

## Característiques tècniques

- **Ticket d'entrada animat** a la homepage amb transició cap al mapa
- **Música amb continuïtat** entre `index.php` i `mapa.php` via `sessionStorage`
- **Motor compartit d'exposicions** (`expo.js`): punts de progrés, placa, modal, navegació per teclat i audioguia
- **Mapa interactiu** amb memòria de sales visitades via `localStorage`
- **Audioguies en català** via Web Speech API, amb fallback a veu espanyola si no n'hi ha de catalana disponible al sistema
- **Modals accessibles** amb focus trap i tancament per `Escape`
- **Responsive mobile-first** a totes les pàgines
- **Formulari de ressenyes** amb validació al client i al servidor
- **Cap estil ni script inline**: tot l'estil és a `css/style.css`. Només queden com a propietats de JS els valors calculats en temps real (posició en arrossegar, mides mesurades, transformacions per frame)

---

## Stack tecnològic

| Tecnologia | Ús |
|---|---|
| HTML5 | Estructura semàntica i accessibilitat |
| CSS3 | Variables, Grid, Flexbox, animacions i responsive |
| JavaScript ES Modules | Navegació, sales, ressenyes i motor visual |
| Canvas 2D API | Obres interactives i generatives |
| Web Speech API | Síntesi de veu de les audioguies |
| PHP 8 | Plantilles, endpoints JSON, normalització i caché |
| PDO + MySQL | Persistència del llibre de visites |
| Art Institute of Chicago API | Obres públiques per a la sala temporal (amb proxy d'imatges local) |
| MyMemory API | Suport a la normalització de metadades al català |

---

## Arquitectura JavaScript

| Fitxer | Responsabilitat |
|---|---|
| `js/main.js` | Capçalera global i continuïtat de la música |
| `js/home.js` | Mural d'art, parallax i ticket d'entrada |
| `js/mapa.js` | Plànol interactiu, cerca i progrés de sales |
| `js/expo.js` | Motor compartit de les tres sales |
| `js/visites.js` | Llibre de ressenyes |

**Mòduls a `js/modules/`:** `api.js` · `artwork-renderers.js` · `audioguia.js` · `dom.js` (escapat d'HTML compartit) · `modal.js` · `reviews.js` · `storage.js` · `validation.js`

`artwork-renderers.js` concentra tots els renderers i les interaccions de les obres locals.

---

## Estructura del projecte

```text
EndinsART/
├── api/
│   ├── artic-image.php         → proxy d'imatges de l'ARTIC (evita el 403 de Cloudflare)
│   ├── auth-visites.php        → activa la sessió d'accés al llibre (des de Sala 3)
│   ├── get-artic-api.php       → fetch, normalització i caché de l'ARTIC
│   ├── get-reviews.php
│   ├── save-review.php
│   └── setup.php               → crea la BD i les taules (idempotent)
├── assets/
│   ├── imgs/
│   │   ├── logos/              → logos de la pàgina «Sobre el projecte»
│   │   ├── quadres/            → imatges de les obres locals
│   │   └── ui/                 → icones de la interfície
│   └── music/
├── css/
│   └── style.css
├── data/
│   ├── expo1.json
│   ├── expo2.json
│   ├── artic-cache-pool-{a|b|c}.json   → caché (es regenera, no es versiona)
│   └── img-cache/                      → imatges descarregades (no es versiona)
├── deliverables/               → memòria i proposta final (DOCX, PDF, MD)
├── includes/
│   ├── assets.php              → asset_url(): versionat de CSS/JS per data de modificació
│   ├── config.php              → credencials de la BD (únic lloc)
│   ├── db.php
│   ├── expo-template.php
│   ├── footer.php
│   ├── header.php
│   └── status-page.php
├── js/
│   ├── expo.js
│   ├── home.js
│   ├── main.js
│   ├── mapa.js
│   ├── visites.js
│   └── modules/
│       ├── api.js
│       ├── artwork-renderers.js
│       ├── audioguia.js
│       ├── dom.js
│       ├── modal.js
│       ├── reviews.js
│       ├── storage.js
│       └── validation.js
├── scripts/ · tools/           → scripts Python que generen la taula i els documents
├── about.php
├── endinsart_visites.sql       → exportació de la BD (alternativa a setup.php)
├── expo1.php
├── expo2.php
├── expo3.php
├── index.php
├── llibre-visites.php
├── mapa.php
├── slides.html · taula-emmagatzematge-endinsart.{html,png}
└── README.md
```

---

## Posada en marxa

**Requisits:** XAMPP (o equivalent) amb Apache, PHP 8 i MySQL.

```text
1. Clona el repositori dins de C:\xampp\htdocs\ amb el nom IngridPalomino_EndinsART:
   git clone https://github.com/ingbiop/EndinsART.git IngridPalomino_EndinsART
2. Engega Apache i MySQL des del panell XAMPP
3. Si cal, actualitza les credencials a includes/config.php
4. Executa:  http://localhost/IngridPalomino_EndinsART/api/setup.php
5. Obre:     http://localhost/IngridPalomino_EndinsART/
```

La carpeta ha de dir-se `IngridPalomino_EndinsART` perquè les URL d'aquest README siguin vàlides. Les rutes del codi són relatives, així que funciona amb qualsevol nom.

**Rutes útils en local:**

| Pàgina | URL |
|---|---|
| Inici | `http://localhost/IngridPalomino_EndinsART/` |
| Mapa | `http://localhost/IngridPalomino_EndinsART/mapa.php` |
| About | `http://localhost/IngridPalomino_EndinsART/about.php` |
| Setup BD | `http://localhost/IngridPalomino_EndinsART/api/setup.php` |
| Activar llibre (proves) | `http://localhost/IngridPalomino_EndinsART/api/auth-visites.php` |

---

## Base de dades

`setup.php` és idempotent: crea la base de dades `endinsart_visites` i la taula `reviews` si no existeixen. Alternativament, es pot importar `endinsart_visites.sql` des de phpMyAdmin.

```sql
CREATE TABLE reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  rating     TINYINT NOT NULL,
  comment    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Notes

- `llibre-visites.php` requereix sessió activa. S'hi arriba al final de la Sala 3, o directament via `api/auth-visites.php` per a proves.
- La Sala 3 depèn de serveis externs; la caché local amorteix errors de xarxa i redueix peticions a l'API.
- `localStorage` conserva el progrés de sales fins que l'usuari esborra les dades del navegador.
- L'accent de les audioguies depèn de les veus del sistema; s'usa veu espanyola com a fallback si no n'hi ha de catalana.
- Si les imatges de la Sala 3 no es veuen, comprova que Apache pot sortir a Internet (el proxy `api/artic-image.php` les descarrega la primera vegada) i que `data/` té permisos d'escriptura. Esborrar `data/img-cache/` i les caché `artic-cache-pool-*.json` força una nova descàrrega.
- Les caché de `data/` es creen soles i no es versionen (vegeu `.gitignore`).

---

## Crèdits i imatges

- **Sala 3**: obres de domini públic de l'[Art Institute of Chicago](https://www.artic.edu/open-access/public-api), accessibles amb la seva API oberta.
- **El Caminant sobre el Mar de Boira** (Caspar David Friedrich, 1818): domini públic, reproducció de Wikimedia Commons.
- **Horitzó de tinta**: composició inspirada en la peça de Lisha Chen; la barca prové de l'arxiu de la peça original (recuperada d'Internet Archive) i el fons de muntanyes és un SVG propi.
- **Sala 2 i part de la Sala 1**: peces generatives recreades a partir de CodePens dels seus autors, que s'enllacen des de la placa de cada obra.
- **Música**: vegeu `assets/music/source-music.md`.

---

## Millores futures

- **Experiència immersiva**: navegació lateral per les sales, fons i parets animats, guia o personatge d'acompanyament, efecte tridimensional entre passadissos.
- **Taller creatiu**: composicions lliures amb el cursor exportables com a imatge, i filtres aplicables a imatges pujades per l'usuari (sèpia, glitch, pixelat, etc.).
- **Botiga virtual**: marxandatge inspirat en les obres, amb carret i secció de preferits.
- **Usuaris i administració**: registre, inici de sessió, rols (visitant / administrador), CRUD complet de ressenyes i moderació des d'un panell segur.
