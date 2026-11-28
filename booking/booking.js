(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const words={
    en:{location:'The Florida Keys',oneNight:'night',oneGuest:'guest',back:'Explore the house',title:'Make time<br>for the island.',intro:'Your waterfront escape, a few details away.',photos:'See the house and photos',eyebrow:'YOUR STAY AT LOBSTER NIRVANA',heading:'A little island time.',test:'Test checkout · No real reservation or charge.',loading:'Checking direct booking availability…',closed:'Online booking is not open yet. Contact Oaktown Rentals to confirm dates and rates.',contact:'Contact Oaktown Rentals',airbnb:'View on Airbnb',arrival:'Check-in',departure:'Checkout',guests:'Guests',check:'Check dates and price',summary:'Your stay',paymentNote:'The full total is due at checkout. Dates are held when you continue to payment.',terms:'Stay terms',cancellation:'Cancellation policy',accept:'I agree to the stay terms and cancellation policy.',pay:'Continue to secure payment',stripe:'Payment is securely processed by Stripe. Your booking is confirmed after successful payment.',resume:'Return to payment',retry:'Recover checkout',recovering:'Your dates are held. Recover your checkout to continue, or contact Oaktown Rentals with your reference.',refresh:'Check payment status',accommodation:'Accommodation',cleaning:'Cleaning',tax:'Taxes',total:'Total (USD)',night:'nights',checking:'Checking…',ready:'Review your stay and terms below.',confirmed:'Your island time is booked.',holding:'Your payment is not confirmed yet.',expired:'This checkout has expired.',refunded:'This stay has been refunded.',confirmedCopy:'Keep your reservation reference. Contact Oaktown Rentals for arrival details or changes.',confirmedEmailCopy:'Keep your reservation reference and check your email for confirmation. Contact Oaktown Rentals for arrival details or changes.',holdingCopy:'If you have paid, check the status again shortly. Otherwise, return to Stripe to finish payment. Closing checkout does not confirm a booking.',expiredCopy:'No reservation was confirmed from this checkout. Choose your dates again to start a new checkout.',refundedCopy:'Contact Oaktown Rentals with questions about your refund.',reference:'Reservation reference',missing:'For your privacy, open this page in the browser used to book, or contact Oaktown Rentals with your reservation reference.',generic:'We could not complete that step. Please try again or contact Oaktown Rentals.',rule:(a,b,g)=>`${a}–${b} nights · Up to ${g} guests`,errors:{invalid_dates:'Choose future dates, with checkout after check-in.',stay_length:'These dates do not meet the stay length shown above.',invalid_guests:'Check the number of guests.',unavailable:'These dates are not available for direct booking. Try different dates or contact us.',booking_closed:'Direct booking is currently closed. Please contact Oaktown Rentals.',terms_required:'Please agree to the stay terms and cancellation policy.',quote_changed:'The price or terms have changed. Check your dates again.',verification_required:'Please complete the security check and try again.',too_many_attempts:'Too many checkout attempts. Please wait 15 minutes before trying again.',payment_unavailable:'Stripe could not be reached. Your dates may still be held. Try continuing again to recover your checkout.',checkout_rejected:'Stripe could not start payment. Check your dates again to start a fresh checkout.',payment_review_required:'This checkout needs our help. Please contact Oaktown Rentals.',new_checkout_required:'Check your dates and price again before continuing.',reservation_not_found:'We could not find this reservation in this browser.'}},
    es:{location:'Los Cayos de Florida',oneNight:'noche',oneGuest:'huésped',back:'Descubrir la casa',title:'Un poco más<br>de tiempo isleño.',intro:'Tu escapada junto al agua está a unos pasos.',photos:'Ver la casa y las fotos',eyebrow:'TU ESTANCIA EN LOBSTER NIRVANA',heading:'Tiempo para la isla.',test:'Pago de prueba · Sin reserva ni cargo real.',loading:'Consultando las reservas directas…',closed:'Las reservas en línea aún no están abiertas. Contacta a Oaktown Rentals para confirmar fechas y tarifas.',contact:'Contactar a Oaktown Rentals',airbnb:'Ver en Airbnb',arrival:'Llegada',departure:'Salida',guests:'Huéspedes',check:'Consultar fechas y precio',summary:'Tu estancia',paymentNote:'El total se paga al completar el pago. Las fechas se retienen cuando continúas al pago.',terms:'Condiciones de estancia',cancellation:'Política de cancelación',accept:'Acepto las condiciones de estancia y la política de cancelación.',pay:'Continuar al pago seguro',stripe:'Stripe procesa el pago de forma segura. Tu reserva se confirma tras completar el pago.',resume:'Volver al pago',retry:'Recuperar el pago',recovering:'Tus fechas están retenidas. Recupera el pago para continuar o contacta a Oaktown Rentals con tu referencia.',refresh:'Consultar estado del pago',accommodation:'Alojamiento',cleaning:'Limpieza',tax:'Impuestos',total:'Total (USD)',night:'noches',checking:'Consultando…',ready:'Revisa tu estancia y las condiciones a continuación.',confirmed:'Tu escapada está reservada.',holding:'Tu pago aún no está confirmado.',expired:'Este proceso de pago ha caducado.',refunded:'Esta estancia ha sido reembolsada.',confirmedCopy:'Guarda la referencia de tu reserva. Contacta a Oaktown Rentals para los detalles de llegada o cambios.',confirmedEmailCopy:'Guarda la referencia de tu reserva y revisa tu correo para ver la confirmación. Contacta a Oaktown Rentals para los detalles de llegada o cambios.',holdingCopy:'Si ya pagaste, vuelve a consultar el estado en unos momentos. Si no, vuelve a Stripe para completar el pago. Cerrar el pago no confirma una reserva.',expiredCopy:'Este proceso de pago no confirmó una reserva. Selecciona tus fechas de nuevo para comenzar otro pago.',refundedCopy:'Contacta a Oaktown Rentals si tienes preguntas sobre el reembolso.',reference:'Referencia de la reserva',missing:'Por tu privacidad, abre esta página en el navegador que usaste para reservar o contacta a Oaktown Rentals con tu referencia.',generic:'No pudimos completar este paso. Inténtalo de nuevo o contacta a Oaktown Rentals.',rule:(a,b,g)=>`${a}–${b} noches · Hasta ${g} huéspedes`,errors:{invalid_dates:'Elige fechas futuras, con salida posterior a la llegada.',stay_length:'Las fechas no cumplen la duración indicada arriba.',invalid_guests:'Revisa el número de huéspedes.',unavailable:'Estas fechas no están disponibles para reserva directa. Prueba otras fechas o contáctanos.',booking_closed:'Las reservas directas están cerradas. Contacta a Oaktown Rentals.',terms_required:'Acepta las condiciones de estancia y la política de cancelación.',quote_changed:'El precio o las condiciones han cambiado. Consulta las fechas de nuevo.',verification_required:'Completa la verificación de seguridad e inténtalo de nuevo.',too_many_attempts:'Demasiados intentos de pago. Espera 15 minutos antes de intentarlo de nuevo.',payment_unavailable:'No se pudo conectar con Stripe. Tus fechas podrían estar retenidas. Intenta continuar otra vez para recuperar el pago.',checkout_rejected:'Stripe no pudo iniciar el pago. Consulta tus fechas de nuevo para iniciar otro pago.',payment_review_required:'Este pago necesita nuestra ayuda. Contacta a Oaktown Rentals.',new_checkout_required:'Consulta las fechas y el precio de nuevo antes de continuar.',reservation_not_found:'No encontramos esta reserva en este navegador.'}}
  };
  const pendingKey='lobster-pending-checkout';
  let language='en',config,quote,reservation,pending,widget,widgetSize,widgetLanguage,turnstileScript,verification='',busy=false;
  try { pending=JSON.parse(sessionStorage.getItem(pendingKey)); } catch {}
  try{language=new URLSearchParams(location.search).get('lang')||localStorage.getItem('oaktown-language')||'en';}catch{}
  if(language!=='es')language='en';
  const t=key=>words[language][key];
  const money=value=>new Intl.NumberFormat(language==='es'?'es-US':'en-US',{style:'currency',currency:'USD'}).format(value/100);
  function notice(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
  function translate(){
    document.documentElement.lang=language;
    document.querySelectorAll('[data-t]').forEach(el=>{if(el.dataset.t==='title')el.innerHTML=t('title');else el.textContent=t(el.dataset.t);});
    $('language').textContent=language==='en'?'ES':'EN';$('language').setAttribute('aria-label',language==='en'?'Cambiar a español':'Switch to English');
    document.title=(language==='es'?'Reservar':'Book')+' Lobster Nirvana — Oaktown Rentals';
    document.querySelector('.skip-link').textContent=language==='es'?'Saltar a la reserva':'Skip to booking';
    document.querySelector('.booking-story>img').alt=language==='es'?'La casa Lobster Nirvana y la piscina':'Lobster Nirvana house and pool';
    if(config?.enabled)$('stay-rule').textContent=t('rule')(config.minNights,config.maxNights,config.maxGuests);
    if(quote)renderQuote();if(reservation && !$('reservation').hidden)renderReservation();
  }
  async function api(path,body){
    const response=await fetch('/api/booking/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});
    let data;try{data=await response.json();}catch{throw Error('generic');}
    if(!response.ok)throw Error(data.error||'generic');return data;
  }
  function error(e){notice(words[language].errors[e.message]||t('generic'),true);verification='';if(widget!==undefined&&window.turnstile)window.turnstile.reset(widget);}
  async function task(fn){if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);notice(t('checking'));try{await fn();}catch(e){error(e);}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
  function fields(){const form=$('dates');return {arrival:form.elements.arrival.value,departure:form.elements.departure.value,guests:Number(form.elements.guests.value)};}
  function resetQuote(){quote=null;$('quote').hidden=true;$('accept').checked=false;verification='';if(widget!==undefined&&window.turnstile)window.turnstile.reset(widget);notice('');}
  function renderQuote(){
    $('quote').hidden=false;
    const nights=quote.nights.length;
    const nightLabel=t(nights===1?'oneNight':'night');
    const guestLabel=t(quote.guests===1?'oneGuest':'guests').toLowerCase();
    $('stay-summary').textContent=quote.arrival+' – '+quote.departure+' · '+nights+' '+nightLabel+' · '+quote.guests+' '+guestLabel;
    $('price').replaceChildren();
    for(const [label,value,last] of [['accommodation',quote.accommodationCents],['cleaning',quote.cleaningCents],['tax',quote.taxCents],['total',quote.totalCents,true]]){const row=document.createElement('div');if(last)row.className='total';const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=t(label);dd.textContent=money(value);row.append(dt,dd);$('price').append(row);}
    $('terms-copy').textContent=quote[language==='es'?'termsEs':'termsEn'];$('cancellation-copy').textContent=quote[language==='es'?'cancellationEs':'cancellationEn'];
    $('accept').checked=false;
  }
  function renderVerification() {
    if (!quote || $('quote').hidden || !window.turnstile) return;
    const size=$('verification').clientWidth<300?'compact':'flexible';
    if (widget!==undefined && size===widgetSize && widgetLanguage===language) return;
    if (widget!==undefined) window.turnstile.remove(widget);
    verification='';
    widgetSize=size;
    widgetLanguage=language;
    widget=window.turnstile.render('#verification',{
      sitekey:config.siteKey,action:'booking',language,theme:'light',size,
      callback:token=>{verification=token;},
      'expired-callback':()=>{verification='';},
      'error-callback':()=>{verification='';notice(words[language].errors.verification_required,true);}
    });
  }
  function mountVerification() {
    if (window.turnstile) { renderVerification(); return; }
    if (turnstileScript) return;
    const script=document.createElement('script');
    turnstileScript=script;
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.onload=renderVerification;
    script.onerror=()=>{
      script.remove();
      turnstileScript=undefined;
      notice(words[language].errors.verification_required,true);
    };
    document.head.append(script);
  }
  function renderReservation() {
    $('dates').hidden=true;$('quote').hidden=true;$('closed').hidden=true;$('reservation').hidden=false;
    $('reservation-title').textContent=t(reservation.state);
    const recover=reservation.state==='holding' && !reservation.checkoutUrl && pending;
    const copy=reservation.state==='confirmed' && config?.notifications?'confirmedEmailCopy':reservation.state+'Copy';
    $('reservation-copy').textContent=t(recover?'recovering':copy);
    $('reference').textContent=t('reference')+': '+reservation.id+' · '+reservation.arrival+' – '+reservation.departure+' · '+money(reservation.totalCents);
    $('retry-checkout').hidden=!recover||!config?.enabled;
    $('resume').hidden=true;
    if (reservation.checkoutUrl && URL.canParse(reservation.checkoutUrl)) {
      const url=new URL(reservation.checkoutUrl);
      if (url.origin==='https://checkout.stripe.com') {
        $('resume').href=url.href;
        $('resume').hidden=false;
      }
    }
    if (['expired','refunded'].includes(reservation.state)) $('dates').hidden=!config?.enabled;
  }
  function clearPending() {
    pending=null;
    try { sessionStorage.removeItem(pendingKey); } catch {}
  }
  function showReservation(result,token) {
    reservation=result;
    try { sessionStorage.setItem('lobster-reservation-'+result.id,token); } catch {}
    if (pending?.token===token && result.state!=='holding') clearPending();
    renderReservation();
    $('refresh-status').hidden=false;
    $('reservation').focus();
    notice('');
  }
  async function status(id,pendingAttempt=pending) {
    let token=pendingAttempt?.token;
    if (id) { try { token=sessionStorage.getItem('lobster-reservation-'+id); } catch { token=undefined; } }
    if (!token) {
      if (!id) return;
      $('dates').hidden=true;$('closed').hidden=true;
      notice(t('missing'),true);$('reference').textContent=t('reference')+': '+id;
      $('reservation').hidden=false;$('refresh-status').hidden=true;
      return;
    }
    try {
      showReservation(await api('status',id?{id,token}:{token}),token);
    } catch (error) {
      if (id || error.message!=='reservation_not_found') throw error;
      clearPending();
      notice('');
    }
  }
  async function submitCheckout(attempt) {
    try {
      const result=await api('checkout',{...attempt,verification,acceptedTerms:true});
      showReservation(result,attempt.token);
      if (!$('resume').hidden) location.assign($('resume').href);
    } catch (error) {
      if (['checkout_rejected','quote_changed','unavailable','new_checkout_required'].includes(error.message)) {
        clearPending();
        resetQuote();
      }
      throw error;
    }
  }
  $('dates').addEventListener('input',resetQuote);
  $('dates').addEventListener('submit',event=>{
    event.preventDefault();
    task(async()=>{
      const input=fields();
      const result=await api('quote',input);
      const current=fields();
      if (input.arrival!==current.arrival || input.departure!==current.departure || input.guests!==current.guests) return;
      quote=result;
      $('reservation').hidden=true;
      renderQuote();
      mountVerification();
      notice(t('ready'));
      $('quote').focus();
    });
  });
  $('pay').addEventListener('click',()=>task(async()=>{
    if (!quote) return;
    if (!$('accept').checked) throw Error('terms_required');
    if (!pending || pending.quoteKey!==quote.key) {
      const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
      const attempt={arrival:quote.arrival,departure:quote.departure,guests:quote.guests,quoteKey:quote.key,token,language};
      sessionStorage.setItem(pendingKey,JSON.stringify(attempt));
      pending=attempt;
    }
    await submitCheckout(pending);
  }));
  $('retry-checkout').addEventListener('click',()=>task(()=>submitCheckout(pending)));
  $('refresh-status').addEventListener('click',()=>task(()=>status(reservation?.id||new URLSearchParams(location.search).get('reservation'))));
  $('language').addEventListener('click',()=>{
    language=language==='en'?'es':'en';
    try{localStorage.setItem('oaktown-language',language);}catch{}
    translate();
    renderVerification();
    notice('');
  });
  window.addEventListener('resize',renderVerification);
  translate();
  task(async()=>{
    config=await api('config');
    $('test-mode').hidden=config.mode!=='test';
    if (config.enabled) {
      const form=$('dates');
      form.elements.arrival.min=new Date(Date.parse(config.today+'T12:00:00Z')+86400000).toISOString().slice(0,10);
      form.elements.departure.min=form.elements.arrival.min;
      for (let i=1;i<=config.maxGuests;i++) form.elements.guests.add(new Option(i,i));
      $('dates').hidden=false;
      translate();
    } else {
      $('closed').hidden=false;
    }
    notice('');
    const id=new URLSearchParams(location.search).get('reservation');
    if (id && /^[a-f0-9-]{36}$/.test(id)) await status(id);
    if (pending && (!id || reservation?.state==='expired')) await status(null);
  });
})();
