(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
  const messages={
    invalid_settings:'Check all booking rules, including both languages and fees.',
    invalid_dates:'Choose valid future dates, up to 90 nights at a time.',
    inventory_confirmation_required:'Confirm the nights are blocked on all other booking channels before opening them.',
    payment_unavailable:'Stripe could not be reached. Try checking again. Held dates are still blocked.',
    payment_review_required:'Keep these nights blocked. Review Stripe Workbench and follow the recovery guide before releasing them.',
    payment_mismatch:'Stripe details do not match this reservation. Keep dates blocked and review the payment.'
  };
  let state,busy=false;

  async function api(path='',method='GET',body) {
    const response=await fetch('/api/admin/bookings'+path,{
      method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'
    });
    let data;
    try { data=await response.json(); } catch { throw Error('Sign in again to manage bookings.'); }
    if (!response.ok) throw Error(messages[data.error]||data.error||'Could not load bookings.');
    return data;
  }
  function el(tag,text,className) {
    const node=document.createElement(tag);
    node.textContent=text;
    if (className) node.className=className;
    return node;
  }
  function button(label,handler) {
    const node=el('button',label,'secondary');
    node.type='button';
    node.addEventListener('click',handler);
    return node;
  }
  function stripeLink(paymentIntent) {
    const link=el('a','Open payment in Stripe');
    link.href='https://dashboard.stripe.com/'+(state.mode==='test'?'test/':'')+'payments/'+encodeURIComponent(paymentIntent);
    link.target='_blank';
    link.rel='noopener';
    return link;
  }
  function reservationCard(reservation) {
    const r=reservation;
    const card=el('article','','reservation-card');
    card.append(el('strong',r.arrival+' – '+r.departure),
      el('p',r.guests+(r.guests===1?' guest':' guests')+' · '+money(r.totalCents)+' · '+r.state),
      el('small','Reference: '+r.id));
    if (r.refundStatus!=='none') card.append(el('p','Stripe refund: '+r.refundStatus));
    for (const notice of r.notifications) {
      const label=notice.recipient==='guest'?'Guest confirmation':'Operator notification';
      card.append(el('small',label+' · '+notice.state));
    }
    const actions=el('div','','reservation-actions');
    if (r.paymentIntent) actions.append(stripeLink(r.paymentIntent));
    if (r.stripeSession && ['holding','confirmed'].includes(r.state)) {
      actions.append(button('Check Stripe status',()=>task(async()=>{
        await api('/'+r.id+'/reconcile','POST',{});
        await load();
      },'Payment status checked.')));
    }
    if (r.state==='holding' && !r.stripeSession) {
      card.append(el('p','Checkout needs review. Look up this reservation in Stripe before releasing dates.'));
      const endpoint='/'+r.id+'/review-checkout';
      actions.append(button('Look up Stripe checkout',()=>task(async()=>{
        await api(endpoint,'POST',{});
        await load();
      },'Stripe checkout located and checked.')));
      if (Date.now()/1000>=r.expiresAt+300) {
        const label=el('label','','booking-check');
        const checkbox=document.createElement('input');
        checkbox.type='checkbox';
        label.append(checkbox,'I checked Stripe Workbench and found no session or payment for this reservation.');
        actions.append(label,button('Release verified unpaid hold',()=>task(async()=>{
          if (!checkbox.checked) throw Error('Verify the reservation in Stripe before releasing it.');
          const result=await api(endpoint,'POST',{confirmNoSession:true});
          await load();
          return result.state==='expired'?'Unpaid hold released.':'Stripe checkout found and reconciled.';
        })));
      }
    }
    card.append(actions);
    return card;
  }
  async function load() {
    state=await api();
    const form=$('settings');
    for (const key of ['minNights','maxNights','maxGuests','termsEn','termsEs','cancellationEn','cancellationEs']) {
      form.elements[key].value=state.config[key]??'';
    }
    form.elements.cleaning.value=state.config.cleaningCents===undefined?'':state.config.cleaningCents/100;
    form.elements.tax.value=state.config.taxBps===undefined?'':state.config.taxBps/100;
    for (const key of ['enabled','exclusiveInventoryAcknowledged']) form.elements[key].checked=!!state.config[key];
    $('payment-state').textContent='Payments: '+state.mode+'. '
      +(state.paymentReady?'Checkout configuration is present.':'Payment setup is incomplete. Public booking stays closed.')
      +' '+(state.config.enabled?'Booking rules enabled.':'Booking rules disabled.')
      +' '+(state.emailReady?'Booking email configured.':'Booking email setup is incomplete.');
    $('reservations').replaceChildren(...state.reservations.map(reservationCard));
    if (!state.reservations.length) $('reservations').append(el('p','No direct reservations yet.'));
    $('inventory-list').replaceChildren();
    if (!state.inventory.length) $('inventory-list').append(el('p','No dates configured.'));
    for (const day of state.inventory) {
      const row=el('div','','inventory-row');
      row.append(el('span',day.day),el('span',money(day.rate_cents)),
        el('span',day.reservation_id?'Reserved / held':day.open?'Open':'Closed'));
      $('inventory-list').append(row);
    }
  }
  async function task(fn,success='Loaded.') {
    if (busy) return;
    busy=true;
    document.querySelectorAll('button').forEach(node=>{node.disabled=true;});
    $('notice').textContent='Working…';
    $('notice').classList.remove('error');
    try {
      $('notice').textContent=(await fn())||success;
    } catch (error) {
      $('notice').textContent=error.message;
      $('notice').classList.add('error');
    } finally {
      busy=false;
      document.querySelectorAll('button').forEach(node=>{node.disabled=false;});
    }
  }
  $('settings').addEventListener('submit',event=>{
    event.preventDefault();
    task(async()=>{
      const fields=event.target.elements;
      const config={
        enabled:fields.enabled.checked,
        exclusiveInventoryAcknowledged:fields.exclusiveInventoryAcknowledged.checked,
        cleaningCents:Math.round(Number(fields.cleaning.value)*100),
        taxBps:Math.round(Number(fields.tax.value)*100)
      };
      for (const key of ['minNights','maxNights','maxGuests']) config[key]=Number(fields[key].value);
      for (const key of ['termsEn','termsEs','cancellationEn','cancellationEs']) config[key]=fields[key].value;
      await api('/settings','PUT',{version:state.version,config});
      await load();
    },'Booking rules saved.');
  });
  const inventory=$('inventory');
  const fields=inventory.elements;
  inventory.addEventListener('input',event=>{
    if (event.target===fields.blockedElsewhere) return;
    fields.blockedElsewhere.checked=false;
    fields.rate.required=fields.open.value==='true';
  });
  inventory.addEventListener('submit',event=>{
    event.preventDefault();
    task(async()=>{
      const open=fields.open.value==='true';
      await api('/inventory','PUT',{
        version:state.version,arrival:fields.arrival.value,departure:fields.departure.value,open,
        rateCents:open?Math.round(Number(fields.rate.value)*100):undefined,
        blockedElsewhere:fields.blockedElsewhere.checked
      });
      fields.blockedElsewhere.checked=false;
      await load();
    },'Dates saved.');
  });
  $('reload').addEventListener('click',()=>task(load));
  task(load);
})();
