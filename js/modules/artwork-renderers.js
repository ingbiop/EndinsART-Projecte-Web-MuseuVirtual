const DEFAULT_HINTS = {
  colorpicker:  'Toca una cel·la per obrir el selector de color.',
  toggle:       'Clica el quadre per alternar la composicio.',
  ratoli:       'Mou el cursor per desplacar els camps de color.',
  cicle:        'Clica per canviar la paleta pop.',
  drag:         'Arrossega els punts per recompondre la pintura.',
  particules:   'Mou el cursor per alterar el moviment de les partícules.',
  ones:         'Mou el cursor sobre l\'obra per deformar-ne el ritme.',
  animacio:     'Clica l\'obra per canviar el ritme del moviment.',
  fosa:         'Frega el quadre amb el cursor per esborrar la boira.',
  slider:       'Arrossega el divisor per comparar el dia i la nit.',
  zoom:         'Scroll per apropar · arrossega per explorar · mòbil: pinça i arrossega.',
  arrossegable: 'Arrossega la poma per descobrir el rostre.',
  puzzle:       'Arrossega les peces per restaurar l\'obra.',
  seguiment:    'Arrossega el nas i els llavis fins al seu lloc · els ulls et seguiran la mirada.',
  pinzell:      'Fes clic i arrossega per dibuixar sobre l\'obra.',
  daliglass:    'Mou el cursor sobre el vidre per revelar la pintura.',
  parallax:     'Mou el cursor per explorar la profunditat de la pintura.',
  metaballs:    'Observa la dansa de les esferes orgàniques.',
  rubik:        'Observa la deconstrucció perpètua del cub.',
  vaixell:      'Contempla el moviment del vaixell sobre les aigües.',
  dropaint:     'Observa les gotes de pintura en moviment.',
  cavall:       'Observa el cavall mentre l\'aigua puja lentament.',
  bezier:       'Fes clic per reiniciar les corbes de Bézier.',
  engranatges:  'Observa la rotació sincronitzada dels engranatges.',
  remolins:     'Contempla les partícules mentre naveguen pel camp de forces.',
  topografia:   'Observa els anells topogràfics mentre es formen i desformen.',
  shred:        'Clica per triturar l\'obra.',
};

