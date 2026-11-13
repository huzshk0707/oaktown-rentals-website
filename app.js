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
  const words = {
    en: {
      homeCount:'homes',gridView:'Grid',galleryView:'Gallery',layoutLabel:'Property view',requestShowing:'Request a showing',availabilityNote:'Contact us to confirm current pricing and availability.',photoUnavailable:'Photos temporarily unavailable',skipContent:'Skip to content',primaryNav:'Primary navigation',mobileNav:'Mobile navigation',openMenu:'Open menu',closeMenu:'Close menu',switchLanguage:'Cambiar a español',homeLink:'Oaktown Rentals — home',applicationLabel:'Open rental application',previewNotice:'Website preview · Confirm listing details with Oaktown Rentals',originalWebsite:'Original website',colonialInterior:'Interior at 115 Colonial Drive',cherokeeInterior:'Interior at 1106 Cherokee Road, unit 8',floridaAlt:'The Mint Mojo in Cudjoe Key',floridaShort:'A waterfront escape in the Florida Keys.',
      textUs:'Text us',motionOn:'Motion on',motionOff:'Motion off',motionLabel:'Enable visual motion',sceneOne:'The beginning',sceneTwo:'The everyday',sceneThree:'The next chapter',sceneTwoTitle:'Room for <em>your life.</em>',sceneThreeTitle:'Make yourself <em>at home.</em>',sceneTwoCopy:'A little more space. A rhythm of your own.',sceneThreeCopy:'Find your place in Louisville. We’ll help with the next step.',heroCaption:'A closer look at 115 Colonial Drive',browseHint:'Explore the collection',previousHome:'Previous home',nextHome:'Next home',filterLabel:'Filter homes by neighborhood',openPhoto:'Enlarge photo',closePhoto:'Close gallery',previousPhoto:'Previous photo',nextPhoto:'Next photo',photoLabel:'Photo',photosLabel:'Photos',insideLabel:'A LOOK INSIDE',highlightsLabel:'THE HIGHLIGHTS',moreLabel:'EXPLORE MORE',sourceLabel:'Original listing',galleryError:'This photo could not load. Try another photo or contact us for the full gallery.',
      navHomes:'Our homes',navStory:'Our story',navFaq:'FAQ',navCommunity:'Community',navApply:'Apply online',contact:'Contact',textBest:'Text is always the best & fastest.',footerTitle:'Your next chapter starts here.',
      heroKicker:'Quality rental homes in Louisville, KY',heroOne:'Find your',heroTwo:'place.',heroTagline:'Rental homes with character, in the Louisville neighborhoods you love.',explore:'View homes',scroll:'Scroll to explore',
      homesLabel:'01 / FIND A HOME',homesHeading:'Find a home <em>that fits.</em>',homesDesc:'Explore our Louisville homes. Find the space and neighborhood for your next chapter.',
      all:'All',stMatthews:'St. Matthews',highlands:'Highlands',okolona:'Okolona',listings:'Homes in our collection',perMonth:'/ month',beds:'beds',baths:'bath',availability:'Ask about availability',
      aboutLabel:'02 / WHO WE ARE',aboutHeading:'Rooted in <em>Louisville.</em>',aboutLead:'A local perspective. A love for our city. Homes that feel like home.',aboutText:'Oaktown Rentals provides quality rental housing in Louisville, Kentucky and nearby counties. We manage homes across the city, with a particular focus on Southern and Southeastern Jefferson County. We believe finding a home should feel personal, not complicated.',aboutLink:'Get in touch',
      floridaLabel:'A LITTLE FURTHER FROM HOME',floridaLink:'Explore the Florida rental',
      faqLabel:'03 / GOOD TO KNOW',faqHeading:'Before you move.',faqDesc:'A little guidance on applications, pets and arranging a visit.',
      communityLabel:'04 / DISCOVER LOUISVILLE',communityHeading:'Get to know Louisville.',communityText:'Schools, parks and local resources to help you settle in.',
      faq1q:'How do I apply?',faq1a:'Use our secure online rental application. Have your contact information, residence history and supporting documents ready. Application requirements and any fees should be confirmed before you submit.',
      faq2q:'What does Oaktown Rentals look for?',faq2a:'Applications are reviewed using income, rental history, references, and other screening information. Contact us for the current screening criteria and any property-specific requirements.',
      faq3q:'How long does an application take?',faq3a:'The existing website says applications typically take 48–96 business hours, though verification requests may take longer. Please confirm current processing times with the team.',
      faq4q:'Are pets allowed?',faq4a:'Pets may be permitted depending on the home and approval. Pet rent, deposits, breed restrictions and other terms should be verified for the property you choose.',
      faq5q:'How do I schedule a showing?',faq5a:'Texting is the fastest way to reach Oaktown Rentals. Mention the address you are interested in so the team can confirm availability and next steps.',
      contactLabel:'LET’S TALK',contactHeading:'Ready to <em>move?</em>',contactDesc:'Questions, showings, applications. Tell us what you’re looking for and we’ll help you take the next step.',
      photo:'VIEW HOME',details:'View details',detailBack:'All rental homes',aboutThis:'A closer look',homeHighlights:'The details that make it yours',rent:'Monthly rent',deposit:'Security deposit',bedrooms:'Bedrooms',bathrooms:'Bathrooms',moreHomes:'Find your next favorite place',termsHeading:'Things to know',termsDisclaimer:'This is a design preview, not a live inventory feed. Pricing, availability and application requirements must be confirmed directly with Oaktown Rentals.',
      communityRes1:'Jefferson County Public Schools',communityRes2:'City of Louisville',communityRes3:'Louisville Visitor Guide',communityRes4:'Louisville Public Library'
    },
    es: {
      homeCount:'viviendas',gridView:'Cuadrícula',galleryView:'Galería',layoutLabel:'Vista de viviendas',requestShowing:'Solicitar una visita',availabilityNote:'Contáctanos para confirmar precios y disponibilidad actualizados.',photoUnavailable:'Fotos temporalmente no disponibles',skipContent:'Saltar al contenido',primaryNav:'Navegación principal',mobileNav:'Navegación móvil',openMenu:'Abrir menú',closeMenu:'Cerrar menú',switchLanguage:'Switch to English',homeLink:'Oaktown Rentals — inicio',applicationLabel:'Abrir solicitud de alquiler',previewNotice:'Vista previa del sitio · Confirma los detalles con Oaktown Rentals',originalWebsite:'Sitio original',colonialInterior:'Interior de 115 Colonial Drive',cherokeeInterior:'Interior de 1106 Cherokee Road, unidad 8',floridaAlt:'The Mint Mojo en Cudjoe Key',floridaShort:'Una escapada junto al agua en los Cayos de Florida.',
      textUs:'Escríbenos',motionOn:'Animación sí',motionOff:'Animación no',motionLabel:'Activar animaciones',sceneOne:'El comienzo',sceneTwo:'El día a día',sceneThree:'La nueva etapa',sceneTwoTitle:'Espacio para <em>tu vida.</em>',sceneThreeTitle:'Siéntete <em>en casa.</em>',sceneTwoCopy:'Un poco más de espacio. Tu propio ritmo.',sceneThreeCopy:'Encuentra tu hogar en Louisville. Te ayudamos a dar el siguiente paso.',heroCaption:'Descubre 115 Colonial Drive',browseHint:'Explora las viviendas',previousHome:'Vivienda anterior',nextHome:'Siguiente vivienda',filterLabel:'Filtrar viviendas por vecindario',openPhoto:'Ampliar foto',closePhoto:'Cerrar galería',previousPhoto:'Foto anterior',nextPhoto:'Siguiente foto',photoLabel:'Foto',photosLabel:'Fotos',insideLabel:'UNA MIRADA AL INTERIOR',highlightsLabel:'LOS DETALLES',moreLabel:'EXPLORA MÁS',sourceLabel:'Anuncio original',galleryError:'No se pudo cargar esta foto. Prueba otra o contáctanos para ver la galería completa.',
      navHomes:'Viviendas',navStory:'Nuestra historia',navFaq:'Preguntas',navCommunity:'Comunidad',navApply:'Solicitar ahora',contact:'Contacto',textBest:'Los mensajes de texto son la forma más rápida de contactarnos.',footerTitle:'Tu próximo capítulo comienza aquí.',
      heroKicker:'Viviendas de alquiler en Louisville, KY',heroOne:'Encuentra tu',heroTwo:'hogar.',heroTagline:'Viviendas con carácter en los vecindarios de Louisville que te encantan.',explore:'Ver viviendas',scroll:'Desliza para explorar',
      homesLabel:'01 / ENCUENTRA TU HOGAR',homesHeading:'Un hogar <em>a tu medida.</em>',homesDesc:'Explora nuestras viviendas en Louisville. Encuentra el espacio y el vecindario para tu próxima etapa.',
      all:'Todas',stMatthews:'St. Matthews',highlands:'Highlands',okolona:'Okolona',listings:'Viviendas en nuestra colección',perMonth:'/ mes',beds:'hab.',baths:'baño',availability:'Consultar disponibilidad',
      aboutLabel:'02 / QUIÉNES SOMOS',aboutHeading:'Arraigados en <em>Louisville.</em>',aboutLead:'Perspectiva local. Amor por nuestra ciudad. Hogares acogedores.',aboutText:'Oaktown Rentals ofrece viviendas de alquiler de calidad en Louisville, Kentucky y los condados cercanos. Gestionamos hogares por toda la ciudad, especialmente en el sur y sureste del condado de Jefferson.',aboutLink:'Contáctanos',
      floridaLabel:'UN POCO MÁS LEJOS DE CASA',floridaLink:'Explorar la casa en Florida',
      faqLabel:'03 / INFORMACIÓN ÚTIL',faqHeading:'Antes de mudarte.',faqDesc:'Información sobre solicitudes, mascotas y cómo programar una visita.',
      communityLabel:'04 / DESCUBRE LOUISVILLE',communityHeading:'Conoce Louisville.',communityText:'Escuelas, parques y recursos locales para ayudarte a instalarte.',
      faq1q:'¿Cómo puedo solicitar una vivienda?',faq1a:'Utiliza nuestra solicitud de alquiler en línea. Prepara tus datos de contacto, historial de residencia y documentos. Confirma los requisitos y tarifas antes de enviarla.',
      faq2q:'¿Qué requisitos tiene Oaktown Rentals?',faq2a:'Se evalúan los ingresos, el historial de alquiler, las referencias y otros datos. Contacta al equipo para obtener los criterios vigentes.',
      faq3q:'¿Cuánto tarda una solicitud?',faq3a:'El sitio actual indica un plazo habitual de 48 a 96 horas laborables, aunque algunas verificaciones pueden tardar más. Confirma los tiempos actuales.',
      faq4q:'¿Se admiten mascotas?',faq4a:'Dependiendo de la vivienda y de la aprobación, pueden admitirse mascotas. Confirma las tarifas, depósitos y condiciones de cada propiedad.',
      faq5q:'¿Cómo programo una visita?',faq5a:'Los mensajes de texto son la forma más rápida de contactarnos. Indica la dirección de la vivienda para consultar disponibilidad.',
      contactLabel:'HABLEMOS',contactHeading:'¿Listo para <em>mudarte?</em>',contactDesc:'Preguntas, visitas y solicitudes. Cuéntanos qué buscas.',
      photo:'VER VIVIENDA',details:'Ver detalles',detailBack:'Todas las viviendas',aboutThis:'Conoce la vivienda',homeHighlights:'Detalles que la hacen especial',rent:'Alquiler mensual',deposit:'Depósito de seguridad',bedrooms:'Habitaciones',bathrooms:'Baños',moreHomes:'Descubre otra vivienda',termsHeading:'Información importante',termsDisclaimer:'Esta es una vista previa de diseño, no un inventario en tiempo real. Confirma precios, disponibilidad y requisitos con Oaktown Rentals.',
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
    const sizes=thumbnail?'(max-width: 600px) 95px, 140px':className==='property-image'?'(max-width: 600px) calc(100vw - 44px), (max-width: 850px) 90vw, 45vw':'100vw';
    return `<img class="${className}" src="${imageUrl(src,thumbnail?300:1200)}" srcset="${widths.map(w=>imageUrl(src,w)+' '+w+'w').join(', ')}" sizes="${sizes}" alt="${alt}" loading="${extra==='eager'?'eager':'lazy'}" decoding="async" ${extra==='eager'?'fetchpriority="high"':''}>`;
  };
  const inquiryUrl = p => 'sms:+15025001070?body='+encodeURIComponent((language==='es'?'Hola, quisiera consultar la disponibilidad de ':'Hi, I’d like to ask about availability for ')+p.name+'.');
  const showingUrl = p => 'sms:+15025001070?body='+encodeURIComponent((language==='es'?'Hola, quisiera programar una visita a ':'Hi, I’d like to request a showing at ')+p.name+'.');
  const sectionHeading = (label, title, desc='') => `<div class="section-heading reveal"><div><div class="eyebrow section-label">${label}</div><h2 class="display-title">${title}</h2></div>${desc?`<p class="heading-note">${desc}</p>`:''}</div>`;
  function card(p, index) {
    return `<article class="property-card reveal" data-neighborhood="${p.neighborhood}">
        <a class="property-image-wrap" href="#home/${p.slug}" aria-label="${t('details')}: ${p.name}" data-image-error="${t('photoUnavailable')}">
          <span class="card-index" aria-hidden="true">${String(index+1).padStart(2,'0')} / ${String(P.length).padStart(2,'0')}</span><span class="card-photo-count">${DATA.images[p.imageKey].length} ${t('photosLabel')}</span>
          ${imageEl(photo(p), p.name+' — '+t('photoLabel'),'property-image')}
          <span class="photo-pill">${t('photo')}</span><span class="card-arrow" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span>
        </a>
        <div class="property-data"><div><span class="property-neighborhood">${p.neighborhood}</span><h3 class="property-name"><a href="#home/${p.slug}">${p.name}</a></h3><p class="property-summary">${localized(p,'summary')}</p></div><div class="property-price">${money(p.rent)}<small>${t('perMonth')}</small></div></div>
        <div class="property-details-line"><span>${p.bedrooms} ${language==='en'&&p.bedrooms===1?'bed':t('beds')} &nbsp; / &nbsp; ${p.bathrooms} ${t('baths')}</span>${p.availability&&p.availability!=='unknown'?`<span class="availability-badge">${({en:{available:'Available',coming_soon:'Coming soon',rented:'Rented'},es:{available:'Disponible',coming_soon:'Próximamente',rented:'Alquilado'}})[language][p.availability]||''}</span>`:''}<a href="${inquiryUrl(p)}">${t('availability')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div>
      </article>`;
  }
  function faqSection() {
    return `<section id="faq" class="section faq-section">${sectionHeading(t('faqLabel'),t('faqHeading'),t('faqDesc'))}<div class="faq-list">${[1,2,3,4,5].map(i=>`<details class="faq-item reveal"><summary>${t('faq'+i+'q')}</summary><div class="faq-answer">${t('faq'+i+'a')}</div></details>`).join('')}</div></section>`;
  }
  function contactSection() {
    return `<section id="contact" class="contact-panel"><div class="reveal"><span class="eyebrow">${t('contactLabel')}</span><h2>${t('contactHeading')}</h2><p>${t('contactDesc')}</p></div><div class="contact-actions reveal"><a href="sms:+15025001070">${t('textBest')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a href="tel:+15025001070">${DATA.phoneDisplay} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a href="mailto:${DATA.email}">${DATA.email}<span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><p>${DATA.mailingAddress}</p></div></section>`;
  }
  function storySection() {
    const featured=P[0],images=featured?DATA.images[featured.imageKey]:[];
    const scenes=[
      {image:images[0],title:t('heroOne')+' <em>'+t('heroTwo')+'</em>',copy:t('heroTagline')},
      {image:images[3]||images[1]||images[0],title:t('sceneTwoTitle'),copy:t('sceneTwoCopy')},
      {image:images[6]||images[2]||images[0],title:t('sceneThreeTitle'),copy:t('sceneThreeCopy')}
    ];
    return `<section class="story" id="top" aria-label="${t('heroKicker')}"><div class="story-stage">
      <div class="story-images" aria-hidden="true">${scenes.map((scene,i)=>`<div class="story-image ${i===0?'is-active':''}" data-scene-image="${i}">${imageEl(scene.image,'','',i===0?'eager':'')}</div>`).join('')}</div>
      <div class="story-letter" aria-hidden="true" ${scenes[2].image?`style="background-image:url('${imageUrl(scenes[2].image,1500)}')"`:''}>O</div>
      <div class="story-shade"></div><div class="story-topline"><span>LOUISVILLE, KENTUCKY</span><a href="#homes">${t('explore')} <span aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a></div>
      <h1 class="sr-only">${t('heroKicker')} — ${t('heroOne')} ${t('heroTwo')}</h1>
      <div class="story-copy">${scenes.map((scene,i)=>`<div class="story-scene ${i===0?'is-active':''}" data-scene="${i}" ${i===0?'':'aria-hidden="true"'}><span class="eyebrow">0${i+1} / ${t(['sceneOne','sceneTwo','sceneThree'][i])}</span><p class="story-title">${scene.title}</p><p class="story-description">${scene.copy}</p></div>`).join('')}</div>
      <a class="story-explore" href="#homes" aria-label="${t('explore')}"><span>${t('explore')}</span><span class="round-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a>
      <div class="story-bottom"><div class="scene-navigation" role="group" aria-label="${t('photosLabel')}">${[0,1,2].map(i=>`<button type="button" data-scene-button="${i}" aria-pressed="${i===0}"><span>0${i+1}</span><span>${t(['sceneOne','sceneTwo','sceneThree'][i])}</span><i aria-hidden="true"></i></button>`).join('')}</div>${featured?`<a class="story-caption" href="#home/${featured.slug}">${featured.name}</a>`:''}</div>
    </div></section>`;
  }
  function homePage() {
    return `${storySection()}
    <section class="section collection" id="homes" data-layout="${collectionLayout}">${sectionHeading(t('homesLabel'),t('homesHeading'),t('homesDesc'))}
      <div class="listing-tools reveal"><span class="listing-count" aria-live="polite">${String(P.length).padStart(2,'0')} / ${t('homeCount')}</span><div class="view-switch" role="group" aria-label="${t('layoutLabel')}"><button type="button" data-layout-button="grid" aria-pressed="${collectionLayout==='grid'}">${t('gridView')}</button><button type="button" data-layout-button="gallery" aria-pressed="${collectionLayout==='gallery'}">${t('galleryView')}</button></div><div class="filter-strip" role="group" aria-label="${t('filterLabel')}"><button class="filter-chip active" data-filter="All" aria-pressed="true">${t('all')}</button><button class="filter-chip" data-filter="St. Matthews" aria-pressed="false">${t('stMatthews')}</button><button class="filter-chip" data-filter="The Highlands|Cherokee Triangle" aria-pressed="false">${t('highlands')}</button><button class="filter-chip" data-filter="Okolona" aria-pressed="false">${t('okolona')}</button>${[...new Set(P.map(p=>p.neighborhood))].filter(n=>!['St. Matthews','The Highlands','Cherokee Triangle','Okolona'].includes(n)).map(n=>`<button class="filter-chip" data-filter="${n}" aria-pressed="false">${n}</button>`).join('')}</div></div>
      <p class="collection-note">${t('availabilityNote')}</p>
      ${!P.length?`<p class="collection-empty">${language==='es'?(DATA.contentUnavailable?'No podemos cargar las viviendas en este momento. Contáctanos para consultar disponibilidad.':'No hay viviendas publicadas en este momento. Contáctanos para saber qué viene próximamente.'):(DATA.contentUnavailable?'We cannot load the homes right now. Contact us for current availability.':'There are no published homes right now. Contact us to hear what’s coming next.')}</p>`:''}
      <div class="collection-viewport" id="collection-viewport" ${collectionLayout==='gallery'?'tabindex="0"':''} role="region" aria-label="${t('listings')}"><div class="property-grid" id="property-grid">${P.map(card).join('')}</div></div>
      <div class="collection-bottom"><span>${t('browseHint')}</span><div class="collection-meter" aria-hidden="true"><span></span></div><div class="collection-controls"><button data-collection-step="-1" aria-label="${t('previousHome')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><button data-collection-step="1" aria-label="${t('nextHome')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></div>
    </section>
    <section class="editorial-section" id="about" aria-labelledby="editorial-title">
      <div class="editorial-intro reveal"><span class="eyebrow section-label">${t('aboutLabel')}</span><h2 id="editorial-title">${t('aboutHeading')}</h2><p class="editorial-lead">${t('aboutLead')}</p><p>${t('aboutText')}</p><a class="text-link" href="#contact">${t('aboutLink')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div>
      <div class="editorial-collage reveal"><div class="editorial-photo editorial-photo-primary">${P[0]?imageEl(photo(P[0],3),P[0].name,''):''}<span class="editorial-photo-caption">01 / ${P[0]?.neighborhood||'OAKTOWN'}</span></div><div class="editorial-photo editorial-photo-secondary">${P[1]?imageEl(photo(P[1],1),P[1].name,''):''}<span class="editorial-photo-caption">02 / ${P[1]?.neighborhood||'LOUISVILLE'}</span></div></div>
    </section>
    ${faqSection()}
    <section class="section community-section" id="community"><div class="reveal"><div class="eyebrow section-label">${t('communityLabel')}</div><h2 class="display-title">${t('communityHeading')}</h2><p class="community-intro">${t('communityText')}</p></div><div class="community-resources reveal"><a class="resource-link" href="https://www.jefferson.kyschools.us/" target="_blank" rel="noopener noreferrer">${t('communityRes1')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://louisvilleky.gov/" target="_blank" rel="noopener noreferrer">${t('communityRes2')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://www.gotolouisville.com/" target="_blank" rel="noopener noreferrer">${t('communityRes3')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://www.lfpl.org/" target="_blank" rel="noopener noreferrer">${t('communityRes4')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a></div></section>
    ${contactSection()}
    <aside id="cudejoe" class="vacation-feature" aria-labelledby="vacation-title"><a href="./mint-mojo/" class="vacation-card">${imageEl('./assets/mint-mojo/house-pool.jpg',t('floridaAlt'),'vacation-photo')}<div><span class="eyebrow">${t('floridaLabel')}</span><h2 id="vacation-title">The Mint Mojo</h2><p>${t('floridaShort')}</p><span class="text-link">${t('floridaLink')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></div></a></aside>`;
  }
  function detailPage(p) {
    const image = photo(p);
    const more = P.filter(x=>x.slug!==p.slug).slice(0,2);
    return `<section class="page-intro has-image"><div class="intro-photo" style="background-image:url('${image}')"></div>
      <a class="back-link" href="#homes"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg> ${t('detailBack')}</a><span class="eyebrow section-label">${p.neighborhood} / ${p.city}</span><h1>${p.name.replace(' · ', '<br>')}</h1><p class="intro-sub">${localized(p,'summary')}</p></section>
    <div class="details-bar"><div class="detail-stats"><div class="detail-stat"><strong>${money(p.rent)}</strong><span>${t('rent')}</span></div><div class="detail-stat"><strong>${money(p.deposit)}</strong><span>${t('deposit')}</span></div><div class="detail-stat"><strong>${p.bedrooms}</strong><span>${t('bedrooms')}</span></div><div class="detail-stat"><strong>${p.bathrooms}</strong><span>${t('bathrooms')}</span></div></div><div class="detail-actions"><a class="button-solid" href="${showingUrl(p)}">${t('requestShowing')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a><a class="text-link" href="${DATA.applicationUrl}" target="_blank" rel="noopener noreferrer">${t('navApply')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div></div>
    <section class="gallery" id="gallery"><div class="gallery-heading"><span class="eyebrow section-label">${t('insideLabel')} / ${p.name.toUpperCase()}</span><span class="gallery-count" aria-live="polite">1 / ${DATA.images[p.imageKey].length}</span></div>
      <div class="gallery-main"><button class="gallery-open" aria-label="${t('openPhoto')}" data-open-gallery>${imageEl(image,p.name+' — '+t('photoLabel')+' 1','gallery-active')}<span>${t('openPhoto')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></button><div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="${t('previousPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><button type="button" data-gallery-step="1" aria-label="${t('nextPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></div>
      <p class="gallery-error" role="status" hidden>${t('galleryError')}</p>
      <div class="gallery-thumbs">${DATA.images[p.imageKey].map((src,i)=>`<button data-gallery-index="${i}" class="${i===0?'active':''}" aria-pressed="${i===0}" aria-label="${t('photoLabel')} ${i+1}">${imageEl(src,p.name+' — '+t('photoLabel')+' '+(i+1),'gallery-thumbnail')}</button>`).join('')}</div>
      <dialog class="lightbox" aria-label="${p.name} — ${t('photosLabel')}"><div class="lightbox-top"><span>${p.name}</span><button data-close-gallery autofocus aria-label="${t('closePhoto')}">×</button></div><div class="lightbox-image"><img alt=""><p class="gallery-error" hidden>${t('galleryError')}</p></div><div class="lightbox-bottom"><button data-gallery-step="-1" aria-label="${t('previousPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><span class="gallery-count" aria-live="polite"></span><button data-gallery-step="1" aria-label="${t('nextPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></dialog>
    </section>
    <section class="detail-body"><div class="reveal"><div class="eyebrow section-label">${t('aboutThis')}</div><h2>${localized(p,'label')}</h2></div><div class="detail-text reveal">${localized(p,'description').map(s=>`<p>${s}</p>`).join('')}</div></section>
    <section class="amenities"><div class="reveal"><div class="eyebrow section-label">${t('highlightsLabel')}</div><h2 class="display-title">${t('homeHighlights')}</h2><ul class="amenity-list">${localized(p,'features').map(f=>`<li>${f}</li>`).join('')}</ul></div><div class="reveal"><div class="eyebrow section-label">${t('termsHeading')}</div><h2 class="display-title">${money(p.rent)}<br><em>${t('perMonth')}</em></h2><ul class="amenity-list">${[`${t('deposit')}: ${money(p.deposit)}`,...localized(p,'terms')].map(f=>`<li>${f}</li>`).join('')}</ul><div class="terms-note">${t('termsDisclaimer')}<br><br><a href="${p.sourceUrl}" target="_blank" rel="noopener noreferrer">${t('sourceLabel')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div><a class="button-solid" style="margin-top:23px" href="${DATA.applicationUrl}" target="_blank" rel="noopener noreferrer">${t('navApply')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div></section>
    <section class="section"><div class="eyebrow section-label">${t('moreLabel')}</div><h2 class="display-title" style="margin-bottom:40px">${t('moreHomes')}</h2><div class="mini-cards">${more.map(x=>`<a href="#home/${x.slug}" class="mini-card">${imageEl(photo(x),x.name,'')}<span>${x.name} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a>`).join('')}</div></section>
    ${contactSection()}`;
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
    const count=app.querySelector('.listing-count');if(count)count.textContent=String(shown).padStart(2,'0')+' / '+t('homeCount');
  }
  function galleryStep(step) {
    const p=P.find(x=>'detail:'+x.slug===currentView);if(!p)return;
    const imgs=DATA.images[p.imageKey];currentGalleryIndex=(currentGalleryIndex+step+imgs.length)%imgs.length;
    const src=imageUrl(imgs[currentGalleryIndex],1500), alt=DATA.photoAlts?.[imgs[currentGalleryIndex]]||p.name+' — '+t('photoLabel')+' '+(currentGalleryIndex+1);
    app.querySelectorAll('.gallery-active, .lightbox[open] .lightbox-image img').forEach(img=>{img.removeAttribute('srcset');img.src=src;img.alt=alt;});
    app.querySelectorAll('.gallery-error').forEach(el=>el.hidden=true);
    app.querySelectorAll('.gallery-count').forEach(el=>el.textContent=(currentGalleryIndex+1)+' / '+imgs.length);
    app.querySelectorAll('[data-gallery-index]').forEach(b=>{const active=Number(b.dataset.galleryIndex)===currentGalleryIndex;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    const active=app.querySelector('[data-gallery-index="'+currentGalleryIndex+'"]');
    if(active)active.parentElement.scrollTo({left:active.offsetLeft-active.parentElement.offsetLeft,behavior:'instant'});
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
    let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{hash='';}
    const detailSlug=hash.startsWith('home/')?hash.substring(5):null;
    const p=detailSlug?P.find(x=>x.slug===detailSlug):null;
    const view=p?'detail:'+p.slug:'home';
    const shouldRender=(view!==currentView)||app.children.length===0||preservePosition;
    const oldScroll=window.scrollY;
    const readingSection=preservePosition?[...app.querySelectorAll(':scope > section, :scope > aside')].find(el=>el.getBoundingClientRect().bottom>110):null;
    const readingIndex=readingSection?[...app.children].indexOf(readingSection):-1;
    const readingTop=readingSection?.getBoundingClientRect().top;
    if(shouldRender){
      cleanupEffects();closeGallery();
      currentView=view;if(!preservePosition)currentGalleryIndex=0;
      app.innerHTML=p?detailPage(p):homePage();
      document.title=(p?p.name+' — ':'')+'Oaktown Rentals — '+t('heroKicker');
      observeSections();
      if(!p)activateFilter(selectedFilter);
      if(p&&preservePosition)galleryStep(0);
      cleanupEffects=window.OaktownEffects.mount(app,{t});
      if(p&&!preservePosition){const heading=app.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
    }
    if(preservePosition) {
      const section=app.children[readingIndex];
      window.scrollTo({top:section&&readingTop!==undefined?scrollY+section.getBoundingClientRect().top-readingTop:oldScroll,behavior:'instant'});
    } else if(p) {
      window.scrollTo({top:0,behavior:'instant'});
    } else if(hash==='discover') {
      requestAnimationFrame(()=>document.getElementById('about')?.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'}));
    } else if(hash && document.getElementById(hash)) {
      requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'}));
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
  }
  function onScroll() {
    const scroll=document.documentElement.scrollTop;
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    document.getElementById('progress').style.width=(Math.min(1,scroll/max)*100)+'%';
    header.classList.toggle('is-fixed',scroll>50);
  }
  menu.addEventListener('click',()=>{const isOpening=mobileNav.hidden;mobileNav.hidden=!isOpening;menu.setAttribute('aria-expanded',String(isOpening));menu.setAttribute('aria-label',t(isOpening?'closeMenu':'openMenu'));});
  mobileNav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
  langButton.addEventListener('click',()=>{language=language==='en'?'es':'en';try{localStorage.setItem('oaktown-language',language);}catch{}draw(true)});
  app.addEventListener('click',e=>{
    const layout=e.target.closest('[data-layout-button]');if(layout){activateLayout(layout.dataset.layoutButton);return;}
    const filter=e.target.closest('[data-filter]');if(filter){activateFilter(filter.dataset.filter);return;}
    const thumb=e.target.closest('[data-gallery-index]');if(thumb){const p=P.find(x=>'detail:'+x.slug===currentView);if(p)galleryStep(Number(thumb.dataset.galleryIndex)-currentGalleryIndex);return;}
    const step=e.target.closest('[data-gallery-step]');if(step)galleryStep(Number(step.dataset.galleryStep));
    if(e.target.closest('[data-open-gallery]')){app.querySelector('.lightbox').showModal();document.body.classList.add('gallery-is-open');galleryStep(0);}
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
  window.addEventListener('hashchange' ,()=>draw());
  window.addEventListener('scroll',onScroll,{passive:true});
  document.getElementById('year').textContent=new Date().getFullYear();
  draw();
})();
