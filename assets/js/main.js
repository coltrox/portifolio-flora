/* ===========================================================
   by flora studio — interações
   =========================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Barra fixa ganha borda ao rolar ------------------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('is-stuck', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Menu em tela cheia (mobile) ----------------------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('menu');
  var lastFocus = null;

  function openMenu() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add('is-open'); });
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    if (window.__lenis) window.__lenis.stop();
    var first = menu.querySelector('a');
    if (first) first.focus();
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (window.__lenis) window.__lenis.start();
    var hide = function () { menu.hidden = true; };
    if (reduced) hide(); else setTimeout(hide, 350);
    if (lastFocus) lastFocus.focus();
  }

  toggle.addEventListener('click', function () {
    if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    else openMenu();
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu();
  });

  /* --- Revelação no scroll ------------------------------- */
  var targets = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });
  }

  /* --- Reels: carrega e toca só quando aparecem ---------- */
  var reels = document.querySelectorAll('.reel video');

  if (reels.length && 'IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (!v.src && v.dataset.src) v.src = v.dataset.src;
          if (!reduced) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    reels.forEach(function (v) { rio.observe(v); });
  }

  /* --- Carrossel: setas e encaixe ------------------------ */
  [].slice.call(document.querySelectorAll('.carrossel')).forEach(function (car) {
    var trilho = car.querySelector('.carrossel__trilho');
    var setas  = [].slice.call(car.querySelectorAll('.carrossel__seta'));
    if (!trilho || !setas.length) return;

    function passo() {
      var item = trilho.querySelector('figure');
      if (!item) return trilho.clientWidth * 0.8;
      var estilo = getComputedStyle(trilho);
      return item.getBoundingClientRect().width + parseFloat(estilo.columnGap || estilo.gap || 0);
    }

    function atualizar() {
      var max = trilho.scrollWidth - trilho.clientWidth;
      setas[0].disabled = trilho.scrollLeft <= 2;
      setas[1].disabled = trilho.scrollLeft >= max - 2;
      // Sem transbordo, as setas não servem para nada
      car.classList.toggle('sem-setas', max <= 2);
    }

    setas.forEach(function (b) {
      b.addEventListener('click', function () {
        trilho.scrollBy({ left: passo() * Number(b.dataset.dir), behavior: 'smooth' });
      });
    });

    trilho.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar, { passive: true });
    atualizar();
  });

  /* --- Lightbox: abre no carrossel de origem -------------- */
  var lb       = document.getElementById('lightbox');
  var lbImg    = document.getElementById('lightboxImg');
  var lbCap    = document.getElementById('lightboxCap');
  var lbConta  = document.getElementById('lightboxContador');
  var grupo    = [];
  var atual    = 0;
  var voltarPara = null;

  function travarFundo(travar) {
    document.body.classList.toggle('lightbox-open', travar);
    if (window.__lenis) { travar ? window.__lenis.stop() : window.__lenis.start(); }
  }

  // Só figuras com imagem entram no lightbox (os reels tocam no lugar)
  [].slice.call(document.querySelectorAll('[data-galeria] figure')).forEach(function (fig) {
    var img = fig.querySelector('img');
    if (!img) return;
    fig.setAttribute('role', 'button');
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('aria-label', 'Ampliar imagem: ' + img.alt);
    fig.addEventListener('click', function () { abrir(fig); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(fig); }
    });
  });

  function mostrar(i) {
    if (!grupo.length) return;
    atual = (i + grupo.length) % grupo.length;
    var img = grupo[atual].querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lbCap.textContent = img.alt || '';
    if (lbConta) lbConta.textContent = (atual + 1) + ' / ' + grupo.length;
    // Mantém o carrossel acompanhando o que está aberto
    grupo[atual].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function abrir(fig) {
    if (!lb) return;
    var caixa = fig.closest('[data-galeria]');
    grupo = [].slice.call(caixa.querySelectorAll('figure')).filter(function (f) {
      return f.querySelector('img');
    });
    voltarPara = fig;
    mostrar(grupo.indexOf(fig));
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    travarFundo(true);
    lb.querySelector('.lightbox__close').focus();
  }

  function fechar() {
    lb.classList.remove('is-open');
    travarFundo(false);
    var esconder = function () { lb.hidden = true; lbImg.src = ''; };
    if (reduced) esconder(); else setTimeout(esconder, 250);
    if (voltarPara) voltarPara.focus();
  }

  if (lb) {
    lb.querySelector('.lightbox__close').addEventListener('click', fechar);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', function () { mostrar(atual - 1); });
    lb.querySelector('.lightbox__nav--next').addEventListener('click', function () { mostrar(atual + 1); });

    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox__frame')) fechar();
    });

    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape')     fechar();
      if (e.key === 'ArrowLeft')  mostrar(atual - 1);
      if (e.key === 'ArrowRight') mostrar(atual + 1);
    });

    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }

  /* --- Preloader: carrega as imagens antes de entrar ----- */
  var pre     = document.getElementById('preloader');
  var preFill = document.getElementById('preloaderFill');
  var prePct  = document.getElementById('preloaderPct');

  function iniciarPreloader() {
    if (!pre || reduced) { if (pre) pre.remove(); return; }

    document.body.classList.add('is-loading');

    // Reúne tudo que precisa estar pronto antes de mostrar o site
    var fontes = [].slice.call(document.images)
      .map(function (img) { return img.currentSrc || img.src; })
      .filter(Boolean);
    // Inclui os posters dos reels, que são lazy
    [].slice.call(document.querySelectorAll('.reel video[poster]'))
      .forEach(function (v) { fontes.push(v.poster); });

    fontes = fontes.filter(function (u, i, a) { return a.indexOf(u) === i; });

    var total = fontes.length || 1;
    var prontas = 0;
    var inicio = Date.now();

    function passo() {
      prontas++;
      var pct = Math.round((prontas / total) * 100);
      if (preFill) preFill.style.width = pct + '%';
      if (prePct)  prePct.textContent = pct + '%';
      if (prontas >= total) encerrar();
    }

    function encerrar() {
      // Segura um instante para o preloader não piscar
      var restante = Math.max(0, 700 - (Date.now() - inicio));
      setTimeout(function () {
        pre.classList.add('is-done');
        document.body.classList.remove('is-loading');
        setTimeout(function () { if (pre.parentNode) pre.remove(); }, 800);
      }, restante);
    }

    fontes.forEach(function (src) {
      var im = new Image();
      im.onload = im.onerror = passo;
      im.src = src;
    });

    // Rede ruim não pode prender ninguém na porta
    setTimeout(encerrar, 6000);
  }

  iniciarPreloader();

  /* --- Scroll Suave Nativo (Lenis) ----------------------- */
  function iniciarLenis() {
    if (reduced) return; // Respeita quem prefere sem animação nas configurações do PC

    // Se a CDN nao carregar (offline, adblock, fora do ar), segue com o
    // scroll nativo em vez de derrubar todo o resto do script.
    if (typeof Lenis !== 'function') return;

    // Inicializa a biblioteca Lenis
    const lenis = new Lenis({
      duration: 1.2, // Tempo da suavidade (quanto maior, mais "lento/suave")
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva de aceleração natural
      smoothWheel: true, // Aplica suavidade na rodinha do mouse
    });

    // Faz o Lenis rodar sincronizado com a taxa de atualização do monitor
    window.__lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Conecta as âncoras (links do menu) para usarem o scroll suave do Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var target = this.getAttribute('href');
        if (target && target !== '#') {
          lenis.scrollTo(target);
        }
      });
    });
  }

  // Como o script do Lenis carrega externo, esperamos ele estar disponível
  window.addEventListener('DOMContentLoaded', function() {
    if (typeof Lenis !== 'undefined') {
      try { iniciarLenis(); } catch (e) { /* scroll nativo continua valendo */ }
    }
  });

  /* --- Cursor: pontinho + círculo que persegue ----------- */
  function iniciarCursor() {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    var dot  = document.createElement('div');
    var ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('cursor-ativo');

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    }, { passive: true });

    // O círculo chega depois, com inércia
    (function quadro() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(quadro);
    })();

    // Sai da tela, some
    document.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-ativo');
    });
    document.addEventListener('mouseenter', function () {
      document.body.classList.add('cursor-ativo');
    });

    // Estado conforme o que está sob o cursor
    var clicaveis = 'a, button, [role="button"]';
    var escuros   = '.contato, .foot, .marquee, .menu, .lightbox';

    document.addEventListener('mouseover', function (e) {
      var alvo = e.target;
      var zoom  = alvo.closest('[data-galeria] figure');
      var click = alvo.closest(clicaveis);
      var dark  = alvo.closest(escuros);

      ring.classList.toggle('is-zoom', !!zoom);
      dot.classList.toggle('is-zoom', !!zoom);
      ring.classList.toggle('is-hover', !!click && !zoom);
      ring.classList.toggle('em-escuro', !!dark && !zoom);
      dot.classList.toggle('em-escuro', !!dark && !zoom);
    }, { passive: true });
  }

  iniciarCursor();

  /* --- Ano em algarismos romanos no rodapé --------------- */
  var roman = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
               [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  function toRoman(n) {
    return roman.reduce(function (out, pair) {
      while (n >= pair[0]) { out += pair[1]; n -= pair[0]; }
      return out;
    }, '');
  }
  var year = toRoman(new Date().getFullYear());
  document.querySelectorAll('.hero__meta span:last-child, .foot .mono:last-child')
    .forEach(function (el) { el.textContent = year; });

})();
