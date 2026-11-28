/* Public header only. The private listing preview keeps its existing shell. */
(() => {
  'use strict';
  const entities = {amp:'&', lt:'<', gt:'>', quot:'"', '#39':"'"};
  const labelText = value => value.replace(/&(amp|lt|gt|quot|#39);/g, (_, key) => entities[key]);

  const labels = {
    en: {
      navHomes: 'Our Homes', browseAllHomes: 'Browse All Homes', resources: 'Resources',
      navFaq: 'FAQ', navCommunity: 'Community', contact: 'Contact', navStory: 'Our Story',
      applyNow: 'Apply Now', primaryNav: 'Primary navigation', homeLink: 'Oaktown Rentals — home',
      switchLanguage: 'Cambiar a español', openMenu: 'Open menu', closeMenu: 'Close menu',
      motionOn: 'Motion on', motionOff: 'Motion off', motionLabel: 'Enable visual motion',
      skipContent: 'Skip to content', missing: 'We couldn’t find that page.', returnHome: 'Return to Oaktown Rentals'
    },
    es: {
      navHomes: 'Viviendas', browseAllHomes: 'Ver todas las viviendas', resources: 'Recursos',
      navFaq: 'Preguntas', navCommunity: 'Comunidad', contact: 'Contacto', navStory: 'Nuestra historia',
      applyNow: 'Solicitar ahora', primaryNav: 'Navegación principal', homeLink: 'Oaktown Rentals — inicio',
      switchLanguage: 'Switch to English', openMenu: 'Abrir menú', closeMenu: 'Cerrar menú',
      motionOn: 'Animación sí', motionOff: 'Animación no', motionLabel: 'Activar animaciones',
      skipContent: 'Saltar al contenido', missing: 'No encontramos esa página.', returnHome: 'Volver a Oaktown Rentals'
    }
  };

  function readLanguage() {
    try { return localStorage.getItem('oaktown-language') === 'es' ? 'es' : 'en'; }
    catch { return 'en'; }
  }

  function translateLabels(root, language) {
    const copy = labels[language];
    root.querySelectorAll('[data-sky]').forEach(node => { node.textContent = copy[node.dataset.sky]; });
    root.querySelectorAll('[data-sky-aria]').forEach(node => node.setAttribute('aria-label', copy[node.dataset.skyAria]));
  }

  function create(route = '') {
    const slot = document.querySelector('[data-sky-header]');
    slot.outerHTML = `<header class="site-header sky-header" id="site-header">
      <a href="${route || '#'}" class="wordmark" aria-label="Oaktown Rentals — home" data-sky-aria="homeLink">
        <img class="brand-logo" src="/assets/signature/oaktown-wordmark-transparent.png" width="480" height="243" alt="Oaktown Rentals" decoding="async">
      </a>
      <div class="header-actions">
        <button id="motion-toggle" class="motion-toggle" type="button" aria-pressed="false">Motion</button>
        <button class="language-switch" id="language-switch" type="button" aria-label="Cambiar a español" data-sky-aria="switchLanguage">ES</button>
        <button class="menu-button" id="menu-button" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu"><span></span><span></span></button>
      </div>
      <nav class="desktop-nav sky-navigation" id="mobile-nav" aria-label="Primary navigation" data-sky-aria="primaryNav">
        <details class="sky-disclosure">
          <summary><span data-sky="navHomes">Our Homes</span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
          <div class="sky-dropdown">
            <a class="sky-browse" href="${route}#homes" data-sky="browseAllHomes">Browse All Homes</a>
            <div id="header-properties"></div>
          </div>
        </details>
        <a class="sky-nav-link" href="/mint-mojo/">Lobster Nirvana</a>
        <details class="sky-disclosure resources-menu">
          <summary><span data-sky="resources">Resources</span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
          <div class="sky-dropdown">
            <a href="${route}#faq" data-sky="navFaq">FAQ</a>
            <a href="${route}#community" data-sky="navCommunity">Community</a>
            <a href="${route}#contact" data-sky="contact">Contact</a>
          </div>
        </details>
        <a class="sky-nav-link sky-story-link" href="${route}#about" data-sky="navStory">Our Story</a>
        <a class="sky-mobile-apply" data-application-link target="_blank" rel="noopener noreferrer" data-sky="applyNow">Apply Now</a>
      </nav>
    </header>`;
    return document.getElementById('site-header');
  }

  window.OaktownSkyHeader = {create, readLanguage, mount(header, app, properties, applicationUrl) {
    const navigation = header.querySelector('.sky-navigation');
    const menu = header.querySelector('#menu-button');
    const disclosures = [...navigation.querySelectorAll('.sky-disclosure')];
    const desktop = matchMedia('(min-width: 961px)');
    const mouse = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const titles = header.querySelector('#header-properties');
    let translate = key => key === 'openMenu' ? 'Open menu' : 'Close menu';
    let pinned = null;
    let leaveTimer = 0;
    let opening = null;
    let photographic = false;
    let surface = '';
    let frame = 0;
    let lastY = scrollY;
    let travel = 0;
    let hoveringHeader = false;

    const panels = new Map(disclosures.map(details => [details, details.querySelector('.sky-dropdown')]));
    header.querySelector('[data-application-link]').href = applicationUrl;

    function setProperties(list) {
      const links = list.filter(property => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(property.slug)).map(property => {
        const link = document.createElement('a');
        link.href = (app.id === 'app' ? '' : '/') + '#home/' + property.slug;
        link.textContent = labelText(property.name);
        return link;
      });
      titles.replaceChildren(...links);
      for (const panel of panels.values()) {
        panel.querySelectorAll('a').forEach((link, index) => link.style.setProperty('--sky-item', Math.min(index, 6)));
      }
    }
    setProperties(properties);

    const openDisclosure = () => disclosures.find(details => details.open);
    const mobileOpen = () => navigation.hasAttribute('data-mobile-open');
    const motionOn = () => !reduced.matches && !document.documentElement.classList.contains('motion-off');

    function reveal() {
      header.classList.remove('sky-header-away');
      travel = 0;
    }

    function showDisclosure(next, fromClick = false) {
      clearTimeout(leaveTimer);
      const previous = openDisclosure();
      if (previous && previous !== next && panels.get(previous).contains(document.activeElement)) {
        // Never strand keyboard focus in a disclosure closed by the pointer.
        previous.querySelector('summary').focus({preventScroll:true});
      }
      for (const details of disclosures) {
        const open = details === next;
        details.open = open;
        panels.get(details).inert = !open;
      }
      pinned = fromClick ? next : null;
      if (next) reveal();
    }

    function showMobile(open) {
      navigation.toggleAttribute('data-mobile-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', translate(open ? 'closeMenu' : 'openMenu'));
      if (open) reveal();
      else showDisclosure(null);
    }

    for (const details of disclosures) {
      const summary = details.querySelector('summary');
      panels.get(details).inert = !details.open;
      summary.addEventListener('click', event => {
        event.preventDefault();
        showDisclosure(details.open && pinned === details ? null : details, true);
      });
      details.addEventListener('pointerenter', event => {
        if (!desktop.matches || !mouse.matches || event.pointerType !== 'mouse') return;
        clearTimeout(leaveTimer);
        const current = openDisclosure();
        if (current === details || pinned || current?.contains(document.activeElement)) return;
        showDisclosure(details);
      });
      details.addEventListener('pointerleave', () => {
        if (!desktop.matches || pinned === details) return;
        leaveTimer = setTimeout(() => {
          if (details.open && !details.contains(document.activeElement)) showDisclosure(null);
        }, 130);
      });
      details.addEventListener('focusout', event => {
        if (desktop.matches && details.open && !details.contains(event.relatedTarget)) showDisclosure(null);
      });
    }

    menu.addEventListener('click', () => showMobile(!mobileOpen()));
    header.addEventListener('focusin', reveal);
    navigation.addEventListener('focusout', event => {
      if (mobileOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) showMobile(false);
    });
    header.addEventListener('pointerenter', event => { hoveringHeader = event.pointerType === 'mouse'; });
    header.addEventListener('pointerleave', () => { hoveringHeader = false; });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) showMobile(false);
      else if (event.target.closest('a')) {
        if (mobileOpen() && navigation.contains(document.activeElement)) menu.focus({preventScroll:true});
        showMobile(false);
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector('dialog[open]')) return;
      const details = openDisclosure();
      if (details) {
        details.querySelector('summary').focus({preventScroll:true});
        showDisclosure(null);
        event.preventDefault();
      } else if (mobileOpen()) {
        showMobile(false);
        menu.focus({preventScroll:true});
        event.preventDefault();
      }
    });

    desktop.addEventListener('change', () => {
      if (!desktop.matches && navigation.contains(document.activeElement)) menu.focus({preventScroll:true});
      showMobile(false);
      reveal();
    });

    function renderScroll() {
      frame = 0;
      const y = Math.max(0, scrollY);
      const delta = y - lastY;
      lastY = y;
      const bottom = opening?.getBoundingClientRect().bottom ?? 0;
      const nextSurface = photographic && bottom > header.offsetHeight ? 'sky' : 'ivory';
      if (nextSurface !== surface) {
        surface = nextSurface;
        header.dataset.surface = surface;
        reveal();
        return;
      }
      if (!opening || bottom > -110 || !desktop.matches || !motionOn() || openDisclosure() ||
          mobileOpen() || hoveringHeader || header.contains(document.activeElement)) {
        reveal();
        return;
      }
      if (Math.abs(delta) < 1) return;
      if (Math.sign(travel) !== Math.sign(delta)) travel = 0;
      travel += delta;
      if (travel < -16) reveal();
      else if (travel > 38) header.classList.add('sky-header-away');
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(renderScroll);
    }
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', schedule, {passive:true});
    reduced.addEventListener('change', schedule);
    new MutationObserver(schedule).observe(document.documentElement, {attributes:true, attributeFilter:['class']});

    return {setProperties, update(language) {
      translate = key => labels[language][key];
      header.querySelector('[data-application-link]').hidden = app.classList.contains('signature-property') &&
        app.nextElementSibling?.hasAttribute('data-contact-only');
      translateLabels(header, language);
      header.querySelector('#language-switch').textContent = language === 'es' ? 'ES / EN' : 'EN / ES';
      opening = app.querySelector('.cinematic-hero, .signature-property > .page-intro');
      photographic = opening?.matches('.cinematic-hero, [data-photographic-header]');
      for (const link of navigation.querySelectorAll('a[href^="#"]')) {
        if (link.hash && link.hash === location.hash) link.setAttribute('aria-current', link.hash.startsWith('#home/') ? 'page' : 'location');
        else link.removeAttribute('aria-current');
      }
      showMobile(false);
      lastY = Math.max(0, scrollY);
      reveal();
      renderScroll();
      if (!header.hasAttribute("data-motion-ready")) {
        requestAnimationFrame(() => requestAnimationFrame(() => { header.dataset.motionReady = ""; }));
      }
    }};
  }, standalone(root, onLanguage) {
    const data = window.OAKTOWN_DATA;
    const header = create('/');
    const controller = this.mount(header, root, [], data.applicationUrl);
    let language = readLanguage();

    function update() {
      document.documentElement.lang = language;
      translateLabels(document, language);
      controller.update(language);
      onLanguage(language, key => labels[language][key]);
    }

    header.querySelector('#language-switch').addEventListener('click', () => {
      language = language === 'en' ? 'es' : 'en';
      try { localStorage.setItem('oaktown-language', language); } catch {}
      update();
    });
    addEventListener('pageshow', event => {
      if (!event.persisted) return;
      const saved = readLanguage();
      if (saved !== language) { language = saved; update(); }
    });
    window.OaktownContent.load(data).then(() => controller.setProperties(data.properties));
    update();
  }};

  const missing = document.querySelector('[data-sky-error]');
  if (missing) {
    let cleanup = () => {};
    window.OaktownSkyHeader.standalone(missing, (_, t) => {
      cleanup();
      cleanup = window.OaktownEffects.mount(missing, {t});
    });
  }
})();
