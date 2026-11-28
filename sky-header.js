/* Public header only. The private listing preview keeps its existing shell. */
(() => {
  'use strict';
  const entities = {amp:'&', lt:'<', gt:'>', quot:'"', '#39':"'"};
  const labelText = value => value.replace(/&(amp|lt|gt|quot|#39);/g, (_, key) => entities[key]);

  window.OaktownSkyHeader = {mount(header, app, properties, applicationUrl) {
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
    let hero = null;
    let surface = '';
    let frame = 0;
    let lastY = scrollY;
    let travel = 0;
    let hoveringHeader = false;

    for (const property of properties) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(property.slug)) continue;
      const link = document.createElement('a');
      link.href = '#home/' + property.slug;
      link.textContent = labelText(property.name);
      titles.append(link);
    }
    header.querySelector('[data-application-link]').href = applicationUrl;

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
      if (previous && previous !== next && previous.querySelector('.sky-dropdown').contains(document.activeElement)) {
        // Never strand keyboard focus in a disclosure closed by the pointer.
        previous.querySelector('summary').focus({preventScroll:true});
      }
      for (const details of disclosures) details.open = details === next;
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
      const bottom = hero?.getBoundingClientRect().bottom ?? 0;
      const nextSurface = bottom > header.offsetHeight ? 'sky' : 'ivory';
      if (nextSurface !== surface) {
        surface = nextSurface;
        header.dataset.surface = surface;
        reveal();
      }
      if (!hero || bottom > -110 || !desktop.matches || !motionOn() || openDisclosure() ||
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

    return {update(t) {
      translate = t;
      hero = app.querySelector('.cinematic-hero');
      for (const link of navigation.querySelectorAll('a[href^="#"]')) {
        if (link.hash === location.hash) link.setAttribute('aria-current', link.hash.startsWith('#home/') ? 'page' : 'location');
        else link.removeAttribute('aria-current');
      }
      showMobile(false);
      lastY = Math.max(0, scrollY);
      reveal();
      renderScroll();
      requestAnimationFrame(() => { header.dataset.motionReady = ""; });
    }};
  }};
})();
