/* Input-driven photo motion; no scroll pinning, autoplay, or idle animation loop. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(min-width: 851px) and (hover: hover) and (pointer: fine)');
  let paused = false;
  try { paused = localStorage.getItem('oaktown-motion') === 'off'; } catch {}
  const enabled = () => !reduce.matches && !paused;
  const clamp = (n,min=-1,max=1) => Math.max(min,Math.min(max,n));
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
      const photoStage = root.querySelector('.story-images');
      const viewport = root.querySelector('.collection-viewport');
      const cards = [...root.querySelectorAll('.collection .property-card')];
      const meter = root.querySelector('.collection-meter span');
      const motionButton = document.getElementById('motion-toggle');
      const animations = new Set();
      let frame=0, collectionPending=false, depthPoint=null, currentScene=-1;
      function animate(element,keyframes,options) {
        if(events.signal.aborted||!enabled()||!element?.animate)return;
        const animation=element.animate(keyframes,{easing:'cubic-bezier(.16,1,.3,1)',...options});
        animations.add(animation);
        const done=()=>animations.delete(animation);
        animation.addEventListener('finish',done,{once:true});
        animation.addEventListener('cancel',done,{once:true});
      }
      function cancelAnimations() {
        for(const animation of [...animations])animation.cancel();
        animations.clear();
      }
      function activeScene(index) {
        if(!images[index]||index===currentScene)return;
        const previous=currentScene;
        // Interrupt cleanly: the new selection always finishes on its own photo.
        cancelAnimations();
        currentScene=index;
        images.forEach((el,i)=>{
          el.classList.toggle('is-active',i===index);
          el.setAttribute('aria-hidden',String(i!==index));
          el.style.zIndex=i===index?'2':'0';
          if(i===index&&el.querySelector('img'))el.querySelector('img').loading='eager';
        });
        buttons.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
        if(previous<0)return;
        images[previous].style.zIndex='1';
        animate(images[previous],[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.015)'}],{duration:420});
        // A restrained photographic wipe keeps a visual link between rooms.
        const from=index>previous?'inset(0 12% 0 0)':'inset(0 0 0 12%)';
        animate(images[index],[{opacity:0,clipPath:from,transform:'scale(1.035)'},{opacity:1,clipPath:'inset(0 0 0 0)',transform:'scale(1)'}],{duration:650});
      }
      function collectionFrame() {
        if(!viewport)return;
        const max=Math.max(0,viewport.scrollWidth-viewport.clientWidth);
        if(meter)meter.style.transform='scaleX('+(max ? .15+.85*clamp(viewport.scrollLeft/max,0,1) : 1)+')';
        root.querySelectorAll('[data-collection-step]').forEach(button=>{
          button.disabled=Number(button.dataset.collectionStep)<0?viewport.scrollLeft<=2:viewport.scrollLeft>=max-2;
        });
        const depth=enabled()&&finePointer.matches&&viewport.closest('.collection').dataset.layout==='gallery';
        const bounds=depth?viewport.getBoundingClientRect():null;
        // Read all geometry before writing transforms; rental text stays flat.
        const positions=cards.map(card=>depth&&!card.hidden?clamp((card.getBoundingClientRect().left+card.offsetWidth/2-bounds.left-bounds.width/2)/bounds.width):0);
        cards.forEach((card,i)=>{
          const image=card.querySelector('.property-image-wrap');
          image.style.setProperty('--gallery-angle',(positions[i]*-3).toFixed(3)+'deg');
          image.style.setProperty('--gallery-rise',(Math.abs(positions[i])*4).toFixed(3)+'px');
        });
      }
      function render() {
        frame=0;
        if(collectionPending){collectionPending=false;collectionFrame();}
        if(depthPoint&&photoStage){
          photoStage.style.setProperty('--photo-tilt-x',(-depthPoint.y*.8).toFixed(3)+'deg');
          photoStage.style.setProperty('--photo-tilt-y',(depthPoint.x*1.2).toFixed(3)+'deg');
          depthPoint=null;
        }
      }
      function requestFrame(){if(!frame)frame=requestAnimationFrame(render);}
      function schedule(){collectionPending=true;requestFrame();}
      function resetDepth(){
        depthPoint=null;
        if(!photoStage)return;
        photoStage.removeAttribute('data-depth-active');
        photoStage.style.removeProperty('--photo-tilt-x');
        photoStage.style.removeProperty('--photo-tilt-y');
      }
      function motionChanged(){
        setRoot();cancelAnimations();resetDepth();
        motionButton.textContent=enabled()?t('motionOn'):t('motionOff');
        motionButton.setAttribute('aria-label',t('motionLabel'));
        motionButton.setAttribute('aria-pressed',String(enabled()));
        motionButton.disabled=reduce.matches;
        schedule();
      }
      on(motionButton,'click',()=>{paused=!paused;try{localStorage.setItem('oaktown-motion',paused?'off':'on');}catch{}motionChanged();});
      on(reduce,'change',motionChanged);
      on(finePointer,'change',()=>{resetDepth();schedule();});
      on(photoStage,'pointermove',event=>{
        if(!enabled()||!finePointer.matches||event.pointerType==='touch')return;
        const bounds=photoStage.getBoundingClientRect();
        photoStage.dataset.depthActive='true';
        depthPoint={x:clamp((event.clientX-bounds.left)/bounds.width*2-1),y:clamp((event.clientY-bounds.top)/bounds.height*2-1)};
        requestFrame();
      },{passive:true});
      on(photoStage,'pointerleave',resetDepth);
      on(document,'visibilitychange',()=>{if(document.hidden){cancelAnimations();resetDepth();}});
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
      // The paired photographs reveal once; text and controls never wait for it.
      const collage=root.querySelector('.editorial-collage');
      const photoObserver=new IntersectionObserver(entries=>{
        for(const entry of entries){
          if(!entry.isIntersecting)continue;
          photoObserver.unobserve(entry.target);
          entry.target.querySelectorAll('.editorial-photo').forEach((photo,i)=>{
            animate(photo,[{clipPath:'inset(0 0 12% 0)',transform:'translateY(16px)'},{clipPath:'inset(0 0 0 0)',transform:'translateY(0)'}],{duration:700,delay:i*90});
          });
        }
      },{threshold:.18});
      if(collage)photoObserver.observe(collage);
      const sizeObserver=new ResizeObserver(schedule);
      sizeObserver.observe(root);
      if(viewport)sizeObserver.observe(viewport);
      on(root,'load',schedule,{capture:true});
      activeScene(0);motionChanged();schedule();
      return ()=>{events.abort();photoObserver.disconnect();sizeObserver.disconnect();cancelAnimations();resetDepth();cancelAnimationFrame(frame);};
    }
  };
})();
