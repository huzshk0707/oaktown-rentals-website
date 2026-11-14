/* Native scroll drives the chapters; no wheel interception or idle loop. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 851px) and (min-height: 700px)');
  const clamp = n => Math.max(0, Math.min(1, n));
  let paused = false;
  try { paused = localStorage.getItem('oaktown-motion') === 'off'; } catch {}
  const enabled = () => !reduce.matches && !paused;
  const setRoot = () => {
    document.documentElement.classList.toggle('motion-enabled', enabled());
    document.documentElement.classList.toggle('motion-off', !enabled());
  };
  setRoot();
  window.OaktownEffects = {
    mount(root, {t}) {
      const events = new AbortController();
      const on = (target, name, fn, options={}) => target?.addEventListener(name, fn, {...options, signal:events.signal});
      const story = root.querySelector('.story');
      const stage = root.querySelector('.story-stage');
      const scenes = [...root.querySelectorAll('[data-scene]')];
      const images = [...root.querySelectorAll('[data-scene-image]')];
      const buttons = [...root.querySelectorAll('[data-scene-button]')];
      const viewport = root.querySelector('.collection-viewport');
      const cards = [...root.querySelectorAll('.collection .property-card')];
      const meter = root.querySelector('.collection-meter span');
      const motionButton = document.getElementById('motion-toggle');
      const pinned = () => enabled() && desktop.matches && images.length > 1;
      let frame = 0, currentScene = 0, geometry = null;

      function activeScene(index) {
        currentScene = index;
        scenes.forEach((el,i) => {
          el.classList.toggle('is-active',i===index);
          el.setAttribute('aria-hidden',String(i!==index));
        });
        images.forEach((el,i) => {
          el.classList.toggle('is-active',i===index);
          el.setAttribute('aria-hidden',String(i!==index));
          // Preload the next chapter before its scroll transition.
          if(i <= index+1 && el.querySelector('img'))el.querySelector('img').loading='eager';
        });
        buttons.forEach((el,i) => el.setAttribute('aria-pressed',String(i===index)));
      }
      function measure() {
        if(story)geometry={top:story.getBoundingClientRect().top+scrollY,travel:Math.max(1,story.offsetHeight-stage.offsetHeight)};
        schedule();
      }
      function render() {
        frame=0;
        if(story && geometry && pinned()) {
          const progress=clamp((scrollY-geometry.top)/geometry.travel);
          const index=Math.min(images.length-1,Math.floor(progress*images.length));
          if(index!==currentScene)activeScene(index);
          images.forEach((image,i) => {
            image.style.transform=`scale(${1.045-clamp(progress*images.length-i)*.045})`;
          });
          buttons.forEach((button,i) => button.style.setProperty('--chapter-progress',clamp(progress*images.length-i)));
        } else {
          images.forEach(image=>image.style.transform='');
          buttons.forEach((button,i)=>button.style.setProperty('--chapter-progress',i===currentScene?1:0));
        }
        if(!viewport)return;
        const gallery=viewport.closest('.collection').dataset.layout==='gallery';
        const max=Math.max(0,viewport.scrollWidth-viewport.clientWidth);
        if(meter)meter.style.transform='scaleX('+(max ? .15+.85*clamp(viewport.scrollLeft/max) : 1)+')';
        root.querySelectorAll('[data-collection-step]').forEach(button=>{
          button.disabled=Number(button.dataset.collectionStep)<0?viewport.scrollLeft<=2:viewport.scrollLeft>=max-2;
        });
        const center=viewport.getBoundingClientRect().left+viewport.clientWidth/2;
        cards.forEach(card=>{
          const image=card.querySelector('.property-image-wrap');
          if(!gallery || !enabled() || !desktop.matches || card.hidden){image.style.transform='';return;}
          const rect=card.getBoundingClientRect();
          const distance=Math.max(-1,Math.min(1,(rect.left+rect.width/2-center)/viewport.clientWidth));
          image.style.transform=`perspective(1600px) rotateY(${distance*-4}deg) translateY(${Math.abs(distance)*5}px)`;
        });
      }
      function schedule() {if(!frame)frame=requestAnimationFrame(render);}
      function motionChanged() {
        const anchor=document.elementFromPoint(innerWidth/2,Math.min(innerHeight-100,150))?.closest('section');
        const oldTop=anchor?.getBoundingClientRect().top;
        setRoot();
        motionButton.textContent=enabled()?t('motionOn'):t('motionOff');
        motionButton.setAttribute('aria-label',t('motionLabel'));
        motionButton.setAttribute('aria-pressed',String(enabled()));
        motionButton.disabled=reduce.matches;
        // Keep the visible section in place when the hero expands/collapses.
        if(anchor && oldTop!==undefined && anchor!==story)scrollBy({top:anchor.getBoundingClientRect().top-oldTop,behavior:'instant'});
        else if(story && anchor===story && geometry)scrollTo({top:geometry.top+(pinned()?Math.max(0,story.offsetHeight-stage.offsetHeight)*(currentScene/images.length):0),behavior:'instant'});
        measure();
      }
      on(motionButton,'click',()=>{paused=!paused;try{localStorage.setItem('oaktown-motion',paused?'off':'on');}catch{}motionChanged();});
      on(reduce,'change',motionChanged);
      on(desktop,'change',motionChanged);
      on(window,'scroll',schedule,{passive:true});
      on(window,'resize',measure,{passive:true});
      on(viewport,'scroll',schedule,{passive:true});
      on(root,'click',e=>{
        const chapter=e.target.closest('[data-scene-button]');
        if(chapter) {
          const index=Number(chapter.dataset.sceneButton);
          activeScene(index);
          if(pinned() && geometry)scrollTo({top:geometry.top+geometry.travel*(index/images.length+.04),behavior:'instant'});
          schedule();
        }
        const step=e.target.closest('[data-collection-step]');
        if(step && viewport) {
          const card=cards.find(c=>!c.hidden);
          const gap=parseFloat(getComputedStyle(viewport.querySelector('.property-grid')).columnGap)||0;
          viewport.scrollBy({left:Number(step.dataset.collectionStep)*(card?card.offsetWidth+gap:viewport.clientWidth*.8),behavior:enabled()?'smooth':'instant'});
        }
      });
      on(viewport,'keydown',e=>{
        if(e.target!==viewport)return;
        if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
          e.preventDefault();
          if(e.key==='Home'||e.key==='End')viewport.scrollTo({left:e.key==='Home'?0:viewport.scrollWidth,behavior:'instant'});
          else viewport.scrollBy({left:(e.key==='ArrowRight'?1:-1)*viewport.clientWidth*.7,behavior:enabled()?'smooth':'instant'});
        }
      });
      const sizeObserver=new ResizeObserver(measure);
      sizeObserver.observe(root);
      if(viewport)sizeObserver.observe(viewport);
      on(root,'load',measure,{capture:true});
      activeScene(0);motionChanged();
      return ()=>{events.abort();sizeObserver.disconnect();cancelAnimationFrame(frame);};
    }
  };
})();
