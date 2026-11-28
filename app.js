/* Lightweight cinematic site: no frameworks, API keys, or build tools required. */
(async () => {
  'use strict';
  const DATA = window.OAKTOWN_DATA;
  const privatePreview = window.OaktownAdminPreview;
  if(privatePreview){if(!await privatePreview.load(DATA))return;}
  else await window.OaktownContent.load(DATA);
  const app = document.getElementById('app');
  const header = document.getElementById('site-header');
  const menu = document.getElementById('menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  const langButton = document.getElementById('language-switch');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const navigationMotion = () => reducedMotion.matches || document.documentElement.classList.contains('motion-off') ? 'instant' : 'smooth';
  const P = DATA.properties;
  const skyHeader = window.OaktownSkyHeader?.mount(header, app, P, DATA.applicationUrl);
  let language = privatePreview?.language==='es'?'es':'en';
  if(!privatePreview)try { if(localStorage.getItem('oaktown-language')==='es')language='es'; } catch {}
  let selectedFilter = 'All';
  let selectedBedrooms = '';
  let selectedBathrooms = '';
  let collectionLayout = 'gallery';
  try {if(localStorage.getItem('oaktown-layout')==='grid')collectionLayout='grid';} catch {}
  let currentView = null;
  let currentGalleryIndex = 0;
  let observer;
  let galleryPlayback;
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
  const pointerPreview = matchMedia('(min-width: 851px) and (hover: hover) and (pointer: fine)');
  let cardSlideshow = null;
  const words = {
    en: {
      resources:'Resources',neighborhood:'Neighborhood',anyNeighborhood:'All neighborhoods',any:'Any',searchHomes:'Search homes',resetFilters:'Reset filters',noMatches:'No homes match these filters. Try another combination or reset your search.',signatureTitle:'A place to<br>call <em>home.</em>',signatureCopy:'Rental homes in Louisville and the surrounding communities.',viewAllHomes:'View all homes',ourHomesTitle:'Our Homes',ourHomesCopy:'Explore our rental homes across Louisville. Find the space and neighborhood that fit your life.',brandPhoto:'Louisville, Kentucky',heroPhotos:'Featured home photography',afterglowPhoto:'8216 Afterglow Drive — brick home beneath mature trees',colonialPhoto:'115 Colonial Drive — white home and front lawn',storyCopy:'Local roots. A personal approach. Oaktown Rentals provides rental homes in Louisville and the surrounding counties.',vacationKicker:'A change of scenery',vacationCopy:'A waterfront escape in the Florida Keys. Discover the home, the pool and life by the water.',journeyLabel:'Renting, made simple',journeyTitle:'Your rental journey',journey1:'Find your home',journey1Copy:'Explore the collection. Ask our team about availability and arrange a showing.',journey2:'Apply online',journey2Copy:'Review the home’s requirements, then complete our online application.',journey3:'Make your move',journey3Copy:'Once approved, work with our team on your lease and next steps.',quickLinks:'Explore',connect:'Get in touch',storyMore:'More about Oaktown',backHome:'Back to home',minimum:'or more',
      cardFeatures:'Home features',beforeApplying:'Ask our team about availability and any application, pet or other charges before applying.',rentalDetails:'Rental details',homeCount:'homes',gridView:'Grid',galleryView:'Gallery',layoutLabel:'Property view',requestShowing:'Request a showing',availabilityNote:'Find a place you like? Text us with the address to ask about availability or a showing.',photoUnavailable:'Photos temporarily unavailable',skipContent:'Skip to content',primaryNav:'Primary navigation',mobileNav:'Mobile navigation',openMenu:'Open menu',closeMenu:'Close menu',switchLanguage:'Cambiar a español',homeLink:'Oaktown Rentals — home',applicationLabel:'Open rental application',footerNote:'Rental homes in Louisville, Kentucky',colonialInterior:'Interior at 115 Colonial Drive',cherokeeInterior:'Interior at 1106 Cherokee Road, unit 8',floridaAlt:'Lobster Nirvana in the Florida Keys',floridaShort:'A waterfront escape in the Florida Keys.',
      textUs:'Text us',motionOn:'Motion on',motionOff:'Motion off',motionLabel:'Enable visual motion',sceneOne:'The beginning',sceneTwo:'The everyday',sceneThree:'The next chapter',sceneTwoTitle:'Room for <em>your life.</em>',sceneThreeTitle:'Make yourself <em>at home.</em>',sceneTwoCopy:'A little more space. A rhythm of your own.',sceneThreeCopy:'Find your place in Louisville. We’ll help with the next step.',heroCaption:'A closer look at 115 Colonial Drive',browseHint:'Explore the collection',previousHome:'Previous home',nextHome:'Next home',filterLabel:'Filter homes by neighborhood',openPhoto:'Enlarge photo',closePhoto:'Close gallery',previousPhoto:'Previous photo',nextPhoto:'Next photo',photoLabel:'Photo',photosLabel:'Photos',insideLabel:'A LOOK INSIDE',highlightsLabel:'THE HIGHLIGHTS',moreLabel:'EXPLORE MORE',sourceLabel:'Full listing details',galleryError:'This photo could not load. Try another photo or contact us for the full gallery.',
      navHomes:'Our Homes',navStory:'Our Story',navFaq:'FAQ',navCommunity:'Community',navApply:'Apply online',contact:'Contact',textBest:'Text us for availability and showings.',footerTitle:'Your next chapter starts here.',
      heroKicker:'Quality rental homes in Louisville, KY',heroOne:'Find your',heroTwo:'place.',heroTagline:'Homes with character. A local team to help you find yours.',explore:'Explore homes',scroll:'Scroll to explore',
      homesLabel:'01 / FIND A HOME',homesHeading:'Find a home that fits.',homesDesc:'Compare homes, neighborhoods and rental details.',
      all:'All',stMatthews:'St. Matthews',highlands:'Highlands & Cherokee Triangle',okolona:'Okolona',listings:'Homes in our collection',perMonth:'/ month',beds:'beds',baths:'bath',availability:'Request a Tour',
      cityPhotoAlt:'Aerial view of downtown Louisville and the Ohio River',cityPhotoCaption:'Louisville, Kentucky · On the Ohio River',photoCredit:'Photo:',aboutLabel:'02 / WHO WE ARE',aboutHeading:'Rooted in Louisville.',aboutLead:'A local perspective. A love for our city. Homes that feel like home.',aboutText:'Oaktown Rentals provides quality rental housing in Louisville, Kentucky and nearby counties. We manage homes across the city, with a particular focus on Southern and Southeastern Jefferson County. We believe finding a home should feel personal, not complicated.',aboutLink:'Get in touch',
      floridaLabel:'Our sister vacation property',floridaLink:'Visit Lobster Nirvana',
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
      resources:'Recursos',neighborhood:'Vecindario',anyNeighborhood:'Todos los vecindarios',any:'Cualquiera',searchHomes:'Buscar viviendas',resetFilters:'Restablecer filtros',noMatches:'Ninguna vivienda coincide con estos filtros. Prueba otra combinación o restablece la búsqueda.',signatureTitle:'Un lugar al que<br>llamar <em>hogar.</em>',signatureCopy:'Viviendas de alquiler en Louisville y las comunidades cercanas.',viewAllHomes:'Ver todas las viviendas',ourHomesTitle:'Nuestras viviendas',ourHomesCopy:'Explora nuestras viviendas de alquiler en Louisville. Encuentra el espacio y el vecindario para ti.',brandPhoto:'Louisville, Kentucky',heroPhotos:'Fotografías de viviendas destacadas',afterglowPhoto:'8216 Afterglow Drive — casa de ladrillo entre árboles',colonialPhoto:'115 Colonial Drive — casa blanca con jardín delantero',storyCopy:'Raíces locales. Un trato personal. Oaktown Rentals ofrece viviendas de alquiler en Louisville y los condados cercanos.',vacationKicker:'Un cambio de paisaje',vacationCopy:'Una escapada junto al agua en los Cayos de Florida. Descubre la casa, la piscina y la vida junto al mar.',journeyLabel:'Alquilar, paso a paso',journeyTitle:'El camino a tu hogar',journey1:'Encuentra tu hogar',journey1Copy:'Explora las viviendas. Consulta la disponibilidad con nuestro equipo y programa una visita.',journey2:'Solicita en línea',journey2Copy:'Consulta los requisitos de la vivienda y completa nuestra solicitud en línea.',journey3:'Prepara tu mudanza',journey3Copy:'Una vez aprobada tu solicitud, coordina el contrato y los siguientes pasos con nuestro equipo.',quickLinks:'Explora',connect:'Contáctanos',storyMore:'Más sobre Oaktown',backHome:'Volver al inicio',minimum:'o más',
      cardFeatures:'Características de la vivienda',beforeApplying:'Antes de solicitar, consulta al equipo sobre disponibilidad y cargos de solicitud, mascotas u otros conceptos.',rentalDetails:'Detalles del alquiler',homeCount:'viviendas',gridView:'Cuadrícula',galleryView:'Galería',layoutLabel:'Vista de viviendas',requestShowing:'Solicitar una visita',availabilityNote:'¿Te interesa una vivienda? Escríbenos con la dirección para consultar disponibilidad o programar una visita.',photoUnavailable:'Fotos temporalmente no disponibles',skipContent:'Saltar al contenido',primaryNav:'Navegación principal',mobileNav:'Navegación móvil',openMenu:'Abrir menú',closeMenu:'Cerrar menú',switchLanguage:'Switch to English',homeLink:'Oaktown Rentals — inicio',applicationLabel:'Abrir solicitud de alquiler',footerNote:'Viviendas de alquiler en Louisville, Kentucky',colonialInterior:'Interior de 115 Colonial Drive',cherokeeInterior:'Interior de 1106 Cherokee Road, unidad 8',floridaAlt:'Lobster Nirvana en los Cayos de Florida',floridaShort:'Una escapada junto al agua en los Cayos de Florida.',
      textUs:'Escríbenos',motionOn:'Animación sí',motionOff:'Animación no',motionLabel:'Activar animaciones',sceneOne:'El comienzo',sceneTwo:'El día a día',sceneThree:'La nueva etapa',sceneTwoTitle:'Espacio para <em>tu vida.</em>',sceneThreeTitle:'Siéntete <em>en casa.</em>',sceneTwoCopy:'Un poco más de espacio. Tu propio ritmo.',sceneThreeCopy:'Encuentra tu hogar en Louisville. Te ayudamos a dar el siguiente paso.',heroCaption:'Descubre 115 Colonial Drive',browseHint:'Explora las viviendas',previousHome:'Vivienda anterior',nextHome:'Siguiente vivienda',filterLabel:'Filtrar viviendas por vecindario',openPhoto:'Ampliar foto',closePhoto:'Cerrar galería',previousPhoto:'Foto anterior',nextPhoto:'Siguiente foto',photoLabel:'Foto',photosLabel:'Fotos',insideLabel:'UNA MIRADA AL INTERIOR',highlightsLabel:'LOS DETALLES',moreLabel:'EXPLORA MÁS',sourceLabel:'Detalles completos del anuncio',galleryError:'No se pudo cargar esta foto. Prueba otra o contáctanos para ver la galería completa.',
      navHomes:'Viviendas',navStory:'Nuestra historia',navFaq:'Preguntas',navCommunity:'Comunidad',navApply:'Solicitar ahora',contact:'Contacto',textBest:'Escríbenos para consultar disponibilidad o programar una visita.',footerTitle:'Tu próximo capítulo comienza aquí.',
      heroKicker:'Viviendas de alquiler en Louisville, KY',heroOne:'Encuentra tu',heroTwo:'hogar.',heroTagline:'Viviendas con carácter. Un equipo local para ayudarte a encontrar la tuya.',explore:'Explorar viviendas',scroll:'Desliza para explorar',
      homesLabel:'01 / ENCUENTRA TU HOGAR',homesHeading:'Un hogar a tu medida.',homesDesc:'Compara viviendas, vecindarios y condiciones de alquiler.',
      all:'Todas',stMatthews:'St. Matthews',highlands:'Highlands y Cherokee Triangle',okolona:'Okolona',listings:'Viviendas en nuestra colección',perMonth:'/ mes',beds:'hab.',baths:'baño',availability:'Solicitar una visita',
      cityPhotoAlt:'Vista aérea del centro de Louisville y el río Ohio',cityPhotoCaption:'Louisville, Kentucky · Junto al río Ohio',photoCredit:'Foto:',aboutLabel:'02 / QUIÉNES SOMOS',aboutHeading:'Arraigados en Louisville.',aboutLead:'Perspectiva local. Amor por nuestra ciudad. Hogares acogedores.',aboutText:'Oaktown Rentals ofrece viviendas de alquiler de calidad en Louisville, Kentucky y los condados cercanos. Gestionamos hogares por toda la ciudad, especialmente en el sur y sureste del condado de Jefferson.',aboutLink:'Contáctanos',
      floridaLabel:'Nuestra propiedad vacacional hermana',floridaLink:'Visita Lobster Nirvana',
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
  Object.assign(words.en, {
    cinematicConnection:'Well-cared-for homes across Greater Louisville.',
    cinematicDiscovery:'Explore our homes.', browseHomes:'Browse Our Homes', howToApply:'How to Apply',
    browseAllHomes:'Browse All Homes', applyNow:'Apply Now',
    scrollExplore:'Scroll to explore', heroScenes:'Explore the three scenes',
    sceneWelcome:'Welcome', sceneConnection:'Connection', sceneDiscovery:'Discovery',
    afterglowReview:'AI-assisted design preview of 8216 Afterglow Drive'
  });
  Object.assign(words.es, {
    cinematicConnection:'Viviendas bien cuidadas en el área metropolitana de Louisville.',
    cinematicDiscovery:'Explora nuestras viviendas.', browseHomes:'Ver nuestras viviendas', howToApply:'Cómo solicitar',
    browseAllHomes:'Ver todas las viviendas', applyNow:'Solicitar ahora',
    scrollExplore:'Desliza para explorar', heroScenes:'Explora las tres escenas',
    sceneWelcome:'Bienvenida', sceneConnection:'Conexión', sceneDiscovery:'Descubre',
    afterglowReview:'Vista previa de diseño de 8216 Afterglow Drive con asistencia de IA'
  });
  const t = (key) => words[language][key] || words.en[key] || key;
  const money = n => window.OaktownCards.formatMoney(n,language);
  const localized = (p,key) => language==='es' && p[key+'Es']?.length ? p[key+'Es'] : p[key];
  const photo = (p, idx=0) => window.OaktownCards.gallery(DATA,p)[idx] || window.OaktownCards.gallery(DATA,p)[0];
  const imageUrl = window.OaktownCards.imageUrl;
  const imageEl = (src, alt, className, extra='') => {
    if(!src)return '';
    if(alt && DATA.photoAlts?.[src])alt=DATA.photoAlts[src];
    const thumbnail=className==='gallery-thumbnail';
    const widths=thumbnail?[100,300,500]:[500,1000,1500,2500];
    const sizes=thumbnail?'(max-width: 600px) 95px, 140px':className==='story-photo'
      ?'100vw'
      :className==='detail-cover-photo'?'(max-width: 850px) calc(100vw - 44px), (max-width: 1328px) calc((100vw - 96px) * .45), 554px'
      :className==='property-image'?'auto, (max-width: 600px) calc(100vw - 44px), (max-width: 850px) 70vw, 38vw':'auto, (max-width: 1328px) calc(100vw - 48px), 1280px';
    const responsive=window.OaktownCards.isSquarespacePhoto(src)?`srcset="${widths.map(w=>imageUrl(src,w)+' '+w+'w').join(', ')}" sizes="${sizes}"`:'';
    return `<img class="${className}" src="${imageUrl(src,thumbnail?300:1200)}" ${responsive} alt="${alt}" loading="${extra==='eager'?'eager':'lazy'}" decoding="async" ${extra==='eager'?'fetchpriority="high"':''}>`;

  };
  // Use the verified property-specific showing fallback until a public Zillow rental is confirmed.
  const inquiryUrl = p => showingUrl(p);
  const showingUrl = p => 'sms:+15025001070?body='+encodeURIComponent((p.contactOnly?(language==='es'?'Hola, quisiera recibir novedades sobre ':'Hi, I’d like updates about '):(language==='es'?'Hola, quisiera programar una visita a ':'Hi, I’d like to request a showing at '))+p.name+'.');
  const sectionHeading = (label, title, desc='') => `<div class="section-heading reveal"><div><div class="eyebrow section-label">${label}</div><h2 class="display-title">${title}</h2></div>${desc?`<p class="heading-note">${desc}</p>`:''}</div>`;
  function availabilityLabel(p) {
    return window.OaktownCards.availabilityLabel(p,language);
  }
  const availabilityBadge = p => availabilityLabel(p)?`<span class="availability-badge">${availabilityLabel(p)}</span>`:'';
  const cards = window.OaktownCards.create({data:DATA,getLanguage:()=>language,t,localized,imageEl,inquiryUrl});
  const card = (p,index) => cards.render(p,index,P.length);
  function faqSection() {
    return `<section id="faq" class="section faq-section">${sectionHeading(t('faqLabel'),t('faqHeading'),t('faqDesc'))}<div class="faq-list">${[1,2,3,4,5].map(i=>`<details class="faq-item reveal"><summary>${t('faq'+i+'q')}</summary><div class="faq-answer">${t('faq'+i+'a')}</div></details>`).join('')}</div></section>`;
  }
  function contactSection() {
    return `<section id="contact" class="contact-panel"><div class="reveal"><span class="eyebrow section-label">${t('contactLabel')}</span><h2>${t('contactHeading')}</h2><p>${t('contactDesc')}</p></div><div class="contact-actions reveal"><a href="sms:+15025001070">${t('textBest')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a href="tel:+15025001070">${DATA.phoneDisplay} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a href="mailto:${DATA.email}">${DATA.email}<span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><p>${DATA.mailingAddress}</p></div></section>`;
  }
  const arrow = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
  function storySection() {
    return `<section class="signature-hero cinematic-hero" id="top" aria-labelledby="signature-title">
      <div class="cinematic-stage">
        <div class="signature-images"><img class="cinematic-photo" src="/assets/signature/afterglow-review-1672.webp" srcset="/assets/signature/afterglow-review-480.webp 480w, /assets/signature/afterglow-review-768.webp 768w, /assets/signature/afterglow-review-1200.webp 1200w, /assets/signature/afterglow-review-1672.webp 1672w" sizes="100vw" width="1672" height="941" alt="${t('afterglowReview')}" fetchpriority="high" decoding="async"></div>
        <div class="signature-shade" aria-hidden="true"></div>
        <div class="cinematic-copy">
          <div class="signature-copy cinematic-scene is-active" data-hero-scene="0">
            <h1 id="signature-title">${t('signatureTitle')}</h1><span class="cinematic-underline" aria-hidden="true"></span>
            <p class="cinematic-mobile-description">${t('cinematicConnection')}</p>
            <div class="cinematic-actions hero-opening-actions">
              <a class="signature-button ivory" href="#homes">${t('browseHomes')}${arrow}</a>
              <a class="signature-button cinematic-secondary" href="${DATA.applicationUrl}" target="_blank" rel="noopener noreferrer">${t('applyNow')}</a>
            </div>
          </div>
          <div class="signature-copy cinematic-scene" data-hero-scene="1" aria-hidden="true" inert>
            <h2>${t('cinematicConnection')}</h2><span class="cinematic-underline" aria-hidden="true"></span>
          </div>
          <div class="signature-copy cinematic-scene" data-hero-scene="2" aria-hidden="true" inert>
            <h2>${t('cinematicDiscovery')}</h2><span class="cinematic-underline" aria-hidden="true"></span>
            <div class="cinematic-actions"><a class="signature-button ivory" href="#homes">${t('browseHomes')}${arrow}</a><a class="signature-button cinematic-secondary" href="#faq">${t('howToApply')}</a></div>
          </div>
        </div>
        <div class="cinematic-progress" role="group" aria-label="${t('heroScenes')}">${['sceneWelcome','sceneConnection','sceneDiscovery'].map((key,index)=>`<button type="button" data-hero-scene-button="${index}" aria-label="${t(key)}" aria-pressed="${index===0}"><span></span></button>`).join('')}</div>
        <a class="cinematic-scroll" href="#home-search"><span>${t('scrollExplore')}</span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg></a>
        <div class="cinematic-exit" aria-hidden="true"></div>
      </div>
    </section>`;
  }
  function searchPanel() {
    const options=key=>[...new Set(P.map(p=>p[key]).filter(n=>Number.isFinite(n)))].sort((a,b)=>a-b).map(n=>`<option value="${n}" ${(key==='bedrooms'?selectedBedrooms:selectedBathrooms)===String(n)?'selected':''}>${n}+ ${t(key)}</option>`).join('');
    return `<form class="signature-search" id="home-search" aria-label="${t('searchHomes')}"><div class="search-fields"><label><span>${t('neighborhood')}</span><select name="neighborhood"><option value="All">${t('anyNeighborhood')}</option>${[...new Set(P.map(p=>p.neighborhood))].map(n=>`<option value="${n}" ${n===selectedFilter?'selected':''}>${n}</option>`).join('')}</select></label><label><span>${t('bedrooms')}</span><select name="bedrooms"><option value="">${t('any')}</option>${options('bedrooms')}</select></label><label><span>${t('bathrooms')}</span><select name="bathrooms"><option value="">${t('any')}</option>${options('bathrooms')}</select></label></div><div class="search-actions"><button class="signature-button" type="submit"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg>${t('searchHomes')}</button><button class="reset-filters" type="reset">${t('resetFilters')}</button></div></form>`;
  }
  function communitySection() { return `<section class="section community-section" id="community"><div class="reveal"><div class="eyebrow section-label">${t('communityLabel')}</div><h2 class="display-title">${t('communityHeading')}</h2><p class="community-intro">${t('communityText')}</p></div><div class="community-resources reveal"><a class="resource-link" href="https://www.jefferson.kyschools.us/" target="_blank" rel="noopener noreferrer">${t('communityRes1')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://louisvilleky.gov/" target="_blank" rel="noopener noreferrer">${t('communityRes2')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://www.gotolouisville.com/" target="_blank" rel="noopener noreferrer">${t('communityRes3')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://www.lfpl.org/" target="_blank" rel="noopener noreferrer">${t('communityRes4')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a></div></section>`; }
  function resourcePage(section) {
    return `<div class="resource-intro"><a class="back-link" href="#">${arrow} ${t('backHome')}</a><h1>${t(section==='faq'?'navFaq':section==='community'?'navCommunity':'contact')}</h1></div>${section==='faq'?faqSection():section==='community'?communitySection():contactSection()}`;
  }
  function homePage() {
    return `${storySection()}${searchPanel()}
    <section class="section collection signature-collection" id="homes" data-layout="${collectionLayout}" aria-labelledby="homes-title">
      <div class="collection-intro reveal"><span class="eyebrow">Oaktown Rentals</span><h2 id="homes-title">${t('ourHomesTitle')}</h2><p>${t('ourHomesCopy')}</p><p class="collection-availability">${t('availabilityNote')}</p></div>
      <div class="collection-results"><div class="listing-tools"><span class="listing-count" role="status" aria-live="polite">${P.length} ${t('homeCount')}</span><div class="collection-view-switch" role="group" aria-label="${t('layoutLabel')}">${['gallery','grid'].map(layout=>`<button type="button" data-layout-button="${layout}" aria-pressed="${collectionLayout===layout}">${t(layout==='grid'?'gridView':'galleryView')}</button>`).join('')}</div></div>
      ${!P.length?`<p class="collection-empty">${language==='es'?(DATA.contentUnavailable?'No podemos cargar las viviendas en este momento. Contáctanos para consultar disponibilidad.':'No hay viviendas publicadas en este momento. Contáctanos para consultar disponibilidad.'):(DATA.contentUnavailable?'We cannot load the homes right now. Contact us for current availability.':'There are no published homes right now. Contact us for current availability.')}</p>`:''}
      <p class="search-empty" role="status" hidden>${t('noMatches')}</p>
      <div class="collection-viewport" id="collection-viewport" ${collectionLayout==='gallery'?'tabindex="0"':''} role="region" aria-label="${t('listings')}"><div class="property-grid" id="property-grid">${P.map(card).join('')}</div></div>
      <div class="collection-bottom"><span>${t('browseHint')}</span><div class="collection-meter" aria-hidden="true"><span></span></div><div class="collection-controls"><button data-collection-step="-1" aria-label="${t('previousHome')}">${arrow}</button><button data-collection-step="1" aria-label="${t('nextHome')}">${arrow}</button></div></div></div>
    </section>
    <section class="signature-story" id="about" aria-labelledby="about-title"><img class="signature-panorama" src="/assets/louisville/louisville-ohio-river.jpg" width="1920" height="1080" alt="${t('cityPhotoAlt')}" loading="lazy" decoding="async"><div class="panorama-shade" aria-hidden="true"></div><div class="panorama-copy reveal"><span class="eyebrow">${t('navStory')}</span><h2 id="about-title">${t('aboutHeading')}</h2><p>${t('storyCopy')}</p><details class="story-more"><summary>${t('storyMore')} <span aria-hidden="true">+</span></summary><p>${t('aboutText')}</p><a class="text-link" href="#contact">${t('aboutLink')} ${arrow}</a></details></div><div class="signature-credit">${t('photoCredit')} <a href="https://commons.wikimedia.org/wiki/File:Louisville_from_Ohio_River_September_2026_002.jpg" target="_blank" rel="noopener noreferrer">King of Hearts</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a></div></section>
    <aside class="signature-vacation" id="cudejoe" aria-labelledby="vacation-title"><img class="signature-panorama" src="/assets/mint-mojo/house-pool.jpg" width="1440" height="960" alt="${t('floridaAlt')}" loading="lazy" decoding="async"><div class="panorama-shade" aria-hidden="true"></div><div class="panorama-copy reveal"><span class="eyebrow">${t('vacationKicker')}</span><h2 id="vacation-title">Lobster Nirvana</h2><span class="vacation-place">${language==='es'?'Cayos de Florida':'Florida Keys'}</span><p>${t('vacationCopy')}</p><a class="signature-button ivory" href="/mint-mojo/">${t('floridaLink')}${arrow}</a></div></aside>
    <section class="signature-journey" aria-labelledby="journey-title"><div class="reveal"><span class="eyebrow">${t('journeyLabel')}</span><h2 id="journey-title">${t('journeyTitle')}</h2></div><ol>${[1,2,3].map(i=>`<li class="reveal"><span class="journey-number" aria-hidden="true">0${i}</span><div><h3>${t('journey'+i)}</h3><p>${t('journey'+i+'Copy')}</p></div></li>`).join('')}</ol></section>`;
  }
  function detailPage(p, startPhoto=0) {
    const image = photo(p,startPhoto);
    const known = n=>typeof n==='number'&&Number.isFinite(n);
    const action=p.contactOnly?(language==='es'?'Consultar novedades':'Ask for updates'):t('requestShowing');
    const cardAction=p.contactOnly?action:t('availability');
    const price=p.hideRent?'':money(p.rent);
    const period=!p.hideRent&&known(p.rent)?t('perMonth'):'';
    const applyLink=(className,icon='')=>p.contactOnly?'':`<a class="${className}" href="${DATA.applicationUrl}" target="_blank" rel="noopener noreferrer">${t('navApply')}${icon}</a>`;
    const stat=(value,label)=>`<div class="detail-stat"><strong>${value}</strong><span>${label}</span></div>`;
    const more = P.filter(x=>x.slug!==p.slug).slice(0,2);
    return `<section class="page-intro has-image"><div class="listing-intro-copy">
      <a class="back-link" href="#homes"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg> ${t('detailBack')}</a><span class="eyebrow section-label">${p.neighborhood} / ${p.city}</span><h1>${p.name.replace(' · ', '<br>')}</h1><p class="intro-sub">${localized(p,'summary')}</p><p class="listing-availability">${availabilityBadge(p)}<a href="${inquiryUrl(p)}" aria-label="${cardAction}: ${p.name}">${cardAction}</a></p></div>${image?`<button type="button" class="detail-cover" data-cover-gallery ${image?'':'disabled'} data-photo-error="${t('photoUnavailable')}" aria-label="${image?t('openPhoto'):t('photoUnavailable')}: ${p.name}">${imageEl(image,p.name+' — '+t('photoLabel')+' '+(startPhoto+1),'detail-cover-photo','eager')}<span>${DATA.images[p.imageKey].length} ${t('photosLabel')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/></svg></span></button>`:`<div class="detail-cover listing-photo-pending" role="img" aria-label="${t('photoUnavailable')}"><span>${t('photoUnavailable')}</span></div>`}</section>
    <div class="listing-dock" hidden role="region" aria-label="${t('rentalDetails')}: ${p.name}"><div class="dock-property"><span class="dock-address" title="${p.name}">${p.name}</span><span><strong>${price||availabilityLabel(p)}</strong> ${period} <span class="dock-specs">${window.OaktownCards.specifications(p,language,t).map(s=>' / '+s).join('')}</span></span></div><div class="dock-actions"><a class="button-solid" href="${showingUrl(p)}">${action}</a>${applyLink('text-link')}</div></div>
    <div class="details-bar"><div class="detail-stats">${p.hideRent?stat(availabilityLabel(p),language==='es'?'Disponibilidad':'Availability'):stat(price,t('rent'))+stat(money(p.deposit),t('deposit'))}${known(p.bedrooms)?stat(p.bedrooms,t('bedrooms')):''}${known(p.bathrooms)?stat(p.bathrooms,t('bathrooms')):''}</div>${p.contactOnly?'':`<p class="application-guidance">${t('beforeApplying')}</p>`}<div class="detail-actions"><a class="button-solid" href="${showingUrl(p)}">${action} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a>${applyLink('text-link',' '+arrow)}</div></div>
    ${image?`<section class="gallery" id="gallery"><div class="gallery-heading"><span class="eyebrow section-label">${t('insideLabel')} / ${p.name.toUpperCase()}</span><span class="gallery-count" aria-live="polite">${DATA.images[p.imageKey].length?1:0} / ${DATA.images[p.imageKey].length}</span></div>
      <div class="gallery-main"><button class="gallery-open" aria-label="${t('openPhoto')}" data-open-gallery>${imageEl(image,p.name+' — '+t('photoLabel')+' 1','gallery-active')}<span>${t('openPhoto')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></button><div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="${t('previousPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><button type="button" data-gallery-step="1" aria-label="${t('nextPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></div>
      <p class="gallery-error" role="status" hidden>${t('galleryError')}</p>
      <div class="photo-playback"><button type="button" data-playback hidden></button><div class="gallery-thumbs">${DATA.images[p.imageKey].map((src,i)=>`<button data-gallery-index="${i}" class="${i===0?'active':''}" aria-pressed="${i===0}" aria-label="${t('photoLabel')} ${i+1}">${imageEl(src,p.name+' — '+t('photoLabel')+' '+(i+1),'gallery-thumbnail')}<span class="photo-track" aria-hidden="true"><i class="photo-fill"></i></span></button>`).join('')}</div></div>
      <dialog class="lightbox" aria-label="${p.name} — ${t('photosLabel')}"><div class="lightbox-top"><span>${p.name}</span><button data-close-gallery autofocus aria-label="${t('closePhoto')}">×</button></div><div class="lightbox-image"><img alt=""><p class="gallery-error" hidden>${t('galleryError')}</p></div><div class="lightbox-bottom"><button data-gallery-step="-1" aria-label="${t('previousPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><span class="gallery-count" aria-live="polite"></span><button data-gallery-step="1" aria-label="${t('nextPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></dialog>
    </section>`:''}
    <section class="detail-body"><div class="reveal"><div class="eyebrow section-label">${t('aboutThis')}</div><h2>${localized(p,'label')}</h2></div><div class="detail-text reveal">${localized(p,'description').map(s=>`<p>${s}</p>`).join('')}</div></section>
    <section class="amenities"><div class="reveal"><div class="eyebrow section-label">${t('highlightsLabel')}</div><h2 class="display-title">${t('homeHighlights')}</h2><ul class="amenity-list">${localized(p,'features').map(f=>`<li>${f}</li>`).join('')}</ul></div><div class="reveal"><div class="eyebrow section-label">${t('termsHeading')}</div><h2 class="display-title">${price||availabilityLabel(p)}${period?'<br>'+period:''}</h2><ul class="amenity-list">${[...(p.hideRent?[]:[`${t('deposit')}: ${money(p.deposit)}`]),...localized(p,'terms')].map(f=>`<li>${f}</li>`).join('')}</ul><div class="terms-note">${p.contactOnly?'':t('termsDisclaimer')+'<br><br>'}<a href="${p.sourceUrl}" target="_blank" rel="noopener noreferrer">${p.contactOnly?(language==='es'?'Ficha histórica de la propiedad':'Historical property profile'):t('sourceLabel')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div>${p.contactOnly?'':`<div style="margin-top:23px">${applyLink('button-solid',' '+arrow)}</div>`}</div></section>
    <section class="section"><div class="eyebrow section-label">${t('moreLabel')}</div><h2 class="display-title" style="margin-bottom:40px">${t('moreHomes')}</h2><div class="mini-cards">${more.map(x=>`<a href="#home/${x.slug}" class="mini-card">${imageEl(photo(x),x.name,'')}<span>${x.name} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a>`).join('')}</div></section>
    ${contactSection()}`;
  }
  function syncCardPhotoControls(card,index) {
    const p=P.find(p=>p.slug===card.dataset.propertySlug),count=window.OaktownCards.gallery(DATA,p||{}).length;
    const dots=[...card.querySelectorAll('[data-card-photo-index]')];
    const focused=dots.includes(document.activeElement);
    const start=Math.max(0,Math.min(index-2,count-dots.length));
    dots.forEach((button,i)=>{button.dataset.cardPhotoIndex=String(start+i);button.setAttribute('aria-label',t('photoLabel')+' '+(start+i+1));button.setAttribute('aria-pressed',String(start+i===index));});
    if(focused)dots.find(button=>Number(button.dataset.cardPhotoIndex)===index)?.focus({preventScroll:true});
  }
  function confirmAction(element) {
    if(!element||reducedMotion.matches||document.documentElement.classList.contains('motion-off'))return;
    element.classList.remove('ux-confirm');void element.offsetWidth;element.classList.add('ux-confirm');
    element.addEventListener('animationend',()=>element.classList.remove('ux-confirm'),{once:true});
  }
  async function selectCardPhoto(card,index) {
    const p=P.find(p=>p.slug===card.dataset.propertySlug),images=window.OaktownCards.gallery(DATA,p||{});
    if(!images.length)return;
    index=(index+images.length)%images.length;
    stopCardSlideshow(false);card.dataset.manualPhoto='true';
    const generation=(Number(card.dataset.photoRequest)||0)+1;card.dataset.photoRequest=String(generation);card.dataset.pendingPhotoIndex=String(index);
    const media=card.querySelector('.card-media'),status=card.querySelector('[data-card-photo-status]');
    media.setAttribute('aria-busy','true');
    const img=new Image();img.className='property-image property-preview';img.alt='';img.setAttribute('aria-hidden','true');img.decoding='async';img.src=imageUrl(images[index],1200);
    let deadline;
    const loaded=await Promise.race([img.decode().then(()=>true,()=>false),new Promise(resolve=>{deadline=setTimeout(()=>resolve(false),5000);})]);
    clearTimeout(deadline);
    if(!card.isConnected||Number(card.dataset.photoRequest)!==generation){img.removeAttribute('src');return;}
    media.removeAttribute('aria-busy');delete card.dataset.pendingPhotoIndex;
    if(!loaded){img.removeAttribute('src');status.textContent=t('galleryError');return;}
    const previousPhotos=[...card.querySelectorAll('.property-preview')];
    // Keep the last visible photo underneath until the new one has faded in.
    // Only the selected image carries is-current, including during rapid clicks.
    previousPhotos.forEach(previous=>{previous.style.opacity='1';previous.classList.remove('is-current');});
    card.querySelector('.property-image-wrap').append(img);
    const animate=!reducedMotion.matches&&!document.documentElement.classList.contains('motion-off');
    if(animate)void img.offsetWidth;
    img.classList.add('is-current');
    card.dataset.selectedPhoto=String(index);card.classList.toggle('is-previewing',index!==0);
    const retire=()=>previousPhotos.forEach(previous=>previous.remove());
    if(animate)setTimeout(retire,320);else retire();
    syncCardPhotoControls(card,index);status.textContent=t('photoLabel')+' '+(index+1)+' / '+images.length;
    confirmAction(card.querySelector(`[data-card-photo-index="${index}"]`));
  }
  function cardSlideshowEnabled() {
    return pointerPreview.matches&&!reducedMotion.matches&&!document.documentElement.classList.contains('motion-off')&&!document.hidden;
  }
  function stopCardSlideshow(reset=true) {
    const state=cardSlideshow;if(!state)return;
    cardSlideshow=null;
    clearTimeout(state.timer);clearTimeout(state.deadline);
    state.cleanup.forEach(clearTimeout);
    state.pending?.removeAttribute('src');
    if(reset){
      state.card.classList.remove('is-previewing');state.card.dataset.selectedPhoto='0';
      state.card.querySelectorAll('.property-preview').forEach(img=>img.remove());syncCardPhotoControls(state.card,0);
    }
  }
  function startCardSlideshow(card) {
    if(!cardSlideshowEnabled()||cardSlideshow?.card===card||card?.dataset.manualPhoto)return;
    stopCardSlideshow();
    const property=P.find(p=>p.slug===card?.dataset.propertySlug);
    const images=property?DATA.images[property.imageKey]:[];
    if(!card||card.hidden||images.length<2)return;
    const state={card,cursor:0,timer:0,deadline:0,pending:null,cleanup:new Set(),failed:new Set()};
    cardSlideshow=state;
    const current=()=>cardSlideshow===state&&card.isConnected&&!card.hidden&&cardSlideshowEnabled();
    const schedule=delay=>{state.timer=setTimeout(advance,delay);};
    const retireOld=()=>{
      const old=[...card.querySelectorAll('.property-preview:not(.is-current)')];
      if(!old.length)return;
      const timer=setTimeout(()=>{old.forEach(img=>img.remove());state.cleanup.delete(timer);},350);
      state.cleanup.add(timer);
    };
    async function advance() {
      if(!current()){if(cardSlideshow===state)stopCardSlideshow();return;}
      let index=(state.cursor+1)%images.length;
      while(state.failed.has(index))index=(index+1)%images.length;
      state.cursor=index;
      if(index===0){
        card.querySelectorAll('.property-preview').forEach(img=>img.classList.remove('is-current'));
        card.classList.remove('is-previewing');card.dataset.selectedPhoto='0';
        syncCardPhotoControls(card,0);retireOld();schedule(1500);return;
      }
      const img=new Image();state.pending=img;
      img.className='property-image property-preview';img.alt='';img.setAttribute('aria-hidden','true');img.decoding='async';
      img.src=imageUrl(images[index],1200);
      const loaded=await Promise.race([
        img.decode().then(()=>true,()=>false),
        new Promise(resolve=>{state.deadline=setTimeout(()=>resolve(false),5000);})
      ]);
      clearTimeout(state.deadline);
      if(!current()){img.remove();return;}
      state.pending=null;
      if(!loaded){
        img.removeAttribute('src');state.failed.add(index);
        if(state.failed.size===images.length-1){stopCardSlideshow();return;}
        schedule(1500);return;
      }
      card.querySelectorAll('.property-preview').forEach(previous=>previous.classList.remove('is-current'));
      img.classList.add('is-current');card.querySelector('.property-image-wrap').append(img);
      card.classList.add('is-previewing');card.dataset.selectedPhoto=String(index);syncCardPhotoControls(card,index);
      img.animate?.([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'});
      retireOld();schedule(1500);
    }
    schedule(650);
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
    const value={version:1,route:location.hash,view:currentView,y:scrollY,filter:selectedFilter,bedrooms:selectedBedrooms,bathrooms:selectedBathrooms,layout:collectionLayout,x:viewport?.scrollLeft||0,galleryIndex:currentGalleryIndex,
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
        viewport.scrollTo({left:snapshot.x,behavior:'instant'});viewport.dispatchEvent(new Event('scroll'));
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
      card?.querySelector(snapshot.focus.kind==='name'?'.property-name a':snapshot.focus.kind==='detail'?'.card-detail-link':'.property-image-wrap')?.focus({preventScroll:true});
    }
    requestAnimationFrame(()=>{if(generation!==positionGeneration)return;apply();restoringPosition=false;rememberView();});
    document.fonts.ready.then(()=>{if(generation===positionGeneration){apply();rememberView();}});
  }
  function clearTransitionNames() {
    app.querySelectorAll('[style*="view-transition-name"]').forEach(el=>el.style.removeProperty('view-transition-name'));
    transitionSource=null;
  }
  function routedDraw() {
    stopCardSlideshow();
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
  function activateFilter(filter) {
    stopCardSlideshow();
    selectedFilter=filter;
    const cards=app.querySelectorAll('.property-card');
    cards.forEach(card => {
      const property=P.find(p=>p.slug===card.dataset.propertySlug);
      card.hidden = !((filter==='All'||filter.split('|').includes(card.dataset.neighborhood)) && (!selectedBedrooms||property?.bedrooms>=Number(selectedBedrooms)) && (!selectedBathrooms||property?.bathrooms>=Number(selectedBathrooms)));
      card.style.display=card.hidden?'none':'';
    });
    app.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===filter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    const viewport=app.querySelector('.collection-viewport');if(viewport){viewport.scrollTo({left:0,behavior:'instant'});viewport.dispatchEvent(new Event('scroll'));viewport.closest('.collection').dispatchEvent(new Event('oaktown:collection-filter'));}
    const shown=[...cards].filter(card=>!card.hidden).length;
    const count=app.querySelector('.listing-count');if(count)count.textContent=shown+' '+t('homeCount');
    const empty=app.querySelector('.search-empty');if(empty)empty.hidden=shown>0||P.length===0;
    const form=app.querySelector('#home-search');if(form){form.elements.neighborhood.value=selectedFilter;form.elements.bedrooms.value=selectedBedrooms;form.elements.bathrooms.value=selectedBathrooms;}
    rememberView();
  }
  function selectCollectionLayout(layout) {
    if(!['gallery','grid'].includes(layout))return;
    stopCardSlideshow(false);
    collectionLayout=layout;
    try{localStorage.setItem('oaktown-layout',layout);}catch{}
    const collection=app.querySelector('.signature-collection');
    if(!collection)return;
    collection.dataset.layout=layout;
    collection.querySelectorAll('[data-layout-button]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.layoutButton===layout)));
    const viewport=collection.querySelector('.collection-viewport');
    if(layout==='gallery')viewport.setAttribute('tabindex','0');else viewport.removeAttribute('tabindex');
    viewport.scrollTo({left:0,behavior:'instant'});
    collection.dispatchEvent(new Event('oaktown:collection-layout'));
    rememberView();
  }
  function galleryStep(step) {
    const p=P.find(x=>'detail:'+x.slug===currentView);if(!p)return;
    const imgs=DATA.images[p.imageKey];if(!imgs.length)return;currentGalleryIndex=(currentGalleryIndex+step+imgs.length)%imgs.length;
    const src=imageUrl(imgs[currentGalleryIndex],1500), alt=DATA.photoAlts?.[imgs[currentGalleryIndex]]||p.name+' — '+t('photoLabel')+' '+(currentGalleryIndex+1);
    app.querySelectorAll('.gallery-active, .detail-cover-photo, .lightbox[open] .lightbox-image img').forEach(img=>{img.classList.remove('image-unavailable');img.removeAttribute('srcset');img.src=src;img.alt=alt;});
    app.querySelectorAll('.gallery-error').forEach(el=>el.hidden=true);
    app.querySelectorAll('.gallery-count').forEach(el=>el.textContent=(currentGalleryIndex+1)+' / '+imgs.length);
    galleryPlayback?.select(currentGalleryIndex);
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
    stopCardSlideshow();
    positionGeneration++;restoringPosition=false;
    const saved=savedView();
    let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{hash='';}
    const detailSlug=hash.startsWith('home/')?hash.substring(5):null;
    const p=detailSlug?P.find(x=>x.slug===detailSlug):null;
    const resource=['faq','community','contact'].includes(hash)?hash:null;
    const view=p?'detail:'+p.slug:resource?'resource:'+resource:'home';
    const restore=!preservePosition?(view==='home'&&pendingHomeRestore?pendingHomeRestore:saved?.view===view?saved:null):null;
    pendingHomeRestore=null;
    if(restore?.home?.view==='home')lastHomeSnapshot=restore.home;
    if(restore&&view==='home'){
      selectedFilter=restore.filter==='All'||typeof restore.filter==='string'&&P.some(home=>restore.filter.split('|').includes(home.neighborhood))?restore.filter:'All';
      selectedBedrooms=String(restore.bedrooms||'');selectedBathrooms=String(restore.bathrooms||'');
      collectionLayout=restore.layout==='grid'?'grid':'gallery';
    }
    const shouldRender=(view!==currentView)||app.children.length===0||preservePosition||!!restore;
    const oldScroll=window.scrollY;
    const readingSection=preservePosition?[...app.querySelectorAll(':scope > section, :scope > aside')].find(el=>el.getBoundingClientRect().bottom>110):null;
    const readingIndex=readingSection?[...app.children].indexOf(readingSection):-1;
    const readingTop=readingSection?.getBoundingClientRect().top;
    if(shouldRender){
      galleryPlayback?.destroy();
      galleryPlayback = null;
      cleanupEffects();closeGallery();
      currentView=view;if(!preservePosition)currentGalleryIndex=restore&&p?Math.min(Math.max(0,Number(restore.galleryIndex)||0),Math.max(0,DATA.images[p.imageKey].length-1)):p&&pendingPhoto?.slug===p.slug?pendingPhoto.index:0;
      pendingPhoto=null;
      app.classList.toggle('signature-home',!p&&!resource);
      app.innerHTML=p?detailPage(p,currentGalleryIndex):resource?resourcePage(resource):homePage();
      document.title=(p?p.name+' — ':'')+'Oaktown Rentals — '+t('heroKicker');
      if(restore){observer?.disconnect();app.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));}
      else observeSections();
      if(!p)activateFilter(selectedFilter);
      if (p && app.querySelector('.lightbox')) {
        const dialog = app.querySelector('.lightbox');
        galleryPlayback = window.OaktownEffects.mountSlideshow({
          strip: app.querySelector('.gallery-thumbs'), surface: app.querySelector('.gallery-main'), dialog, language,
          currentImage: () => dialog.open ? dialog.querySelector('.lightbox-image img') : app.querySelector('.gallery-active'),
          advance: () => galleryStep(1)
        });
        galleryPlayback.select(currentGalleryIndex);
      }
      if(p&&(preservePosition||currentGalleryIndex))galleryStep(0);
      const stopEffects=window.OaktownEffects.mount(app,{t});
      const stopSignature=window.OaktownSignature?.mount(app)||(()=>{});
      const stopCollection=window.OaktownCollection?.mount(app)||(()=>{});
      cleanupEffects=()=>{stopCollection();stopEffects();stopSignature();};
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
    langButton.textContent=language==='en'?'EN / ES':'ES / EN';
    const mobileInquiry=document.getElementById('mobile-inquiry');
    mobileInquiry.href=p?showingUrl(p):'sms:+15025001070';
    mobileInquiry.textContent=t(p?'requestShowing':'textUs');
    if(skyHeader)skyHeader.update(t);
    else closeMenu();
    onScroll();
    if(!restore)rememberView();
    privatePreview?.rendered();
  }
  function onScroll() {
    const scroll=document.documentElement.scrollTop;
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    document.getElementById('progress').style.width=(Math.min(1,scroll/max)*100)+'%';
    if(!skyHeader)header.classList.toggle('is-fixed',scroll>50);
    scheduleViewSave();
  }
  if(!skyHeader)menu.addEventListener('click',()=>{const isOpening=mobileNav.hidden;mobileNav.hidden=!isOpening;menu.setAttribute('aria-expanded',String(isOpening));menu.setAttribute('aria-label',t(isOpening?'closeMenu':'openMenu'));});
  if(!skyHeader)mobileNav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
  langButton.addEventListener('click',()=>{routeGeneration++;activeTransition?.skipTransition();clearTransitionNames();language=language==='en'?'es':'en';if(privatePreview)privatePreview.language=language;else try{localStorage.setItem('oaktown-language',language);}catch{}draw(true)});
  app.addEventListener('submit',e=>{
    if(e.target.id!=='home-search')return;
    e.preventDefault();const values=new FormData(e.target);
    selectedBedrooms=values.get('bedrooms')||'';selectedBathrooms=values.get('bathrooms')||'';
    activateFilter(values.get('neighborhood')||'All');confirmAction(e.submitter);
    document.getElementById('homes')?.scrollIntoView({behavior:navigationMotion()});
  });
  app.addEventListener('reset',e=>{
    if(e.target.id!=='home-search')return;
    e.preventDefault();selectedBedrooms='';selectedBathrooms='';activateFilter('All');confirmAction(e.target.querySelector('[type=reset]'));
  });
  if(!skyHeader)document.querySelectorAll('.resources-menu').forEach(details=>{
    details.addEventListener('keydown',e=>{if(e.key==='Escape'){details.open=false;details.querySelector('summary').focus();}});
    document.addEventListener('click',e=>{if(!details.contains(e.target)||e.target.closest('a'))details.open=false;});
  });
  app.addEventListener('click',e=>{
    const layout=e.target.closest('[data-layout-button]');if(layout){selectCollectionLayout(layout.dataset.layoutButton);return;}
    const photoControl=e.target.closest('[data-card-photo-index],[data-card-photo-step]');
    if(photoControl){const card=photoControl.closest('.property-card');const index=photoControl.hasAttribute('data-card-photo-index')?Number(photoControl.dataset.cardPhotoIndex):Number(card.dataset.pendingPhotoIndex??card.dataset.selectedPhoto??0)+Number(photoControl.dataset.cardPhotoStep);selectCardPhoto(card,index);return;}

    if(e.target.closest('.back-link')&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey)pendingHomeRestore=lastHomeSnapshot;
    const listing=e.target.closest('.property-card a[href^="#home/"]');
    if(listing&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){
      const card=listing.closest('.property-card');
      pendingPhoto={slug:card.dataset.propertySlug,index:Number(card.dataset.selectedPhoto)||0};
      stopCardSlideshow(false);
      activeTransition?.skipTransition();clearTransitionNames();
      const source=card.querySelector('.property-preview.is-current')||card.querySelector('.property-image:not(.property-preview)');
      if(source?.naturalWidth&&!reducedMotion.matches&&!document.documentElement.classList.contains('motion-off')&&document.startViewTransition){
        source.getAnimations().forEach(animation=>animation.cancel());
        source.style.transition='none';source.style.opacity='1';
        source.style.viewTransitionName='rental-photo';transitionSource=source;
      }
    }

    const filter=e.target.closest('[data-filter]');if(filter){activateFilter(filter.dataset.filter);return;}
    const thumb=e.target.closest('[data-gallery-index]');if(thumb){const p=P.find(x=>'detail:'+x.slug===currentView);if(p)galleryStep(Number(thumb.dataset.galleryIndex)-currentGalleryIndex);return;}
    const step=e.target.closest('[data-gallery-step]');if(step)galleryStep(Number(step.dataset.galleryStep));
    if(e.target.closest('[data-open-gallery],[data-cover-gallery]')&&app.querySelector('.lightbox')){app.querySelector('.lightbox').showModal();document.body.classList.add('gallery-is-open');galleryStep(0);}
    if(e.target.closest('[data-close-gallery]'))closeGallery();
  });
  document.addEventListener('keydown',e=>{
    const layout=e.target.closest?.('[data-layout-button]');
    if(layout&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
      e.preventDefault();const next=e.key==='Home'?'gallery':e.key==='End'?'grid':layout.dataset.layoutButton==='gallery'?'grid':'gallery';
      selectCollectionLayout(next);app.querySelector('[data-layout-button="'+next+'"]').focus();
    }
    if(!skyHeader&&e.key==='Escape'&&!mobileNav.hidden){closeMenu();menu.focus();}
    if(app.querySelector('.lightbox[open]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();galleryStep(e.key==='ArrowLeft'?-1:1);}
  });
  app.addEventListener('close',e=>{if(e.target.matches('.lightbox'))document.body.classList.remove('gallery-is-open');},true);
  app.addEventListener('error',e=>{
    if(!e.target.matches('img'))return;
    e.target.classList.add('image-unavailable');
    if(e.target.matches('.gallery-active'))app.querySelector('.gallery > .gallery-error').hidden=false;
    if(e.target.matches('.lightbox-image img'))app.querySelector('.lightbox .gallery-error').hidden=false;
  },true);
  app.addEventListener('load',e=>{if(e.target.matches('img'))e.target.classList.remove('image-unavailable');},true);
  app.addEventListener('touchstart',e=>{if(e.target.closest('.gallery-main,.lightbox-image'))touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  app.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)galleryStep(dx>0?-1:1);},{passive:true});
  app.addEventListener('pointerover',e=>{
    const card=e.target.closest('.property-card');
    if(card&&!card.contains(e.relatedTarget)&&e.pointerType!=='touch')startCardSlideshow(card);
  });
  app.addEventListener('pointerout',e=>{
    const card=e.target.closest('.property-card');
    if(card===cardSlideshow?.card&&!card.contains(e.relatedTarget))stopCardSlideshow();
  });
  document.getElementById('motion-toggle').addEventListener('click',()=>queueMicrotask(()=>{
    if(document.documentElement.classList.contains('motion-off')){stopCardSlideshow();activeTransition?.skipTransition();}
  }));
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){stopCardSlideshow();activeTransition?.skipTransition();}});
  pointerPreview.addEventListener('change',()=>{if(!pointerPreview.matches)stopCardSlideshow();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCardSlideshow();});
  window.addEventListener('blur',()=>stopCardSlideshow());
  document.addEventListener('click',e=>{
    const link=e.target.closest('a[href^="#"]');
    if(!link||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;
    const card=link.closest('.property-card');
    rememberView(card?{slug:card.dataset.propertySlug,kind:link.closest('.property-name')?'name':link.matches('.card-detail-link')?'detail':'photo'}:null);
  });
  app.addEventListener('scroll',e=>{if(e.target.matches('.collection-viewport'))scheduleViewSave();},true);
  ['wheel','touchstart','pointerdown','keydown'].forEach(name=>window.addEventListener(name,()=>{positionGeneration++;restoringPosition=false;},{passive:true}));
  window.addEventListener('pagehide',()=>{stopCardSlideshow();clearTimeout(viewSaveTimer);rememberView();});
  window.addEventListener('popstate',()=>{if(location.hash===renderedHash)routedDraw();});
  window.addEventListener('hashchange',routedDraw);
  window.addEventListener('scroll',onScroll,{passive:true});
  document.getElementById('year').textContent=new Date().getFullYear();
  privatePreview?.onUpdate(()=>{routeGeneration++;activeTransition?.skipTransition();clearTransitionNames();language=privatePreview.language;draw(true);});
  draw();
})();
