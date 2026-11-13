/* Scroll follows the browser: no wheel interception, scroll hijacking, or animation loop. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 851px) and (min-height: 600px)');
  let paused = false;
  try { paused = localStorage.getItem('oaktown-motion') === 'off'; } catch {}
  const clamp = n => Math.max(0, Math.min(1, n));
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
      const scrollcraft = window.OaktownScrollcraft?.mount(root.querySelector('.scrollcraft-canvas'));
      const scenes = [...root.querySelectorAll('[data-scene]')];
      const images = [...root.querySelectorAll('[data-scene-image]')];
      const buttons = [...root.querySelectorAll('[data-scene-button]')];
      const letter = root.querySelector('.story-letter');
      const viewport = root.querySelector('.collection-viewport');
      const cards = [...root.querySelectorAll('.collection .property-card')];
      const meter = root.querySelector('.collection-meter span');
      const motionButton = document.getElementById('motion-toggle');
      let frame = 0, currentScene = -1, geometry = null;
      function activeScene(index) {
        if (currentScene === index) return;
        currentScene = index;
        scenes.forEach((el,i) => {el.classList.toggle('is-active',i===index);el.setAttribute('aria-hidden',String(i!==index));});
        images.forEach((el,i) => {
          el.classList.toggle('is-active',i===index);
          if (i<=index+1 && el.querySelector('img')) el.querySelector('img').loading='eager';
        });
        buttons.forEach((el,i) => el.setAttribute('aria-pressed',String(i===index)));
      }
      function measure() {
        const bounds = el => el ? {top:el.getBoundingClientRect().top+scrollY,travel:Math.max(1,el.offsetHeight-innerHeight)} : null;
        geometry = {story:bounds(story)};
        schedule();
      }
      function collectionFrame() {
        if (!viewport) return;
        const gallery=viewport.closest('.collection').dataset.layout==='gallery';
        const max = Math.max(0,viewport.scrollWidth-viewport.clientWidth);
        if(meter)meter.style.transform='scaleX('+(max ? .15+.85*clamp(viewport.scrollLeft/max) : 1)+')';
        root.querySelectorAll('[data-collection-step]').forEach(button=>{
          button.disabled = Number(button.dataset.collectionStep)<0 ? viewport.scrollLeft<=2 : viewport.scrollLeft>=max-2;
        });
        const center = viewport.getBoundingClientRect().left+viewport.clientWidth/2;
        cards.forEach(card=>{
          if(card.hidden)return;
          const rect=card.getBoundingClientRect();
          const distance=Math.max(-1,Math.min(1,(rect.left+rect.width/2-center)/viewport.clientWidth));
          // Rotate the image, keeping text crisp and the clickable card geometry stable.
          card.querySelector('.property-image-wrap').style.transform=gallery&&enabled()&&desktop.matches ? `perspective(1400px) rotateY(${distance*-6}deg) translateY(${Math.abs(distance)*8}px)` : '';
        });
      }
      function render() {
        frame=0;
        if(!geometry)return;
        const animate=enabled()&&desktop.matches;
        const progress=story ? clamp((scrollY-geometry.story.top)/geometry.story.travel) : 0;
        scrollcraft?.render(progress,animate);
        if(story&&animate) {
          const p=clamp((scrollY-geometry.story.top)/geometry.story.travel);
          activeScene(Math.min(2,Math.floor(p*3)));
          images.forEach((el,i)=>el.style.transform=`scale(${1.055-clamp(p*3-i)*.055})`);
          buttons.forEach((button,i)=>button.style.setProperty('--chapter-progress',clamp(p*3-i)));
          // A brief photo-filled O bridges the last two scenes within the hero.
          const reveal=clamp((p-.47)/.3);
          letter.style.transform=`translate(-50%,-50%) scale(${1+reveal*reveal*8})`;
          letter.style.opacity=String(clamp(reveal*5)*(1-clamp((reveal-.5)*2))*.7);
        }
        if(letter&&!animate)letter.style.opacity='0';
        collectionFrame();
      }
      function schedule() {if(!frame)frame=requestAnimationFrame(render);}
      function motionChanged() {
        // Retain the reading position when the pinned hero collapses or expands.
        const anchor = document.elementFromPoint(innerWidth/2,Math.min(innerHeight-100,150))?.closest('section');
        const oldTop = anchor?.getBoundingClientRect().top;
        setRoot();
        motionButton.textContent=enabled()?t('motionOn'):t('motionOff');
        motionButton.setAttribute('aria-label',t('motionLabel'));
        motionButton.setAttribute('aria-pressed',String(enabled()));
        motionButton.disabled=reduce.matches;
        images.forEach(el=>el.style.transform='');
        if(!enabled()||!desktop.matches){activeScene(0);buttons.forEach(el=>el.style.setProperty('--chapter-progress','0'));}
        if(anchor&&oldTop!==undefined)scrollBy({top:anchor.getBoundingClientRect().top-oldTop,behavior:'instant'});
        measure();
      }
      on(motionButton,'click',()=>{paused=!paused;try{localStorage.setItem('oaktown-motion',paused?'off':'on');}catch{}motionChanged();});
      on(reduce,'change',motionChanged);on(desktop,'change',motionChanged);
      on(window,'scroll',schedule,{passive:true});on(window,'resize',measure,{passive:true});
      on(viewport,'scroll',schedule,{passive:true});
      on(root,'click',e=>{
        const chapter=e.target.closest('[data-scene-button]');
        if(chapter){
          const index=Number(chapter.dataset.sceneButton);
          if(enabled()&&desktop.matches){scrollTo({top:geometry.story.top+geometry.story.travel*(index/3+.04),behavior:'smooth'});}
          else activeScene(index);
        }
        const step=e.target.closest('[data-collection-step]');
        if(step&&viewport){const card=cards.find(c=>!c.hidden);viewport.scrollBy({left:Number(step.dataset.collectionStep)*(card?.offsetWidth+28||viewport.clientWidth*.8),behavior:enabled()?'smooth':'instant'});}
      });
      on(viewport,'keydown',e=>{
        if(e.target!==viewport)return;
        if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
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
      return ()=>{events.abort();sizeObserver.disconnect();cancelAnimationFrame(frame);scrollcraft?.destroy();};
    }
  };
})();
