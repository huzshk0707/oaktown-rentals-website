const $ = selector => document.querySelector(selector);
const form = $('#property-form');
const textFields = ['name','slug','neighborhood','city','availability','label','labelEs','summary','summaryEs','sourceUrl'];
const arrays = ['description','descriptionEs','features','featuresEs','terms','termsEs'];
let records = [], current = null, photos = [], dirty = false, busy = false, photosEnabled = false;
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:n%1?2:0,maximumFractionDigits:2}).format(n);
const escape = text => String(text ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photoSource = url => url.startsWith('/media/') ? '/api/admin'+url : url;
function notice(message='',error=false) { $('#notice').textContent=message; $('#notice').classList.toggle('error',error); }
async function api(path,options={}) {
  const response = await fetch('/api/admin'+path,{credentials:'same-origin',...options});
  const type=response.headers.get('Content-Type') || '';
  if (!type.includes('application/json')) throw new Error('Your sign-in may have expired. Reload the admin to sign in again.');
  const value=await response.json();
  if (!response.ok) throw new Error(value.error || 'The request could not be completed.');
  return value;
}
const send = (path,method,body) => api(path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
function lock(value) {
  busy=value;
  for(const control of form.querySelectorAll('input,textarea,select'))control.disabled=value;
  for(const button of document.querySelectorAll('#property-form button,#back,#new-property,#refresh')) button.disabled=value;
  $('#photo-upload').disabled=value||!photosEnabled;
  if(!value){for(const button of document.querySelectorAll('[data-move]')){const i=Number(button.dataset.move),j=i+Number(button.dataset.direction);button.disabled=j<0||j>=photos.length;}}
}
async function task(fn) { if(busy)return; lock(true);try{await fn();}catch(error){notice(error.message,true);}finally{lock(false);} }
function renderList() {
  const counts={all:records.length,published:0,draft:0,archived:0};records.forEach(r=>counts[r.state]++);
  $('#stats').innerHTML=[['all','Total homes'],['published','Published'],['draft','Drafts'],['archived','Archived']].map(([key,label])=>`<div class="stat"><strong>${counts[key]}</strong><span>${label}</span></div>`).join('');
  const query=$('#search').value.toLowerCase(), state=$('#state-filter').value;
  const shown=records.filter(r=>(state==='all'||r.state===state)&&`${r.property.name} ${r.property.neighborhood}`.toLowerCase().includes(query));
  $('#empty-list').hidden=shown.length>0;
  $('#property-list').innerHTML=shown.map(r=>`<article class="listing"><div class="listing-photo">${r.property.photos[0]?`<img src="${escape(photoSource(r.property.photos[0].url))}" alt="${escape(r.property.photos[0].alt)}" loading="lazy">`:''}<span class="badge">${escape(r.state)}</span></div><div class="listing-body"><p>${escape(r.property.neighborhood||'Neighborhood to be added')}</p><h3>${escape(r.property.name)}</h3><p>${r.property.bedrooms} beds · ${r.property.bathrooms} baths · ${escape(r.property.availability.replaceAll('_',' '))}</p>${r.unpublishedChanges?'<p class="dirty-note">Unpublished changes saved</p>':''}<div class="listing-bottom"><strong>${money(r.property.rent)} <small>/ month</small></strong><button class="secondary" data-edit="${escape(r.id)}">Edit listing</button></div></div></article>`).join('');
}
async function refresh() { const data=await api('/properties');records=data.properties;renderList(); }
function snapshot() {
  const result={photos:photos.map(p=>({...p}))};
  for(const key of textFields) result[key]=form.elements.namedItem(key).value.trim();
  for(const key of ['rent','deposit','bedrooms','bathrooms']) result[key]=Number(form.elements.namedItem(key).value);
  for(const key of arrays) result[key]=form.elements.namedItem(key).value.split(key.startsWith('description')?/\n\s*\n/:/\n/).map(s=>s.trim()).filter(Boolean);
  return result;
}
function openEditor(record) {
  current=record;photos=record?record.property.photos.map(p=>({...p})):[];form.reset();
  if(record){for(const key of textFields)form.elements.namedItem(key).value=record.property[key]||'';for(const key of ['rent','deposit','bedrooms','bathrooms'])form.elements.namedItem(key).value=record.property[key];for(const key of arrays)form.elements.namedItem(key).value=record.property[key].join(key.startsWith('description')?'\n\n':'\n');}
  form.elements.slug.readOnly=!!record;
  $('#editor-title').textContent=record?record.property.name:'Add a property';
  $('#record-state').textContent=record?(record.unpublishedChanges?'Unpublished edits':record.state):'New draft';
  $('#archive').hidden=!record||record.state==='archived';$('#unpublish').hidden=!record||record.state!=='published';
  $('#collection').hidden=true;$('#editor').hidden=false;$('#new-property').hidden=true;
  dirty=false;renderPhotos();notice();window.scrollTo({top:0,behavior:'instant'});form.elements.name.focus();
}
function renderPhotos() {
  $('#photo-list').innerHTML=photos.map((p,i)=>`<article class="photo-card"><img src="${escape(photoSource(p.url))}" alt="${escape(p.alt)}"><span class="badge">${i===0?'Main photo':'Photo '+(i+1)}</span><label>Photo description<input data-caption="${i}" value="${escape(p.alt)}" maxlength="300" placeholder="Describe the room or exterior"></label><div class="photo-actions"><button type="button" data-move="${i}" data-direction="-1" aria-label="Move photo ${i+1} earlier" ${i===0?'disabled':''}>Earlier</button><button type="button" data-move="${i}" data-direction="1" aria-label="Move photo ${i+1} later" ${i===photos.length-1?'disabled':''}>Later</button><button class="secondary" type="button" data-remove="${i}">Remove</button></div></article>`).join('');
  $('#photo-upload').disabled=!photosEnabled||busy;
}
async function save() {
  if(!form.reportValidity())throw new Error('Please check the highlighted fields.');
  const property=snapshot();
  current=current?await send('/properties/'+current.id,'PUT',{version:current.version,property}):await send('/properties','POST',property);
  dirty=false;form.elements.slug.readOnly=true;$('#editor-title').textContent=current.property.name;$('#record-state').textContent=current.unpublishedChanges?'Unpublished edits':current.state;$('#archive').hidden=current.state==='archived';
  await refresh();return current;
}
function mayLeave(){return !dirty||window.confirm('Leave this property without saving your changes?');}
function showCollection(){current=null;dirty=false;$('#editor').hidden=true;$('#collection').hidden=false;$('#new-property').hidden=false;notice();}
$('#new-property').addEventListener('click',()=>{if(mayLeave())openEditor(null);});
$('#back').addEventListener('click',()=>{if(mayLeave())showCollection();});
$('#search').addEventListener('input',renderList);$('#state-filter').addEventListener('change',renderList);
$('#refresh').addEventListener('click',()=>task(async()=>{await refresh();notice('Collection refreshed.');}));
$('#property-list').addEventListener('click',event=>{const b=event.target.closest('[data-edit]');if(b)openEditor(records.find(r=>r.id===b.dataset.edit));});
form.addEventListener('input',event=>{
  dirty=true;
  if(event.target.hasAttribute('data-caption'))photos[Number(event.target.dataset.caption)].alt=event.target.value;
  if(event.target.name==='name'&&!current)form.elements.slug.value=event.target.value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
});
form.addEventListener('submit',event=>{event.preventDefault();task(async()=>{await save();notice('Draft saved. The live listing has not changed.');});});
$('#publish').addEventListener('click',()=>{if(!form.reportValidity())return;task(async()=>{
  await save();current=await send('/properties/'+current.id+'/publish','POST',{version:current.version});
  openEditor(current);await refresh();notice('Listing published. The website now uses this version.');
});});
for(const action of ['archive','unpublish'])$('#'+action).addEventListener('click',()=>task(async()=>{
  if(!current||!window.confirm(`${action==='archive'?'Archive':'Unpublish'} ${current.property.name}? This removes it from the public website.${dirty?' Unsaved form edits will be discarded.':''}`))return;
  current=await send('/properties/'+current.id+'/'+action,'POST',{version:current.version});dirty=false;await refresh();showCollection();notice(action==='archive'?'Property archived. You can edit and republish it later.':'Listing unpublished and kept as a draft.');
}));
$('#photo-list').addEventListener('click',event=>{
  const move=event.target.closest('[data-move]'),remove=event.target.closest('[data-remove]');
  if(move){const i=Number(move.dataset.move),j=i+Number(move.dataset.direction);if(j>=0&&j<photos.length){[photos[i],photos[j]]=[photos[j],photos[i]];dirty=true;renderPhotos();}}
  if(remove){photos.splice(Number(remove.dataset.remove),1);dirty=true;renderPhotos();}
});
$('#photo-upload').addEventListener('change',()=>task(async()=>{
  const files=[...$('#photo-upload').files];$('#photo-upload').value='';
  if(!files.length)return;
  if(files.length+photos.length>20)throw new Error('A property can have at most 20 photos.');
  if(files.some(file=>file.size>8*1024*1024))throw new Error('Each photo must be 8 MB or smaller.');
  await save();let completed=0;
  for(const file of files){notice(`Uploading photo ${completed+1} of ${files.length}…`);const photo=await api('/properties/'+current.id+'/photos',{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});photos.push(photo);dirty=true;completed++;renderPhotos();}
  notice('Photos uploaded privately. Add descriptions and save your draft before publishing.');
}));
$('#preview').addEventListener('click',()=>{
  const p=snapshot();$('#preview-content').innerHTML=`${p.photos[0]?`<img class="preview-cover" src="${escape(photoSource(p.photos[0].url))}" alt="${escape(p.photos[0].alt)}">`:''}<h3 class="preview-name">${escape(p.name||'Your property')}</h3><p>${escape(p.neighborhood)} · ${escape(p.city)}</p><p class="preview-facts">${money(p.rent)} / month · ${money(p.deposit)} deposit<br>${p.bedrooms} beds · ${p.bathrooms} baths · ${escape(p.availability.replaceAll('_',' '))}</p><p class="preview-text">${escape(p.summary)}</p><div class="preview-text">${escape(p.description.join('\n\n'))}</div><h4>Features</h4><ul>${p.features.map(s=>`<li>${escape(s)}</li>`).join('')}</ul><h4>Lease terms</h4><ul>${p.terms.map(s=>`<li>${escape(s)}</li>`).join('')}</ul>`;$('#preview-dialog').showModal();
});
$('#close-preview').addEventListener('click',()=>$('#preview-dialog').close());
document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement)event.target.setAttribute('data-failed','');},true);
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
try{const session=await api('/session');photosEnabled=session.photosEnabled;$('#account-email').textContent=session.email;await refresh();$('#collection').hidden=false;$('#new-property').disabled=false;notice(photosEnabled?'':'Photo uploads will be available once photo storage is connected.');}catch(error){$('#account-email').textContent='Sign-in required';notice(error.message,true);}
