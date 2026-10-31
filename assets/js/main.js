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
    var first = menu.querySelector('a');
    if (first) first.focus();
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
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

  /* --- Lightbox: clique na imagem para ampliar ----------- */
  var lb      = document.getElementById('lightbox');
  var lbImg   = document.getElementById('lightboxImg');
  var lbCap   = document.getElementById('lightboxCap');
  var figuras = [].slice.call(document.querySelectorAll('[data-galeria] figure'));
  var atual   = 0;
  var voltarPara = null;

  // Cada figura vira alvo de clique e de teclado
  figuras.forEach(function (fig, i) {
    fig.setAttribute('role', 'button');
    fig.setAttribute('tabindex', '0');
    var img = fig.querySelector('img');
    fig.setAttribute('aria-label', 'Ampliar imagem: ' + (img ? img.alt : ''));
    fig.addEventListener('click', function () { abrir(i); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(i); }
    });
  });

  function mostrar(i) {
    atual = (i + figuras.length) % figuras.length;
    var img = figuras[atual].querySelector('img');
    if (!img) return;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lbCap.textContent = img.alt || '';
  }

  function abrir(i) {
    if (!lb) return;
    voltarPara = figuras[i];
    mostrar(i);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    document.body.classList.add('lightbox-open');
    lb.querySelector('.lightbox__close').focus();
  }

  function fechar() {
    lb.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    var esconder = function () { lb.hidden = true; lbImg.src = ''; };
    if (reduced) esconder(); else setTimeout(esconder, 250);
    if (voltarPara) voltarPara.focus();
  }

  if (lb) {
    lb.querySelector('.lightbox__close').addEventListener('click', fechar);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', function () { mostrar(atual - 1); });
    lb.querySelector('.lightbox__nav--next').addEventListener('click', function () { mostrar(atual + 1); });

    // Clicar no fundo fecha; clicar na imagem, não
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox__frame')) fechar();
    });

    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape')     fechar();
      if (e.key === 'ArrowLeft')  mostrar(atual - 1);
      if (e.key === 'ArrowRight') mostrar(atual + 1);
    });

    // Arrastar para o lado no celular
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

  /* --- Scroll suave por interpolação (desktop, mouse) ---- */
  function iniciarScrollSuave() {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return; // toque já tem inércia nativa

    var alvo = window.scrollY, pos = window.scrollY, rodando = false;

    function teto() {
      return document.documentElement.scrollHeight - window.innerHeight;
    }

    function quadro() {
      pos += (alvo - pos) * 0.06; 
      if (Math.abs(alvo - pos) < 0.5) {
        pos = alvo; rodando = false;
        window.scrollTo(0, pos);
        return;
      }
      window.scrollTo(0, pos);
      requestAnimationFrame(quadro);
    }

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey) return; // não atrapalha o zoom
      if (document.body.classList.contains('lightbox-open')) return;
      if (document.body.classList.contains('menu-open')) return;
      
      e.preventDefault();
      
      var multiplicador = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 2.5;
      var d = e.deltaY * multiplicador;
      
      alvo = Math.max(0, Math.min(teto(), alvo + d));
      
      if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
    }, { passive: false });

    // Se a página rolar por outro caminho (teclado, barra, âncora), realinha
    window.addEventListener('scroll', function () {
      if (!rodando) { alvo = pos = window.scrollY; }
    }, { passive: true });

    window.addEventListener('resize', function () {
      alvo = Math.min(alvo, teto());
    }, { passive: true });
  }

  iniciarScrollSuave();

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
    var clicaveis = 'a, button, [role="button"], .serv__item';
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
