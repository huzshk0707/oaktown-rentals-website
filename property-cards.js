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
  const availabilityLabel = (p,language='en') => ({en:{available:'Available',coming_soon:'Coming soon',rented:'Rented'},es:{available:'Disponible',coming_soon:'Próximamente',rented:'Alquilado'}})[language==='es'?'es':'en'][p.availability]||'';
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
  function render(p, index=0, total=1) {
    const language=getLanguage();
    return `<article class="property-card reveal" data-neighborhood="${p.neighborhood}" data-property-slug="${p.slug}" data-selected-photo="0">
        <div class="card-media"><a class="property-image-wrap" href="#home/${p.slug}" aria-label="${t('details')}: ${p.name}" data-image-error="${t('photoUnavailable')}">
          <span class="card-index" aria-hidden="true">${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</span><span class="card-photo-count">${gallery(data,p).length} ${t('photosLabel')}</span>
          ${gallery(data,p).length?imageEl(gallery(data,p)[0], p.name+' — '+t('photoLabel'),'property-image'):'<span class="image-unavailable" aria-hidden="true"></span>'}
          <span class="photo-pill">${t('photo')}</span><span class="card-arrow" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span>
        </a></div>
        <div class="property-data"><div><span class="property-neighborhood">${p.neighborhood}</span><h3 class="property-name"><a href="#home/${p.slug}">${p.name}</a></h3><p class="property-summary">${localized(p,'summary')||''}</p></div><div class="property-price">${money(p.rent)}${isNumber(p.rent)?`<small>${t('perMonth')}</small>`:''}${isNumber(p.deposit)?`<span class="property-deposit">${t('deposit')}: ${money(p.deposit)}</span>`:''}</div></div>
        ${cardAmenities(p)}
        <div class="property-details-line"><span>${specifications(p,language,t).join(' &nbsp; / &nbsp; ')}</span>${availabilityBadge(p)}<a href="${inquiryUrl(p)}" aria-label="${t('availability')}: ${p.name}">${t('availability')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div>
      </article>`;
  }
    return {render};
  }
  window.OaktownCards = Object.freeze({create,formatMoney,gallery,availabilityLabel,specifications,isSquarespacePhoto,imageUrl});
})();
