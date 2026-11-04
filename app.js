/* Lightweight cinematic site: no frameworks, API keys, or build tools required. */
(() => {
  'use strict';
  const DATA = window.OAKTOWN_DATA;
  const app = document.getElementById('app');
  const header = document.getElementById('site-header');
  const menu = document.getElementById('menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  const langButton = document.getElementById('language-switch');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const P = DATA.properties;
  let language = 'en';
  let selectedFilter = 'All';
  let currentView = null;
  let currentGalleryIndex = 0;
  let observer;
  let cleanupEffects = () => {};
  let touchStart = null;
  const words = {
    en: {
      textUs:'Text us',motionOn:'Motion on',motionOff:'Motion off',motionLabel:'Enable visual motion',sceneOne:'The beginning',sceneTwo:'The everyday',sceneThree:'The next chapter',sceneTwoTitle:'Room for <em>your life.</em>',sceneThreeTitle:'Make yourself <em>at home.</em>',sceneTwoCopy:'A little more space. A rhythm of your own.',sceneThreeCopy:'Find your place in Louisville. We’ll help with the next step.',heroCaption:'A closer look at 115 Colonial Drive',portalKicker:'ONE CITY. YOUR OWN PLACE.',portalTitle:'Open the door to <em>what’s next.</em>',browseHint:'Explore the collection',previousHome:'Previous home',nextHome:'Next home',filterLabel:'Filter homes by neighborhood',openPhoto:'Enlarge photo',closePhoto:'Close gallery',previousPhoto:'Previous photo',nextPhoto:'Next photo',photoLabel:'Photo',photosLabel:'Photos',insideLabel:'A LOOK INSIDE',highlightsLabel:'THE HIGHLIGHTS',moreLabel:'EXPLORE MORE',sourceLabel:'Original listing',galleryError:'This photo could not load. Try another photo or contact us for the full gallery.',
      editorialEyebrow:'A HOME, NOT JUST AN ADDRESS',editorialTitle:'Made for <em>life as it happens.</em>',editorialCopy:'Quiet mornings. Familiar corners. New favorite places. Explore rental homes with character, comfort and room for what matters.',editorialTag:'LOUISVILLE LIVING / THE OAKTOWN COLLECTION',
      navHomes:'Our homes',navStory:'Our story',navFaq:'FAQ',navCommunity:'Community',navApply:'Apply online',contact:'Contact',textBest:'Text is always the best & fastest.',footerTitle:'Your next chapter starts here.',
      heroKicker:'Quality rental homes in Louisville, KY',heroOne:'Find your',heroTwo:'place.',heroTagline:'Homes to make your own. Neighborhoods to fall in love with. A new chapter begins here.',explore:'Explore our homes',scroll:'Scroll to explore',
      homesLabel:'01 / FIND A HOME',homesHeading:'Spaces to <em>call yours.</em>',homesDesc:'Thoughtfully cared-for rental homes throughout Louisville and surrounding counties. Discover the one that feels right.',
      all:'All homes',stMatthews:'St. Matthews',highlands:'Highlands',okolona:'Okolona',listings:'Homes in our collection',perMonth:'/ month',beds:'beds',baths:'bath',availability:'Ask about availability',
      cinemaLabel:'ROOM FOR WHAT MATTERS',cinemaTitle:'More than a <em>roof.</em>',cinemaDesc:'The little everyday moments deserve a great place to happen.',
      aboutLabel:'02 / WHO WE ARE',aboutHeading:'Rooted in <em>Louisville.</em>',aboutLead:'A local perspective. A love for our city. Homes that feel like home.',aboutText:'Oaktown Rentals provides quality rental housing in Louisville, Kentucky and nearby counties. We manage homes across the city, with a particular focus on Southern and Southeastern Jefferson County. We believe finding a home should feel personal, not complicated.',aboutLink:'Get in touch',
      floridaLabel:'A LITTLE FURTHER FROM HOME',floridaHeading:'Meet the <em>Mint Mojo.</em>',floridaText:'Escape to Cudjoe Key in the Florida Keys. Think wide-open water, a beautiful pool, a tiki hut, kayaks and easygoing island days.',floridaLink:'Explore the Florida rental',
      faqLabel:'03 / GOOD TO KNOW',faqHeading:'A few things, <em>answered.</em>',faqDesc:'Start here. For the latest application requirements and property-specific policies, please contact Oaktown Rentals.',
      communityLabel:'04 / DISCOVER LOUISVILLE',communityHeading:'Get to know <em>your city.</em>',communityText:'From schools to parks and neighborhood amenities, explore resources that make settling into Louisville a little easier.',
      faq1q:'How do I apply?',faq1a:'Use our secure online rental application. Have your contact information, residence history and supporting documents ready. Application requirements and any fees should be confirmed before you submit.',
      faq2q:'What does Oaktown Rentals look for?',faq2a:'Applications are reviewed using income, rental history, references, and other screening information. Contact us for the current screening criteria and any property-specific requirements.',
      faq3q:'How long does an application take?',faq3a:'The existing website says applications typically take 48–96 business hours, though verification requests may take longer. Please confirm current processing times with the team.',
      faq4q:'Are pets allowed?',faq4a:'Pets may be permitted depending on the home and approval. Pet rent, deposits, breed restrictions and other terms should be verified for the property you choose.',
      faq5q:'How do I schedule a showing?',faq5a:'Texting is the fastest way to reach Oaktown Rentals. Mention the address you are interested in so the team can confirm availability and next steps.',
      contactLabel:'LET’S TALK',contactHeading:'Ready to <em>move?</em>',contactDesc:'Questions, showings, applications. Tell us what you’re looking for and we’ll help you take the next step.',
      photo:'VIEW HOME',details:'View details',detailBack:'All rental homes',aboutThis:'A closer look',homeHighlights:'The details that make it yours',rent:'Monthly rent',deposit:'Security deposit',bedrooms:'Bedrooms',bathrooms:'Bathrooms',moreHomes:'Find your next favorite place',termsHeading:'Things to know',termsDisclaimer:'This is a design preview, not a live inventory feed. Pricing, availability and application requirements must be confirmed directly with Oaktown Rentals.',
      sourceInfo:'This draft uses publicly accessible photos from the existing Squarespace site; image hosting must be migrated before retiring Squarespace.',
      communityRes1:'Jefferson County Public Schools',communityRes2:'City of Louisville',communityRes3:'Louisville Visitor Guide',communityRes4:'Louisville Public Library'
    },
    es: {
      textUs:'Escríbenos',motionOn:'Animación sí',motionOff:'Animación no',motionLabel:'Activar animaciones',sceneOne:'El comienzo',sceneTwo:'El día a día',sceneThree:'La nueva etapa',sceneTwoTitle:'Espacio para <em>tu vida.</em>',sceneThreeTitle:'Siéntete <em>en casa.</em>',sceneTwoCopy:'Un poco más de espacio. Tu propio ritmo.',sceneThreeCopy:'Encuentra tu hogar en Louisville. Te ayudamos a dar el siguiente paso.',heroCaption:'Descubre 115 Colonial Drive',portalKicker:'UNA CIUDAD. TU PROPIO HOGAR.',portalTitle:'Abre la puerta a <em>tu nueva etapa.</em>',browseHint:'Explora las viviendas',previousHome:'Vivienda anterior',nextHome:'Siguiente vivienda',filterLabel:'Filtrar viviendas por vecindario',openPhoto:'Ampliar foto',closePhoto:'Cerrar galería',previousPhoto:'Foto anterior',nextPhoto:'Siguiente foto',photoLabel:'Foto',photosLabel:'Fotos',insideLabel:'UNA MIRADA AL INTERIOR',highlightsLabel:'LOS DETALLES',moreLabel:'EXPLORA MÁS',sourceLabel:'Anuncio original',galleryError:'No se pudo cargar esta foto. Prueba otra o contáctanos para ver la galería completa.',
      editorialEyebrow:'UN HOGAR, NO SOLO UNA DIRECCIÓN',editorialTitle:'Hecho para <em>la vida real.</em>',editorialCopy:'Mañanas tranquilas. Rincones favoritos. Nuevos comienzos. Descubre viviendas con carácter, comodidad y espacio para lo importante.',editorialTag:'VIVIR EN LOUISVILLE / LA COLECCIÓN OAKTOWN',
      navHomes:'Viviendas',navStory:'Nuestra historia',navFaq:'Preguntas',navCommunity:'Comunidad',navApply:'Solicitar ahora',contact:'Contacto',textBest:'Los mensajes de texto son la forma más rápida de contactarnos.',footerTitle:'Tu próximo capítulo comienza aquí.',
      heroKicker:'Viviendas de alquiler en Louisville, KY',heroOne:'Encuentra tu',heroTwo:'hogar.',heroTagline:'Hogares para hacerlos tuyos. Barrios para enamorarte. Una nueva etapa empieza aquí.',explore:'Explorar viviendas',scroll:'Desliza para explorar',
      homesLabel:'01 / ENCUENTRA TU HOGAR',homesHeading:'Espacios para <em>vivir.</em>',homesDesc:'Viviendas de alquiler bien cuidadas en Louisville y condados cercanos. Descubre cuál es perfecta para ti.',
      all:'Todas',stMatthews:'St. Matthews',highlands:'Highlands',okolona:'Okolona',listings:'Viviendas en nuestra colección',perMonth:'/ mes',beds:'hab.',baths:'baño',availability:'Consultar disponibilidad',
      cinemaLabel:'ESPACIO PARA LO IMPORTANTE',cinemaTitle:'Más que un <em>techo.</em>',cinemaDesc:'Los pequeños momentos de cada día merecen un gran hogar.',
      aboutLabel:'02 / QUIÉNES SOMOS',aboutHeading:'Arraigados en <em>Louisville.</em>',aboutLead:'Perspectiva local. Amor por nuestra ciudad. Hogares acogedores.',aboutText:'Oaktown Rentals ofrece viviendas de alquiler de calidad en Louisville, Kentucky y los condados cercanos. Gestionamos hogares por toda la ciudad, especialmente en el sur y sureste del condado de Jefferson.',aboutLink:'Contáctanos',
      floridaLabel:'UN POCO MÁS LEJOS DE CASA',floridaHeading:'Conoce <em>Mint Mojo.</em>',floridaText:'Escápate a Cudjoe Key en los Cayos de Florida. Agua, piscina, tiki bar, kayaks y días tranquilos.',floridaLink:'Explorar la casa en Florida',
      faqLabel:'03 / INFORMACIÓN ÚTIL',faqHeading:'Tus preguntas, <em>resueltas.</em>',faqDesc:'Consulta aquí lo esencial. Para requisitos actualizados y normas de cada vivienda, comunícate con Oaktown Rentals.',
      communityLabel:'04 / DESCUBRE LOUISVILLE',communityHeading:'Conoce <em>tu ciudad.</em>',communityText:'Escuelas, parques y recursos locales para ayudarte a instalarte en Louisville.',
      faq1q:'¿Cómo puedo solicitar una vivienda?',faq1a:'Utiliza nuestra solicitud de alquiler en línea. Prepara tus datos de contacto, historial de residencia y documentos. Confirma los requisitos y tarifas antes de enviarla.',
      faq2q:'¿Qué requisitos tiene Oaktown Rentals?',faq2a:'Se evalúan los ingresos, el historial de alquiler, las referencias y otros datos. Contacta al equipo para obtener los criterios vigentes.',
      faq3q:'¿Cuánto tarda una solicitud?',faq3a:'El sitio actual indica un plazo habitual de 48 a 96 horas laborables, aunque algunas verificaciones pueden tardar más. Confirma los tiempos actuales.',
      faq4q:'¿Se admiten mascotas?',faq4a:'Dependiendo de la vivienda y de la aprobación, pueden admitirse mascotas. Confirma las tarifas, depósitos y condiciones de cada propiedad.',
      faq5q:'¿Cómo programo una visita?',faq5a:'Los mensajes de texto son la forma más rápida de contactarnos. Indica la dirección de la vivienda para consultar disponibilidad.',
      contactLabel:'HABLEMOS',contactHeading:'¿Listo para <em>mudarte?</em>',contactDesc:'Preguntas, visitas y solicitudes. Cuéntanos qué buscas.',
      photo:'VER VIVIENDA',details:'Ver detalles',detailBack:'Todas las viviendas',aboutThis:'Conoce la vivienda',homeHighlights:'Detalles que la hacen especial',rent:'Alquiler mensual',deposit:'Depósito de seguridad',bedrooms:'Habitaciones',bathrooms:'Baños',moreHomes:'Descubre otra vivienda',termsHeading:'Información importante',termsDisclaimer:'Esta es una vista previa de diseño, no un inventario en tiempo real. Confirma precios, disponibilidad y requisitos con Oaktown Rentals.',
      sourceInfo:'Esta versión usa fotos públicas del sitio Squarespace actual; será necesario migrarlas antes de cerrar Squarespace.',
      communityRes1:'Escuelas públicas de Jefferson County',communityRes2:'Ciudad de Louisville',communityRes3:'Guía turística de Louisville',communityRes4:'Biblioteca pública de Louisville'
    }
  };
  const t = (key) => words[language][key] || words.en[key] || key;
  const money = (n) => new Intl.NumberFormat(language==='es'?'es-US':'en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  const photo = (p, idx=0) => DATA.images[p.imageKey][idx] || DATA.images[p.imageKey][0];
  const imageUrl = (src, width=1200) => src.includes('images.squarespace-cdn.com') ? src.split('?')[0]+'?format='+width+'w' : src;
  const imageEl = (src, alt, className, extra='') => {
    const thumbnail=className==='gallery-thumbnail';
    const widths=thumbnail?[100,300,500]:[500,1000,1500,2500];
    const sizes=thumbnail?'(max-width: 600px) 95px, 140px':className==='property-image'?'(max-width: 600px) 84vw, (max-width: 850px) 70vw, 44vw':'100vw';
    return `<img class="${className}" src="${imageUrl(src,thumbnail?300:1200)}" srcset="${widths.map(w=>imageUrl(src,w)+' '+w+'w').join(', ')}" sizes="${sizes}" alt="${alt}" loading="${extra==='eager'?'eager':'lazy'}" decoding="async" ${extra==='eager'?'fetchpriority="high"':''}>`;
  };
  const inquiryUrl = p => 'sms:+15025001070?body='+encodeURIComponent((language==='es'?'Hola, quisiera consultar la disponibilidad de ':'Hi, I’d like to ask about availability for ')+p.name+'.');
  const sectionHeading = (label, title, desc='') => `<div class="section-heading reveal"><div><div class="eyebrow section-label">${label}</div><h2 class="display-title">${title}</h2></div>${desc?`<p class="heading-note">${desc}</p>`:''}</div>`;
  function card(p, index) {
    return `<article class="property-card reveal" data-neighborhood="${p.neighborhood}">
        <a class="property-image-wrap" href="#home/${p.slug}" aria-label="${t('details')}: ${p.name}">
          <span class="card-index" aria-hidden="true">${String(index+1).padStart(2,'0')} / ${String(P.length).padStart(2,'0')}</span><span class="card-photo-count">${DATA.images[p.imageKey].length} ${t('photosLabel')}</span>
          ${imageEl(photo(p), p.name+' property photo','property-image')}
          <span class="photo-pill">${t('photo')}</span><span class="card-arrow" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span>
        </a>
        <div class="property-data"><div><span class="property-neighborhood">${p.neighborhood}</span><h3 class="property-name"><a href="#home/${p.slug}">${p.name}</a></h3><p class="property-summary">${language==='es'?p.summaryEs:p.summary}</p></div><div class="property-price">${money(p.rent)}<small>${t('perMonth')}</small></div></div>
        <div class="property-details-line"><span>${p.bedrooms} ${language==='en'&&p.bedrooms===1?'bed':t('beds')} &nbsp; / &nbsp; ${p.bathrooms} ${t('baths')}</span><a href="${inquiryUrl(p)}">${t('availability')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div>
      </article>`;
  }
  function faqSection() {
    return `<section id="faq" class="section faq-section">${sectionHeading(t('faqLabel'),t('faqHeading'),t('faqDesc'))}<div class="faq-list">${[1,2,3,4,5].map(i=>`<details class="faq-item reveal"><summary>${t('faq'+i+'q')}</summary><div class="faq-answer">${t('faq'+i+'a')}</div></details>`).join('')}</div></section>`;
  }
  function contactSection() {
    return `<section id="contact" class="contact-panel"><div class="reveal"><span class="eyebrow">${t('contactLabel')}</span><h2>${t('contactHeading')}</h2><p>${t('contactDesc')}</p></div><div class="contact-actions reveal"><a href="sms:+15025001070">${t('textBest')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a href="tel:+15025001070">${DATA.phoneDisplay} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a href="mailto:${DATA.email}">${DATA.email}<span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><p>${DATA.mailingAddress}</p></div></section>`;
  }
  function storySection() {
    const scenes=[
      {image:DATA.images.colonial[0],title:t('heroOne')+' <em>'+t('heroTwo')+'</em>',copy:t('heroTagline')},
      {image:DATA.images.colonial[3],title:t('sceneTwoTitle'),copy:t('sceneTwoCopy')},
      {image:DATA.images.colonial[6],title:t('sceneThreeTitle'),copy:t('sceneThreeCopy')}
    ];
    return `<section class="story" id="top" aria-label="${t('heroKicker')}"><div class="story-stage">
      <div class="story-images" aria-hidden="true">${scenes.map((scene,i)=>`<div class="story-image ${i===0?'is-active':''}" data-scene-image="${i}">${imageEl(scene.image,'','',i===0?'eager':'')}</div>`).join('')}</div>
      <div class="story-shade"></div><div class="story-topline"><span>LOUISVILLE, KENTUCKY</span><a href="#homes">${t('explore')} <span aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a></div>
      <h1 class="sr-only">${t('heroKicker')} — ${t('heroOne')} ${t('heroTwo')}</h1>
      <div class="story-copy">${scenes.map((scene,i)=>`<div class="story-scene ${i===0?'is-active':''}" data-scene="${i}" ${i===0?'':'aria-hidden="true"'}><span class="eyebrow">0${i+1} / ${t(['sceneOne','sceneTwo','sceneThree'][i])}</span><p class="story-title">${scene.title}</p><p class="story-description">${scene.copy}</p></div>`).join('')}</div>
      <a class="story-explore" href="#homes"><span>${t('explore')}</span><span class="round-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a>
      <div class="story-bottom"><div class="scene-navigation" role="group" aria-label="${t('photosLabel')}">${[0,1,2].map(i=>`<button type="button" data-scene-button="${i}" aria-pressed="${i===0}"><span>0${i+1}</span><span>${t(['sceneOne','sceneTwo','sceneThree'][i])}</span><i aria-hidden="true"></i></button>`).join('')}</div><a class="story-caption" href="#home/${P[0].slug}">${t('heroCaption')}</a></div>
    </div></section>`;
  }
  function portalSection() {
    return `<section class="portal" aria-labelledby="portal-title"><div class="portal-stage"><div class="portal-photo" aria-hidden="true">${imageEl(DATA.images.colonial[1],'','')}</div><div class="portal-letter" aria-hidden="true" style="background-image:url('${imageUrl(DATA.images.colonial[1],1500)}')">O</div><div class="portal-copy"><span class="eyebrow">${t('portalKicker')}</span><h2 id="portal-title">${t('portalTitle')}</h2><a class="text-link" href="#homes">${t('explore')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div></div></section>`;
  }
  function homePage() {
    return `${storySection()}${portalSection()}
    <section class="section collection" id="homes">${sectionHeading(t('homesLabel'),t('homesHeading'),t('homesDesc'))}
      <div class="listing-tools reveal"><span class="listing-count" aria-live="polite">${String(P.length).padStart(2,'0')} / ${t('listings')}</span><div class="filter-strip" role="group" aria-label="${t('filterLabel')}"><button class="filter-chip active" data-filter="All" aria-pressed="true">${t('all')}</button><button class="filter-chip" data-filter="St. Matthews" aria-pressed="false">${t('stMatthews')}</button><button class="filter-chip" data-filter="The Highlands|Cherokee Triangle" aria-pressed="false">${t('highlands')}</button><button class="filter-chip" data-filter="Okolona" aria-pressed="false">${t('okolona')}</button></div></div>
      <div class="collection-viewport" id="collection-viewport" tabindex="0" role="region" aria-label="${t('listings')}"><div class="property-grid" id="property-grid">${P.map(card).join('')}</div></div>
      <div class="collection-bottom"><span>${t('browseHint')}</span><div class="collection-meter" aria-hidden="true"><span></span></div><div class="collection-controls"><button data-collection-step="-1" aria-label="${t('previousHome')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><button data-collection-step="1" aria-label="${t('nextHome')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></div>
    </section>
    <section class="editorial-section" id="discover" aria-labelledby="editorial-title">
      <div class="editorial-intro reveal"><span class="eyebrow section-label">${t('editorialEyebrow')}</span><h2 id="editorial-title">${t('editorialTitle')}</h2><p>${t('editorialCopy')}</p></div>
      <div class="editorial-collage reveal"><div class="editorial-photo editorial-photo-primary">${imageEl(DATA.images.colonial[3],'A sunlit room at 115 Colonial Drive','')}<span class="editorial-photo-caption">01 / ST. MATTHEWS</span></div><div class="editorial-photo editorial-photo-secondary">${imageEl(DATA.images.cherokee8[1],'An interior at Cherokee Road','')}<span class="editorial-photo-caption">02 / HIGHLANDS</span></div><span class="editorial-collage-note">${t('editorialTag')}</span><span class="editorial-outline" aria-hidden="true">HOME.</span></div>
    </section>
    <section class="section about-section" id="about"><div class="reveal"><div class="eyebrow section-label">${t('aboutLabel')}</div><h2 class="display-title">${t('aboutHeading')}</h2></div><div class="about-copy reveal"><p>${t('aboutLead')}</p><p>${t('aboutText')}</p><a class="text-link" href="#contact">${t('aboutLink')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a></div></section>
    <section id="cudejoe" class="florida-panel"><div class="florida-image" role="img" aria-label="The Mint Mojo, Cudjoe Key canal" style="background-image:url('${DATA.images.cudejoe[0]}')"></div><div class="florida-copy reveal"><div class="eyebrow section-label">${t('floridaLabel')}</div><h2>${t('floridaHeading')}</h2><p>${t('floridaText')}</p><a class="text-link" href="${DATA.squarespaceUrl}contact-five" target="_blank" rel="noopener noreferrer">${t('floridaLink')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a></div></section>
    ${faqSection()}
    <section class="section community-section" id="community"><div class="reveal"><div class="eyebrow section-label">${t('communityLabel')}</div><h2 class="display-title">${t('communityHeading')}</h2><p class="community-intro">${t('communityText')}</p></div><div class="community-resources reveal"><a class="resource-link" href="https://www.jefferson.kyschools.us/" target="_blank" rel="noopener noreferrer">${t('communityRes1')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://louisvilleky.gov/" target="_blank" rel="noopener noreferrer">${t('communityRes2')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://www.gotolouisville.com/" target="_blank" rel="noopener noreferrer">${t('communityRes3')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><a class="resource-link" href="https://www.lfpl.org/" target="_blank" rel="noopener noreferrer">${t('communityRes4')} <span><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a></div></section>
    ${contactSection()}`;
  }
  function detailPage(p) {
    const image = photo(p);
    const more = P.filter(x=>x.slug!==p.slug).slice(0,2);
    return `<section class="page-intro has-image"><div class="intro-photo" style="background-image:url('${image}')"></div>
      <a class="back-link" href="#homes"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg> ${t('detailBack')}</a><span class="eyebrow section-label">${p.neighborhood} / ${p.city}</span><h1>${p.name.replace(' · ', '<br>')}</h1><p class="intro-sub">${language==='es'?p.summaryEs:p.summary}</p></section>
    <div class="details-bar"><div class="detail-stats"><div class="detail-stat"><strong>${money(p.rent)}</strong><span>${t('rent')}</span></div><div class="detail-stat"><strong>${p.bedrooms}</strong><span>${t('bedrooms')}</span></div><div class="detail-stat"><strong>${p.bathrooms}</strong><span>${t('bathrooms')}</span></div></div><a class="button-solid" href="${DATA.applicationUrl}" target="_blank" rel="noopener noreferrer">${t('navApply')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div>
    <section class="detail-body"><div class="reveal"><div class="eyebrow section-label">${t('aboutThis')}</div><h2>${p.label.split(' ').slice(0,2).join(' ')} <em>${p.label.split(' ').slice(2).join(' ')}</em></h2></div><div class="detail-text reveal" lang="en">${p.description.map(s=>`<p>${s}</p>`).join('')}</div></section>
    <section class="gallery" id="gallery"><div class="gallery-heading"><span class="eyebrow section-label">${t('insideLabel')} / ${p.name.toUpperCase()}</span><span class="gallery-count" aria-live="polite">1 / ${DATA.images[p.imageKey].length}</span></div>
      <div class="gallery-main"><button class="gallery-open" aria-label="${t('openPhoto')}" data-open-gallery>${imageEl(image,p.name+' — '+t('photoLabel')+' 1','gallery-active')}<span>${t('openPhoto')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></button><div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="${t('previousPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><button type="button" data-gallery-step="1" aria-label="${t('nextPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></div>
      <p class="gallery-error" role="status" hidden>${t('galleryError')}</p>
      <div class="gallery-thumbs">${DATA.images[p.imageKey].map((src,i)=>`<button data-gallery-index="${i}" class="${i===0?'active':''}" aria-pressed="${i===0}" aria-label="${t('photoLabel')} ${i+1}">${imageEl(src,p.name+' — '+t('photoLabel')+' '+(i+1),'gallery-thumbnail')}</button>`).join('')}</div>
      <dialog class="lightbox" aria-label="${p.name} — ${t('photosLabel')}"><div class="lightbox-top"><span>${p.name}</span><button data-close-gallery autofocus aria-label="${t('closePhoto')}">×</button></div><div class="lightbox-image"><img alt=""><p class="gallery-error" hidden>${t('galleryError')}</p></div><div class="lightbox-bottom"><button data-gallery-step="-1" aria-label="${t('previousPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><span class="gallery-count" aria-live="polite"></span><button data-gallery-step="1" aria-label="${t('nextPhoto')}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button></div></dialog>
    </section>
    <section class="amenities"><div class="reveal"><div class="eyebrow section-label">${t('highlightsLabel')}</div><h2 class="display-title">${t('homeHighlights')}</h2><ul class="amenity-list" lang="en">${p.features.map(f=>`<li>${f}</li>`).join('')}</ul></div><div class="reveal"><div class="eyebrow section-label">${t('termsHeading')}</div><h2 class="display-title">${money(p.rent)}<br><em>${t('perMonth')}</em></h2><ul class="amenity-list">${[`${t('deposit')}: ${money(p.deposit)}`,...p.terms].map(f=>`<li>${f}</li>`).join('')}</ul><div class="terms-note">${t('termsDisclaimer')}<br><br><a href="${p.sourceUrl}" target="_blank" rel="noopener noreferrer">${t('sourceLabel')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div><a class="button-solid" style="margin-top:23px" href="${DATA.applicationUrl}" target="_blank" rel="noopener noreferrer">${t('navApply')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div></section>
    <section class="section"><div class="eyebrow section-label">${t('moreLabel')}</div><h2 class="display-title" style="margin-bottom:40px">${t('moreHomes')}</h2><div class="mini-cards">${more.map(x=>`<a href="#home/${x.slug}" class="mini-card">${imageEl(photo(x),x.name,'')}<span>${x.name} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a>`).join('')}</div></section>
    ${contactSection()}`;
  }
  const closeMenu=()=>{mobileNav.hidden=true;menu.setAttribute('aria-expanded','false');};
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
    const count=app.querySelector('.listing-count');if(count)count.textContent=String(shown).padStart(2,'0')+' / '+t('listings');
  }
  function galleryStep(step) {
    const p=P.find(x=>'detail:'+x.slug===currentView);if(!p)return;
    const imgs=DATA.images[p.imageKey];currentGalleryIndex=(currentGalleryIndex+step+imgs.length)%imgs.length;
    const src=imageUrl(imgs[currentGalleryIndex],1500), alt=p.name+' — '+t('photoLabel')+' '+(currentGalleryIndex+1);
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
    if(shouldRender){
      cleanupEffects();closeGallery();
      currentView=view;currentGalleryIndex=0;
      app.innerHTML=p?detailPage(p):homePage();
      document.title=(p?p.name+' — ':'')+'Oaktown Rentals — Find your place';
      observeSections();
      if(!p)activateFilter(selectedFilter);
      cleanupEffects=window.OaktownEffects.mount(app,{t});
      if(p&&!preservePosition){const heading=app.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
    }
    if(p) {
      if(!preservePosition)window.scrollTo({top:0,behavior:'instant'});
    } else if(preservePosition) {
      window.scrollTo({top:oldScroll,behavior:'instant'});
    } else if(hash && document.getElementById(hash)) {
      requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'}));
    } else {
      window.scrollTo({top:0,behavior:'instant'});
    }
    document.documentElement.lang=language;
    document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
    langButton.textContent=language==='en'?'ES':'EN';
    document.getElementById('mobile-inquiry').href=p?inquiryUrl(p):'sms:+15025001070';
    closeMenu();
    onScroll();
  }
  function onScroll() {
    const scroll=document.documentElement.scrollTop;
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    document.getElementById('progress').style.width=(Math.min(1,scroll/max)*100)+'%';
    header.classList.toggle('is-fixed',scroll>50);
  }
  menu.addEventListener('click',()=>{const isOpening=mobileNav.hidden;mobileNav.hidden=!isOpening;menu.setAttribute('aria-expanded',String(isOpening));});
  mobileNav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
  langButton.addEventListener('click',()=>{language=language==='en'?'es':'en';draw(true)});
  app.addEventListener('click',e=>{
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
