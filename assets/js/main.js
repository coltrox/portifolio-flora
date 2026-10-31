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
