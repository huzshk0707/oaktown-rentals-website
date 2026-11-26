/* Signature photography: manual crossfades and a small scroll offset. No idle loop,
   wheel interception, auto-advance or animation dependency. */
(() => {
  'use strict';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  window.OaktownSignature={mount(root){
    const hero=root.querySelector('.signature-hero');
    if(!hero)return ()=>{};
    const events=new AbortController(), options={signal:events.signal};
    const slides=[...hero.querySelectorAll('[data-hero-slide]')];
    const buttons=[...hero.querySelectorAll('[data-hero-button]')];
    const photo=hero.querySelector('.signature-images');
    let frame=0,visible=true;
    const enabled=()=>!reduce.matches&&!document.documentElement.classList.contains('motion-off')&&!navigator.connection?.saveData;
    function update(){frame=0;photo.style.transform=enabled()&&visible?`translateY(${Math.min(32,Math.max(0,scrollY)*.065)}px) scale(1.025)`:'none';}
    function request(){if(!frame)frame=requestAnimationFrame(update);}
    buttons.forEach(button=>button.addEventListener('click',()=>{
      const index=Number(button.dataset.heroButton);
      slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===index);slide.setAttribute('aria-hidden',String(i!==index));if(i===index)slide.querySelector('img').loading='eager';});
      buttons.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
    },options));
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;request();});observer.observe(hero);
    const prefs=new MutationObserver(request);prefs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    addEventListener('scroll',()=>{if(visible)request();},{...options,passive:true});
    reduce.addEventListener('change',request,options);request();
    return ()=>{events.abort();observer.disconnect();prefs.disconnect();cancelAnimationFrame(frame);};
  }};
  document.addEventListener('click',event=>{if(event.target.closest('[data-motion-shortcut]')){document.getElementById('motion-toggle')?.click();}});
})();
