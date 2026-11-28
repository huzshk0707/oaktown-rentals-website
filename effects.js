/* Native scroll drives the chapters. Geometry is cached on layout changes;
   input schedules one frame, with no wheel interception or idle render loop. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 851px)');
  const cinematic = matchMedia('(min-height: 560px)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { const p=clamp(n);return p*p*(3-2*p); };
  let paused = false;
  try { paused = localStorage.getItem('oaktown-motion') === 'off'; } catch {}
  let openingSeen = false;
  try { openingSeen = sessionStorage.getItem('oaktown-opening-seen') === 'yes'; } catch {}
  const enabled = () => !reduce.matches && !paused;
  const setRoot = () => {
    document.documentElement.classList.toggle('motion-enabled', enabled());
    document.documentElement.classList.toggle('motion-off', !enabled());
  };
  const style = (element, property, value) => {
    if(element && element.style[property]!==value)element.style[property]=value;
  };
  setRoot();
  window.OaktownEffects = {
    // Use one animation as both the visible progress bar and the advance clock.
    mountSlideshow({strip, surface, dialog, currentImage, advance, language}) {
      const holder = strip.parentElement;
      const playsInDialog = holder.parentElement === dialog;
      const toggle = holder.querySelector('[data-playback]');
      const events = new AbortController();
      const options = {signal: events.signal};
      let animation;
      let inView = false;
      let userPaused = false;

      function sync() {
        const motion = enabled();
        toggle.hidden = !motion || strip.children.length < 2;
        const labels = language === 'es' ? ['Pausar', 'Reproducir'] : ['Pause', 'Play'];
        toggle.textContent = labels[Number(userPaused)];
        toggle.setAttribute('aria-label', toggle.textContent + (language === 'es' ? ' presentación' : ' slideshow'));
        if (!animation) return;
        const img = currentImage();
        const ready = img?.complete && img.naturalWidth > 0;
        const visible = playsInDialog ? dialog.open : inView && !dialog.open;
        if (motion && ready && visible && !document.hidden && !userPaused) animation.play();
        else animation.pause();
      }

      function select(index) {
        animation?.cancel();
        animation = null;
        const active = strip.children[index];
        if (!active) return;
        for (const button of strip.children) {
          button.classList.toggle('active', button === active);
          button.setAttribute('aria-pressed', String(button === active));
        }
        // Scroll the filmstrip only. Moving the page would interrupt reading.
        strip.scrollLeft += active.getBoundingClientRect().left - strip.getBoundingClientRect().left
          - (strip.clientWidth - active.offsetWidth) / 2;
        if (strip.children.length > 1) {
          animation = active.querySelector('.photo-fill').animate(
            [{transform:'scaleX(0)'}, {transform:'scaleX(1)'}], {duration:6000, fill:'both'}
          );
          animation.pause();
          animation.onfinish = advance;
        }
        sync();
      }
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.intersectionRatio >= 0.25;
        sync();
      }, {threshold:0.25});
      observer.observe(surface);
      const prefs = new MutationObserver(sync);
      prefs.observe(document.documentElement, {attributes:true, attributeFilter:['class']});
      document.addEventListener('visibilitychange', sync, options);
      document.addEventListener('load', event => { if (event.target === currentImage()) sync(); }, {...options, capture:true});
      toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); }, options);
      dialog.addEventListener('close', () => select([...strip.children].findIndex(button => button.classList.contains('active'))), options);
      return {select, destroy() {
        events.abort(); observer.disconnect(); prefs.disconnect(); animation?.cancel();
      }};
    },
    mount(root, {t}) {
      const events = new AbortController();
      const on = (target, name, fn, options={}) => target?.addEventListener(name, fn, {...options, signal:events.signal});
      const story = root.querySelector('.story');
      const stage = root.querySelector('.story-stage');
      const imageStage = root.querySelector('.story-images');
      const scenes = [...root.querySelectorAll('[data-scene]')];
      const images = [...root.querySelectorAll('[data-scene-image]')];
      const buttons = [...root.querySelectorAll('[data-scene-button]')];
      const letter = root.querySelector('.story-letter');
      const letterPhoto = images[2]?.querySelector('img');
      const editorial = root.querySelector('.editorial-section');
      const editorialPhotos = [...root.querySelectorAll('.editorial-photo img')];
      const viewport = root.querySelector('.collection-viewport');
      const collection = root.querySelector('.collection');
      const cards = [...root.querySelectorAll('.collection .property-card')];
      const steps = [...root.querySelectorAll('[data-collection-step]')];
      const meter = root.querySelector('.collection-meter span');
      const motionButton = document.getElementById('motion-toggle');
      const detailsBar = root.querySelector('.details-bar');
      const dock = root.querySelector('.listing-dock');
      const contact = root.querySelector('.contact-panel');
      const pinned = () => enabled() && cinematic.matches && images.length > 1;
      let frame = 0, currentScene = -1, geometry = null, letterReady = false;
      const openingAnimations = new Set();
      let openingStopped = false;

      function stopOpening() {
        openingStopped=true;
        openingAnimations.forEach(animation=>animation.cancel());
        openingAnimations.clear();
      }
      function entrance(element, keyframes, options) {
        if(!element?.animate || openingStopped || !enabled())return;
        const animation=element.animate(keyframes,{easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards',...options});
        openingAnimations.add(animation);
        animation.finished.then(()=>openingAnimations.delete(animation),()=>openingAnimations.delete(animation));
      }
      function playOpening() {
        if(!story || openingSeen || scrollY>8 || (location.hash && location.hash!=='#top'))return;
        openingSeen=true;
        try { sessionStorage.setItem('oaktown-opening-seen','yes'); } catch {}
        if(!enabled() || navigator.connection?.saveData || document.hidden)return;
        const compact=!desktop.matches;
        const firstScene=scenes[0];
        const rise=compact?8:20;
        entrance(firstScene?.querySelector('.eyebrow'),[{opacity:0,transform:`translateY(${rise/2}px)`},{opacity:1,transform:'translateY(0)'}],{duration:compact?240:420});
        entrance(firstScene?.querySelector('.story-title'),[{opacity:0,transform:`translateY(${rise}px)`},{opacity:1,transform:'translateY(0)'}],{duration:compact?360:650,delay:compact?30:90});
        entrance(firstScene?.querySelector('.story-description'),[{opacity:0,transform:`translateY(${rise/2}px)`},{opacity:1,transform:'translateY(0)'}],{duration:compact?300:500,delay:compact?70:180});
        const photo=images[0]?.querySelector('img');
        if(!photo)return;
        const started=performance.now();
        const revealPhoto=()=>{
          if(openingStopped || performance.now()-started>700 || !photo.naturalWidth)return;
          entrance(imageStage,compact?[{opacity:.45},{opacity:1}]:[{opacity:.4,transform:'scale(.9)'},{opacity:1,transform:'scale(1)'}],{duration:compact?420:900});
        };
        if(photo.complete)revealPhoto();
        else on(photo,'load',revealPhoto,{once:true});
      }

      function activeScene(index) {
        if(currentScene===index)return;
        currentScene=index;
        scenes.forEach((el,i) => {
          el.classList.toggle('is-active',i===index);
          el.setAttribute('aria-hidden',String(i!==index));
        });
        images.forEach((el,i) => {
          el.classList.toggle('is-active',i===index);
          el.setAttribute('aria-hidden',String(i!==index));
          if(i<=index+1 && el.querySelector('img'))el.querySelector('img').loading='eager';
        });
        buttons.forEach((el,i) => el.setAttribute('aria-pressed',String(i===index)));
      }
      function syncLetterPhoto() {
        letterReady=!!(letterPhoto?.complete && letterPhoto.naturalWidth);
        // Reuse a decoded chapter image's exact responsive URL. No extra asset,
        // invented photograph or solid-letter stand-in when photos fail.
        if(letterReady)style(letter,'backgroundImage',`url(${JSON.stringify(letterPhoto.currentSrc||letterPhoto.src)})`);
      }
      function measure() {
        const scroll=scrollY;
        const storyRect=story?.getBoundingClientRect();
        const editorialRect=editorial?.getBoundingClientRect();
        const viewportRect=viewport?.getBoundingClientRect();
        const left=viewport?.scrollLeft||0;
        const detailsRect=detailsBar?.getBoundingClientRect();
        const contactRect=contact?.getBoundingClientRect();
        geometry={
          details:detailsBar?{bottom:detailsRect.bottom+scroll,contactTop:contactRect?contactRect.top+scroll:Infinity,headerHeight:document.getElementById('site-header').offsetHeight}:null,
          story:story?{top:storyRect.top+scroll,travel:Math.max(1,story.offsetHeight-stage.offsetHeight)}:null,
          editorial:editorial?{top:editorialRect.top+scroll,height:editorial.offsetHeight}:null,
          height:innerHeight,
          width:viewportRect?.width||0,
          max:viewport?Math.max(0,viewport.scrollWidth-viewport.clientWidth):0,
          cards:cards.map(card=>{
            const rect=card.getBoundingClientRect();
            return {card,image:card.querySelector('.property-image-wrap'),center:rect.left-(viewportRect?.left||0)+left+rect.width/2};
          })
        };
        syncLetterPhoto();schedule();
      }
      function render() {
        frame=0;
        if(!geometry)return;
        const scroll=scrollY;
        const animate=pinned();
        if(geometry.story && animate) {
          const progress=clamp((scroll-geometry.story.top)/geometry.story.travel);
          activeScene(Math.min(images.length-1,Math.floor(progress*images.length)));
          images.forEach((image,i) => {
            const local=clamp(progress*images.length-i);
            style(image,'transform',`translateY(${(1.2-local*2.4).toFixed(3)}%) scale(${(1.12-local*.08).toFixed(5)})`);
          });
          buttons.forEach((button,i) => button.style.setProperty('--chapter-progress',clamp(progress*images.length-i)));
          if(letter && desktop.matches) {
            // PR #1's centered, quadratic photo zoom, contained in the compact
            // opening. Ease both ends so reverse scrolling has no hard fade.
            const reveal=clamp((progress-.36)/.56);
            const opacity=smooth(reveal/.14)*(1-smooth((reveal-.68)/.32))*.8;
            letter.hidden=!letterReady || opacity===0;
            style(letter,'opacity',letterReady?opacity.toFixed(3):'0');
            style(letter,'transform',`translate(-50%,-50%) scale(${(1+reveal*reveal*7).toFixed(4)})`);
          } else if(letter){letter.hidden=true;style(letter,'opacity','0');}
        } else {
          images.forEach(image=>style(image,'transform',''));
          buttons.forEach((button,i)=>button.style.setProperty('--chapter-progress',i===currentScene?1:0));
          if(letter){letter.hidden=true;style(letter,'opacity','0');}
        }
        if(geometry.editorial) {
          const progress=clamp((scroll+geometry.height-geometry.editorial.top)/(geometry.height+geometry.editorial.height));
          const offset=enabled()&&desktop.matches?`${((progress-.5)*4).toFixed(2)}%`:'0%';
          editorialPhotos.forEach(photo=>photo.style.setProperty('--photo-offset',offset));
        }
        if(dock&&geometry.details){
          const {bottom,contactTop,headerHeight}=geometry.details;
          const visible=innerHeight>=480&&scroll+headerHeight>=bottom&&scroll+headerHeight+80<contactTop;
          dock.hidden=!visible&&!dock.contains(document.activeElement);
        }
        if(!viewport)return;
        const left=viewport.scrollLeft;
        const gallery=collection.dataset.layout==='gallery';
        style(meter,'transform','scaleX('+(geometry.max ? .15+.85*clamp(left/geometry.max) : 1)+')');
        steps.forEach(button=>{button.disabled=Number(button.dataset.collectionStep)<0?left<=2:left>=geometry.max-2;});
        geometry.cards.forEach(({card,image,center})=>{
          if(!gallery || geometry.max<=2 || !enabled() || card.hidden){style(image,'transform','');return;}
          const distance=Math.max(-1,Math.min(1,(center-left-geometry.width/2)/geometry.width));
          style(image,'transform',`perspective(1600px) rotateY(${(distance*(desktop.matches?-4:-2.5)).toFixed(3)}deg) translateY(${(Math.abs(distance)*(desktop.matches?5:3)).toFixed(2)}px)`);
        });
      }
      function schedule() {if(!frame)frame=requestAnimationFrame(render);}
      function motionChanged() {
        stopOpening();
        const anchor=document.elementFromPoint(innerWidth/2,Math.min(innerHeight-100,150))?.closest('section');
        const oldTop=anchor?.getBoundingClientRect().top;
        setRoot();
        motionButton.textContent=enabled()?t('motionOn'):t('motionOff');
        motionButton.setAttribute('aria-label',t('motionLabel'));
        motionButton.setAttribute('aria-pressed',String(enabled()));
        motionButton.disabled=reduce.matches;
        if(anchor && oldTop!==undefined && anchor!==story)scrollBy({top:anchor.getBoundingClientRect().top-oldTop,behavior:'instant'});
        else if(story && anchor===story && geometry?.story)scrollTo({top:geometry.story.top+(pinned()?Math.max(0,story.offsetHeight-stage.offsetHeight)*(Math.max(0,currentScene)/images.length):0),behavior:'instant'});
        measure();
      }
      on(motionButton,'click',()=>{paused=!paused;try{localStorage.setItem('oaktown-motion',paused?'off':'on');}catch{}motionChanged();});
      on(reduce,'change',motionChanged);on(desktop,'change',motionChanged);on(cinematic,'change',motionChanged);
      on(window,'scroll',()=>{if(scrollY>8)stopOpening();schedule();},{passive:true});
      on(window,'resize',()=>{stopOpening();measure();},{passive:true});
      on(window,'wheel',stopOpening,{passive:true});
      on(window,'touchstart',stopOpening,{passive:true});
      on(window,'pointerdown',stopOpening,{passive:true});
      on(window,'keydown',stopOpening);
      on(document,'visibilitychange',()=>{if(document.hidden)stopOpening();});
      on(viewport,'scroll',schedule,{passive:true});
      on(dock,'focusout',schedule);
      on(root,'click',e=>{
        const chapter=e.target.closest('[data-scene-button]');
        if(chapter) {
          const index=Number(chapter.dataset.sceneButton);
          activeScene(index);
          if(pinned() && geometry?.story)scrollTo({top:geometry.story.top+geometry.story.travel*(index/images.length+.04),behavior:'instant'});
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
        if(e.target!==viewport||collection.dataset.layout!=='gallery')return;
        if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
          e.preventDefault();
          if(e.key==='Home'||e.key==='End')viewport.scrollTo({left:e.key==='Home'?0:viewport.scrollWidth,behavior:'instant'});
          else viewport.scrollBy({left:(e.key==='ArrowRight'?1:-1)*viewport.clientWidth*.7,behavior:enabled()?'smooth':'instant'});
        }
      });
      const sizeObserver=new ResizeObserver(measure);
      sizeObserver.observe(root);
      if(viewport)sizeObserver.observe(viewport);
      // Layout selection can change horizontal geometry without changing height.
      const layoutObserver=new MutationObserver(measure);
      if(collection)layoutObserver.observe(collection,{attributes:true,subtree:true,attributeFilter:['data-layout','hidden']});
      on(root,'load',measure,{capture:true});on(root,'error',measure,{capture:true});
      activeScene(0);motionChanged();openingStopped=false;playOpening();
      return ()=>{stopOpening();events.abort();sizeObserver.disconnect();layoutObserver.disconnect();cancelAnimationFrame(frame);};
    }
  };
})();
