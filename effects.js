/* Small, input-driven enhancements. No scroll pinning or animation loop. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
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
      const images = [...root.querySelectorAll('[data-scene-image]')];
      const buttons = [...root.querySelectorAll('[data-scene-button]')];
      const viewport = root.querySelector('.collection-viewport');
      const cards = [...root.querySelectorAll('.collection .property-card')];
      const meter = root.querySelector('.collection-meter span');
      const motionButton = document.getElementById('motion-toggle');
      let frame = 0;
      function activeScene(index) {
        images.forEach((el,i) => {
          el.classList.toggle('is-active',i===index);
          el.setAttribute('aria-hidden',String(i!==index));
          if(i===index && el.querySelector('img'))el.querySelector('img').loading='eager';
        });
        buttons.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
      }
      function collectionFrame() {
        frame=0;
        if(!viewport)return;
        const max=Math.max(0,viewport.scrollWidth-viewport.clientWidth);
        if(meter)meter.style.transform='scaleX('+(max ? .15+.85*Math.min(1,Math.max(0,viewport.scrollLeft/max)) : 1)+')';
        root.querySelectorAll('[data-collection-step]').forEach(button=>{
          button.disabled=Number(button.dataset.collectionStep)<0?viewport.scrollLeft<=2:viewport.scrollLeft>=max-2;
        });
      }
      function schedule() {if(!frame)frame=requestAnimationFrame(collectionFrame);}
      function motionChanged() {
        setRoot();
        motionButton.textContent=enabled()?t('motionOn'):t('motionOff');
        motionButton.setAttribute('aria-label',t('motionLabel'));
        motionButton.setAttribute('aria-pressed',String(enabled()));
        motionButton.disabled=reduce.matches;
      }
      on(motionButton,'click',()=>{paused=!paused;try{localStorage.setItem('oaktown-motion',paused?'off':'on');}catch{}motionChanged();});
      on(reduce,'change',motionChanged);
      on(viewport,'scroll',schedule,{passive:true});
      on(root,'click',e=>{
        const chapter=e.target.closest('[data-scene-button]');
        if(chapter)activeScene(Number(chapter.dataset.sceneButton));
        const step=e.target.closest('[data-collection-step]');
        if(step&&viewport){const card=cards.find(c=>!c.hidden);viewport.scrollBy({left:Number(step.dataset.collectionStep)*(card?.offsetWidth+32||viewport.clientWidth*.8),behavior:enabled()?'smooth':'instant'});}
      });
      on(viewport,'keydown',e=>{
        if(e.target!==viewport)return;
        if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
          e.preventDefault();
          if(e.key==='Home'||e.key==='End')viewport.scrollTo({left:e.key==='Home'?0:viewport.scrollWidth,behavior:'instant'});
          else viewport.scrollBy({left:(e.key==='ArrowRight'?1:-1)*viewport.clientWidth*.7,behavior:enabled()?'smooth':'instant'});
        }
      });
      const sizeObserver=new ResizeObserver(schedule);
      sizeObserver.observe(root);
      if(viewport)sizeObserver.observe(viewport);
      on(root,'load',schedule,{capture:true});
      activeScene(0);motionChanged();schedule();
      return ()=>{events.abort();sizeObserver.disconnect();cancelAnimationFrame(frame);};
    }
  };
})();
