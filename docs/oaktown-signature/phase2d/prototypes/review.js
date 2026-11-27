/* Isolated review harness. Not included in the public static asset allowlist. */
const frame=document.getElementById('review-site');
const prefix='/docs/oaktown-signature/phase2d/prototypes/';
let activeMap=null,currentMode='original';
const regions=[
 {name:'St. Matthews',lat:38.24988,lon:-85.6357424},
 {name:'Okolona',lat:38.1411796,lon:-85.6877379},
 {name:'Cherokee Triangle',lat:38.23526857,lon:-85.71244061},
 {name:'Russell',lat:38.2535489,lon:-85.7863582}
];
function ready(){return frame.contentDocument?.querySelector('.property-card');}
function restore(){
 const d=frame.contentDocument;activeMap?.remove();activeMap=null;delete d.body.dataset.reviewMode;d.querySelectorAll('.review-surface').forEach(el=>el.remove());currentMode='original';
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode==='original')));
}
async function show(mode){
 if(!ready())return;
 restore();if(mode==='original')return;
 currentMode=mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 const d=frame.contentDocument,w=frame.contentWindow,es=d.documentElement.lang==='es';
 if(!d.querySelector('#review-styles')){const link=d.createElement('link');link.id='review-styles';link.rel='stylesheet';link.href=prefix+'review.css';d.head.append(link);await new Promise(resolve=>{link.onload=resolve;link.onerror=resolve;});}
 d.body.dataset.reviewMode=mode;
 if(mode==='panels'){
  const section=d.createElement('section');section.className='review-surface review-panels signature-collection';section.innerHTML=`<span class="eyebrow">${es?'Un hogar, a tu manera':'A home, your way'}</span><h1>${es?'Encuentra tu lugar.':'Find your place.'}</h1><p>${es?'Explora nuestras viviendas. Selecciona una para ver sus detalles.':'Explore our homes. Select a home for a closer look.'}</p><div class="review-panel-row"></div>`;
  const row=section.querySelector('.review-panel-row');
  d.querySelectorAll('#homes .property-card').forEach((original,index)=>{
   const panel=d.createElement('div');panel.className='review-panel';const card=original.cloneNode(true);card.hidden=false;card.style.display='';card.classList.add('in-view');
   const button=d.createElement('button');button.className='review-panel-toggle';button.type='button';button.textContent=String(index+1).padStart(2,'0')+' / '+card.querySelector('.property-name').textContent;button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','review-panel-card-'+index);card.id='review-panel-card-'+index;
   panel.append(button,card);row.append(panel);
   const activate=()=>row.querySelectorAll('.review-panel').forEach(p=>{const selected=p===panel;p.classList.toggle('is-active',selected);p.querySelector('.review-panel-toggle').setAttribute('aria-expanded',String(selected));p.querySelector('.property-card').inert=!selected;});
   button.addEventListener('click',activate);button.addEventListener('focus',activate);panel.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&w.matchMedia('(min-width:701px) and (hover:hover)').matches)activate();});
   button.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)){e.preventDefault();const buttons=[...row.querySelectorAll('.review-panel-toggle')];const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+buttons.length)%buttons.length;buttons[next].focus();}});
   if(index===0)activate();
  });
  // Inactive cards are removed from keyboard access, while their panel buttons remain reachable.
  row.querySelectorAll('.review-panel').forEach((p,i)=>p.querySelector('.property-card').inert=i!==0);
  d.querySelector('#app').append(section);
 }else{
  const section=d.createElement('section');section.className='review-surface review-city';
  section.innerHTML=`<div class="review-city-portrait"><img class="review-city-photo" src="/assets/louisville/louisville-ohio-river.jpg" width="1920" height="1080" alt="${es?'El horizonte de Louisville y el río Ohio':'Louisville skyline and the Ohio River'}"><div class="review-city-copy"><span class="eyebrow">${es?'Nuestra historia':'Our story'}</span><h1>${es?'Raíces en<br>Louisville.':'Rooted in<br>Louisville.'}</h1><p>${es?'Raíces locales. Un trato personal. Oaktown Rentals ofrece viviendas de alquiler en Louisville y los condados cercanos.':'Local roots. A personal approach. Oaktown Rentals provides rental homes in Louisville and the surrounding counties.'}</p></div></div><div class="review-map-panel"><h2>${es?'Conoce los vecindarios.':'Find your neighborhood.'}</h2><p>${es?'Selecciona una zona para explorar nuestras viviendas. Los marcadores representan vecindarios.':'Select an area to explore our homes. Markers represent neighborhoods.'}</p><div class="review-map" id="review-map" aria-label="${es?'Mapa de vecindarios de Louisville':'Louisville neighborhood map'}"><button class="review-map-loader">${es?'Explorar el mapa':'Explore the map'}</button></div><div class="review-neighborhoods" role="group" aria-label="${es?'Lista de vecindarios':'Neighborhood list'}"></div><div class="review-map-action"><p role="status" aria-live="polite"></p><button>${es?'Ver viviendas':'Browse homes'} →</button></div><details class="review-credits"><summary>${es?'Créditos de fotografía y mapa':'Photography & map credits'}</summary><p><a href="https://commons.wikimedia.org/wiki/File:Louisville_from_Ohio_River_September_2026_002.jpg">Louisville from Ohio River September 2026 002</a> · <a href="https://commons.wikimedia.org/wiki/User:King_of_Hearts">King of Hearts</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. ${es?'Recorte y degradado de presentación; licencia de la fotografía conservada.':'Presentation crop and gradient; photograph remains CC BY-SA 4.0.'}</p><p>Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>. Leaflet, BSD-2-Clause. ${es?'El mapa carga mosaicos de OpenStreetMap al activarlo.':'Activating the map loads tiles from OpenStreetMap.'}</p></details></div>`;
  d.querySelector('#app').append(section);
  const vacation=d.querySelector('.signature-vacation').cloneNode(true);vacation.classList.add('review-surface');vacation.id='review-vacation';vacation.setAttribute('aria-labelledby','review-vacation-title');vacation.querySelector('h2').id='review-vacation-title';vacation.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));d.querySelector('#app').append(vacation);
  let selected='All';const markers=[];const list=section.querySelector('.review-neighborhoods'),status=section.querySelector('[role=status]');
  const select=name=>{selected=name;list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.region===name)));const count=w.OAKTOWN_DATA.properties.filter(p=>name==='All'||p.neighborhood===name).length;status.textContent=(name==='All'?(es?'Todas las zonas':'All areas'):name)+' · '+count+' '+(es?'vivienda'+(count===1?'':'s'):count===1?'home':'homes');const r=regions.find(r=>r.name===name);if(activeMap&&r)activeMap.setView([r.lat,r.lon],12,{animate:!w.matchMedia('(prefers-reduced-motion:reduce)').matches&&!d.documentElement.classList.contains('motion-off')});};
  for(const region of regions){const button=d.createElement('button');button.dataset.region=region.name;const count=w.OAKTOWN_DATA.properties.filter(p=>p.neighborhood===region.name).length;button.innerHTML=region.name+'<small>'+count+' '+(es?'vivienda en nuestra colección':'home in our collection')+'</small>';button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>select(region.name));list.append(button);}
  select('All');section.querySelector('.review-map-action button').addEventListener('click',()=>{const name=selected;restore();const form=d.querySelector('#home-search');form.elements.neighborhood.value=name;form.requestSubmit();d.querySelector('#homes').scrollIntoView({behavior:'instant'});});
  section.querySelector('.review-map-loader').addEventListener('click',async event=>{
   const button=event.currentTarget;button.disabled=true;button.textContent=es?'Cargando mapa…':'Loading map…';
   try{
    if(!w.L){const css=d.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';d.head.append(css);await new Promise((resolve,reject)=>{const js=d.createElement('script');js.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';js.onload=resolve;js.onerror=reject;d.head.append(js);});}
    if(currentMode!=='louisville'||!section.isConnected)return;button.remove();
    activeMap=w.L.map(section.querySelector('.review-map'),{scrollWheelZoom:false}).setView([38.205,-85.705],10);
    w.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(activeMap);
    regions.forEach((r,i)=>{const marker=w.L.marker([r.lat,r.lon],{title:r.name,alt:r.name,icon:w.L.divIcon({className:'review-pin',html:String(i+1),iconSize:[30,30]})}).addTo(activeMap);marker.on('click',()=>select(r.name));markers.push(marker);});
    activeMap.invalidateSize();
   }catch{button.textContent=es?'Mapa no disponible. Usa la lista de vecindarios.':'Map unavailable. Use the neighborhood list.';}
  });
 }
 w.scrollTo({top:0,behavior:'instant'});
}
frame.addEventListener('load',()=>{frame.contentWindow.addEventListener('hashchange',()=>{if(currentMode!=='original')restore();});});
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.mode)));