const WARHOL_PALETTES = [
  { bg: '#ffd447', can: '#183153', label: '#ff5f6d', accent: '#fef9ef' },
  { bg: '#8ee3ef', can: '#16324f', label: '#f7b801', accent: '#f9fbff' },
  { bg: '#ff8fab', can: '#392f5a', label: '#00b2ca', accent: '#fff5f8' },
  { bg: '#9ef01a', can: '#3a0ca3', label: '#ff6b35', accent: '#fbfff1' },
  { bg: '#f9c74f', can: '#7b2cbf', label: '#277da1', accent: '#fffaf0' },
  { bg: '#f1fa8c', can: '#1d3557', label: '#e63946', accent: '#fffef5' },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const rand = (min, max) => min + Math.random() * (max - min);

const listen = (target, type, handler, options, cleanups) => {
  target.addEventListener(type, handler, options);
  cleanups.push(() => target.removeEventListener(type, handler, options));
};

const fitCoverCrop = (image, width, height) => {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;

  if (sourceRatio > targetRatio) {
    const sourceWidth = image.naturalHeight * targetRatio;
    return {
      sx: (image.naturalWidth - sourceWidth) / 2,
      sy: 0,
      sw: sourceWidth,
      sh: image.naturalHeight,
    };
  }

  const sourceHeight = image.naturalWidth / targetRatio;
  return {
    sx: 0,
    sy: (image.naturalHeight - sourceHeight) / 2,
    sw: image.naturalWidth,
    sh: sourceHeight,
  };
};

const drawImageCover = (ctx, image, width, height) => {
  const crop = fitCoverCrop(image, width, height);
  ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
};

const drawImageCoverFocused = (ctx, image, width, height, options = {}) => {
  const {
    focusX = 0.5,
    focusY = 0.5,
    zoom = 1,
  } = options;

  const crop = fitCoverCrop(image, width, height);
  const safeZoom = Math.max(1, zoom);
  const sw = crop.sw / safeZoom;
  const sh = crop.sh / safeZoom;
  const focalX = crop.sx + crop.sw * focusX;
  const focalY = crop.sy + crop.sh * focusY;

  const maxSx = Math.max(0, image.naturalWidth - sw);
  const maxSy = Math.max(0, image.naturalHeight - sh);
  const sx = Math.min(maxSx, Math.max(0, focalX - sw / 2));
  const sy = Math.min(maxSy, Math.max(0, focalY - sh / 2));

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
};

// Una URL dins d'una variable CSS es resol respecte al full d'estils, no a la
// pàgina: cal passar-la absoluta perquè les rutes relatives (assets/...) funcionin.
const cssUrl = (src) => `url("${new URL(src, document.baseURI).href}")`;

// Fons d'imatge d'un host: el CSS (.obra-render--fons) en fixa mida i posició.
const setBackdrop = (host, src, position = 'center') => {
  host.classList.add('obra-render--fons');
  host.style.setProperty('--obra-fons', cssUrl(src));
  host.style.setProperty('--obra-fons-pos', position);
};

const clearBackdrop = (host) => {
  host.classList.remove('obra-render--fons');
  host.style.removeProperty('--obra-fons');
  host.style.removeProperty('--obra-fons-pos');
};

const loadImage = (src) => new Promise((resolve, reject) => {
  if (!src) {
    reject(new Error('Image source missing.'));
    return;
  }

  const image = new Image();
  image.decoding = 'async';
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
  image.src = src;
});

const createCanvasSurface = (host) => {
  const canvas = document.createElement('canvas');
  canvas.className = 'art-canvas';
  host.appendChild(canvas);

  const context = canvas.getContext('2d');
  let width = 1;
  let height = 1;

  const resize = () => {
    const rect = host.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.round(nextWidth * ratio);
    canvas.height = Math.round(nextHeight * ratio);
    canvas.style.width = `${nextWidth}px`;
    canvas.style.height = `${nextHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    return { width, height };
  };

  let observer = null;
  const onResize = () => resize();

  if ('ResizeObserver' in window) {
    observer = new ResizeObserver(onResize);
    observer.observe(host);
  } else {
    window.addEventListener('resize', onResize);
  }

  resize();

  return {
    canvas,
    context,
    resize,
    getSize: () => ({ width, height }),
    destroy: () => {
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener('resize', onResize);
      }
    },
  };
};

const getPoint = (event, element) => {
  const rect = element.getBoundingClientRect();
  const source = event.touches?.[0] ?? event.changedTouches?.[0] ?? event;

  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top,
  };
};

const showHint = (hintEl, artwork) => {
  if (!hintEl) return;

  const text = artwork?.hint || DEFAULT_HINTS[artwork?.interactionType] || '';
  hintEl.textContent = text;
  hintEl.hidden = !text;
};

const resetSceneLayers = (refs) => {
  if (!refs?.imageEl || !refs?.renderEl) return;

  refs.imageEl.hidden = false;
  refs.imageEl.removeAttribute('aria-hidden');
  refs.imageEl.classList.remove('animacio-float', 'animacio-pulse', 'animacio-bounce', 'animacio-spin');

  refs.renderEl.hidden = true;
  refs.renderEl.setAttribute('aria-hidden', 'true');
  refs.renderEl.innerHTML = '';
};

export const cleanupArtworkScene = (refs) => {
  const cleanup = refs?.renderEl?._cleanup;
  if (typeof cleanup === 'function') cleanup();

  if (refs?.renderEl) {
    refs.renderEl._cleanup = null;
  }

  if (refs?.sceneEl) {
    delete refs.sceneEl.dataset.mode;
    refs.sceneEl.style.aspectRatio = '';
  }

  if (refs?.imageEl) {
    refs.imageEl.onload = null;
  }

  resetSceneLayers(refs);
  showHint(refs?.hintEl, null);
};

const renderFallbackImage = (refs, artwork) => {
  const { imageEl, renderEl, sceneEl } = refs;
  const imageSource = artwork?.image || '';

  imageEl.hidden = false;
  imageEl.removeAttribute('aria-hidden');

  const applyNaturalRatio = () => {
    if (sceneEl && imageEl.naturalWidth && imageEl.naturalHeight) {
      sceneEl.style.aspectRatio = `${imageEl.naturalWidth} / ${imageEl.naturalHeight}`;
    }
  };

  if (imageSource) {
    imageEl.src = imageSource;
    if (imageEl.complete && imageEl.naturalWidth) {
      applyNaturalRatio();
    } else {
      imageEl.onload = applyNaturalRatio;
    }
  } else {
    imageEl.removeAttribute('src');
  }
  imageEl.alt = artwork?.title || '';

  if (artwork?.animationType) {
    imageEl.classList.add(`animacio-${artwork.animationType}`);
  }

  renderEl.hidden = true;
  renderEl.setAttribute('aria-hidden', 'true');
  renderEl.innerHTML = '';

  if (sceneEl) {
    sceneEl.dataset.mode = artwork?.animationType || 'image';
  }
};

const renderMondrian = (host) => {
  const defaultColors = ['#f0eeea', '#e63329', '#f0eeea', '#1e4fa3', '#f0eeea', '#f5c922'];
  host.innerHTML = `
    <div class="art-mondrian" aria-label="Composicio interactiva inspirada en Mondrian">
      ${defaultColors.map((color, index) => `
        <label class="art-mondrian__cell art-mondrian__cell--${index + 1}">
          <input type="color" value="${color}" aria-label="Canvia el color de la cel·la ${index + 1}">
        </label>
      `).join('')}
    </div>
  `;

  const inputs = Array.from(host.querySelectorAll('.art-mondrian__cell input'));
  const cleanups = [];

  inputs.forEach((input) => {
    const cell = input.parentElement;
    cell?.style.setProperty('--fill', input.value);
    const onInput = () => {
      cell?.style.setProperty('--fill', input.value);
    };

    listen(input, 'input', onInput, undefined, cleanups);
  });


  return () => {
    cleanups.forEach((fn) => fn());
  };
};


const renderMalevich = (host) => {
  const surface = createCanvasSurface(host);
  const { context } = surface;
  let progress = 0;
  let target = 0;
  let raf = 0;

  const draw = () => {
    const { width, height } = surface.getSize();
    const minSide = Math.min(width, height);
    const squareSize = lerp(minSide * 0.52, minSide * 0.3, progress);

    progress += (target - progress) * 0.11;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#f5f2ea';
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(width * 0.5, height * 0.48);
    context.rotate(progress * 0.7);
    context.fillStyle = '#0f0f10';
    context.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
    context.restore();

    context.globalAlpha = progress;
    context.fillStyle = '#d54633';
    context.fillRect(width * 0.17, height * 0.19, width * 0.31, height * 0.08);
    context.fillStyle = '#3156b5';
    context.fillRect(width * 0.61, height * 0.56, width * 0.16, width * 0.16);
    context.fillStyle = '#f6c12d';
    context.fillRect(width * 0.26, height * 0.67, width * 0.24, height * 0.06);
    context.fillStyle = '#111111';
    context.fillRect(width * 0.69, height * 0.26, width * 0.1, height * 0.26);
    context.globalAlpha = 1;

    raf = window.requestAnimationFrame(draw);
  };

  const toggle = () => {
    target = target > 0.5 ? 0 : 1;
  };

  surface.canvas.addEventListener('click', toggle);
  draw();

  return () => {
    window.cancelAnimationFrame(raf);
    surface.canvas.removeEventListener('click', toggle);
    surface.destroy();
  };
};

const renderRothko = (host) => {
  const surface = createCanvasSurface(host);
  const { context, canvas } = surface;
  let raf = 0;
  let paletteIndex = 0;
  const palettes = [
    ['#54352e', '#7d4331', '#d79b63', '#35201f'],
    ['#2e384f', '#495a76', '#bd8c62', '#1f2029'],
    ['#4f2d42', '#8f466f', '#d9a066', '#1d1720'],
  ];
  const pointer = { x: 0.5, y: 0.5, active: false };

  const onMove = (event) => {
    const point = getPoint(event, canvas);
    const { width, height } = surface.getSize();
    pointer.x = clamp(point.x / width, 0, 1);
    pointer.y = clamp(point.y / height, 0, 1);
    pointer.active = true;
  };

  const onLeave = () => {
    pointer.active = false;
  };

  const cyclePalette = () => {
    paletteIndex = (paletteIndex + 1) % palettes.length;
  };

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', cyclePalette);

  const drawGlow = (width, height) => {
    if (!pointer.active) return;

    const glow = context.createRadialGradient(
      width * pointer.x,
      height * pointer.y,
      20,
      width * pointer.x,
      height * pointer.y,
      width * 0.28,
    );
    glow.addColorStop(0, 'rgba(255, 245, 220, 0.18)');
    glow.addColorStop(1, 'rgba(255, 245, 220, 0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
  };

  const draw = () => {
    const { width, height } = surface.getSize();
    const minSide = Math.min(width, height);
    const time = performance.now() * 0.0012;
    const [background, bandOne, bandTwo, accent] = palettes[paletteIndex];

    context.clearRect(0, 0, width, height);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.filter = `blur(${Math.max(minSide * 0.035, 12)}px)`;
    context.fillStyle = bandOne;
    context.globalAlpha = 0.78;
    context.fillRect(
      width * 0.14,
      height * (0.14 + Math.sin(time) * 0.015),
      width * 0.72,
      height * 0.3,
    );

    context.fillStyle = bandTwo;
    context.globalAlpha = 0.76;
    context.fillRect(
      width * 0.18,
      height * (0.48 + Math.cos(time * 0.9) * 0.02),
      width * 0.64,
      height * 0.24,
    );

    context.fillStyle = accent;
    context.globalAlpha = 0.18;
    context.fillRect(
      width * 0.22,
      height * (0.28 + Math.sin(time * 0.7) * 0.018),
      width * 0.56,
      height * 0.34,
    );
    context.globalAlpha = 1;
    context.filter = 'none';

    drawGlow(width, height);

    raf = window.requestAnimationFrame(draw);
  };

  draw();

  return () => {
    window.cancelAnimationFrame(raf);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('click', cyclePalette);
    surface.destroy();
  };
};

const renderWarhol = (host) => {
  host.innerHTML = `
    <div class="art-warhol" aria-label="Serie pop inspirada en Andy Warhol">
      ${Array.from({ length: 6 }, () => `
        <div class="art-warhol__panel">
          <div class="art-warhol__can">
            <span class="art-warhol__lid"></span>
            <span class="art-warhol__brand">SOUP</span>
            <span class="art-warhol__label"></span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const panels = Array.from(host.querySelectorAll('.art-warhol__panel'));
  let shift = 0;

  const applyPalette = () => {
    panels.forEach((panel, index) => {
      const tone = WARHOL_PALETTES[(index + shift) % WARHOL_PALETTES.length];
      panel.style.setProperty('--panel-bg', tone.bg);
      panel.style.setProperty('--can-ink', tone.can);
      panel.style.setProperty('--label-bg', tone.label);
      panel.style.setProperty('--can-accent', tone.accent);
    });
  };

  const cycle = () => {
    shift = (shift + 1) % WARHOL_PALETTES.length;
    applyPalette();
    host.classList.remove('art-warhol--bump');
    void host.offsetWidth;
    host.classList.add('art-warhol--bump');
  };

  applyPalette();
  host.addEventListener('click', cycle);

  return () => {
    host.removeEventListener('click', cycle);
  };
};

const renderKandinskyDrag = (host) => {
  const surface = createCanvasSurface(host);
  const { context, canvas } = surface;
  canvas.classList.add('art-canvas--sense-gestos');

  const initialNodes = [
    { x: 0.2, y: 0.2, r: 0.06, color: '#ed6a5a' },
    { x: 0.72, y: 0.24, r: 0.08, color: '#1d5db0' },
    { x: 0.3, y: 0.72, r: 0.05, color: '#f4c430' },
    { x: 0.74, y: 0.68, r: 0.07, color: '#0f0f0f' },
  ];
  const nodes = initialNodes.map((node) => ({ ...node }));
  let dragIndex = -1;
  let raf = 0;

  const reset = () => {
    nodes.forEach((node, index) => {
      node.x = initialNodes[index].x;
      node.y = initialNodes[index].y;
    });
  };

  const pickNode = (point) => {
    const { width, height } = surface.getSize();
    return nodes.findIndex((node) => {
      const dx = point.x - node.x * width;
      const dy = point.y - node.y * height;
      return Math.hypot(dx, dy) <= node.r * Math.min(width, height) + 12;
    });
  };

  const updateNode = (point) => {
    if (dragIndex < 0) return;
    const { width, height } = surface.getSize();
    nodes[dragIndex].x = clamp(point.x / width, 0.12, 0.88);
    nodes[dragIndex].y = clamp(point.y / height, 0.12, 0.88);
  };

  const onDown = (event) => {
    const point = getPoint(event, canvas);
    const index = pickNode(point);
    if (index < 0) return;

    dragIndex = index;
    canvas.setPointerCapture(event.pointerId);
    updateNode(point);
  };

  const onMove = (event) => {
    if (dragIndex < 0) return;
    updateNode(getPoint(event, canvas));
  };

  const onUp = (event) => {
    if (dragIndex < 0) return;
    dragIndex = -1;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const drawTriangle = (x, y, size, rotation, color) => {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(0, -size);
    context.lineTo(size * 0.88, size);
    context.lineTo(-size * 0.88, size);
    context.closePath();
    context.fill();
    context.restore();
  };

  const draw = () => {
    const { width, height } = surface.getSize();
    const minSide = Math.min(width, height);
    const time = performance.now() * 0.0011;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#f5efdf';
    context.fillRect(0, 0, width, height);

    context.strokeStyle = 'rgba(15, 15, 15, 0.72)';
    context.lineWidth = Math.max(2, minSide * 0.008);
    context.beginPath();
    context.moveTo(nodes[0].x * width, nodes[0].y * height);
    context.lineTo(nodes[1].x * width, nodes[1].y * height);
    context.lineTo(nodes[2].x * width, nodes[2].y * height);
    context.lineTo(nodes[3].x * width, nodes[3].y * height);
    context.stroke();

    context.save();
    context.translate(width * 0.5, height * 0.5);
    context.rotate(time * 0.55);
    context.strokeStyle = 'rgba(30, 79, 163, 0.3)';
    context.lineWidth = Math.max(1.5, minSide * 0.01);
    context.beginPath();
    context.arc(0, 0, minSide * 0.22, 0, Math.PI * 1.6);
    context.stroke();
    context.restore();

    drawTriangle(width * 0.54, height * 0.28, minSide * 0.06, time, '#f4c430');
    drawTriangle(width * 0.28, height * 0.48, minSide * 0.05, -time * 0.8, '#ed6a5a');

    nodes.forEach((node) => {
      context.fillStyle = node.color;
      context.beginPath();
      context.arc(node.x * width, node.y * height, node.r * minSide, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = 'rgba(15, 15, 15, 0.2)';
      context.lineWidth = 1;
      context.stroke();
    });

    raf = window.requestAnimationFrame(draw);
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  draw();

  return () => {
    window.cancelAnimationFrame(raf);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
    surface.destroy();
  };
};

const renderParticles = (host, artwork) => {
  const surface = createCanvasSurface(host);
  const { context, canvas } = surface;
  const variant = artwork?.variant || 'abstract';
  const pointer = { x: 0.5, y: 0.5, active: false };
  const particles = Array.from({ length: variant === 'starry' ? 64 : 48 }, () => ({
    x: rand(0, 1),
    y: rand(0, 1),
    vx: rand(-0.0012, 0.0012),
    vy: rand(-0.0012, 0.0012),
    r: rand(1.2, variant === 'starry' ? 3.4 : 5.8),
    alpha: rand(0.35, 0.95),
  }));
  let image = null;
  let raf = 0;
  let destroyed = false;

  if (variant === 'starry' && artwork?.image) {
    loadImage(artwork.image)
      .then((loaded) => {
        if (!destroyed) image = loaded;
      })
      .catch(() => {});
  }

  const onMove = (event) => {
    const point = getPoint(event, canvas);
    const { width, height } = surface.getSize();
    pointer.x = clamp(point.x / width, 0, 1);
    pointer.y = clamp(point.y / height, 0, 1);
    pointer.active = true;
  };

  const onLeave = () => {
    pointer.active = false;
  };

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  const drawStarryBase = (width, height) => {
    if (image) {
      drawImageCover(context, image, width, height);
      context.fillStyle = 'rgba(12, 20, 52, 0.22)';
      context.fillRect(0, 0, width, height);
      return;
    }

    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0d1b4f');
    gradient.addColorStop(0.45, '#132a7a');
    gradient.addColorStop(1, '#031028');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  };

  const drawAbstractBase = (width, height, time) => {
    context.fillStyle = '#f6eee0';
    context.fillRect(0, 0, width, height);

    for (let index = 0; index < 5; index += 1) {
      context.save();
      context.translate(width * (0.18 + index * 0.15), height * (0.22 + (index % 2) * 0.18));
      context.rotate(time * 0.3 + index);
      context.fillStyle = ['rgba(237,106,90,0.38)', 'rgba(29,93,176,0.32)', 'rgba(244,196,48,0.34)', 'rgba(19,19,19,0.18)', 'rgba(79,182,134,0.28)'][index];
      context.beginPath();
      context.ellipse(0, 0, width * 0.1, height * 0.04, index * 0.4, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  };

  const draw = () => {
    const { width, height } = surface.getSize();
    const time = performance.now() * 0.001;

    context.clearRect(0, 0, width, height);

    if (variant === 'starry') {
      drawStarryBase(width, height);
      context.strokeStyle = 'rgba(249, 199, 79, 0.26)';
      context.lineWidth = Math.max(1.5, width * 0.007);

      for (let ring = 0; ring < 4; ring += 1) {
        context.beginPath();
        context.arc(
          width * (0.18 + ring * 0.18),
          height * (0.18 + Math.sin(time + ring) * 0.03),
          width * (0.07 + ring * 0.018),
          time * 0.8 + ring,
          time * 0.8 + ring + Math.PI * 1.35,
        );
        context.stroke();
      }
    } else {
      drawAbstractBase(width, height, time);
    }

    particles.forEach((particle, index) => {
      const forceX = pointer.active ? (pointer.x - particle.x) * 0.0009 : 0;
      const forceY = pointer.active ? (pointer.y - particle.y) * 0.0009 : 0;

      particle.vx += forceX + Math.sin(time + index) * 0.00003;
      particle.vy += forceY + Math.cos(time * 0.9 + index) * 0.00003;
      particle.x = (particle.x + particle.vx + 1) % 1;
      particle.y = (particle.y + particle.vy + 1) % 1;
      particle.vx *= 0.992;
      particle.vy *= 0.992;

      context.beginPath();
      context.fillStyle = variant === 'starry'
        ? `rgba(250, 226, 137, ${particle.alpha})`
        : `rgba(${90 + index * 3}, ${110 + index * 2}, ${180 - index * 2}, ${Math.min(0.7, particle.alpha)})`;
      context.arc(particle.x * width, particle.y * height, particle.r, 0, Math.PI * 2);
      context.fill();
    });

    raf = window.requestAnimationFrame(draw);
  };

  draw();

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(raf);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    surface.destroy();
  };
};

const renderWaves = (host, artwork) => {
  const surface = createCanvasSurface(host);
  const { context, canvas } = surface;
  const variant = artwork?.variant || 'sunrise';
  const pointer = { x: 0.5, y: 0.5, active: false };
  let raf = 0;

  const onMove = (event) => {
    const point = getPoint(event, canvas);
    const { width, height } = surface.getSize();
    pointer.x = clamp(point.x / width, 0, 1);
    pointer.y = clamp(point.y / height, 0, 1);
    pointer.active = true;
  };

  const onLeave = () => {
    pointer.active = false;
  };

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  const drawMonet = (width, height, time) => {
    const sky = context.createLinearGradient(0, 0, 0, height * 0.54);
    sky.addColorStop(0, '#b4d6ea');
    sky.addColorStop(0.45, '#f2c4a8');
    sky.addColorStop(1, '#a8c5cf');
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height * 0.54);

    const water = context.createLinearGradient(0, height * 0.42, 0, height);
    water.addColorStop(0, '#8cb7c7');
    water.addColorStop(1, '#5f8798');
    context.fillStyle = water;
    context.fillRect(0, height * 0.42, width, height * 0.58);

    const sunX = width * lerp(0.38, 0.68, pointer.active ? pointer.x : 0.55);
    const sunY = height * 0.24;
    context.fillStyle = 'rgba(242, 126, 43, 0.88)';
    context.beginPath();
    context.arc(sunX, sunY, width * 0.055, 0, Math.PI * 2);
    context.fill();

    for (let line = 0; line < 18; line += 1) {
      const y = height * (0.48 + line * 0.028);
      context.strokeStyle = line % 2 === 0 ? 'rgba(243, 160, 89, 0.56)' : 'rgba(75, 108, 124, 0.45)';
      context.lineWidth = Math.max(1.2, width * 0.006 - line * 0.08);
      context.beginPath();

      for (let x = 0; x <= width; x += 18) {
        const wave = Math.sin(x * 0.025 + time * 2.2 + line * 0.9) * (4 + line * 0.12);
        const sway = pointer.active ? (pointer.x - 0.5) * 16 : 0;
        if (x === 0) {
          context.moveTo(x, y + wave + sway * 0.04);
        } else {
          context.lineTo(x, y + wave + sway * 0.04);
        }
      }

      context.stroke();
    }

    context.fillStyle = 'rgba(35, 45, 58, 0.45)';
    context.fillRect(width * 0.5, height * 0.46, width * 0.08, height * 0.12);
  };

  const drawMunch = (width, height, time) => {
    const bands = ['#f4b400', '#ef6c00', '#d94841', '#9f2b68', '#2f3e63'];

    bands.forEach((color, index) => {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(0, height * (0.08 + index * 0.1));

      for (let x = 0; x <= width; x += 14) {
        const amplitude = 18 + index * 6 + (pointer.active ? pointer.x * 12 : 0);
        const y = height * (0.14 + index * 0.1) + Math.sin(x * 0.018 + time * 1.8 + index) * amplitude;
        context.lineTo(x, y);
      }

      context.lineTo(width, height * 0.55);
      context.lineTo(0, height * 0.55);
      context.closePath();
      context.fill();
    });

    context.fillStyle = '#28506d';
    context.fillRect(0, height * 0.58, width, height * 0.42);

    context.strokeStyle = '#49311e';
    context.lineWidth = Math.max(4, width * 0.015);
    context.beginPath();
    context.moveTo(width * 0.18, height * 0.7);
    context.lineTo(width * 0.9, height * 0.58);
    context.stroke();

    context.beginPath();
    context.moveTo(width * 0.23, height * 0.8);
    context.lineTo(width * 0.94, height * 0.68);
    context.stroke();

    context.fillStyle = '#1b1b1d';
    context.beginPath();
    context.ellipse(width * 0.48, height * 0.66, width * 0.05, height * 0.1, 0, 0, Math.PI * 2);
    context.fill();
    context.fillRect(width * 0.45, height * 0.72, width * 0.06, height * 0.16);
    context.fillStyle = '#f4d5b5';
    context.beginPath();
    context.ellipse(width * 0.48, height * 0.64, width * 0.035, height * 0.06, 0, 0, Math.PI * 2);
    context.fill();
  };

  const draw = () => {
    const { width, height } = surface.getSize();
    const time = performance.now() * 0.001;

    context.clearRect(0, 0, width, height);

    if (variant === 'scream') {
      drawMunch(width, height, time);
    } else {
      drawMonet(width, height, time);
    }

    raf = window.requestAnimationFrame(draw);
  };

  draw();

  return () => {
    window.cancelAnimationFrame(raf);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    surface.destroy();
  };
};

const renderMatisse = (host) => {
  const surface = createCanvasSurface(host);
  const { context, canvas } = surface;
  let direction = 1;
  let speed = 1;
  let raf = 0;

  const toggleSpeed = () => {
    speed = speed === 1 ? 1.7 : 1;
    direction *= -1;
  };

  canvas.addEventListener('click', toggleSpeed);

  const drawFigure = (x, y, angle, scale, color) => {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.scale(scale, scale);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 5;
    context.lineCap = 'round';

    context.beginPath();
    context.arc(0, -22, 9, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.moveTo(0, -12);
    context.lineTo(0, 18);
    context.moveTo(0, -4);
    context.lineTo(-18, 10);
    context.moveTo(0, -4);
    context.lineTo(18, 10);
    context.moveTo(0, 18);
    context.lineTo(-14, 40);
    context.moveTo(0, 18);
    context.lineTo(16, 38);
    context.stroke();
    context.restore();
  };

  const draw = () => {
    const { width, height } = surface.getSize();
    const minSide = Math.min(width, height);
    const time = performance.now() * 0.0012 * speed * direction;
    const radius = minSide * 0.24;
    const centerX = width * 0.5;
    const centerY = height * 0.56;
    const colors = ['#d15c2f', '#e67c52', '#cc4f39', '#dd6b4d', '#c9512c'];

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#82c4dd';
    context.fillRect(0, 0, width, height * 0.56);
    context.fillStyle = '#70a45b';
    context.fillRect(0, height * 0.56, width, height * 0.44);

    context.strokeStyle = 'rgba(255, 245, 210, 0.8)';
    context.lineWidth = Math.max(5, minSide * 0.02);
    context.beginPath();

    for (let index = 0; index < 5; index += 1) {
      const angle = time + index * ((Math.PI * 2) / 5);
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius * 0.8;

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }

      drawFigure(x, y, angle + Math.PI / 2, 1.05, colors[index]);
    }

    context.closePath();
    context.stroke();

    raf = window.requestAnimationFrame(draw);
  };

  draw();

  return () => {
    window.cancelAnimationFrame(raf);
    canvas.removeEventListener('click', toggleSpeed);
    surface.destroy();
  };
};

const renderMelt = (host, artwork) => {
  const surface = createCanvasSurface(host);
  const { context, canvas } = surface;
  const imageSource = artwork?.image || 'assets/imgs/quadres/dali.jpg';
  let image = null;
  let lastPoint = null;
  let destroyed = false;
  let redrawObserver = null;
  const redrawOnResize = () => redraw();

  host.classList.add('obra-render--scratch');
  setBackdrop(host, imageSource);

  const redraw = () => {
    if (!image) return;

    const { width, height } = surface.getSize();
    context.clearRect(0, 0, width, height);
    context.filter = `blur(${Math.max(width * 0.018, 10)}px)`;
    drawImageCover(context, image, width, height);
    context.filter = 'none';
    context.globalCompositeOperation = 'destination-out';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = Math.max(width * 0.1, 36);
  };

  const scratch = (point) => {
    if (!point) return;

    context.beginPath();
    if (lastPoint) {
      context.moveTo(lastPoint.x, lastPoint.y);
    } else {
      context.moveTo(point.x, point.y);
    }
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPoint = point;
  };

  const onMove = (event) => {
    if (!image) return;
    event.preventDefault();
    scratch(getPoint(event, canvas));
  };

  const onLeave = () => {
    lastPoint = null;
  };

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onLeave);

  if ('ResizeObserver' in window) {
    redrawObserver = new ResizeObserver(redrawOnResize);
    redrawObserver.observe(host);
  } else {
    window.addEventListener('resize', redrawOnResize);
  }


  loadImage(imageSource)
    .then((loaded) => {
      if (destroyed) return;
      image = loaded;
      redraw();
    })
    .catch(() => {});

  return () => {
    destroyed = true;
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('touchmove', onMove);
    canvas.removeEventListener('touchend', onLeave);
    if (redrawObserver) {
      redrawObserver.disconnect();
    } else {
      window.removeEventListener('resize', redrawOnResize);
    }
    host.classList.remove('obra-render--scratch');
    clearBackdrop(host);
    surface.destroy();
  };
};

// ─── Slider (Dia i Nit) ───────────────────────────────────────────────────────
const renderSlider = (host, artwork) => {
  const cleanups = [];
  const srcLeft  = artwork.image       || 'assets/imgs/quadres/day.png';
  const srcRight = artwork.secondImage || 'assets/imgs/quadres/night.png';

  host.classList.add('obra-render--slider');

  const imgLeft = document.createElement('img');
  imgLeft.src = srcLeft; imgLeft.alt = 'Dia'; imgLeft.draggable = false;
  imgLeft.className = 'slider__imatge';

  const imgRight = document.createElement('img');
  imgRight.src = srcRight; imgRight.alt = 'Nit'; imgRight.draggable = false;
  imgRight.className = 'slider__imatge slider__imatge--dreta';

  const divider = document.createElement('div');
  divider.setAttribute('aria-hidden', 'true');
  divider.className = 'slider__divisor';

  const handle = document.createElement('div');
  handle.setAttribute('aria-hidden', 'true');
  handle.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 8l-3-3 3-3M2 5h12M11 8l3 3-3 3M14 11H2" stroke="#333" stroke-width="1.5" stroke-linecap="round"/></svg>';
  handle.className = 'slider__nanses';
  divider.appendChild(handle);

  const input = document.createElement('input');
  input.type = 'range'; input.min = '0'; input.max = '100'; input.value = '50';
  input.setAttribute('aria-label', 'Comparar dia i nit');
  input.className = 'slider__control';

  const update = (val) => {
    host.style.setProperty('--slider-pos', `${val}%`);
  };
  update(50);
  listen(input, 'input', () => update(Number(input.value)), {}, cleanups);

  host.append(imgLeft, imgRight, divider, input);

  return () => { cleanups.forEach(c => c()); host.classList.remove('obra-render--slider'); host.style.removeProperty('--slider-pos'); };
};

// ─── Zoom / Pan (Mae West) ────────────────────────────────────────────────────
const renderZoom = (host, artwork) => {
  const cleanups = [];
  const src = artwork.image || 'assets/imgs/quadres/mae-west-dali.jpg';

  const wrap = document.createElement('div');
  wrap.className = 'zoom__marc';

  const img = document.createElement('img');
  img.src = src; img.alt = artwork.title || ''; img.draggable = false;
  img.className = 'zoom__imatge';

  let scale = 1, tx = 0, ty = 0;
  const MIN_S = 1, MAX_S = 8;

  const applyTransform = () => {
    img.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`;
  };

  const clampPos = () => {
    const maxX = (wrap.offsetWidth  * (scale - 1)) / 2;
    const maxY = (wrap.offsetHeight * (scale - 1)) / 2;
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  };

  const zoomAt = (factor, px, py) => {
    const rect = wrap.getBoundingClientRect();
    const ox = px - rect.left - rect.width / 2;
    const oy = py - rect.top  - rect.height / 2;
    const ns = Math.min(MAX_S, Math.max(MIN_S, scale * factor));
    tx = ox - (ox - tx) * (ns / scale);
    ty = oy - (oy - ty) * (ns / scale);
    scale = ns;
    wrap.classList.toggle('is-ampliat', scale > 1);
    clampPos(); applyTransform();
  };

  listen(wrap, 'wheel', (e) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.15 : 0.87, e.clientX, e.clientY); }, { passive: false }, cleanups);

  let dragging = false, lastX = 0, lastY = 0;
  listen(wrap, 'mousedown',  (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; wrap.classList.add('is-arrossegant'); }, {}, cleanups);
  listen(window, 'mousemove', (e) => { if (!dragging) return; tx += e.clientX - lastX; ty += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; clampPos(); applyTransform(); }, {}, cleanups);
  listen(window, 'mouseup',   ()  => { dragging = false; wrap.classList.remove('is-arrossegant'); }, {}, cleanups);

  let lastDist = null, lTX = 0, lTY = 0;
  listen(wrap, 'touchstart', (e) => {
    if (e.touches.length === 2) lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    else { lTX = e.touches[0].clientX; lTY = e.touches[0].clientY; }
  }, { passive: true }, cleanups);
  listen(wrap, 'touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      if (lastDist) zoomAt(d / lastDist, cx, cy);
      lastDist = d;
    } else {
      tx += e.touches[0].clientX - lTX; ty += e.touches[0].clientY - lTY;
      lTX = e.touches[0].clientX; lTY = e.touches[0].clientY;
      clampPos(); applyTransform();
    }
  }, { passive: false }, cleanups);
  listen(wrap, 'touchend', () => { lastDist = null; }, { passive: true }, cleanups);

  wrap.appendChild(img);
  host.appendChild(wrap);

  return () => { cleanups.forEach(c => c()); wrap.remove(); };
};

