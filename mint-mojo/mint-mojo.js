/* A standalone coastal stay page; the monthly-rental application is not a booking flow. */
(() => {
  'use strict';
  const main = document.getElementById('mint-main');
  const languageButton = document.getElementById('mint-language');
  const menuButton = document.getElementById('mint-menu');
  const navigation = document.getElementById('mint-nav');
  const asset = name => '../assets/mint-mojo/' + name + '.jpg';
  const arrow = '<svg class="mint-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg>';
  const copy = {
    en: {
      skip:'Skip to content',navStay:'The stay',navPhotos:'Photos',navIsland:'Island life',askDates:'Ask about dates',allHomes:'Oaktown homes',openMenu:'Open menu',closeMenu:'Close menu',footerLine:'Louisville roots. A little island soul.',preview:'Website preview · Confirm dates and details with Oaktown Rentals.',
      motionOn:'Motion on',motionOff:'Motion off',motionLabel:'Enable animations',location:'Cudjoe Key · Florida Keys',heroTitle:'A little more<br><em>island time.</em>',heroCopy:'Your own waterfront hideaway. A pool, a palm-shaded tiki hut, and nowhere you need to rush.',exploreHouse:'Explore the house',sceneHouse:'The house',scenePool:'The pool',sceneWater:'The waterfront',photoScene:'Opening photo',
      beds:'bedrooms',baths:'full bathrooms',dock:'feet of dock',privatePool:'pool to unwind in',introLabel:'WELCOME TO THE MINT MOJO',introTitle:'Slow mornings.<br><em>Saltwater afternoons.</em>',introCopy:'Leave a little room in your plans. For coffee on the screened porch. A swim before lunch. One more evening under the tiki hut.',introDetails:'Set on a double fenced lot along a Cudjoe Key canal, this three-bedroom, two-bath home brings everyone together, with plenty of space to find a quiet corner.',viewPhotos:'Take a look around',roundNote:'A slower<br>kind of day',aerialCaption:'Your corner of Cudjoe Key',galleryLabel:'MAKE YOURSELF AT HOME',galleryTitle:'A closer <em>look.</em>',allPhotos:'View all photos',openPhoto:'Open photo',
      experienceLabel:'THE GOOD KIND OF EVERYDAY',experienceTitle:'Make room for<br><em>the little things.</em>',experienceCopy:'The best part of a Keys stay might be the time you spend right here.',poolTitle:'A dip. Then another.',poolCopy:'An easy afternoon by the pool, with palms overhead and your next swim a few steps away.',tikiTitle:'Stay for one more story.',tikiCopy:'Pull up a chair under the tiki hut. Let lunch turn into a long, unhurried evening.',dockTitle:'Life at the water’s edge.',dockCopy:'A 150-foot canal-side dock, with a step-down and ladder for time spent close to the water.',amenities:['Screened porch','Grill','Kayaks','Bicycles','Pickleball court','Fish-cleaning station','Freezer & ice maker','Boat tie-up'],
      islandLabel:'A LITTLE FURTHER OUT',islandTitle:'Follow the<br><em>blue.</em>',islandCopy:'The canal is only the beginning. Make your own plans for a day of boating, snorkeling, or diving in the Florida Keys, then come back to your own place by the water.',activityNote:'Water-activity photos show outings in the Keys. Excursions, diving services and equipment are arranged separately; they are not a booking or an included tour.',islandCaption:'Canal mornings. Open-water afternoons.',
      inquiryLabel:'LET’S MAKE A LITTLE ISLAND TIME',inquiryTitle:'Your next<br><em>Keys chapter.</em>',inquiryCopy:'Tell us when you’d like to visit. We’ll help you confirm dates, rates, and the details of your stay.',textUs:'Text about Mint Mojo',emailUs:'Email Oaktown Rentals',formTitle:'When are you thinking?',arrival:'Arrival',departure:'Departure',prepareEmail:'Prepare date inquiry',formNote:'Choose email or text to send your inquiry. Availability, rates, occupancy and stay requirements are confirmed directly with Oaktown Rentals. No reservation or payment is made here.',ready:'Your inquiry is ready. Choose email or text to send it.',emailInquiry:'Open email draft',textInquiry:'Open text message',invalidDates:'Departure must be after arrival.',
      faqLabel:'BEFORE YOU PACK',faqTitle:'A few good<br>things to know.',faq:[['What spaces are available to guests?','The original listing offers the entire house and outdoor guest spaces. The boat lift and fuel tank are excluded from guest use.'],['How do I reserve dates?','Contact Oaktown Rentals to confirm availability, rates, guest capacity and minimum stay requirements. A date inquiry on this page is not a confirmed reservation.'],['Can I bring a boat?','The listing includes a 150-foot dock and boat tie-up. Confirm your boat’s size, access, storage and any conditions with Oaktown Rentals before you travel.'],['What should I confirm before my stay?','Ask about arrival details, house and pool rules, pets, current amenities, and arrangements for any water activities. Oaktown Rentals can share the current terms for your dates.']],
      closeGallery:'Close gallery',previousPhoto:'Previous photo',nextPhoto:'Next photo',photoError:'This photo could not load. Try the next photo or contact Oaktown Rentals.',photosOf:'of',galleryName:'The Mint Mojo photo gallery'
    },
    es: {
      skip:'Saltar al contenido',navStay:'La estancia',navPhotos:'Fotos',navIsland:'Vida isleña',askDates:'Consultar fechas',allHomes:'Viviendas de Oaktown',openMenu:'Abrir menú',closeMenu:'Cerrar menú',footerLine:'Raíces en Louisville. Espíritu isleño.',preview:'Vista previa del sitio · Confirma fechas y detalles con Oaktown Rentals.',
      motionOn:'Animación sí',motionOff:'Animación no',motionLabel:'Activar animaciones',location:'Cudjoe Key · Cayos de Florida',heroTitle:'Un poco más de<br><em>tiempo isleño.</em>',heroCopy:'Tu refugio junto al agua. Una piscina, una palapa entre palmeras y tiempo para disfrutar sin prisas.',exploreHouse:'Descubrir la casa',sceneHouse:'La casa',scenePool:'La piscina',sceneWater:'El canal',photoScene:'Foto de portada',
      beds:'habitaciones',baths:'baños completos',dock:'pies de muelle',privatePool:'piscina para relajarte',introLabel:'BIENVENIDOS A THE MINT MOJO',introTitle:'Mañanas tranquilas.<br><em>Tardes junto al mar.</em>',introCopy:'Deja espacio en tus planes. Para un café en el porche con mosquiteros. Un baño antes de comer. Una tarde más bajo la palapa.',introDetails:'En un terreno doble cercado junto a un canal de Cudjoe Key, esta casa de tres habitaciones y dos baños ofrece espacios para reunirse y rincones para descansar.',viewPhotos:'Echa un vistazo',roundNote:'Un día<br>sin prisas',aerialCaption:'Tu rincón de Cudjoe Key',galleryLabel:'SIÉNTETE COMO EN CASA',galleryTitle:'Mira <em>de cerca.</em>',allPhotos:'Ver todas las fotos',openPhoto:'Ampliar foto',
      experienceLabel:'PLACERES DE CADA DÍA',experienceTitle:'Disfruta de<br><em>las pequeñas cosas.</em>',experienceCopy:'Puede que lo mejor de tu viaje a los Cayos sea el tiempo que pases aquí.',poolTitle:'Un baño. Y luego otro.',poolCopy:'Una tarde tranquila junto a la piscina, con palmeras a tu alrededor y el agua a pocos pasos.',tikiTitle:'Quédate un rato más.',tikiCopy:'Siéntate bajo la palapa. Deja que la comida se convierta en una larga tarde de conversación.',dockTitle:'La vida junto al agua.',dockCopy:'Un muelle de 150 pies junto al canal, con una plataforma más baja y escalera para disfrutar del agua.',amenities:['Porche con mosquiteros','Parrilla','Kayaks','Bicicletas','Cancha de pickleball','Estación de limpieza de pescado','Congelador y máquina de hielo','Amarre para barco'],
      islandLabel:'UN POCO MÁS ALLÁ',islandTitle:'Sigue el<br><em>azul.</em>',islandCopy:'El canal es solo el comienzo. Organiza un día de navegación, esnórquel o buceo en los Cayos de Florida y vuelve a tu propio refugio junto al agua.',activityNote:'Las fotos de actividades acuáticas muestran excursiones por los Cayos. Los paseos, servicios de buceo y equipos se organizan por separado; no constituyen una reserva ni un tour incluido.',islandCaption:'Mañanas en el canal. Tardes en el mar.',
      inquiryLabel:'HAGAMOS TIEMPO PARA LA ISLA',inquiryTitle:'Tu próxima<br><em>escapada a los Cayos.</em>',inquiryCopy:'Cuéntanos cuándo te gustaría venir. Te ayudaremos a confirmar fechas, tarifas y los detalles de tu estancia.',textUs:'Escribir sobre Mint Mojo',emailUs:'Enviar un correo a Oaktown Rentals',formTitle:'¿Cuándo te gustaría venir?',arrival:'Llegada',departure:'Salida',prepareEmail:'Preparar consulta de fechas',formNote:'Elige correo o mensaje de texto para enviar tu consulta. Confirma disponibilidad, tarifas, capacidad y requisitos directamente con Oaktown Rentals. Aquí no se realiza ninguna reserva ni pago.',ready:'Tu consulta está lista. Elige correo o mensaje de texto para enviarla.',emailInquiry:'Abrir borrador de correo',textInquiry:'Abrir mensaje de texto',invalidDates:'La salida debe ser posterior a la llegada.',
      faqLabel:'ANTES DE HACER LAS MALETAS',faqTitle:'Algunas cosas<br>que debes saber.',faq:[['¿Qué espacios pueden usar los huéspedes?','El anuncio original ofrece toda la casa y los espacios exteriores para huéspedes. El elevador de barcos y el tanque de combustible quedan excluidos.'],['¿Cómo reservo unas fechas?','Contacta a Oaktown Rentals para confirmar disponibilidad, tarifas, capacidad y estancia mínima. Una consulta en esta página no es una reserva confirmada.'],['¿Puedo llevar un barco?','El anuncio incluye un muelle de 150 pies y amarre. Confirma con Oaktown Rentals el tamaño de tu barco, el acceso, el almacenamiento y las condiciones antes de viajar.'],['¿Qué debo confirmar antes del viaje?','Consulta los detalles de llegada, las normas de la casa y la piscina, las mascotas, los servicios actuales y las actividades acuáticas. Oaktown Rentals te facilitará las condiciones vigentes para tus fechas.']],
      closeGallery:'Cerrar galería',previousPhoto:'Foto anterior',nextPhoto:'Foto siguiente',photoError:'No se pudo cargar esta foto. Prueba la siguiente o contacta a Oaktown Rentals.',photosOf:'de',galleryName:'Galería de fotos de The Mint Mojo'
    }
  };
  const photos = [
    ['house-pool','The Mint Mojo house and pool','La casa The Mint Mojo y la piscina',1440,959],
    ['aerial','The house, pool and canal-side dock from above','Vista aérea de la casa, piscina y muelle',1200,874],
    ['pool','Pool, palms and tiki hut','Piscina, palmeras y palapa',720,472],
    ['canal-dock','The 150-foot canal-side dock','El muelle de 150 pies junto al canal',1440,939],
    ['living-room','The living room and open dining area','Sala de estar y comedor abierto',1200,900],
    ['kitchen','Kitchen and breakfast counter','Cocina y barra de desayuno',1200,791],
    ['primary-bedroom','The primary bedroom','La habitación principal',1440,1080],
    ['blue-bedroom','The blue guest bedroom','La habitación azul',720,540],
    ['guest-bedroom','The third bedroom','La tercera habitación',720,540],
    ['bathroom','Bathroom with a walk-in shower','Baño con ducha',1440,1080],
    ['screened-porch','The screened porch seating area','Zona de estar del porche con mosquiteros',1440,1080],
    ['porch-view','The view from the screened porch','La vista desde el porche',1440,967],
    ['tiki-hut','Seating beneath the tiki hut','Asientos bajo la palapa',1440,959],
    ['pool-chairs','Relaxing by the pool','Descanso junto a la piscina',720,474],
    ['garden-house','The house from the garden','La casa vista desde el jardín',720,468],
    ['covered-patio','The covered ground-floor patio','El patio cubierto de la planta baja',1440,959],
    ['porch-lounge','Outdoor lounge seating on the porch','Sofás exteriores en el porche',1440,1080],
    ['dining','The dining room','El comedor',720,478],
    ['pool-at-night','The pool after dark','La piscina de noche',1440,1080]
  ];
  let language = 'en';
  try { if (localStorage.getItem('oaktown-language') === 'es') language = 'es'; } catch {}
  let photoIndex = 0, sceneIndex = 0, cleanupEffects = () => {}, inquiryObserver;
  const c = key => copy[language][key];
  const caption = p => p[language === 'es' ? 2 : 1];
  const escape = str => String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const image = (name, alt, width, height, extra = '') => `<img src="${asset(name)}" alt="${escape(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async" ${extra}>`;
  function closeMenu(returnFocus = false) {
    navigation.hidden = true;
    menuButton.setAttribute('aria-expanded','false');
    menuButton.setAttribute('aria-label',c('openMenu'));
    if (returnFocus) menuButton.focus();
  }
  function render() {
    const arrival = main.querySelector('[name=arrival]')?.value || '';
    const departure = main.querySelector('[name=departure]')?.value || '';
    const oldScroll = scrollY;
    const oldSection = [...main.children].find(el => el.getBoundingClientRect().bottom > 110);
    const oldTop = oldSection?.getBoundingClientRect().top;
    const oldId = oldSection?.id;
    cleanupEffects(); inquiryObserver?.disconnect();
    main.querySelector('dialog[open]')?.close();
    document.documentElement.lang = language;
    document.querySelectorAll('[data-copy]').forEach(el => el.textContent = c(el.dataset.copy));
    document.querySelectorAll('[data-copy-aria]').forEach(el => el.setAttribute('aria-label',c(el.dataset.copyAria)));
    languageButton.textContent = language === 'en' ? 'ES' : 'EN';
    languageButton.setAttribute('aria-label',language === 'en' ? 'Cambiar a español' : 'Switch to English');
    document.title = 'The Mint Mojo — Cudjoe Key · Oaktown Rentals';
    main.innerHTML = `
      <section class="mint-hero" id="stay" aria-labelledby="mint-title">
        <img class="mint-hero-image" src="${asset('house-pool')}" alt="${escape(caption(photos[0]))}" width="1440" height="959" fetchpriority="high" decoding="async">
        <div class="mint-hero-copy mint-enter"><span class="mint-eyebrow">THE MINT MOJO / ${c('location')}</span><h1 id="mint-title">${c('heroTitle')}</h1><p>${c('heroCopy')}</p><a class="mint-button" href="#inquire">${c('askDates')} ${arrow}</a></div>
        <div class="mint-hero-counter"><div class="mint-scene-buttons" role="group" aria-label="${c('photoScene')}">${['sceneHouse','scenePool','sceneWater'].map((key,i) => `<button type="button" data-mint-scene="${i}" aria-pressed="${i===sceneIndex}">0${i+1} / ${c(key)}</button>`).join('')}</div><span>${c('location')}</span></div>
      </section>
      <section class="mint-facts" aria-label="${c('navStay')}"><div><strong>3</strong><span>${c('beds')}</span></div><div><strong>2</strong><span>${c('baths')}</span></div><div><strong>150</strong><span>${c('dock')}</span></div><div><strong>1</strong><span>${c('privatePool')}</span></div></section>
      <section class="mint-section mint-intro" id="house"><div class="mint-intro-copy"><span class="mint-eyebrow">${c('introLabel')}</span><h2>${c('introTitle')}</h2><p>${c('introCopy')}</p><p>${c('introDetails')}</p><a class="mint-text-link" href="#photos">${c('viewPhotos')} ${arrow}</a></div><figure class="mint-intro-visual">${image('aerial',caption(photos[1]),1200,874)}<figcaption><span>${c('aerialCaption')}</span><span>THE FLORIDA KEYS</span></figcaption><span class="mint-round-note" aria-hidden="true">${c('roundNote')}</span></figure></section>
      <section class="mint-section mint-photo-section" id="photos"><div class="mint-section-head"><div><span class="mint-eyebrow">${c('galleryLabel')}</span><h2>${c('galleryTitle')}</h2></div><button class="mint-quiet-button" type="button" data-open-photo="0">${c('allPhotos')} <span aria-hidden="true">(19)</span> ${arrow}</button></div><div class="mint-mosaic">${[2,4,6,10,3].map(i => `<button type="button" data-open-photo="${i}" aria-label="${c('openPhoto')}: ${escape(caption(photos[i]))}">${image(photos[i][0],caption(photos[i]),photos[i][3],photos[i][4])}<span aria-hidden="true">${caption(photos[i])}</span></button>`).join('')}</div></section>
      <section class="mint-section mint-experiences" id="little-things"><div class="mint-section-head"><div><span class="mint-eyebrow">${c('experienceLabel')}</span><h2>${c('experienceTitle')}</h2></div><p>${c('experienceCopy')}</p></div><div class="mint-experience-grid">${[['pool-chairs',13,'poolTitle','poolCopy'],['tiki-hut',12,'tikiTitle','tikiCopy'],['canal-dock',3,'dockTitle','dockCopy']].map(([name,i,title,text],n) => `<figure class="mint-experience">${image(name,caption(photos[i]),photos[i][3],photos[i][4])}<figcaption><span>0${n+1}</span><h3>${c(title)}</h3><p>${c(text)}</p></figcaption></figure>`).join('')}</div><ul class="mint-amenities">${c('amenities').map(a=>`<li>${a}</li>`).join('')}</ul></section>
      <section class="mint-section mint-island" id="island"><figure>${image('canal-dock',caption(photos[3]),1440,939,'class="mint-island-main"')}${image('snorkeling',language==='en'?'Snorkelers in the clear water of the Keys':'Personas haciendo esnórquel en los Cayos',480,640,'class="mint-island-small"')}<figcaption>${c('islandCaption')}</figcaption></figure><div><span class="mint-eyebrow">${c('islandLabel')}</span><h2>${c('islandTitle')}</h2><p>${c('islandCopy')}</p><p class="mint-activity-note">${c('activityNote')}</p></div></section>
      <section class="mint-section mint-inquiry" id="inquire"><div class="mint-inquiry-copy"><span class="mint-eyebrow">${c('inquiryLabel')}</span><h2>${c('inquiryTitle')}</h2><p>${c('inquiryCopy')}</p><div class="mint-contact-links"><a href="sms:+15025001070?body=${encodeURIComponent(language==='en'?'Hi, I’d like to ask about a stay at The Mint Mojo in Cudjoe Key.':'Hola, quisiera consultar una estancia en The Mint Mojo, Cudjoe Key.')}">${c('textUs')} ${arrow}</a><a href="tel:+15025001070">(502) 500-1070 ${arrow}</a><a href="mailto:joejrandles@yahoo.com">joejrandles@yahoo.com ${arrow}</a></div></div><form class="mint-date-form"><h3>${c('formTitle')}</h3><div class="mint-date-fields"><label for="mint-arrival">${c('arrival')}<input id="mint-arrival" name="arrival" type="date" required></label><label for="mint-departure">${c('departure')}<input id="mint-departure" name="departure" type="date" required></label></div><button class="mint-button" type="submit">${c('prepareEmail')} ${arrow}</button><p class="mint-form-note">${c('formNote')}</p><p class="mint-inquiry-ready" hidden role="status">${c('ready')}<br><a data-inquiry-email href="mailto:joejrandles@yahoo.com">${c('emailInquiry')}</a> · <a data-inquiry-text href="sms:+15025001070">${c('textInquiry')}</a></p></form></section>
      <section class="mint-section mint-faq" id="questions"><div><span class="mint-eyebrow">${c('faqLabel')}</span><h2>${c('faqTitle')}</h2></div><div>${c('faq').map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>
      <dialog class="mint-lightbox" aria-label="${c('galleryName')}"><div class="mint-lightbox-top"><strong>The Mint Mojo</strong><button type="button" class="mint-lightbox-close" data-close-photo>${c('closeGallery')} <span aria-hidden="true">×</span></button></div><div class="mint-lightbox-visual"><img alt=""><p class="mint-gallery-error" hidden>${c('photoError')}</p></div><div class="mint-lightbox-bottom"><button type="button" data-photo-step="-1" aria-label="${c('previousPhoto')}">←</button><p class="mint-gallery-caption" aria-live="polite" aria-atomic="true"></p><button type="button" data-photo-step="1" aria-label="${c('nextPhoto')}">→</button></div></dialog>`;
    main.querySelector('[name=arrival]').value = arrival;
    main.querySelector('[name=departure]').value = departure;
    syncDates(); setScene(sceneIndex);
    cleanupEffects = window.OaktownEffects.mount(main,{t:c});
    inquiryObserver = new IntersectionObserver(entries => {
      for (const entry of entries) document.body.classList.toggle(entry.target.id==='stay'?'mint-hero-visible':'mint-inquiry-visible',entry.isIntersecting);
    },{threshold:.05});
    inquiryObserver.observe(document.getElementById('inquire'));
    inquiryObserver.observe(document.getElementById('stay'));
    closeMenu();
    if (oldId) {
      const nextSection = document.getElementById(oldId);
      scrollTo({top:nextSection ? scrollY + nextSection.getBoundingClientRect().top - oldTop : oldScroll,behavior:'instant'});
    }
  }
  function setScene(index) {
    sceneIndex = index;
    const p = photos[[0,2,3][index]];
    const hero = main.querySelector('.mint-hero-image');
    hero.src = asset(p[0]); hero.alt = caption(p);
    hero.width = p[3]; hero.height = p[4];
    main.querySelectorAll('[data-mint-scene]').forEach(b => b.setAttribute('aria-pressed',String(Number(b.dataset.mintScene)===index)));
  }
  function showPhoto(index) {
    photoIndex = (index + photos.length) % photos.length;
    const p = photos[photoIndex], dialog = main.querySelector('dialog');
    const img = dialog.querySelector('img');
    dialog.querySelector('.mint-gallery-error').hidden = true;
    img.src = asset(p[0]); img.alt = caption(p);
    dialog.querySelector('.mint-gallery-caption').textContent = `${photoIndex+1} ${c('photosOf')} ${photos.length} — ${caption(p)}`;
  }
  function tomorrowAfter(value) {
    const date = new Date(value+'T12:00:00');
    date.setDate(date.getDate()+1);
    return localDate(date);
  }
  function localDate(date) {
    return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  }
  function syncDates() {
    const arrival = main.querySelector('[name=arrival]'), departure = main.querySelector('[name=departure]');
    arrival.min = localDate(new Date());
    departure.min = tomorrowAfter(arrival.value || arrival.min);
    departure.setCustomValidity(departure.value && departure.value<=arrival.value ? c('invalidDates') : '');
    main.querySelector('.mint-inquiry-ready').hidden = true;
  }
  function inquiryBody() {
    const format = value => new Intl.DateTimeFormat(language==='es'?'es-US':'en-US',{dateStyle:'long'}).format(new Date(value+'T12:00:00'));
    const arrival = format(main.querySelector('[name=arrival]').value), departure = format(main.querySelector('[name=departure]').value);
    return language==='en' ? `Hi Oaktown Rentals,\n\nI’d like to ask about The Mint Mojo in Cudjoe Key.\nArrival: ${arrival}\nDeparture: ${departure}\n\nPlease let me know the availability, rates, guest capacity and stay requirements.\n\nThank you!` : `Hola Oaktown Rentals:\n\nQuisiera consultar una estancia en The Mint Mojo, Cudjoe Key.\nLlegada: ${arrival}\nSalida: ${departure}\n\nPor favor, indíquenme la disponibilidad, las tarifas, la capacidad y los requisitos de estancia.\n\n¡Gracias!`;
  }
  main.addEventListener('submit',event => {
    if (!event.target.matches('.mint-date-form')) return;
    event.preventDefault(); syncDates();
    if (!event.target.reportValidity()) return;
    const email = 'mailto:joejrandles@yahoo.com?subject='+encodeURIComponent('The Mint Mojo — '+(language==='en'?'date inquiry':'consulta de fechas'))+'&body='+encodeURIComponent(inquiryBody());
    const text = 'sms:+15025001070?body='+encodeURIComponent(inquiryBody());
    main.querySelector('[data-inquiry-email]').href = email;
    main.querySelector('[data-inquiry-text]').href = text;
    main.querySelector('.mint-inquiry-ready').hidden = false;
  });
  main.addEventListener('input',event => {if (event.target.matches('input[type=date]')) syncDates();});
  main.addEventListener('click',event => {
    const scene = event.target.closest('[data-mint-scene]');
    if (scene) setScene(Number(scene.dataset.mintScene));
    const opener = event.target.closest('[data-open-photo]');
    if (opener) {
      showPhoto(Number(opener.dataset.openPhoto));
      main.querySelector('dialog').showModal();
    }
    const step = event.target.closest('[data-photo-step]');
    if (step) showPhoto(photoIndex+Number(step.dataset.photoStep));
    if (event.target.closest('[data-close-photo]')) main.querySelector('dialog').close();
  });
  main.addEventListener('error',event => {if (event.target.matches('.mint-lightbox img')) main.querySelector('.mint-gallery-error').hidden=false;},true);
  let touchStart;
  main.addEventListener('touchstart',event => {
    if (event.target.closest('.mint-lightbox-visual')) touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  main.addEventListener('touchend',event => {
    if (!touchStart) return;
    const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
    touchStart=null;
    if (Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5) showPhoto(photoIndex+(dx>0?-1:1));
  },{passive:true});
  languageButton.addEventListener('click',() => {
    language = language==='en'?'es':'en';
    try { localStorage.setItem('oaktown-language',language); } catch {}
    render();
  });
  menuButton.addEventListener('click',() => {
    const opening = navigation.hidden;
    navigation.hidden = !opening;
    menuButton.setAttribute('aria-expanded',String(opening));
    menuButton.setAttribute('aria-label',c(opening?'closeMenu':'openMenu'));
  });
  navigation.addEventListener('click',event => {if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event => {
    if (event.key==='Escape'&&!navigation.hidden) closeMenu(true);
    if (main.querySelector('dialog[open]')&&['ArrowLeft','ArrowRight'].includes(event.key)) {
      event.preventDefault(); showPhoto(photoIndex+(event.key==='ArrowLeft'?-1:1));
    }
  });
  render();
  // Content is rendered before following a deep link to a section.
  if (location.hash) requestAnimationFrame(() => {
    const id = location.hash.slice(1);
    document.getElementById(id)?.scrollIntoView({behavior:'instant'});
  });
})();
