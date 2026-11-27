/* Single-row collection behavior. Existing effects.js owns arrow/keyboard steps;
 * this controller owns fit detection and deliberate desktop edge movement only. */
(() => {
  'use strict';
  window.OaktownCollection = {
    mount(root) {
      const collection=root.querySelector('.signature-collection');
      if(!collection)return ()=>{};
      const viewport=collection.querySelector('.collection-viewport');
      const controls=collection.querySelector('.collection-bottom');
      const reduce=matchMedia('(prefers-reduced-motion: reduce)');
      const pointer=matchMedia('(min-width: 851px) and (hover: hover) and (pointer: fine)');
      const events=new AbortController();
      const on=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal:events.signal});
      let frame=0,last=0,velocity=0,overflow=false,visibleCount=0,lastBoundary='';
      const allowed=()=>overflow&&visibleCount>2&&pointer.matches&&!reduce.matches&&!document.hidden&&!document.documentElement.classList.contains('motion-off');
      function stop(){cancelAnimationFrame(frame);frame=0;last=0;velocity=0;}
      function tick(now){
        frame=0;
        if(!allowed()||!velocity){stop();return;}
        const dt=last?Math.min(32,now-last):0;last=now;
        const max=viewport.scrollWidth-viewport.clientWidth;
        const next=Math.max(0,Math.min(max,viewport.scrollLeft+velocity*dt/1000));
        viewport.scrollTo({left:next,behavior:'instant'});
        if(next<=0&&velocity<0||next>=max&&velocity>0){stop();return;}
        frame=requestAnimationFrame(tick);
      }
      function measure(){
        overflow=viewport.scrollWidth-viewport.clientWidth>2;
        visibleCount=collection.querySelectorAll('.property-card:not([hidden])').length;
        if(visibleCount<=2)stop();
        if(!overflow){
          stop();viewport.scrollTo({left:0,behavior:'instant'});
          if(controls.contains(document.activeElement))viewport.focus({preventScroll:true});
        }
        controls.hidden=!overflow;
        collection.dataset.overflow=String(overflow);
      }
      on(viewport,'pointermove',event=>{
        if(event.pointerType!=='mouse'||event.buttons||event.target.closest('.card-photo-controls')||!allowed()){stop();return;}
        const rect=viewport.getBoundingClientRect(),x=event.clientX-rect.left;
        const edge=Math.min(80,rect.width*.1);
        velocity=x<edge?-160*(1-x/edge):x>rect.width-edge?160*(1-(rect.width-x)/edge):0;
        if(!velocity){stop();return;}
        if(!frame)frame=requestAnimationFrame(tick);
      });
      for(const type of ['pointerleave','pointercancel','pointerdown','touchstart','wheel','keydown'])on(viewport,type,stop,{passive:type==='wheel'||type==='touchstart'});
      on(collection,'oaktown:collection-filter',()=>{stop();measure();});
      on(viewport,'scroll',()=>{
        const max=viewport.scrollWidth-viewport.clientWidth;
        const boundary=max>2?(viewport.scrollLeft<=2?'start':viewport.scrollLeft>=max-2?'end':''):'';
        if(boundary&&boundary!==lastBoundary&&!reduce.matches&&!document.documentElement.classList.contains('motion-off')){
          const meter=collection.querySelector('.collection-meter');meter.classList.remove('is-boundary');void meter.offsetWidth;meter.classList.add('is-boundary');
        }
        lastBoundary=boundary;
      },{passive:true});
      on(window,'blur',stop);on(document,'visibilitychange',stop);
      on(window,'scroll',stop,{passive:true});
      on(reduce,'change',stop);on(pointer,'change',stop);
      const preference=new MutationObserver(stop);preference.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
      const resize=new ResizeObserver(()=>{stop();measure();});resize.observe(viewport);
      // Observe filtering, not our own controls.hidden updates.
      const filters=new MutationObserver(()=>{stop();measure();});
      filters.observe(collection.querySelector('.property-grid'),{subtree:true,attributes:true,attributeFilter:['hidden']});
      measure();
      return ()=>{stop();events.abort();resize.disconnect();filters.disconnect();preference.disconnect();};
    }
  };
})();