// ─── Arrossegable (El Fill de l'Home) ────────────────────────────────────────
const renderArrossegable = (host, artwork) => {
  const cleanups = [];
  const paintSrc = artwork.image       || 'assets/imgs/quadres/son-of-man-face.png';
  const appleSrc = artwork.secondImage || 'assets/imgs/quadres/apple.png';

  host.classList.add('obra-render--contingut');

  const painting = document.createElement('img');
  painting.src = paintSrc; painting.alt = artwork.title || ''; painting.draggable = false;
  painting.className = 'arrossegable__pintura';

  const apple = document.createElement('img');
  apple.src = appleSrc; apple.alt = 'Poma'; apple.draggable = false;
  apple.className = 'arrossegable__poma';

  const APPLE_W = 0.17, BODY_Y = 0.69, FCX = 0.50, FCY = 0.28;
  let homeLeft = 0, homeTop = 0;

  const snapHome = (animate) => {
    const PW = painting.offsetWidth, PH = painting.offsetHeight;
    if (!PW || !PH) return;
    const AW = PW * APPLE_W;
    const ratio = apple.naturalWidth ? apple.naturalHeight / apple.naturalWidth : 1.5;
    homeLeft = PW * FCX - AW / 2;
    homeTop  = PH * FCY - (AW * ratio) * BODY_Y;
    if (animate) {
      apple.classList.add('is-tornant');
      setTimeout(() => apple.classList.remove('is-tornant'), 520);
    }
    apple.style.width = AW + 'px';
    apple.style.left  = homeLeft + 'px';
    apple.style.top   = homeTop  + 'px';
  };

  const onLoad = () => requestAnimationFrame(() => snapHome(false));
  if (painting.complete) onLoad(); else listen(painting, 'load', onLoad, {}, cleanups);

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => snapHome(false));
    ro.observe(host);
    cleanups.push(() => ro.disconnect());
  }

  let dragging = false, spx = 0, spy = 0, ox = 0, oy = 0;
  const pt = (e) => e.touches ? e.touches[0] : e;
  const down = (e) => { e.preventDefault(); dragging = true; apple.classList.add('is-arrossegant'); const p = pt(e); spx = p.clientX; spy = p.clientY; ox = parseFloat(apple.style.left) || 0; oy = parseFloat(apple.style.top) || 0; };
  const move = (e) => { if (!dragging) return; e.preventDefault(); const p = pt(e); apple.style.left = (ox + p.clientX - spx) + 'px'; apple.style.top  = (oy + p.clientY - spy) + 'px'; };
  const up   = ()  => { dragging = false; apple.classList.remove('is-arrossegant'); };

  listen(apple,    'mousedown',  down, {}, cleanups);
  listen(apple,    'touchstart', down, { passive: false }, cleanups);
  listen(document, 'mousemove',  move, {}, cleanups);
  listen(document, 'touchmove',  move, { passive: false }, cleanups);
  listen(document, 'mouseup',    up,   {}, cleanups);
  listen(document, 'touchend',   up,   {}, cleanups);
  listen(apple,    'dblclick',   () => snapHome(true), {}, cleanups);

  let lastTap = 0;
  listen(apple, 'touchend', () => { const now = Date.now(); if (now - lastTap < 300) snapHome(true); lastTap = now; }, {}, cleanups);

  host.append(painting, apple);

  return () => { cleanups.forEach(c => c()); host.classList.remove('obra-render--contingut'); };
};

