/* Native sticky scroll uses one photo and a single requested frame per update.
   Reuses the existing motion preference, lifecycle cleanup and scroll conventions. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 851px) and (min-height: 560px)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };

  window.OaktownSignature = {mount(root) {
    const hero = root.querySelector('.cinematic-hero');
    if (!hero) return () => {};
    const events = new AbortController();
    const options = {signal: events.signal};
    const stage = hero.querySelector('.cinematic-stage');
    const photo = hero.querySelector('.signature-images');
    const scenes = [...hero.querySelectorAll('[data-hero-scene]')];
    const buttons = [...hero.querySelectorAll('[data-hero-scene-button]')];
    const exit = hero.querySelector('.cinematic-exit');
    const hint = hero.querySelector('.cinematic-scroll');
    let frame = 0;
    let geometry;
    let active = -1;
    let cinematic = false;
    const enabled = () => desktop.matches && !reduce.matches
      && !document.documentElement.classList.contains('motion-off')
      && !navigator.connection?.saveData;

    function selectScene(index) {
      if (active === index) return;
      active = index;
      scenes.forEach((scene, i) => {
        const selected = i === index;
        // A scroll transition must not leave focus in an invisible scene.
        if (!selected && scene.contains(document.activeElement)) buttons[index].focus({preventScroll: true});
        scene.inert = !selected;
        scene.setAttribute('aria-hidden', String(!selected));
        scene.classList.toggle('is-active', selected);
      });
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      hero.dataset.scene = String(index);
    }

    function render() {
      frame = 0;
      const progress = cinematic ? clamp((scrollY - geometry.top) / geometry.travel) : 0;
      // Scale around the actual entrance. Both directions use the same continuous mapping.
      photo.style.transform = cinematic ? `scale(${1 + progress * .82})` : 'none';
      const firstFade = smooth((progress - .18) / .12);
      const secondFadeIn = smooth((progress - .30) / .12);
      const secondFadeOut = smooth((progress - .62) / .12);
      const thirdFade = smooth((progress - .74) / .12);
      const opacity = [1 - firstFade, secondFadeIn * (1 - secondFadeOut), thirdFade];
      scenes.forEach((scene, index) => {
        scene.style.opacity = String(opacity[index]);
        scene.style.transform = cinematic ? `translateY(${(1 - opacity[index]) * 12}px)` : 'none';
      });
      selectScene(progress < .30 ? 0 : progress < .74 ? 1 : 2);
      exit.style.opacity = String(cinematic ? smooth((progress - .86) / .14) : 0);
      hint.style.opacity = String(cinematic ? 1 - smooth((progress - .78) / .12) : 0);
      hint.inert = !cinematic || progress > .9;
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }
    function measure() {
      geometry = {
        top: hero.getBoundingClientRect().top + scrollY,
        travel: Math.max(1, hero.offsetHeight - stage.offsetHeight),
        height: hero.offsetHeight
      };
      schedule();
    }
    function preferencesChanged() {
      const previous = geometry;
      const previousScroll = scrollY;
      const wasCinematic = cinematic;
      cinematic = enabled();
      hero.classList.toggle('is-cinematic', cinematic);
      measure();
      if (previous && wasCinematic !== cinematic) {
        if (previousScroll >= previous.top + previous.height) {
          scrollTo({top: previousScroll + geometry.height - previous.height, behavior: 'instant'});
        } else if (previousScroll > previous.top) {
          scrollTo({top: previous.top, behavior: 'instant'});
        }
      }
      schedule();
    }

    buttons.forEach((button, index) => button.addEventListener('click', () => {
      if (!cinematic) return;
      scrollTo({top: geometry.top + geometry.travel * [0, .5, 1][index], behavior: 'smooth'});
    }, options));
    addEventListener('scroll', schedule, {...options, passive: true});
    addEventListener('resize', measure, {...options, passive: true});
    reduce.addEventListener('change', preferencesChanged, options);
    desktop.addEventListener('change', preferencesChanged, options);
    navigator.connection?.addEventListener('change', preferencesChanged, options);
    const preferences = new MutationObserver(preferencesChanged);
    preferences.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
    const sizes = new ResizeObserver(measure);
    sizes.observe(hero);
    preferencesChanged();
    return () => {
      events.abort();
      preferences.disconnect();
      sizes.disconnect();
      cancelAnimationFrame(frame);
    };
  }};
  document.addEventListener('click', event => {
    if (event.target.closest('[data-motion-shortcut]')) document.getElementById('motion-toggle')?.click();
  });
})();
