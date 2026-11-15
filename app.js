/* Lightweight cinematic site: no frameworks, API keys, or build tools required. */
(async () => {
  'use strict';
  const DATA = window.OAKTOWN_DATA;
  await window.OaktownContent.load(DATA);
  const app = document.getElementById('app');
  const header = document.getElementById('site-header');
  const menu = document.getElementById('menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  const langButton = document.getElementById('language-switch');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const navigationMotion = () => reducedMotion.matches || document.documentElement.classList.contains('motion-off') ? 'instant' : 'smooth';
  const P = DATA.properties;
  let language = 'en';
  try { if(localStorage.getItem('oaktown-language')==='es')language='es'; } catch {}
  let selectedFilter = 'All';
  let collectionLayout = 'grid';
  let currentView = null;
  let currentGalleryIndex = 0;
  let observer;
  let cleanupEffects = () => {};
  let touchStart = null;
  let pendingPhoto = null;
  let activeTransition = null;
  let routeGeneration = 0;
  let transitionSource = null;
  let renderedHash = null;
  let lastHomeSnapshot = null;
  let pendingHomeRestore = null;
  let restoringPosition = false;
  let positionGeneration = 0;
  let viewSaveTimer = 0;
  try { history.scrollRestoration='manual'; } catch {}
  const pointerPreview = matchMedia('(hover: hover) and (pointer: fine)');
  const words = {
    en: {
      cardFeatures:'Home features',beforeApplying:'Ask our team about availability and any application, pet or other charges before applying.',previewPhoto:'Preview photo',loadingPhoto:'Loading photo…',rentalDetails:'Rental details',homeCount:'homes',gridView:'Grid',galleryView:'Gallery',layoutLabel:'Property view',requestShowing:'Request a showing',availabilityNote:'Find a place you like? Text us with the address to ask about availability or a showing.',photoUnavailable:'Photos temporarily unavailable',skipContent:'Skip to content',primaryNav:'Primary navigation',mobileNav:'Mobile navigation',openMenu:'Open menu',closeMenu:'Close menu',switchLanguage:'Cambiar a español',homeLink:'Oaktown Rentals — home',applicationLabel:'Open rental application',footerNote:'Rental homes in Louisville, Kentucky',colonialInterior:'Interior at 115 Colonial Drive',cherokeeInterior:'Interior at 1106 Cherokee Road, unit 8',floridaAlt:'The Mint Mojo in Cudjoe Key',floridaShort:'A waterfront escape in the Florida Keys.',
      textUs:'Text us',motionOn:'Motion on',motionOff:'Motion off',motionLabel:'Enable visual motion',sceneOne:'The beginning',sceneTwo:'The everyday',sceneThree:'The next chapter',sceneTwoTitle:'Room for <em>your life.</em>',sceneThreeTitle:'Make yourself <em>at home.</em>',sceneTwoCopy:'A little more space. A rhythm of your own.',sceneThreeCopy:'Find your place in Louisville. We’ll help with the next step.',heroCaption:'A closer look at 115 Colonial Drive',browseHint:'Explore the collection',previousHome:'Previous home',nextHome:'Next home',filterLabel:'Filter homes by neighborhood',openPhoto:'Enlarge photo',closePhoto:'Close gallery',previousPhoto:'Previous photo',nextPhoto:'Next photo',photoLabel:'Photo',photosLabel:'Photos',insideLabel:'A LOOK INSIDE',highlightsLabel:'THE HIGHLIGHTS',moreLabel:'EXPLORE MORE',sourceLabel:'Full listing details',galleryError:'This photo could not load. Try another photo or contact us for the full gallery.',
      navHomes:'Our homes',navStory:'Our story',navFaq:'FAQ',navCommunity:'Community',navApply:'Apply online',contact:'Contact',textBest:'Text us for availability and showings.',footerTitle:'Your next chapter starts here.',
      heroKicker:'Quality rental homes in Louisville, KY',heroOne:'Find your',heroTwo:'place.',heroTagline:'Homes with character. A local team to help you find yours.',explore:'View homes',scroll:'Scroll to explore',
      homesLabel:'01 / FIND A HOME',homesHeading:'Find a home that fits.',homesDesc:'Compare homes, neighborhoods and rental details.',
      all:'All',stMatthews:'St. Matthews',highlands:'Highlands & Cherokee Triangle',okolona:'Okolona',listings:'Homes in our collection',perMonth:'/ month',beds:'beds',baths:'bath',availability:'Check availability',
      cityPhotoAlt:'Aerial view of downtown Louisville and the Ohio River',cityPhotoCaption:'Louisville, Kentucky · On the Ohio River',photoCredit:'Photo:',aboutLabel:'02 / WHO WE ARE',aboutHeading:'Rooted in Louisville.',aboutLead:'A local perspective. A love for our city. Homes that feel like home.',aboutText:'Oaktown Rentals provides quality rental housing in Louisville, Kentucky and nearby counties. We manage homes across the city, with a particular focus on Southern and Southeastern Jefferson County. We believe finding a home should feel personal, not complicated.',aboutLink:'Get in touch',
      floridaLabel:'Our sister vacation property',floridaLink:'Visit The Mint Mojo',
      faqLabel:'03 / GOOD TO KNOW',faqHeading:'Before you move.',faqDesc:'A little guidance on applications, pets and arranging a visit.',
      communityLabel:'04 / DISCOVER LOUISVILLE',communityHeading:'Get to know Louisville.',communityText:'Schools, parks and local resources to help you settle in.',
      faq1q:'How do I apply?',faq1a:'Select Apply online to open our rental application. Have your contact information, residence history and supporting documents ready. For questions about the home or application charges, text our team before applying.',
      faq2q:'What does Oaktown Rentals look for?',faq2a:'We review income, rental history, references and other screening information. For questions about a home’s requirements or your circumstances, talk with our team before applying.',
      faq3q:'How long does an application take?',faq3a:'Review time depends on a complete application and the checks needed. For an update on your application, text our team with the property address.',
      faq4q:'Are pets allowed?',faq4a:'Pet policies are specific to each home. Text us with the property address and details about your pets to discuss permission, charges and any restrictions.',
      faq5q:'How do I schedule a showing?',faq5a:'Select Request a showing on a listing, or text us with the address. Our team will help you with availability and arranging a visit.',
      contactLabel:'05 / LET’S TALK',contactHeading:'Ready to move?',contactDesc:'Questions, showings, applications. Tell us what you’re looking for and we’ll help you take the next step.',
      photo:'VIEW HOME',details:'View details',detailBack:'All rental homes',aboutThis:'A closer look',homeHighlights:'The details that make it yours',rent:'Monthly rent',deposit:'Security deposit',bedrooms:'Bedrooms',bathrooms:'Bathrooms',moreHomes:'Find your next favorite place',termsHeading:'Things to know',termsDisclaimer:'Questions about the lease, utilities or pets? Text us with this address before applying.',
      communityRes1:'Jefferson County Public Schools',communityRes2:'City of Louisville',communityRes3:'Louisville Visitor Guide',communityRes4:'Louisville Public Library'
    },
    es: {
      cardFeatures:'Características de la vivienda',beforeApplying:'Antes de solicitar, consulta al equipo sobre disponibilidad y cargos de solicitud, mascotas u otros conceptos.',previewPhoto:'Vista previa',loadingPhoto:'Cargando foto…',rentalDetails:'Detalles del alquiler',homeCount:'viviendas',gridView:'Cuadrícula',galleryView:'Galería',layoutLabel:'Vista de viviendas',requestShowing:'Solicitar una visita',availabilityNote:'¿Te interesa una vivienda? Escríbenos con la dirección para consultar disponibilidad o programar una visita.',photoUnavailable:'Fotos temporalmente no disponibles',skipContent:'Saltar al contenido',primaryNav:'Navegación principal',mobileNav:'Navegación móvil',openMenu:'Abrir menú',closeMenu:'Cerrar menú',switchLanguage:'Switch to English',homeLink:'Oaktown Rentals — inicio',applicationLabel:'Abrir solicitud de alquiler',footerNote:'Viviendas de alquiler en Louisville, Kentucky',colonialInterior:'Interior de 115 Colonial Drive',cherokeeInterior:'Interior de 1106 Cherokee Road, unidad 8',floridaAlt:'The Mint Mojo en Cudjoe Key',floridaShort:'Una escapada junto al agua en los Cayos de Florida.',
      textUs:'Escríbenos',motionOn:'Animación sí',motionOff:'Animación no',motionLabel:'Activar animaciones',sceneOne:'El comienzo',sceneTwo:'El día a día',sceneThree:'La nueva etapa',sceneTwoTitle:'Espacio para <em>tu vida.</em>',sceneThreeTitle:'Siéntete <em>en casa.</em>',sceneTwoCopy:'Un poco más de espacio. Tu propio ritmo.',sceneThreeCopy:'Encuentra tu hogar en Louisville. Te ayudamos a dar el siguiente paso.',heroCaption:'Descubre 115 Colonial Drive',browseHint:'Explora las viviendas',previousHome:'Vivienda anterior',nextHome:'Siguiente vivienda',filterLabel:'Filtrar viviendas por vecindario',openPhoto:'Ampliar foto',closePhoto:'Cerrar galería',previousPhoto:'Foto anterior',nextPhoto:'Siguiente foto',photoLabel:'Foto',photosLabel:'Fotos',insideLabel:'UNA MIRADA AL INTERIOR',highlightsLabel:'LOS DETALLES',moreLabel:'EXPLORA MÁS',sourceLabel:'Detalles completos del anuncio',galleryError:'No se pudo cargar esta foto. Prueba otra o contáctanos para ver la galería completa.',
      navHomes:'Viviendas',navStory:'Nuestra historia',navFaq:'Preguntas',navCommunity:'Comunidad',navApply:'Solicitar ahora',contact:'Contacto',textBest:'Escríbenos para consultar disponibilidad o programar una visita.',footerTitle:'Tu próximo capítulo comienza aquí.',
      heroKicker:'Viviendas de alquiler en Louisville, KY',heroOne:'Encuentra tu',heroTwo:'hogar.',heroTagline:'Viviendas con carácter. Un equipo local para ayudarte a encontrar la tuya.',explore:'Ver viviendas',scroll:'Desliza para explorar',
      homesLabel:'01 / ENCUENTRA TU HOGAR',homesHeading:'Un hogar a tu medida.',homesDesc:'Compara viviendas, vecindarios y condiciones de alquiler.',
      all:'Todas',stMatthews:'St. Matthews',highlands:'Highlands y Cherokee Triangle',okolona:'Okolona',listings:'Viviendas en nuestra colección',perMonth:'/ mes',beds:'hab.',baths:'baño',availability:'Consultar disponibilidad',
      cityPhotoAlt:'Vista aérea del centro de Louisville y el río Ohio',cityPhotoCaption:'Louisville, Kentucky · Junto al río Ohio',photoCredit:'Foto:',aboutLabel:'02 / QUIÉNES SOMOS',aboutHeading:'Arraigados en Louisville.',aboutLead:'Perspectiva local. Amor por nuestra ciudad. Hogares acogedores.',aboutText:'Oaktown Rentals ofrece viviendas de alquiler de calidad en Louisville, Kentucky y los condados cercanos. Gestionamos hogares por toda la ciudad, especialmente en el sur y sureste del condado de Jefferson.',aboutLink:'Contáctanos',
      floridaLabel:'Nuestra propiedad vacacional hermana',floridaLink:'Visita The Mint Mojo',
      faqLabel:'03 / INFORMACIÓN ÚTIL',faqHeading:'Antes de mudarte.',faqDesc:'Información sobre solicitudes, mascotas y cómo programar una visita.',
      communityLabel:'04 / DESCUBRE LOUISVILLE',communityHeading:'Conoce Louisville.',communityText:'Escuelas, parques y recursos locales para ayudarte a instalarte.',
      faq1q:'¿Cómo puedo solicitar una vivienda?',faq1a:'Selecciona Solicitar ahora para abrir nuestra solicitud de alquiler. Ten a mano tus datos de contacto, historial de residencia y documentos. Si tienes preguntas sobre la vivienda o los cargos de solicitud, escríbenos antes de solicitar.',
      faq2q:'¿Qué requisitos tiene Oaktown Rentals?',faq2a:'Revisamos los ingresos, el historial de alquiler, las referencias y otros datos de evaluación. Si tienes preguntas sobre los requisitos de una vivienda o tu situación, habla con nuestro equipo antes de solicitar.',
      faq3q:'¿Cuánto tarda una solicitud?',faq3a:'El tiempo de revisión depende de que la solicitud esté completa y de las verificaciones necesarias. Para consultar el estado de tu solicitud, escríbenos con la dirección de la vivienda.',
      faq4q:'¿Se admiten mascotas?',faq4a:'La política de mascotas depende de cada vivienda. Escríbenos con la dirección y los datos de tus mascotas para hablar sobre permisos, cargos y restricciones.',
      faq5q:'¿Cómo programo una visita?',faq5a:'Selecciona Solicitar una visita en el anuncio o escríbenos con la dirección. Nuestro equipo te ayudará a consultar disponibilidad y organizar una visita.',
      contactLabel:'05 / HABLEMOS',contactHeading:'¿Listo para mudarte?',contactDesc:'Preguntas, visitas y solicitudes. Cuéntanos qué buscas.',
      photo:'VER VIVIENDA',details:'Ver detalles',detailBack:'Todas las viviendas',aboutThis:'Conoce la vivienda',homeHighlights:'Detalles que la hacen especial',rent:'Alquiler mensual',deposit:'Depósito de seguridad',bedrooms:'Habitaciones',bathrooms:'Baños',moreHomes:'Descubre otra vivienda',termsHeading:'Información importante',termsDisclaimer:'¿Tienes preguntas sobre el contrato, los servicios o las mascotas? Escríbenos con esta dirección antes de solicitar.',
      communityRes1:'Escuelas públicas de Jefferson County',communityRes2:'Ciudad de Louisville',communityRes3:'Guía turística de Louisville',communityRes4:'Biblioteca pública de Louisville'
    }
  };
  const t = (key) => words[language][key] || words.en[key] || key;
  const money = (n) => new Intl.NumberFormat(language==='es'?'es-US':'en-US',{style:'currency',currency:'USD',minimumFractionDigits:n%1?2:0,maximumFractionDigits:2}).format(n);
  const localized = (p,key) => language==='es' && p[key+'Es']?.length ? p[key+'Es'] : p[key];
  const photo = (p, idx=0) => DATA.images[p.imageKey][idx] || DATA.images[p.imageKey][0];
  const imageUrl = (src, width=1200) => src.includes('images.squarespace-cdn.com') ? src.split('?')[0]+'?format='+width+'w' : src;
  const imageEl = (src, alt, className, extra='') => {
    if(!src)return '';
    if(alt && DATA.photoAlts?.[src])alt=DATA.photoAlts[src];
    const thumbnail=className==='gallery-thumbnail';
    const widths=thumbnail?[100,300,500]:[500,1000,1500,2500];
    const sizes=thumbnail?'(max-width: 600px) 95px, 140px':className==='story-photo'
      ?'100vw'
      :className==='detail-cover-photo'?'(max-width: 850px) calc(100vw - 44px), (max-width: 1328px) calc((100vw - 96px) * .45), 554px'
      :className==='property-image'?'auto, (max-width: 600px) calc(100vw - 40px), (max-width: 1328px) calc((100vw - 80px) / 2), 624px':'auto, (max-width: 1328px) calc(100vw - 48px), 1280px';
    const responsive=src.includes('images.squarespace-cdn.com')?`srcset="${widths.map(w=>imageUrl(src,w)+' '+w+'w').join(', ')}" sizes="${sizes}"`:'';
    return `<img class="${className}" src="${imageUrl(src,thumbnail?300:1200)}" ${responsive} alt="${alt}" loading="${extra==='eager'?'eager':'lazy'}" decoding="async" ${extra==='eager'?'fetchpriority="high"':''}>`;

  };
  const inquiryUrl = p => 'sms:+15025001070?body='+encodeURIComponent((language==='es'?'Hola, quisiera consultar la disponibilidad de ':'Hi, I’d like to ask about availability for ')+p.name+'.');
  const showingUrl = p => 'sms:+15025001070?body='+encodeURIComponent((language==='es'?'Hola, quisiera programar una visita a ':'Hi, I’d like to request a showing at ')+p.name+'.');
  const sectionHeading = (label, title, desc='') => `<div class="section-heading reveal"><div><div class="eyebrow section-label">${label}</div><h2 class="display-title">${title}</h2></div>${desc?`<p class="heading-note">${desc}</p>`:''}</div>`;
  function availabilityLabel(p) {
    return ({en:{available:'Available',coming_soon:'Coming soon',rented:'Rented'},es:{available:'Disponible',coming_soon:'Próximamente',rented:'Alquilado'}})[language][p.availability]||'';
  }
  const availabilityBadge = p => availabilityLabel(p)?`<span class="availability-badge">${availabilityLabel(p)}</span>`:'';
  function cardAmenities(p) {
    const features=Array.isArray(p.features)?p.features:[];
    const translated=localized(p,'features')||[];
    const items=features.map((feature,index)=>({feature,index})).filter(({feature})=>!(/\b(bedrooms?|bathrooms?|location)\b/i.test(feature))).slice(0,3);
    return items.length?`<ul class="card-amenities" aria-label="${t('cardFeatures')}">${items.map(({feature,index})=>`<li>${translated[index]||feature}</li>`).join('')}</ul>`:'';
  }
  function card(p, index) {
    return `<article class="property-card reveal" data-neighborhood="${p.neighborhood}" data-property-slug="${p.slug}" data-selected-photo="0">
        <div class="card-media"><a class="property-image-wrap" href="#home/${p.slug}" aria-label="${t('details')}: ${p.name}" data-image-error="${t('photoUnavailable')}">
          <span class="card-index" aria-hidden="true">${String(index+1).padStart(2,'0')} / ${String(P.length).padStart(2,'0')}</span><span class="card-photo-count">${DATA.images[p.imageKey].length} ${t('photosLabel')}</span>
          ${imageEl(photo(p), p.name+' — '+t('photoLabel'),'property-image')}
          <span class="photo-pill">${t('photo')}</span><span class="card-arrow" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span>
        </a>${DATA.images[p.imageKey].length>1?`<button class="card-preview" type="button" data-card-preview aria-pressed="false" aria-label="${t('previewPhoto')}: ${p.name}"><span>${t('previewPhoto')}</span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button>`:''}</div>
        <div class="property-data"><div><span class="property-neighborhood">${p.neighborhood}</span><h3 class="property-name"><a href="#home/${p.slug}">${p.name}</a></h3><p class="property-summary">${localized(p,'summary')}</p></div><div class="property-price">${money(p.rent)}<small>${t('perMonth')}</small><span class="property-deposit">${t('deposit')}: ${money(p.deposit)}</span></div></div>
        ${cardAmenities(p)}
        <div class="property-details-line"><span>${p.bedrooms} ${language==='en'&&p.bedrooms===1?'bed':t('beds')} &nbsp; / &nbsp; ${p.bathrooms} ${t('baths')}</span>${availabilityBadge(p)}<a href="${inquiryUrl(p)}" aria-label="${t('availability')}: ${p.name}">${t('availability')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div>
      </article>`;
  }
  function faqSection() {
    return `<section id="faq" class="section faq-section">${sectionHeading(t('faqLabel'),t('faqHeading'),t('faqDesc'))}<div class="faq-list">${[1,2,3,4,5].map(i=>`<details class="faq-item reveal"><summary>${t('faq'+i+'q')}</summary><div class="faq-answer">${t('faq'+i+'a')}</div></details>`).join('')}</div></section>`;
  }
  function contactSection() {
    return `<section id="contact" class="contact-panel"><div class="reveal"><span class="eyebrow section-label">${t('contactLabel')}</span><h2>${t('contactHeading')}</h2><p>${t('contactDesc')}</p></div><div class="contact-actions reveal"><a href="sms:+15025001070">${t('textBest')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a href="tel:+15025001070">${DATA.phoneDisplay} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a href="mailto:${DATA.email}">${DATA.email}<span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><p>${DATA.mailingAddress}</p></div></section>`;
  }
  function storySection() {
    const featured=P[0],images=featured?DATA.images[featured.imageKey]:[];
    const scenes=[images[0],images[3]||images[1],images[6]||images[2]].filter(Boolean);
    const chapters=[
      {label:t('sceneOne'),title:`${t('heroOne')} <em>${t('heroTwo')}</em>`,copy:t('heroTagline')},
      {label:t('sceneTwo'),title:t('sceneTwoTitle'),copy:t('sceneTwoCopy')},
      {label:t('sceneThree'),title:t('sceneThreeTitle'),copy:t('sceneThreeCopy')}
    ].slice(0,Math.max(1,scenes.length));
    return `<section class="story ${scenes.length>1?'has-chapters':''}" id="top" aria-label="${t('heroKicker')}"><div class="story-stage" data-image-error="${t('photoUnavailable')}">
      <div class="story-images">${scenes.map((src,i)=>`<div class="story-image ${i===0?'is-active':''}" data-scene-image="${i}" aria-hidden="${i!==0}" data-image-error="${t('photoUnavailable')}">${imageEl(src,featured.name+' — '+t('photoLabel')+' '+(i+1),'story-photo',i===0?'eager':'')}</div>`).join('')}</div>${scenes.length>2?'<div class="story-letter" aria-hidden="true" hidden>O</div>':''}<div class="story-shade" aria-hidden="true"></div>
      <div class="story-topline"><span>Louisville, Kentucky</span></div>
      <div class="story-copy"><div class="story-scenes">${chapters.map((chapter,i)=>`<div class="story-scene ${i===0?'is-active':''}" data-scene="${i}" aria-hidden="${i!==0}"><p class="eyebrow">${chapter.label}</p><${i===0?'h1':'h2'} class="story-title">${chapter.title}</${i===0?'h1':'h2'}><p class="story-description">${chapter.copy}</p></div>`).join('')}</div><div class="story-actions"><a class="story-explore" href="#homes"><span>${t('explore')}</span><span class="story-action-orbit" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a></div></div>
      ${featured?`<div class="story-bottom"><div class="scene-navigation" role="group" aria-label="${t('photosLabel')}">${chapters.map((chapter,i)=>`<button type="button" data-scene-button="${i}" aria-label="${t('photoLabel')} ${i+1}: ${chapter.label}" aria-pressed="${i===0}"><span>${String(i+1).padStart(2,'0')}</span><span>${chapter.label}</span><i aria-hidden="true"></i></button>`).join('')}</div><a class="story-caption" href="#home/${featured.slug}">${featured.name}<span>${featured.neighborhood}</span></a></div>`:`<p class="story-empty">${t('availabilityNote')}</p>`}
    </div></section>`;
  }
  function homePage() {
    return `${storySection()}
    <section class="section collection" id="homes" data-layout="${collectionLayout}">${sectionHeading(t('homesLabel'),t('homesHeading'),t('homesDesc'))}
      <div class="listing-tools reveal"><span class="listing-count" aria-live="polite">${P.length} ${t('homeCount')}</span><div class="view-switch" role="group" aria-label="${t('layoutLabel')}"><button type="button" data-layout-button="grid" aria-pressed="${collectionLayout==='grid'}">${t('gridView')}</button><button type="button" data-layout-button="gallery" aria-pressed="${collectionLayout==='gallery'}">${t('galleryView')}</button></div><div class="filter-strip" role="group" aria-label="${t('filterLabel')}"><button class="filter-chip active" data-filter="All" aria-pressed="true">${t('all')}</button><button class="filter-chip" data-filter="St. Matthews" aria-pressed="false">${t('stMatthews')}</button><button class="filter-chip" data-filter="The Highlands|Cherokee Triangle" aria-pressed="false">${t('highlands')}</button><button class="filter-chip" data-filter="Okolona" aria-pressed="false">${t('okolona')}</button>${[...new Set(P.map(p=>p.neighborhood))].filter(n=>!['St. Matthews','The Highlands','Cherokee Triangle','Okolona'].includes(n)).map(n=>`<button class="filter-chip" data-filter="${n}" aria-pressed="false">${n}</button>`).join('')}</div></div>
      ${!P.length?`<p class="collection-empty">${language==='es'?(DATA.contentUnavailable?'No podemos cargar las viviendas en este momento. Contáctanos para consultar disponibilidad.':'No hay viviendas publicadas en este momento. Contáctanos para saber qué viene próximamente.'):(DATA.contentUnavailable?'We cannot load the homes right now. Contact us for current availability.':'There are no published homes right now. Contact us to hear what’s coming next.')}</p>`:''}
      <div class="collection-viewport" id="collection-viewport" ${collectionLayout==='gallery'?'tabindex="0"':''} role="region" aria-label="${t('listings')}"><div class="property-grid" id="property-grid">${P.map(card).join('')}</div></div>
      <div class="collection-bottom"><span>${t('browseHint')}</span><div class="collection-meter" aria-hidden="true"><span></span></div><div class="collection-controls"><button data-collection-step="-1" aria-label="${t('previousHome')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><button data-collection-step="1" aria-label="${t('nextHome')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></div>
    </section>
    <section class="editorial-section" id="about" aria-labelledby="editorial-title">
      <div class="editorial-intro reveal"><span class="eyebrow section-label">${t('aboutLabel')}</span><h2 id="editorial-title">${t('aboutHeading')}</h2><p class="editorial-lead">${t('aboutLead')}</p><p>${t('aboutText')}</p><a class="text-link" href="#contact">${t('aboutLink')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div>
      <figure class="louisville-photo reveal"><img src="./assets/louisville/louisville-ohio-river.jpg" width="1920" height="1080" alt="${t('cityPhotoAlt')}" loading="lazy" decoding="async"><figcaption><span>${t('cityPhotoCaption')}</span><small>${t('photoCredit')} <a href="https://commons.wikimedia.org/wiki/File:Louisville_from_Ohio_River_September_2026_002.jpg" target="_blank" rel="noopener noreferrer">King of Hearts / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a></small></figcaption></figure>
    </section>
    ${faqSection()}
    <section class="section community-section" id="community"><div class="reveal"><div class="eyebrow section-label">${t('communityLabel')}</div><h2 class="display-title">${t('communityHeading')}</h2><p class="community-intro">${t('communityText')}</p></div><div class="community-resources reveal"><a class="resource-link" href="https://www.jefferson.kyschools.us/" target="_blank" rel="noopener noreferrer">${t('communityRes1')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://louisvilleky.gov/" target="_blank" rel="noopener noreferrer">${t('communityRes2')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://www.gotolouisville.com/" target="_blank" rel="noopener noreferrer">${t('communityRes3')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://www.lfpl.org/" target="_blank" rel="noopener noreferrer">${t('communityRes4')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a></div></section>
    ${contactSection()}
    <aside id="cudejoe" class="vacation-feature" aria-labelledby="vacation-title"><a href="./mint-mojo/" class="vacation-card">${imageEl('./assets/mint-mojo/house-pool.jpg',t('floridaAlt'),'vacation-photo')}<div><h2 id="vacation-title">The Mint Mojo</h2><p class="vacation-location">${t('floridaLabel')} · Cudjoe Key, Florida</p><p class="vacation-description">${t('floridaShort')}</p><span class="text-link">${t('floridaLink')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></div></a></aside>`;
  }
  function detailPage(p, startPhoto=0) {
    const image = photo(p,startPhoto);
    const more = P.filter(x=>x.slug!==p.slug).slice(0,2);
    return `<section class="page-intro has-image"><div class="listing-intro-copy">
      <a class="back-link" href="#homes"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg> ${t('detailBack')}</a><span class="eyebrow section-label">${p.neighborhood} / ${p.city}</span><h1>${p.name.replace(' · ', '<br>')}</h1><p class="intro-sub">${localized(p,'summary')}</p><p class="listing-availability">${availabilityBadge(p)}<a href="${inquiryUrl(p)}" aria-label="${t('availability')}: ${p.name}">${t('availability')}</a></p></div><button type="button" class="detail-cover" data-cover-gallery ${image?'':'disabled'} data-photo-error="${t('photoUnavailable')}" aria-label="${image?t('openPhoto'):t('photoUnavailable')}: ${p.name}">${imageEl(image,p.name+' — '+t('photoLabel')+' '+(startPhoto+1),'detail-cover-photo','eager')}<span>${DATA.images[p.imageKey].length} ${t('photosLabel')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/></svg></span></button></section>
    <div class="listing-dock" hidden role="region" aria-label="${t('rentalDetails')}: ${p.name}"><div class="dock-property"><span class="dock-address" title="${p.name}">${p.name}</span><span><strong>${money(p.rent)}</strong> ${t('perMonth')} <span class="dock-specs"> / ${p.bedrooms} ${language==='en'&&p.bedrooms===1?'bed':t('beds')} / ${p.bathrooms} ${t('baths')}</span></span></div><div class="dock-actions"><a class="button-solid" href="${showingUrl(p)}">${t('requestShowing')}</a><a class="text-link" href="${DATA.applicationUrl}" target="_blank" rel="noopener noreferrer">${t('navApply')}</a></div></div>
    <div class="details-bar"><div class="detail-stats"><div class="detail-stat"><strong>${money(p.rent)}</strong><span>${t('rent')}</span></div><div class="detail-stat"><strong>${money(p.deposit)}</strong><span>${t('deposit')}</span></div><div class="detail-stat"><strong>${p.bedrooms}</strong><span>${t('bedrooms')}</span></div><div class="detail-stat"><strong>${p.bathrooms}</strong><span>${t('bathrooms')}</span></div></div><p class="application-guidance">${t('beforeApplying')}</p><div class="detail-actions"><a class="button-solid" href="${showingUrl(p)}">${t('requestShowing')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a><a class="text-link" href="${DATA.applicationUrl}" target="_blank" rel="noopener noreferrer">${t('navApply')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div></div>
    <section class="gallery" id="gallery"><div class="gallery-heading"><span class="eyebrow section-label">${t('insideLabel')} / ${p.name.toUpperCase()}</span><span class="gallery-count" aria-live="polite">1 / ${DATA.images[p.imageKey].length}</span></div>
      <div class="gallery-main"><button class="gallery-open" aria-label="${t('openPhoto')}" data-open-gallery>${imageEl(image,p.name+' — '+t('photoLabel')+' 1','gallery-active')}<span>${t('openPhoto')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></button><div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="${t('previousPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><button type="button" data-gallery-step="1" aria-label="${t('nextPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></div>
      <p class="gallery-error" role="status" hidden>${t('galleryError')}</p>
      <div class="gallery-thumbs">${DATA.images[p.imageKey].map((src,i)=>`<button data-gallery-index="${i}" class="${i===0?'active':''}" aria-pressed="${i===0}" aria-label="${t('photoLabel')} ${i+1}">${imageEl(src,p.name+' — '+t('photoLabel')+' '+(i+1),'gallery-thumbnail')}</button>`).join('')}</div>
      <dialog class="lightbox" aria-label="${p.name} — ${t('photosLabel')}"><div class="lightbox-top"><span>${p.name}</span><button data-close-gallery autofocus aria-label="${t('closePhoto')}">×</button></div><div class="lightbox-image"><img alt=""><p class="gallery-error" hidden>${t('galleryError')}</p></div><div class="lightbox-bottom"><button data-gallery-step="-1" aria-label="${t('previousPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><span class="gallery-count" aria-live="polite"></span><button data-gallery-step="1" aria-label="${t('nextPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></dialog>
    </section>
    <section class="detail-body"><div class="reveal"><div class="eyebrow section-label">${t('aboutThis')}</div><h2>${localized(p,'label')}</h2></div><div class="detail-text reveal">${localized(p,'description').map(s=>`<p>${s}</p>`).join('')}</div></section>
    <section class="amenities"><div class="reveal"><div class="eyebrow section-label">${t('highlightsLabel')}</div><h2 class="display-title">${t('homeHighlights')}</h2><ul class="amenity-list">${localized(p,'features').map(f=>`<li>${f}</li>`).join('')}</ul></div><div class="reveal"><div class="eyebrow section-label">${t('termsHeading')}</div><h2 class="display-title">${money(p.rent)}<br>${t('perMonth')}</h2><ul class="amenity-list">${[`${t('deposit')}: ${money(p.deposit)}`,...localized(p,'terms')].map(f=>`<li>${f}</li>`).join('')}</ul><div class="terms-note">${t('termsDisclaimer')}<br><br><a href="${p.sourceUrl}" target="_blank" rel="noopener noreferrer">${t('sourceLabel')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div><a class="button-solid" style="margin-top:23px" href="${DATA.applicationUrl}" target="_blank" rel="noopener noreferrer">${t('navApply')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div></section>
    <section class="section"><div class="eyebrow section-label">${t('moreLabel')}</div><h2 class="display-title" style="margin-bottom:40px">${t('moreHomes')}</h2><div class="mini-cards">${more.map(x=>`<a href="#home/${x.slug}" class="mini-card">${imageEl(photo(x),x.name,'')}<span>${x.name} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a>`).join('')}</div></section>
    ${contactSection()}`;
  }
  function previewCard(card,show) {
    const property=P.find(p=>p.slug===card?.dataset.propertySlug);
    if(!property||DATA.images[property.imageKey].length<2)return;
    const button=card.querySelector('[data-card-preview]');
    const reset=()=>{
      card.classList.remove('is-previewing');card.dataset.selectedPhoto='0';
      button?.setAttribute('aria-pressed','false');
      button?.removeAttribute('aria-busy');
      if(button){button.querySelector('span').textContent=t('previewPhoto');button.setAttribute('aria-label',t('previewPhoto')+': '+property.name);}
    };
    card.dataset.previewRequested=String(show);
    if(!show){reset();return;}
    const index=DATA.images[property.imageKey].length>3?3:1;
    let img=card.querySelector('.property-preview');
    if(!img){
      img=document.createElement('img');img.className='property-image property-preview';
      img.alt=DATA.photoAlts?.[photo(property,index)]||property.name+' — '+t('photoLabel')+' '+(index+1);
      img.decoding='async';img.src=imageUrl(photo(property,index),1500);
      card.querySelector('.property-image-wrap').append(img);
    }
    button?.setAttribute('aria-busy','true');
    if(button)button.querySelector('span').textContent=t('loadingPhoto');
    img.decode().then(()=>{
      if(!card.isConnected||card.dataset.previewRequested!=='true')return;
      card.classList.add('is-previewing');card.dataset.selectedPhoto=String(index);
      button?.setAttribute('aria-pressed','true');button?.removeAttribute('aria-busy');
      if(button){button.querySelector('span').textContent=t('previewPhoto');button.setAttribute('aria-label',t('previewPhoto')+': '+property.name);}
    }).catch(()=>{
      if(!card.isConnected||card.dataset.previewRequested!=='true')return;
      img.remove();card.dataset.previewPinned='false';reset();
      if(button){button.querySelector('span').textContent=t('photoUnavailable');button.setAttribute('aria-label',t('photoUnavailable')+': '+property.name);}
    });
  }
  function savedView() {
    const value=history.state?.oaktownView;
    return value&&value.route===location.hash&&Number.isFinite(value.y)&&value.y>=0?value:null;
  }
  function rememberView(focus=null) {
    if(!currentView||renderedHash!==location.hash||restoringPosition)return;
    const viewport=app.querySelector('.collection-viewport');
    const headerBottom=header.getBoundingClientRect().bottom;
    const card=currentView==='home'?[...app.querySelectorAll('.property-card:not([hidden])')].find(el=>{
      const r=el.getBoundingClientRect();return r.bottom>headerBottom&&r.top<innerHeight-80&&r.right>24&&r.left<innerWidth-24;
    }):null;
    const section=[...app.querySelectorAll(':scope > section[id]')].find(el=>el.getBoundingClientRect().bottom>headerBottom+20);
    const value={version:1,route:location.hash,view:currentView,y:scrollY,filter:selectedFilter,layout:collectionLayout,x:viewport?.scrollLeft||0,galleryIndex:currentGalleryIndex,
      anchorSlug:card?.dataset.propertySlug||null,anchorTop:card?.getBoundingClientRect().top??null,sectionId:section?.id||null,sectionTop:section?.getBoundingClientRect().top??null,
      focus:focus||(currentView==='home'?history.state?.oaktownView?.focus:null)||null};
    if(currentView==='home')lastHomeSnapshot=value;
    else if(lastHomeSnapshot)value.home=lastHomeSnapshot;
    try{history.replaceState({...history.state,oaktownView:value},'');}catch{}
  }
  function scheduleViewSave() {
    clearTimeout(viewSaveTimer);
    viewSaveTimer=setTimeout(()=>rememberView(),500);
  }
  function restoreViewPosition(snapshot) {
    const generation=++positionGeneration;
    restoringPosition=true;
    const apply=()=>{
      if(generation!==positionGeneration)return;
      const viewport=app.querySelector('.collection-viewport');
      if(viewport&&Number.isFinite(snapshot.x)){
        viewport.scrollLeft=snapshot.x;viewport.dispatchEvent(new Event('scroll'));
      }
      const card=snapshot.anchorSlug?[...app.querySelectorAll('.property-card:not([hidden])')].find(el=>el.dataset.propertySlug===snapshot.anchorSlug):null;
      const section=snapshot.sectionId?document.getElementById(snapshot.sectionId):null;
      const anchor=card||section;
      const offset=card?snapshot.anchorTop:snapshot.sectionTop;
      const top=anchor&&Number.isFinite(offset)?anchor.getBoundingClientRect().top+scrollY-offset:snapshot.y;
      scrollTo({top:Math.max(0,top),behavior:'instant'});
    };
    apply();
    if(snapshot.focus&&currentView==='home'){
      const card=[...app.querySelectorAll('.property-card:not([hidden])')].find(el=>el.dataset.propertySlug===snapshot.focus.slug);
      card?.querySelector(snapshot.focus.kind==='name'?'.property-name a':'.property-image-wrap')?.focus({preventScroll:true});
    }
    requestAnimationFrame(()=>{if(generation!==positionGeneration)return;apply();restoringPosition=false;rememberView();});
    document.fonts.ready.then(()=>{if(generation===positionGeneration){apply();rememberView();}});
  }
  function clearTransitionNames() {
    app.querySelectorAll('[style*="view-transition-name"]').forEach(el=>el.style.removeProperty('view-transition-name'));
    transitionSource=null;
  }
  function routedDraw() {
    positionGeneration++;restoringPosition=false;
    const generation=++routeGeneration;
    const route=location.hash;
    let requestedSlug=null;
    try{const value=decodeURIComponent(route.slice(1));if(value.startsWith('home/'))requestedSlug=value.slice(5);}catch{}
    activeTransition?.skipTransition();
    const source=transitionSource;
    const selection=pendingPhoto;
    const motion=!reducedMotion.matches&&!document.documentElement.classList.contains('motion-off');
    if(!source?.isConnected||selection?.slug!==requestedSlug||!motion||!document.startViewTransition){clearTransitionNames();draw();return;}
    transitionSource=null;
    const transition=document.startViewTransition(async()=>{
      // A skipped native transition still invokes its update callback. Only the
      // latest requested route may draw or assign a shared photograph.
      if(generation!==routeGeneration||location.hash!==route)return;
      draw();
      const target=app.querySelector('.detail-cover-photo');
      if(target&&currentView==='detail:'+selection.slug){
        target.style.viewTransitionName='rental-photo';
        target.removeAttribute('srcset');target.src=source.currentSrc||source.src;
        await Promise.race([target.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,200))]);
      }
    });
    activeTransition=transition;
    transition.ready.catch(()=>{});
    transition.finished.catch(()=>{}).finally(()=>{
      if(activeTransition===transition){activeTransition=null;clearTransitionNames();}
    });
  }
  const closeMenu=()=>{mobileNav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',t('openMenu'));};
  function activateLayout(layout) {
    collectionLayout=layout;
    const collection=app.querySelector('.collection');if(!collection)return;
    collection.dataset.layout=layout;
    collection.querySelectorAll('[data-layout-button]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.layoutButton===layout)));
    const viewport=collection.querySelector('.collection-viewport');
    if(layout==='gallery')viewport.tabIndex=0;else viewport.removeAttribute('tabindex');
    viewport.scrollLeft=0;viewport.dispatchEvent(new Event('scroll'));
    rememberView();
  }
  function activateFilter(filter) {
    selectedFilter=filter;
    const cards=app.querySelectorAll('.property-card');
    cards.forEach(card => {
      card.hidden = !(filter==='All'||filter.split('|').includes(card.dataset.neighborhood));
      card.style.display=card.hidden?'none':'';
    });
    app.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===filter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    const viewport=app.querySelector('.collection-viewport');if(viewport){viewport.scrollLeft=0;viewport.dispatchEvent(new Event('scroll'));}
    const shown=[...cards].filter(card=>!card.hidden).length;
    const count=app.querySelector('.listing-count');if(count)count.textContent=shown+' '+t('homeCount');
    rememberView();
  }
  function galleryStep(step) {
    const p=P.find(x=>'detail:'+x.slug===currentView);if(!p)return;
    const imgs=DATA.images[p.imageKey];if(!imgs.length)return;currentGalleryIndex=(currentGalleryIndex+step+imgs.length)%imgs.length;
    const src=imageUrl(imgs[currentGalleryIndex],1500), alt=DATA.photoAlts?.[imgs[currentGalleryIndex]]||p.name+' — '+t('photoLabel')+' '+(currentGalleryIndex+1);
    app.querySelectorAll('.gallery-active, .detail-cover-photo, .lightbox[open] .lightbox-image img').forEach(img=>{img.removeAttribute('srcset');img.src=src;img.alt=alt;});
    app.querySelectorAll('.gallery-error').forEach(el=>el.hidden=true);
    app.querySelectorAll('.gallery-count').forEach(el=>el.textContent=(currentGalleryIndex+1)+' / '+imgs.length);
    app.querySelectorAll('[data-gallery-index]').forEach(b=>{const active=Number(b.dataset.galleryIndex)===currentGalleryIndex;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    const active=app.querySelector('[data-gallery-index="'+currentGalleryIndex+'"]');
    if(active)active.parentElement.scrollTo({left:active.offsetLeft-active.parentElement.offsetLeft,behavior:'instant'});
    rememberView();
  }
  function closeGallery() {
    app.querySelector('.lightbox[open]')?.close();document.body.classList.remove('gallery-is-open');
  }
  function observeSections() {
    observer?.disconnect();
    if(reducedMotion.matches){app.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));return;}
    observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}})},{threshold:.08,rootMargin:'0px 0px -20px 0px'});
    app.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }
  function draw(preservePosition=false) {
    positionGeneration++;restoringPosition=false;
    const saved=savedView();
    let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{hash='';}
    const detailSlug=hash.startsWith('home/')?hash.substring(5):null;
    const p=detailSlug?P.find(x=>x.slug===detailSlug):null;
    const view=p?'detail:'+p.slug:'home';
    const restore=!preservePosition?(view==='home'&&pendingHomeRestore?pendingHomeRestore:saved?.view===view?saved:null):null;
    pendingHomeRestore=null;
    if(restore?.home?.view==='home')lastHomeSnapshot=restore.home;
    if(restore&&view==='home'){
      selectedFilter=restore.filter==='All'||typeof restore.filter==='string'&&P.some(home=>restore.filter.split('|').includes(home.neighborhood))?restore.filter:'All';
      collectionLayout=restore.layout==='gallery'?'gallery':'grid';
    }
    const shouldRender=(view!==currentView)||app.children.length===0||preservePosition||!!restore;
    const oldScroll=window.scrollY;
    const readingSection=preservePosition?[...app.querySelectorAll(':scope > section, :scope > aside')].find(el=>el.getBoundingClientRect().bottom>110):null;
    const readingIndex=readingSection?[...app.children].indexOf(readingSection):-1;
    const readingTop=readingSection?.getBoundingClientRect().top;
    if(shouldRender){
      cleanupEffects();closeGallery();
      currentView=view;if(!preservePosition)currentGalleryIndex=restore&&p?Math.min(Math.max(0,Number(restore.galleryIndex)||0),Math.max(0,DATA.images[p.imageKey].length-1)):p&&pendingPhoto?.slug===p.slug?pendingPhoto.index:0;
      pendingPhoto=null;
      app.innerHTML=p?detailPage(p,currentGalleryIndex):homePage();
      document.title=(p?p.name+' — ':'')+'Oaktown Rentals — '+t('heroKicker');
      if(restore){observer?.disconnect();app.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));}
      else observeSections();
      if(!p)activateFilter(selectedFilter);
      if(p&&(preservePosition||currentGalleryIndex))galleryStep(0);
      cleanupEffects=window.OaktownEffects.mount(app,{t});
      if(p&&!preservePosition){const heading=app.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
    }
    renderedHash=location.hash;
    if(restore){restoreViewPosition(restore);}
    else if(preservePosition) {
      const section=app.children[readingIndex];
      window.scrollTo({top:section&&readingTop!==undefined?scrollY+section.getBoundingClientRect().top-readingTop:oldScroll,behavior:'instant'});
    } else if(p) {
      window.scrollTo({top:0,behavior:'instant'});
    } else if(hash==='discover') {
      requestAnimationFrame(()=>document.getElementById('about')?.scrollIntoView({behavior:navigationMotion()}));
    } else if(hash && document.getElementById(hash)) {
      requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView({behavior:navigationMotion()}));
    } else {
      window.scrollTo({top:0,behavior:'instant'});
    }
    document.documentElement.lang=language;
    document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));
    langButton.textContent=language==='en'?'ES':'EN';
    const mobileInquiry=document.getElementById('mobile-inquiry');
    mobileInquiry.href=p?showingUrl(p):'sms:+15025001070';
    mobileInquiry.textContent=t(p?'requestShowing':'textUs');
    closeMenu();
    onScroll();
    if(!restore)rememberView();
  }
  function onScroll() {
    const scroll=document.documentElement.scrollTop;
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    document.getElementById('progress').style.width=(Math.min(1,scroll/max)*100)+'%';
    header.classList.toggle('is-fixed',scroll>50);
    scheduleViewSave();
  }
  menu.addEventListener('click',()=>{const isOpening=mobileNav.hidden;mobileNav.hidden=!isOpening;menu.setAttribute('aria-expanded',String(isOpening));menu.setAttribute('aria-label',t(isOpening?'closeMenu':'openMenu'));});
  mobileNav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
  langButton.addEventListener('click',()=>{routeGeneration++;activeTransition?.skipTransition();clearTransitionNames();language=language==='en'?'es':'en';try{localStorage.setItem('oaktown-language',language);}catch{}draw(true)});
  app.addEventListener('click',e=>{
    if(e.target.closest('.back-link')&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey)pendingHomeRestore=lastHomeSnapshot;
    const preview=e.target.closest('[data-card-preview]');
    if(preview){
      const card=preview.closest('.property-card');
      const show=!card.classList.contains('is-previewing')&&card.dataset.previewPinned!=='true';card.dataset.previewPinned=String(show);
      previewCard(card,show);return;
    }
    const listing=e.target.closest('.property-card a[href^="#home/"]');
    if(listing&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){
      const card=listing.closest('.property-card');
      pendingPhoto={slug:card.dataset.propertySlug,index:Number(card.dataset.selectedPhoto)||0};
      activeTransition?.skipTransition();clearTransitionNames();
      const source=card.querySelector(card.classList.contains('is-previewing')?'.property-preview':'.property-image:not(.property-preview)');
      if(source?.naturalWidth&&!reducedMotion.matches&&!document.documentElement.classList.contains('motion-off')&&document.startViewTransition){
        source.style.transition='none';source.style.opacity='1';
        source.style.viewTransitionName='rental-photo';transitionSource=source;
      }
    }

    const layout=e.target.closest('[data-layout-button]');if(layout){activateLayout(layout.dataset.layoutButton);return;}
    const filter=e.target.closest('[data-filter]');if(filter){activateFilter(filter.dataset.filter);return;}
    const thumb=e.target.closest('[data-gallery-index]');if(thumb){const p=P.find(x=>'detail:'+x.slug===currentView);if(p)galleryStep(Number(thumb.dataset.galleryIndex)-currentGalleryIndex);return;}
    const step=e.target.closest('[data-gallery-step]');if(step)galleryStep(Number(step.dataset.galleryStep));
    if(e.target.closest('[data-open-gallery],[data-cover-gallery]')){app.querySelector('.lightbox').showModal();document.body.classList.add('gallery-is-open');galleryStep(0);}
    if(e.target.closest('[data-close-gallery]'))closeGallery();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!mobileNav.hidden){closeMenu();menu.focus();}
    if(app.querySelector('.lightbox[open]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();galleryStep(e.key==='ArrowLeft'?-1:1);}
  });
  app.addEventListener('close',e=>{if(e.target.matches('.lightbox'))document.body.classList.remove('gallery-is-open');},true);
  app.addEventListener('error',e=>{
    if(!e.target.matches('img'))return;
    e.target.classList.add('image-unavailable');
    if(e.target.matches('.gallery-active'))app.querySelector('.gallery > .gallery-error').hidden=false;
    if(e.target.closest('.lightbox'))app.querySelector('.lightbox .gallery-error').hidden=false;
  },true);
  app.addEventListener('load',e=>{if(e.target.matches('img'))e.target.classList.remove('image-unavailable');},true);
  app.addEventListener('touchstart',e=>{if(e.target.closest('.gallery-main,.lightbox-image'))touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  app.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)galleryStep(dx>0?-1:1);},{passive:true});
  app.addEventListener('pointerover',e=>{
    const media=e.target.closest('.card-media');
    if(media&&!media.contains(e.relatedTarget)&&pointerPreview.matches)previewCard(media.closest('.property-card'),true);
  });
  app.addEventListener('pointerout',e=>{
    const media=e.target.closest('.card-media');const card=media?.closest('.property-card');
    if(card&&!media.contains(e.relatedTarget)&&card.dataset.previewPinned!=='true'&&!media.contains(document.activeElement))previewCard(card,false);
  });
  app.addEventListener('focusin',e=>{
    const media=e.target.closest('.card-media');
    if(media&&!media.contains(e.relatedTarget)&&!e.target.closest('[data-card-preview]'))previewCard(media.closest('.property-card'),true);
  });
  app.addEventListener('focusout',e=>{
    const media=e.target.closest('.card-media');const card=media?.closest('.property-card');
    if(card&&!media.contains(e.relatedTarget)&&card.dataset.previewPinned!=='true'&&!media.matches(':hover'))previewCard(card,false);
  });
  document.getElementById('motion-toggle').addEventListener('click',()=>queueMicrotask(()=>{if(document.documentElement.classList.contains('motion-off'))activeTransition?.skipTransition();}));
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)activeTransition?.skipTransition();});
  document.addEventListener('click',e=>{
    const link=e.target.closest('a[href^="#"]');
    if(!link||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;
    const card=link.closest('.property-card');
    rememberView(card?{slug:card.dataset.propertySlug,kind:link.closest('.property-name')?'name':'photo'}:null);
  });
  app.addEventListener('scroll',e=>{if(e.target.matches('.collection-viewport'))scheduleViewSave();},true);
  ['wheel','touchstart','pointerdown','keydown'].forEach(name=>window.addEventListener(name,()=>{positionGeneration++;restoringPosition=false;},{passive:true}));
  window.addEventListener('pagehide',()=>{clearTimeout(viewSaveTimer);rememberView();});
  window.addEventListener('popstate',()=>{if(location.hash===renderedHash)routedDraw();});
  window.addEventListener('hashchange',routedDraw);
  window.addEventListener('scroll',onScroll,{passive:true});
  document.getElementById('year').textContent=new Date().getFullYear();
  draw();
})();