// ─── Engranatges (Planetary Gears) ───────────────────────────────────────────
const renderEngranatges = (host, _artwork) => {
  host.classList.add('obra-render--engranatges');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 400 400');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.classList.add('engranatges__svg');

  const dash = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  Object.entries({ cx:'200', cy:'200', r:'100', fill:'none', stroke:'#FFF', 'stroke-width':'200', 'stroke-dasharray':'18 19' })
    .forEach(([k, v]) => dash.setAttribute(k, v));

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.classList.add('engranatges__grup');
  [[200,200,200],[240,200,130],[170,200,80],[220,200,40]].forEach(([cx,cy,r]) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r);
    c.setAttribute('fill', '#FFF'); c.classList.add('engranatges__cercle');
    g.appendChild(c);
  });

  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  Object.entries({ cx:'200', cy:'200', r:'20', fill:'black' }).forEach(([k,v]) => dot.setAttribute(k,v));

  svg.append(dash, g, dot);
  host.appendChild(svg);

  return () => { host.classList.remove('obra-render--engranatges'); svg.remove(); };
};

// ─── Remolins (Flow-field particles) ─────────────────────────────────────────
const renderRemolins = (host, _artwork) => {
  const canvas = document.createElement('canvas');
  canvas.className = 'art-canvas';
  host.appendChild(canvas);

  const ctx = canvas.getContext('2d', { alpha: false });
  const CFG = { eddyCount: 9, pPerFrame: 6, maxSteps: 2600, lw: 1.35, fade: 0.028 };

  let W = 0, H = 0, scale = 1, ref = 1, eddies = [], hue0 = Math.random() * 360, rafId = null;
  const rnd = (a, b) => a + Math.random() * (b - a);

  class Eddy {
    constructor() { this.x=rnd(.08,.92); this.y=rnd(.08,.92); this.r=rnd(.08,.24); this.pull=rnd(.00045,.0012); this.spin=rnd(.007,.018)*(Math.random()<.5?-1:1); this.w=rnd(0,Math.PI*2); }
    force(p, t) {
      const dx=p.x/ref-(this.x+Math.sin(t*.00022+this.w)*.018), dy=p.y/ref-(this.y+Math.cos(t*.00018+this.w)*.018);
      const rad=Math.max(1e-4,Math.hypot(dx,dy)), cos=dx/rad, sin=dy/rad, d=rad-this.r;
      const ang=this.spin*Math.exp(-d*d/.01), rad2=-d*this.pull;
      return { x: rad2*cos-ang*rad*sin, y: rad2*sin+ang*rad*cos };
    }
  }

  const field = (p, t) => {
    let sx=0, sy=0;
    for (const e of eddies) { const f=e.force(p,t); sx+=f.x; sy+=f.y; }
    const pulse=1+Math.sin(t*.0003)*.12;
    return { x: sx*ref*pulse, y: sy*ref*pulse };
  };

  const drawPath = (x0, y0, t) => {
    const col=`hsl(${(hue0+x0*.06+y0*.09+t*.01)%360} ${rnd(90,100).toFixed(0)}% ${rnd(42,62).toFixed(0)}%)`;
    const pts=[{x:x0,y:y0}];
    const extend=(pt,dir)=>{ for(let s=0;s<CFG.maxSteps;s++){ const f=field(pt,t+s); pt={x:pt.x+f.x*dir,y:pt.y+f.y*dir}; if(pt.x<-40||pt.x>W+40||pt.y<-40||pt.y>H+40) break; dir>0?pts.push(pt):pts.unshift(pt); if(s>100&&Math.hypot(f.x,f.y)<.045) break; } };
    extend({x:x0,y:y0},1); extend({x:x0,y:y0},-1);
    if(pts.length<2) return;
    ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
    for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
    ctx.lineWidth=CFG.lw; ctx.strokeStyle=col; ctx.stroke();
  };

  const resize = () => {
    const r=host.getBoundingClientRect(); W=Math.max(1,Math.floor(r.width)); H=Math.max(1,Math.floor(r.height));
    scale=Math.min(window.devicePixelRatio||1,2); ref=Math.sqrt(W*H);
    canvas.width=Math.floor(W*scale); canvas.height=Math.floor(H*scale);
    ctx.setTransform(scale,0,0,scale,0,0);
    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
    eddies=Array.from({length:CFG.eddyCount},()=>new Eddy()); hue0=Math.random()*360;
  };

  const frame = (t) => {
    ctx.fillStyle=`rgba(0,0,0,${CFG.fade})`; ctx.fillRect(0,0,W,H);
    for(let i=0;i<CFG.pPerFrame;i++) drawPath(rnd(0,W),rnd(0,H),t);
    rafId=requestAnimationFrame(frame);
  };

  let ro;
  if ('ResizeObserver' in window) { ro=new ResizeObserver(resize); ro.observe(host); }
  resize();
  rafId = requestAnimationFrame(frame);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (ro) ro.disconnect();
    canvas.remove();
  };
};

