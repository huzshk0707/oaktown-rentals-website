/* Reusable collection cards. File data is trusted editorial content; CMS/preview
 * adapters supply escaped text. Do not double-escape their strings here.
 * No inventory writes, availability inference or prose-to-field conversion. */
(() => {
  'use strict';
  const isNumber = value => typeof value==='number' && Number.isFinite(value) && value>=0;
  const gallery = (data,p) => Array.isArray(data.images?.[p.imageKey]) ? data.images[p.imageKey] : [];
  const formatMoney = (value,language='en') => isNumber(value)
    ? new Intl.NumberFormat(language==='es'?'es-US':'en-US',{style:'currency',currency:'USD',minimumFractionDigits:value%1?2:0,maximumFractionDigits:2}).format(value)
    : language==='es'?'Consultar precio':'Ask for pricing';
  const availabilityLabel = (p,language='en') => {
    const labels=({en:{available:'Available',coming_soon:'Coming soon',rented:'Rented'},es:{available:'Disponible',coming_soon:'Próximamente',rented:'Alquilado'}})[language==='es'?'es':'en'];
    return Object.hasOwn(labels,p.availability)?labels[p.availability]:'';
  };
  const specifications = (p,language,t) => [
    isNumber(p.bedrooms)?`${p.bedrooms} ${language==='en'&&p.bedrooms===1?'bed':t('beds')}`:'',
    isNumber(p.bathrooms)?`${p.bathrooms} ${t('baths')}`:''
  ].filter(Boolean);
  const isSquarespacePhoto = src => {
    try {const url=new URL(src);return url.protocol==='https:' && url.hostname==='images.squarespace-cdn.com' && !url.username && !url.password;}
    catch {return false;}
  };
  const imageUrl = (src,width=1200) => isSquarespacePhoto(src)?src.split('?')[0]+'?format='+width+'w':src;
  function create({data,getLanguage,t,localized,imageEl,inquiryUrl}) {
    const money = value => formatMoney(value,getLanguage());
    const availabilityBadge = p => {const label=availabilityLabel(p,getLanguage());return label?`<span class="availability-badge">${label}</span>`:'';};
    function cardAmenities(p) {
      const features=Array.isArray(p.features)?p.features:[];
      const translated=localized(p,'features')||[];
      const items=features.map((feature,index)=>({feature,index})).filter(({feature})=>!(/\b(bedrooms?|bathrooms?|location)\b/i.test(feature))).slice(0,3);
      return items.length?`<ul class="card-amenities" aria-label="${t('cardFeatures')}">${items.map(({feature,index})=>`<li>${translated[index]||feature}</li>`).join('')}</ul>`:'';
    }
    const svg = path => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
    const bed = svg('M3 18V6m18 12v-8H3m0 5h18M6 10V7h5v3m2 0V7h5v3');
    const bath = svg('M3 12h18m-17 0v3a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-3M6 19v2m12-2v2M6 12V5a2 2 0 0 1 4 0v1m-2 0h4');
    const pin = svg('M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0');
    const arrow = svg('M4 12h16m-6-6 6 6-6 6');
    function render(p,index=0,total=1) {
      const language=getLanguage(),images=gallery(data,p);
      const specs=specifications(p,language,t);
      const icons=[isNumber(p.bedrooms)?bed:'',isNumber(p.bathrooms)?bath:''].filter(Boolean);
      return `<article class="property-card reveal" data-neighborhood="${p.neighborhood||''}" data-property-slug="${p.slug}" data-selected-photo="0">
        <div class="card-media"><a class="property-image-wrap" href="#home/${p.slug}" aria-label="${t('details')}: ${p.name}" data-image-error="${t('photoUnavailable')}">
          <span class="card-index" aria-hidden="true">${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</span>
          ${images.length?imageEl(images[0],p.name+' — '+t('photoLabel'),'property-image'):'<span class="image-unavailable" aria-hidden="true"></span>'}
        </a>${availabilityBadge(p)}<span class="card-photo-count">${images.length} ${t('photosLabel')}</span>
        ${images.length>1?`<div class="card-photo-controls" role="group" aria-label="${t('photosLabel')}: ${p.name}">
          <button type="button" class="card-photo-previous" data-card-photo-step="-1" aria-label="${t('previousPhoto')}">${arrow}</button>
          <div class="card-photo-dots">${images.slice(0,5).map((_,i)=>`<button type="button" data-card-photo-index="${i}" aria-label="${t('photoLabel')} ${i+1}" aria-pressed="${i===0}"><span></span></button>`).join('')}</div>
          <button type="button" class="card-photo-next" data-card-photo-step="1" aria-label="${t('nextPhoto')}">${arrow}</button></div>`:''}
        <span class="sr-only" data-card-photo-status role="status" aria-live="polite"></span></div>
        <div class="boutique-card-body">
          <div class="property-data"><div><h3 class="property-name"><a href="#home/${p.slug}">${p.name}</a></h3><span class="property-neighborhood">${p.neighborhood||''}</span>${p.city?`<span class="property-location">${pin}${p.city}</span>`:''}<p class="property-summary">${localized(p,'summary')||''}</p></div>
            <div class="property-price">${money(p.rent)}${isNumber(p.rent)?`<small>${t('perMonth')}</small>`:''}${isNumber(p.deposit)?`<span class="property-deposit">${t('deposit')}: ${money(p.deposit)}</span>`:''}</div></div>
          ${cardAmenities(p)}
          <div class="property-details-line"><span class="card-specs">${specs.map((text,i)=>`<span class="card-spec">${icons[i]}${text}</span>`).join('')}</span><a href="${inquiryUrl(p)}" aria-label="${t('availability')}: ${p.name}">${t('availability')}</a></div>
          <a class="card-detail-link" href="#home/${p.slug}" aria-label="${t('details')}: ${p.name}">${arrow}</a>
        </div></article>`;
    }
    return {render};
  }
  window.OaktownCards = Object.freeze({create,formatMoney,gallery,availabilityLabel,specifications,isSquarespacePhoto,imageUrl});
})();
