const address = /^[^\s<>,@]+@[^\s<>,@]+\.[^\s<>,@]+$/;
const retryWindow = 23 * 60 * 60;
const retryDelay = 5 * 60;

export function emailReady(env) {
  return !!(env.RESEND_API_KEY && address.test(env.BOOKING_EMAIL_FROM || '')
    && address.test(env.BOOKING_OPERATOR_EMAIL || ''));
}

function message(row, recipient) {
  const quote = JSON.parse(row.quote_json);
  const spanish = JSON.parse(row.checkout_params).locale === 'es';
  const total = new Intl.NumberFormat(spanish && recipient === 'guest' ? 'es-US' : 'en-US', {
    style:'currency', currency:'USD'
  }).format(quote.totalCents / 100);
  if (recipient === 'operator') {
    return {
      subject:'Lobster Nirvana booking confirmed',
      text:'Reservation ' + row.id + '\nCheck-in: ' + quote.arrival + '\nCheckout: ' + quote.departure
        + '\nGuests: ' + quote.guests + '\nPaid: ' + total + ' USD\n\nReview the reservation in Oaktown booking admin.'
    };
  }
  if (spanish) {
    return {
      subject:'Tu reserva de Lobster Nirvana está confirmada',
      text:'Tu reserva de Lobster Nirvana está confirmada.\n\nReferencia: ' + row.id
        + '\nLlegada: ' + quote.arrival + '\nSalida: ' + quote.departure
        + '\nHuéspedes: ' + quote.guests + '\nTotal pagado: ' + total
        + ' USD\n\nResponde a este correo para coordinar la llegada o solicitar cambios.'
    };
  }
  return {
    subject:'Your Lobster Nirvana booking is confirmed',
    text:'Your Lobster Nirvana booking is confirmed.\n\nReservation reference: ' + row.id
      + '\nCheck-in: ' + quote.arrival + '\nCheckout: ' + quote.departure
      + '\nGuests: ' + quote.guests + '\nTotal paid: ' + total
      + ' USD\n\nReply to this email for arrival details or changes.'
  };
}

export async function sendBookingNotifications(env, row, guestEmail, transport) {
  if (!emailReady(env) || row.state!=='confirmed' || row.refund_status==='pending') return;
  const db=env.DB;
  const time=Math.floor(Date.now()/1000);
  const pending=await db.prepare(`
    SELECT recipient, first_attempt_at FROM booking_notifications
    WHERE reservation_id=? AND sent_at IS NULL AND needs_review=0 AND next_attempt_at<=?
  `).bind(row.id,time).all();
  for (const item of pending.results) {
    const to=item.recipient==='guest' ? guestEmail : env.BOOKING_OPERATOR_EMAIL;
    if (!address.test(to||'') || (item.first_attempt_at && time-item.first_attempt_at>=retryWindow)) {
      await markForReview(db,row.id,item.recipient);
      continue;
    }
    const claim=await db.prepare(`
      UPDATE booking_notifications SET next_attempt_at=?, first_attempt_at=COALESCE(first_attempt_at,?)
      WHERE reservation_id=? AND recipient=? AND sent_at IS NULL AND needs_review=0 AND next_attempt_at<=?
        AND EXISTS (SELECT 1 FROM booking_reservations WHERE id=? AND state='confirmed' AND refund_status<>'pending')
    `).bind(time+retryDelay,time,row.id,item.recipient,time,row.id).run();
    if (claim.meta.changes!==1) continue;
    let response;
    try {
      response=await transport('https://api.resend.com/emails',{
        method:'POST',
        headers:{
          Authorization:'Bearer '+env.RESEND_API_KEY,
          'Content-Type':'application/json',
          'Idempotency-Key':'lobster-booking-'+row.id+'-'+item.recipient
        },
        body:JSON.stringify({from:'Oaktown Rentals <'+env.BOOKING_EMAIL_FROM+'>',to:[to],
          reply_to:env.BOOKING_OPERATOR_EMAIL,...message(row,item.recipient)}),
        signal:AbortSignal.timeout(8000),redirect:'error'
      });
    } catch { continue; }
    if (response.ok) {
      await db.prepare('UPDATE booking_notifications SET sent_at=? WHERE reservation_id=? AND recipient=?')
        .bind(time,row.id,item.recipient).run();
    } else if (response.status>=400 && response.status<500 && ![408,409,429].includes(response.status)) {
      await markForReview(db,row.id,item.recipient);
    }
  }
}

async function markForReview(db,id,recipient) {
  await db.prepare(`
    UPDATE booking_notifications SET needs_review=1
    WHERE reservation_id=? AND recipient=? AND sent_at IS NULL
  `).bind(id,recipient).run();
}