// ─── Parallax (El Caminant) ──────────────────────────────────────────────────
const renderParallax = (host, artwork) => {
  const src = artwork?.image || 'assets/imgs/quadres/caminant-boira.jpg';

  // Tres capes de la mateixa pintura, separades per màscares degradades:
  // cel i muntanyes llunyanes → boira i caminant → roca del primer pla.
  // factor = desplaçament màxim com a fracció del contenidor.
  // Cal factor < (scale - 1) / 2 perquè mai es vegin les vores d'una capa.
  const SCALE = 1.1;
  const LAYERS = [
    { factor: 0.010, mask: null },
    { factor: 0.024, mask: 'linear-gradient(to bottom, transparent 30%, #000 52%)' },
    { factor: 0.042, mask: 'linear-gradient(to bottom, transparent 64%, #000 80%)' },
  ];

  host.classList.add('obra-render--contingut');

  const layerEls = LAYERS.map(({ factor, mask }) => {
    const img = document.createElement('img');
    img.src = src; img.alt = ''; img.draggable = false;
    img.className = 'parallax__capa';
    img.style.setProperty('--escala', SCALE);
    if (mask) img.style.setProperty('--mascara', mask);
    host.appendChild(img);
    return { el: img, factor };
  });

  const cleanups = [];
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    const x = clamp((e.clientX - r.left  - r.width  / 2) / (r.width  / 2), -1, 1);
    const y = clamp((e.clientY - r.top   - r.height / 2) / (r.height / 2), -1, 1);
    layerEls.forEach(({ el, factor }) => {
      const dx = -x * r.width  * factor;
      const dy = -y * r.height * factor;
      el.style.transform = `translate(${dx}px,${dy}px) scale(${SCALE})`;
    });
  };
  const onLeave = () => {
    layerEls.forEach(({ el }) => { el.style.transform = ''; });
  };

  listen(host, 'mousemove', onMove, {}, cleanups);
  listen(host, 'mouseleave', onLeave, {}, cleanups);

  return () => { cleanups.forEach(c => c()); host.classList.remove('obra-render--contingut'); };
};

// ─── Metaballs WebGL (Esferes de Vida) ───────────────────────────────────────
const renderMetaballs = (host, _artwork) => {
  const canvas = document.createElement('canvas');
  canvas.className = 'art-canvas';
  host.appendChild(canvas);

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { canvas.remove(); return () => {}; }

  const COUNT = 11;
  let W = 1, H = 1, raf = null, mbHandle = null, prog = null;
  let metaballs = [];
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1) + a);
  const mouse = { x: 0, y: 0, active: false };
  const cleanups = [];

  const vsSource = 'attribute vec2 position;void main(void){gl_Position=vec4(position,0.0,1.0);}';
  const fsSource = `precision highp float;uniform vec3 metaballs[${COUNT}];void main(void){float x=gl_FragCoord.x,y=gl_FragCoord.y,v=0.0;for(int i=0;i<${COUNT};i++){vec3 mb=metaballs[i];float dx=mb.x-x,dy=mb.y-y,r=mb.z;v+=r*r/(dx*dx+dy*dy);}if(v>1.4)gl_FragColor=vec4(.851,.929,.573,1.);else if(v>1.3)gl_FragColor=vec4(.709,.894,.549,1.);else if(v>1.2)gl_FragColor=vec4(.600,.851,.549,1.);else if(v>1.1)gl_FragColor=vec4(.463,.784,.576,1.);else if(v>1.0)gl_FragColor=vec4(.322,.714,.604,1.);else if(v>0.9)gl_FragColor=vec4(.204,.627,.643,1.);else if(v>0.8)gl_FragColor=vec4(.086,.541,.678,1.);else if(v>0.7)gl_FragColor=vec4(.102,.459,.624,1.);else if(v>0.6)gl_FragColor=vec4(.118,.376,.569,1.);else if(v>0.5)gl_FragColor=vec4(.094,.306,.467,1.);else if(v>0.4)gl_FragColor=vec4(.068,.208,.322,1.);else gl_FragColor=vec4(.098,.262,.412,1.);}`;

  const mkShader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog); gl.useProgram(prog);
  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 8, 0);
  mbHandle = gl.getUniformLocation(prog, 'metaballs');
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const spawn = () => {
    metaballs = [];
    const rMax = Math.floor(Math.min(W, H) / 15);
    for (let i = 0; i < COUNT; i++) {
      const r = Math.round(Math.random() * (rMax - rMax / 2.2) + rMax / 2.2);
      metaballs.push({ x: rnd(r, W - r), y: rnd(r, H - r), vx: Math.random() * 1.2 - 0.6, vy: Math.random() * 1.2 - 0.6, r, follow: i === 0 });
    }
    if (metaballs[0]) metaballs[0].r = Math.round(rMax * 1.12);
  };

  const resize = () => {
    const rect = host.getBoundingClientRect();
    W = Math.max(1, Math.floor(rect.width)); H = Math.max(1, Math.floor(rect.height));
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H); gl.clearColor(0.098, 0.262, 0.412, 1.0);
    spawn();
  };

  const move = () => {
    for (const m of metaballs) {
      if (mouse.active && m.follow) { m.x += (mouse.x - m.x) / 8; m.y += (mouse.y - m.y) / 8; }
      else { m.x += m.vx; m.y += m.vy; }
      if (m.x > W - m.r) { m.x = W - m.r; m.vx *= -1; } else if (m.x < m.r) { m.x = m.r; m.vx *= -1; }
      if (m.y > H - m.r) { m.y = H - m.r; m.vy *= -1; } else if (m.y < m.r) { m.y = m.r; m.vy *= -1; }
    }
  };

  const frame = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    const data = new Float32Array(3 * COUNT);
    metaballs.forEach((m, i) => { data[i*3] = m.x; data[i*3+1] = m.y; data[i*3+2] = m.r; });
    gl.uniform3fv(mbHandle, data); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    move(); raf = requestAnimationFrame(frame);
  };

  listen(canvas, 'mousemove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = H - (e.clientY - r.top); mouse.active = true; }, {}, cleanups);
  listen(canvas, 'mouseleave', () => { mouse.active = false; }, {}, cleanups);

  let ro;
  if ('ResizeObserver' in window) { ro = new ResizeObserver(resize); ro.observe(host); } else { listen(window, 'resize', resize, {}, cleanups); }
  resize(); raf = requestAnimationFrame(frame);

  return () => {
    if (raf) cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    cleanups.forEach(c => c());
    if (prog) gl.deleteProgram(prog);
    canvas.remove();
  };
};

// ─── Puzzle (El Bes) ─────────────────────────────────────────────────────────
const renderPuzzle = (host, artwork) => {
  const IMG = artwork.image || 'assets/imgs/quadres/the-kiss.jpg';
  const COLS = 3, ROWS = 4;
  let state = Array.from({ length: COLS * ROWS }, (_, i) => i);
  for (let i = state.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state[i], state[j]] = [state[j], state[i]];
  }

  // Set scene container to image's natural aspect ratio so grid fills with no gaps
  const sceneEl = host.parentElement;
  const probe = new Image();
  probe.onload = () => {
    if (sceneEl && probe.naturalWidth && probe.naturalHeight) {
      sceneEl.style.aspectRatio = `${probe.naturalWidth} / ${probe.naturalHeight}`;
    }
  };
  probe.src = IMG;

  // Grid fills the render element exactly via CSS fractions + percentage backgrounds
  const grid = document.createElement('div');
  grid.className = 'puzzle__graella';
  grid.style.setProperty('--cols', COLS);
  grid.style.setProperty('--rows', ROWS);
  host.appendChild(grid);

  let dragFrom = null;

  const renderGrid = () => {
    grid.innerHTML = '';
    state.forEach((pid, cellIdx) => {
      const col = pid % COLS;
      const row = Math.floor(pid / COLS);
      const bpx = `${col / (COLS - 1) * 100}%`;
      const bpy = `${row / (ROWS - 1) * 100}%`;
      const el = document.createElement('div');
      el.draggable = true;
      el.dataset.cell = cellIdx;
      el.className = 'puzzle__peca';
      el.style.setProperty('--peca-imatge', cssUrl(IMG));
      el.style.setProperty('--peca-x', bpx);
      el.style.setProperty('--peca-y', bpy);
      el.style.setProperty('--peca-mida', `${COLS * 100}% ${ROWS * 100}%`);
      el.addEventListener('dragstart', () => { dragFrom = cellIdx; el.classList.add('is-arrossegant'); });
      el.addEventListener('dragend',   () => { el.classList.remove('is-arrossegant'); });
      el.addEventListener('dragover',  (e) => { e.preventDefault(); el.classList.add('is-destinacio'); });
      el.addEventListener('dragleave', () => { el.classList.remove('is-destinacio'); });
      el.addEventListener('drop', () => {
        el.classList.remove('is-destinacio');
        if (dragFrom !== null && dragFrom !== cellIdx) swap(dragFrom, cellIdx);
        dragFrom = null;
      });
      let touchSrc = null;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); touchSrc = cellIdx; }, { passive: false });
      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        const target = document.elementFromPoint(t.clientX, t.clientY);
        if (target && target.dataset.cell !== undefined && touchSrc !== null) {
          swap(touchSrc, parseInt(target.dataset.cell, 10));
        }
        touchSrc = null;
      }, { passive: false });
      grid.appendChild(el);
    });
  };

  const swap = (a, b) => {
    if (a === b) return;
    [state[a], state[b]] = [state[b], state[a]];
    renderGrid();
    if (state.every((p, i) => p === i)) {
      grid.classList.add('is-resolt');
    }
  };

  renderGrid();

  return () => { host.innerHTML = ''; };
};

// ─── Seguiment (Retrat de la Reina) ──────────────────────────────────────────
const renderSeguiment = (host, artwork) => {
  const src = artwork.image || 'assets/imgs/quadres/reina-isabel.jpeg';
  const noseSrc  = 'assets/imgs/quadres/nariz.png';
  const lipsSrc  = 'assets/imgs/quadres/lips.webp';
  const cleanups = [];

  host.classList.add('obra-render--seguiment');

  const painting = document.createElement('div');
  painting.className = 'seguiment__pintura';
  painting.style.setProperty('--seguiment-imatge', cssUrl(src));

  const overlay = document.createElement('div');
  overlay.className = 'seguiment__capa';

  const makeEye = (leftPct, topPct, tilt) => {
    const eye = document.createElement('div');
    eye.className = 'seguiment__ull';
    eye.style.setProperty('--top', `${topPct}%`);
    eye.style.setProperty('--left', `${leftPct}%`);
    eye.style.setProperty('--tilt', tilt);
    const white = document.createElement('div');
    white.className = 'seguiment__blanc';
    const iris = document.createElement('div');
    iris.className = 'seguiment__iris';
    const pupil = document.createElement('div');
    pupil.className = 'seguiment__pupil';
    const hilite = document.createElement('div');
    hilite.className = 'seguiment__brillantor';
    iris.append(pupil, hilite);
    white.appendChild(iris);
    eye.appendChild(white);
    return { eye, iris, white, state: { x: 0, y: 0 } };
  };

  const eyes = [ makeEye(39.3, 33.5, '-1deg'), makeEye(53.0, 33.5, '1deg') ];
  eyes.forEach(({ eye }) => overlay.appendChild(eye));

  const featuresLayer = document.createElement('div');
  featuresLayer.className = 'seguiment__capa';

  const makeFeature = (src2, topPct, leftPct, widthPct, initTop, initLeft) => {
    const img = document.createElement('img');
    img.src = src2; img.alt = ''; img.draggable = false;
    const sTop = initTop !== undefined ? initTop : topPct;
    const sLeft = initLeft !== undefined ? initLeft : leftPct;
    img.className = 'seguiment__tret';
    img.style.setProperty('--amplada', `${widthPct}%`);
    img.style.top = `${sTop}%`;
    img.style.left = `${sLeft}%`;
    let drag = null;
    listen(img, 'pointerdown', (e) => { e.preventDefault(); img.setPointerCapture(e.pointerId); drag = { px: e.clientX, py: e.clientY, ox: parseFloat(img.style.left), oy: parseFloat(img.style.top) }; img.classList.add('is-arrossegant'); }, {}, cleanups);
    listen(img, 'pointermove', (e) => {
      if (!drag) return;
      const rect = painting.getBoundingClientRect();
      const nx = drag.ox + (e.clientX - drag.px) / rect.width * 100;
      const ny = drag.oy + (e.clientY - drag.py) / rect.height * 100;
      img.style.left = clamp(nx, 20, 80) + '%';
      img.style.top  = clamp(ny, 20, 80) + '%';
    }, {}, cleanups);
    listen(img, 'pointerup', () => {
      drag = null; img.classList.remove('is-arrossegant');
      const cl = parseFloat(img.style.left);
      const ct = parseFloat(img.style.top);
      if (Math.abs(cl - leftPct) < 6 && Math.abs(ct - topPct) < 6) {
        img.classList.add('is-tornant');
        img.style.left = leftPct + '%';
        img.style.top  = topPct + '%';
        setTimeout(() => img.classList.remove('is-tornant'), 220);
      }
    }, {}, cleanups);
    featuresLayer.appendChild(img);
    return img;
  };

  makeFeature(noseSrc, 40.1, 46.2, 17.7, 23.0, 71.0);
  makeFeature(lipsSrc, 48.9, 46.3, 12.4, 67.0, 24.0);

  painting.appendChild(overlay);
  host.appendChild(painting);
  host.appendChild(featuresLayer);

  const pointer = { x: 0, y: 0, active: false };
  let raf = 0, blinkTimer = 0;

  const tick = () => {
    eyes.forEach(({ eye, iris, state }) => {
      const rect = eye.getBoundingClientRect();
      const maxOff = rect.width * 0.085;
      let tX = 0, tY = 0;
      if (pointer.active) {
        const dx = pointer.x - (rect.left + rect.width / 2);
        const dy = pointer.y - (rect.top  + rect.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const travel = Math.min(maxOff, dist * 0.03);
        tX = dx / dist * travel; tY = dy / dist * travel;
      }
      state.x += (tX - state.x) * 0.12;
      state.y += (tY - state.y) * 0.12;
      iris.style.transform = `translate(calc(-50% + ${state.x.toFixed(2)}px), calc(-50% + ${state.y.toFixed(2)}px))`;
    });
    raf = requestAnimationFrame(tick);
  };

  const scheduleBlink = () => {
    blinkTimer = setTimeout(() => {
      eyes.forEach(({ white }) => { white.classList.add('is-parpellejant'); });
      setTimeout(() => { eyes.forEach(({ white }) => { white.classList.remove('is-parpellejant'); }); }, 90);
      scheduleBlink();
    }, 2600 + Math.random() * 3400);
  };

  listen(document, 'mousemove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; }, { passive: true }, cleanups);
  listen(document, 'mouseout',  (e) => { if (!e.relatedTarget) pointer.active = false; }, {}, cleanups);

  tick(); scheduleBlink();

  return () => {
    cancelAnimationFrame(raf); clearTimeout(blinkTimer);
    cleanups.forEach(c => c()); host.classList.remove('obra-render--seguiment');
  };
};

// ─── Pinzell (Nit Estelada) ───────────────────────────────────────────────────
const renderPinzell = (host, artwork) => {
  const src = artwork.image || 'assets/imgs/quadres/starry-night.webp';
  const surface = createCanvasSurface(host);
  const { context, canvas } = surface;
  let isDown = false, lastPt = null, hue = 50;
  const cleanups = [];

  setBackdrop(host, src);

  listen(canvas, 'pointerdown', (e) => { isDown = true; lastPt = getPoint(e, canvas); hue = (hue + 8) % 360; }, {}, cleanups);
  listen(window, 'pointerup',   () => { isDown = false; lastPt = null; }, {}, cleanups);
  listen(canvas, 'pointermove', (e) => {
    if (!isDown) return; e.preventDefault();
    const pt = getPoint(e, canvas);
    const { width } = surface.getSize();
    context.lineWidth = Math.max(width * 0.028, 8);
    context.lineCap = 'round'; context.lineJoin = 'round';
    context.strokeStyle = `hsla(${hue},88%,76%,.42)`;
    context.beginPath();
    if (lastPt) context.moveTo(lastPt.x, lastPt.y); else context.moveTo(pt.x, pt.y);
    context.lineTo(pt.x, pt.y); context.stroke();
    lastPt = pt;
  }, {}, cleanups);
  listen(canvas, 'touchmove', (e) => e.preventDefault(), { passive: false }, cleanups);


  return () => {
    cleanups.forEach(c => c());
    clearBackdrop(host);
    surface.destroy();
  };
};

// ─── Rubik (Construcció Perpètua) ────────────────────────────────────────────
const renderRubik = (host, _artwork) => {
  host.classList.add('obra-render--rubik');

  const COLORS = ['#0750a4','#46b856','#ed1c24','#f3e63c','#f26522','#fff'];
  const BW = 0.15;
  const rEl = (arr) => arr[(Math.random() * arr.length) | 0];
  const chk = (prev, col, idx, last, c) => (!prev || prev[idx] !== c) && (idx === 0 || col[idx-1] !== c) && (!last || col[0] !== c);
  const genPat = (cols, rows) => {
    const pat = []; let prev = null;
    for (let i = 0; i < cols; i++) {
      const col = [];
      for (let j = 0; j < rows; j++) { let c = rEl(COLORS); while (!chk(prev, col, j, j===rows-1, c)) c = rEl(COLORS); col.push(c); }
      pat.push(col); prev = col;
    }
    return pat;
  };
  const applyTiles = (el, pat) => {
    const g = [], p = [];
    for (let j = 0; j < pat.length; j++) for (let i = 0; i < pat[j].length; i++) { g.push(`linear-gradient(${pat[j][i]},${pat[j][i]})`); p.push(`${i+BW/2}em ${j+BW/2}em`); }
    el.classList.add('rubik-tessella');
    Object.assign(el.style, { backgroundImage:g.join(','), backgroundSize:`${1-BW}em ${1-BW}em`, backgroundPosition:p.join(',') });
  };

  const wrap = document.createElement('div');
  wrap.className = 'obra-render__escalat';

  const container = document.createElement('div');
  container.dataset.eaType = 'rubik';

  const floor = document.createElement('div');
  floor.className = 'rubik-floor'; applyTiles(floor, genPat(22, 22));

  const makeCube = (isBase) => {
    const cube = document.createElement('div');
    cube.className = 'rubik-cube' + (isBase ? ' rubik-base' : '');

    const f1 = document.createElement('div'); f1.className = 'rubik-face';
    const inner = document.createElement('div'); inner.className = 'rubik-face-inner';
    const t1 = document.createElement('div'); t1.className = 'rubik-tiles'; applyTiles(t1, genPat(3,3));
    inner.appendChild(t1); f1.appendChild(inner);

    const f2 = document.createElement('div'); f2.className = 'rubik-face';
    const t2 = document.createElement('div'); t2.className = 'rubik-tiles'; applyTiles(t2, genPat(3,3));
    f2.appendChild(t2);

    const f3 = document.createElement('div'); f3.className = 'rubik-face'; applyTiles(f3, genPat(3,3));

    cube.append(f1, f2, f3);
    return cube;
  };

  container.append(floor, makeCube(false), makeCube(true));
  wrap.appendChild(container);
  host.appendChild(wrap);

  const scaleToFit = () => {
    const s = Math.min(host.offsetWidth / (9 * 40), host.offsetHeight / (12 * 40)) * 1.08;
    wrap.style.transform = `scale(${s})`;
  };
  let ro;
  if ('ResizeObserver' in window) { ro = new ResizeObserver(scaleToFit); ro.observe(host); }
  scaleToFit();

  return () => { if (ro) ro.disconnect(); host.classList.remove('obra-render--rubik'); };
};

// ─── Vaixell (Chinese Brush Painting) ────────────────────────────────────────
const renderVaixell = (host, _artwork) => {
  host.classList.add('obra-render--vaixell');

  const bg = document.createElement('div');
  bg.className = 'vaixell__fons';

  const boat = document.createElement('div');
  boat.className = 'vaixell__barca';
  const boatImg = document.createElement('img');
  boatImg.src = 'assets/imgs/quadres/vaixell-barca.png'; boatImg.alt = "Vaixell navegant sobre l'aigua"; boatImg.draggable = false;
  boatImg.className = 'vaixell__imatge';
  boat.appendChild(boatImg);

  host.append(bg, boat);
  return () => { host.classList.remove('obra-render--vaixell'); };
};

// ─── Dropaint (Gotes de Pintura) ─────────────────────────────────────────────
const renderDropaint = (host, _artwork) => {
  const surface = createCanvasSurface(host);
  const { context } = surface;
  let raf = 0, tick = 0, W = 0, H = 0;
  const COUNT = 100;
  let points = [];
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1) + a);

  const spawn = () => {
    const sz = surface.getSize(); W = sz.width; H = sz.height;
    points = Array.from({ length: COUNT }, (_, i) => ({
      x: (i / COUNT) * W, y: (i / COUNT) * H,
      vx: (rnd(0,100) - 50) / 2, vy: (rnd(0,100) - 50) / 2,
    }));
  };

  const frame = () => {
    const sz = surface.getSize();
    if (sz.width !== W || sz.height !== H) spawn();
    for (const p of points) {
      p.x += p.vx; p.y += p.vy;
      if (p.x > W || p.x < 0) p.vx = -p.vx;
      if (p.y > H || p.y < 0) p.vy = -p.vy;
      context.beginPath();
      context.arc(p.x, p.y, rnd(1, 10), 0, Math.PI * 2);
      context.fillStyle = `hsl(${(tick + rnd(0,15)) % 360},${rnd(80,100)}%,${rnd(50,60)}%)`;
      context.fill();
    }
    tick++; raf = requestAnimationFrame(frame);
  };

  spawn(); raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); surface.destroy(); };
};

// ─── Cavall (Fine Art Horse Animation) ───────────────────────────────────────
const renderCavall = (host, _artwork) => {
  host.classList.add('obra-render--cavall');

  const wrap = document.createElement('div');
  wrap.className = 'obra-render__escalat';

  const scene = document.createElement('div');
  scene.dataset.eaType = 'cavall';
  scene.innerHTML = `<div class="horse-parallax"><div class="horse"><div class="sdl"></div><div class="bly"></div><div class="mid"></div><div class="chn"></div><div class="nck"></div><div class="fce"></div><div class="tpp"></div><div class="brg"></div><div class="eyy"></div><div class="ear"></div><div class="b_ear"></div><div class="brd"></div><div class="nse"></div><div class="nst"></div><div class="thi"></div><div class="lgg"></div><div class="hof"></div><div class="sho"></div><div class="mne"></div><div class="tmn"></div><div class="skull"><div class="cran"></div><div class="jaw"></div><div class="tth"></div></div></div></div><div class="water"></div><canvas class="bbl-canvas" width="650" height="790"></canvas>`;

  wrap.appendChild(scene);
  host.appendChild(wrap);

  const canvas = scene.querySelector('canvas.bbl-canvas');
  const ctx = canvas.getContext('2d');
  const SKULL_L = 370, SK_Y0 = 283, SK_Y1 = 618, SINK_DLY = 1500, SINK_DUR = 16000, WATER_Y = 375;
  const cos35 = Math.cos(-35*Math.PI/180), sin35 = Math.sin(-35*Math.PI/180);
  const eyePts = [[40.5,34.5],[115.5,34.5]].map(([lx,ly]) => ({ x: lx*cos35-ly*sin35+18+SKULL_L, y: lx*sin35+ly*cos35+41 }));
  let appStart = null, bubbles = [], lastSpawn = 0, raf = null;
  const cleanups = [];

  const drawFrame = (now) => {
    if (!appStart) appStart = now;
    ctx.clearRect(0,0,650,790);
    const elapsed = now - (appStart + SINK_DLY);
    const skY = elapsed > 0 ? SK_Y0+(SK_Y1-SK_Y0)*Math.min(elapsed/SINK_DUR,1)**2 : SK_Y0;
    if (elapsed > 0 && now - lastSpawn > 200) {
      for (const e of eyePts) {
        const ey = skY + e.y;
        if (ey > WATER_Y + 8) {
          const mkBubble = () => ({ x:e.x+(Math.random()-.5)*8, y:ey+(Math.random()-.5)*8, r:2+Math.random()*5, vy:-(0.45+Math.random()*.9), vx:(Math.random()-.5)*.35, life:0 });
          bubbles.push(mkBubble()); if (Math.random()<.3) bubbles.push(mkBubble());
        }
      }
      lastSpawn = now;
    }
    bubbles = bubbles.filter(b => b.y+b.r > WATER_Y);
    for (const b of bubbles) {
      b.life++; b.x += b.vx+Math.sin(b.life*.09)*.28; b.y += b.vy;
      const ds = b.y-WATER_Y;
      let op = b.life<15 ? b.life/15 : 1; if (ds<35) op=Math.min(op,ds/35);
      if (op<=0) continue;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${op})`; ctx.fill();
    }
    raf = requestAnimationFrame(drawFrame);
  };

  const hp = scene.querySelector('.horse-parallax');
  listen(document, 'mousemove', (e) => {
    const ox = ((e.clientX - window.innerWidth/2) / (window.innerWidth/2)) * 6;
    const oy = ((e.clientY - window.innerHeight/2) / (window.innerHeight/2)) * 4;
    hp.style.transform = `translate(${ox}px,${oy}px)`;
  }, { passive: true }, cleanups);

  const scaleToCover = () => { const s = Math.max(host.offsetWidth/650, host.offsetHeight/790); wrap.style.transform = `scale(${s})`; };
  let ro;
  if ('ResizeObserver' in window) { ro = new ResizeObserver(scaleToCover); ro.observe(host); }
  scaleToCover(); raf = requestAnimationFrame(drawFrame);

  return () => {
    cancelAnimationFrame(raf); cleanups.forEach(c => c());
    if (ro) ro.disconnect(); host.classList.remove('obra-render--cavall');
  };
};

// ─── Bezier amb soroll de Perlin (Corba de Bézier) ───────────────────────────
const renderBezier = (host, _artwork) => {
  const surface = createCanvasSurface(host);
  const { context } = surface;
  let raf = 0, t = 0;

  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = perm[i+256] = (Math.random()*256)|0;
  const fade = x => x*x*x*(x*(x*6-15)+10);
  const g1 = (h, x) => h&1 ? -x : x;
  const noise = (x) => {
    const X = Math.floor(x)&255, fx = x-Math.floor(x);
    return (lerp(g1(perm[X],fx), g1(perm[X+1],fx-1), fade(fx))+1)*0.5;
  };

  const draw = () => {
    const { width, height } = surface.getSize();
    const sz = Math.min(width, height);
    const pad = sz * 0.1;
    context.strokeStyle = 'rgba(254,14,122,.45)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(sz*noise(t+35), sz*noise(t+75));
    context.bezierCurveTo(sz*noise(t+45),sz*noise(t+85),sz*noise(t+55),sz*noise(t+95),sz*noise(t+65),sz*noise(t+105));
    context.stroke();
    context.strokeStyle = 'rgba(255,255,255,.8)';
    context.lineWidth = Math.max(3, sz*0.011);
    context.strokeRect(pad, pad, sz*0.8, sz*0.8);
    t += 0.005;
    raf = requestAnimationFrame(draw);
  };

  host.classList.add('obra-render--bezier');


  draw();
  return () => { cancelAnimationFrame(raf); host.classList.remove('obra-render--bezier'); surface.destroy(); };
};

// ─── Topografia (Geografia d'un Buit) ────────────────────────────────────────
const renderTopografia = (host, _artwork) => {
  const filterId = 'ea-topo-svg';
  if (!document.getElementById(filterId)) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = filterId;
    svg.classList.add('topografia__filtre');
    svg.setAttribute('aria-hidden', 'true');
    // stdDeviation lowered → sharper ring edges; more tableValues alternations → more visible rings
    svg.innerHTML = '<defs><filter id="ea-topo-f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="26" result="blur"/><feComponentTransfer in="blur" result="rings"><feFuncA type="discrete" tableValues="0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0"/></feComponentTransfer><feFlood flood-color="#1a1a1a" result="fill"/><feComposite in="fill" in2="rings" operator="in"/></filter></defs>';
    document.body.appendChild(svg);
  }

  host.classList.add('obra-render--topografia');

  const stage = document.createElement('div');
  stage.className = 'topografia__escena';

  const canvas = document.createElement('canvas');
  canvas.className = 'art-canvas';
  stage.appendChild(canvas);
  host.appendChild(stage);

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dots = [], raf = null;

  const resize = () => {
    const r = host.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = Array.from({ length: 22 }, () => ({
      bx: Math.random()*W, by: Math.random()*H,
      x: 0, y: 0,
      r: 90 + Math.random()*110,
      ax: Math.random()*Math.PI*2,         // X phase
      ay: Math.random()*Math.PI*2,         // Y phase — independent → Lissajous path
      sx: 0.025 + Math.random()*0.03,      // X angular speed (~5× faster than before)
      sy: 0.018 + Math.random()*0.028,     // Y angular speed (different → complex loops)
      rx: 160 + Math.random()*200,         // X orbit radius
      ry: 140 + Math.random()*180,         // Y orbit radius
    }));
  };

  const frame = () => {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.ax += d.sx;
      d.ay += d.sy;
      d.x = d.bx + Math.cos(d.ax) * d.rx;
      d.y = d.by + Math.sin(d.ay) * d.ry;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };

  let ro;
  if ('ResizeObserver' in window) { ro = new ResizeObserver(resize); ro.observe(host); }
  resize(); raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf); if (ro) ro.disconnect();
    host.classList.remove('obra-render--topografia');
  };
};

// ─── Dalí Glass (La Persistència de la Memòria) ──────────────────────────────
const renderDaliGlass = (host, artwork) => {
  const src = artwork?.image || 'assets/imgs/quadres/dali.jpg';
  const focusX = artwork?.focusX ?? 0.25;
  const focusY = artwork?.focusY ?? 0.48;
  const zoom = artwork?.imageZoom ?? 1.26;
  const canvas = document.createElement('canvas');
  canvas.className = 'art-canvas';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const cleanups = [];
  let lastPt = null;
  let cachedImg = null;

  setBackdrop(host, src, `${focusX * 100}% ${focusY * 100}%`);

  const setupCanvas = () => {
    const rect = host.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    canvas.width  = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { w, h };
  };

  const drawBlur = () => {
    if (!cachedImg) return;
    const { w, h } = setupCanvas();
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'blur(18px)';
    drawImageCoverFocused(ctx, cachedImg, w, h, { focusX, focusY, zoom });
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = Math.max(w * 0.10, 28);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    lastPt = null;
  };

  let ro;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => requestAnimationFrame(drawBlur));
    ro.observe(host);
  }

  loadImage(src).then(img => { cachedImg = img; drawBlur(); });

  const draw = (pt) => {
    if (!cachedImg || !lastPt) return;
    ctx.beginPath();
    ctx.moveTo(lastPt.x, lastPt.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  listen(canvas, 'mousemove', (e) => {
    const pt = getPoint(e, canvas); draw(pt); lastPt = pt;
  }, {}, cleanups);
  listen(canvas, 'mouseleave', () => { lastPt = null; }, {}, cleanups);
  listen(canvas, 'touchmove', (e) => {
    e.preventDefault();
    const pt = getPoint(e, canvas); draw(pt); lastPt = pt;
  }, { passive: false }, cleanups);
  listen(canvas, 'touchend', () => { lastPt = null; }, {}, cleanups);


  return () => {
    cleanups.forEach(c => c());
    if (ro) ro.disconnect();
    clearBackdrop(host);
    canvas.remove();
  };
};

// ─── Banksy Shred ─────────────────────────────────────────────────────────────
const renderShred = (host, artwork) => {
  const cleanups = [];
  const src = artwork.image || '';
  const STRIP_COLS = 20;
  const STRIP_ROWS = 12;
  const SHREDDER_HEIGHT = 9;

  host.classList.add('obra-render--shred');

  const canvas = document.createElement('canvas');
  canvas.className = 'shred__canvas';

  const stripsContainer = document.createElement('div');
  stripsContainer.className = 'shred__tires';

  const slotEl = document.createElement('div');
  slotEl.className = 'shred__ranura';

  const teeth = document.createElement('div');
  teeth.className = 'shred__dents';
  for (let i = 0; i < STRIP_COLS; i++) {
    const t = document.createElement('div');
    t.className = 'shred__dent';
    teeth.appendChild(t);
  }
  slotEl.appendChild(teeth);
  host.append(canvas, stripsContainer, slotEl);

  let img = null;
  let state = 'idle';
  let pieces = [];

  const w = () => host.offsetWidth;
  const h = () => host.offsetHeight;

  const drawCanvas = (shredded) => {
    const cw = w(), ch = h();
    if (!cw || !ch) return;
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!img) { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, cw, ch); return; }
    drawImageCover(ctx, img, cw, ch);
    if (shredded) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, cw, ch);
    }
  };

  const buildPieces = () => {
    stripsContainer.innerHTML = '';
    pieces = [];
    const cw = w(), ch = h();

    const off = document.createElement('canvas');
    off.width = cw; off.height = ch;
    drawImageCover(off.getContext('2d'), img, cw, ch);

    for (let row = 0; row < STRIP_ROWS; row++) {
      const sy = Math.floor((row / STRIP_ROWS) * ch);
      const nextSy = Math.floor(((row + 1) / STRIP_ROWS) * ch);
      const sh = Math.max(1, nextSy - sy);

      for (let col = 0; col < STRIP_COLS; col++) {
        const sx = Math.floor((col / STRIP_COLS) * cw);
        const nextSx = Math.floor(((col + 1) / STRIP_COLS) * cw);
        const sw = Math.max(1, nextSx - sx);
        const sc = document.createElement('canvas');
        sc.width = sw; sc.height = sh;
        sc.getContext('2d').drawImage(off, sx, sy, sw, sh, 0, 0, sw, sh);

        const el = document.createElement('div');
        el.className = 'shred__tira';
        Object.assign(el.style, {
          left: `${sx}px`,
          top: `${sy}px`,
          width: `${sw}px`,
          height: `${sh}px`,
          backgroundImage: `url(${sc.toDataURL()})`,
        });
        stripsContainer.appendChild(el);
        pieces.push({ el, row, col, height: sh });
      }
    }
  };

  const startShred = () => {
    if (state !== 'idle' || !img) return;
    state = 'animating';
    drawCanvas(true);
    buildPieces();

    const ch = h();
    slotEl.classList.add('is-oberta');

    let done = 0;

    pieces.forEach((piece) => {
      const delay = Math.random() * 90 + piece.col * 3;
      const duration = 620 + Math.random() * 220;
      const wobble = (Math.random() - 0.5) * 18;
      const driftX = ((piece.col - (STRIP_COLS - 1) / 2) / STRIP_COLS) * 34 + (Math.random() - 0.5) * 18;
      const totalFall = ch + piece.height + piece.row * 8 + 20;

      setTimeout(() => {
        if (state !== 'animating') return;
        let t0 = null;
        const tick = (ts) => {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / duration, 1);
          const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          piece.el.style.transform = `translate(${driftX * ease}px, ${ease * totalFall}px) rotate(${wobble * ease}deg)`;
          piece.el.style.opacity = String(1 - ease * 0.15);
          if (p < 1) {
            requestAnimationFrame(tick);
          } else {
            done++;
            if (done === pieces.length) state = 'shredded';
          }
        };
        requestAnimationFrame(tick);
      }, delay);
    });
  };

  const reset = () => {
    state = 'idle';
    stripsContainer.innerHTML = '';
    pieces = [];
    slotEl.classList.remove('is-oberta');
    drawCanvas(false);
  };

  const onClick = () => {
    if (state === 'idle') startShred();
    else if (state === 'shredded') reset();
  };

  listen(host, 'click', onClick, {}, cleanups);
  listen(host, 'touchend', (e) => { e.preventDefault(); onClick(); }, { passive: false }, cleanups);

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => { if (state === 'idle') drawCanvas(false); });
    ro.observe(host);
    cleanups.push(() => ro.disconnect());
  }

  loadImage(src)
    .then(loaded => { img = loaded; drawCanvas(false); })
    .catch(() => drawCanvas(false));

  return () => { cleanups.forEach(c => c()); host.classList.remove('obra-render--shred'); };
};

const RENDERERS = {
  colorpicker:  renderMondrian,
  toggle:       renderMalevich,
  ratoli:       renderRothko,
  cicle:        renderWarhol,
  drag:         renderKandinskyDrag,
  particules:   renderParticles,
  ones:         renderWaves,
  animacio:     renderMatisse,
  fosa:         renderMelt,
  slider:       renderSlider,
  zoom:         renderZoom,
  arrossegable: renderArrossegable,
  engranatges:  renderEngranatges,
  remolins:     renderRemolins,
  parallax:     renderParallax,
  metaballs:    renderMetaballs,
  puzzle:       renderPuzzle,
  seguiment:    renderSeguiment,
  pinzell:      renderPinzell,
  daliglass:    renderDaliGlass,
  rubik:        renderRubik,
  vaixell:      renderVaixell,
  dropaint:     renderDropaint,
  cavall:       renderCavall,
  bezier:       renderBezier,
  topografia:   renderTopografia,
  shred:        renderShred,
};

export const renderArtworkScene = (refs, artwork) => {
  cleanupArtworkScene(refs);

  if (!refs?.sceneEl || !refs?.imageEl || !refs?.renderEl) return;

  if (refs.sceneEl && artwork?.aspectRatio) {
    refs.sceneEl.style.aspectRatio = artwork.aspectRatio;
  }

  showHint(refs.hintEl, artwork);

  const interactionType = artwork?.interactionType;
  const renderer = interactionType ? RENDERERS[interactionType] : null;

  if (!renderer) {
    renderFallbackImage(refs, artwork);
    return;
  }

  refs.imageEl.hidden = true;
  refs.imageEl.setAttribute('aria-hidden', 'true');
  refs.imageEl.removeAttribute('src');
  refs.imageEl.alt = artwork?.title || '';

  refs.renderEl.hidden = false;
  refs.renderEl.setAttribute('aria-hidden', 'false');
  refs.sceneEl.dataset.mode = interactionType;

  const cleanup = renderer(refs.renderEl, artwork);
  refs.renderEl._cleanup = typeof cleanup === 'function' ? cleanup : null;
};
