import './vendor/sortable-1.15.7.min.js';

const $ = selector => document.querySelector(selector);
const form = $('#property-form');
const photoList = $('#photo-list');
const textFields = ['name','slug','neighborhood','city','availability','label','labelEs','summary','summaryEs','sourceUrl'];
const arrays = ['description','descriptionEs','features','featuresEs','terms','termsEs'];
let records = [], current = null, photos = [], dirty = false, busy = false, photosEnabled = false;
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:n%1?2:0,maximumFractionDigits:2}).format(n);
const escape = text => String(text ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photoSource = url => url.startsWith('/media/') ? '/api/admin'+url : url;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const photoSort = new window.Sortable(photoList,{
  draggable:'.photo-card',handle:'.photo-drag-handle',
  animation:reducedMotion.matches?0:150,
  ghostClass:'photo-drop-target',chosenClass:'photo-chosen',dragClass:'photo-dragging',fallbackClass:'photo-dragging',
  forceFallback:true,fallbackOnBody:true,fallbackTolerance:5,delay:150,delayOnTouchOnly:true,touchStartThreshold:4,
  scrollSensitivity:70,scrollSpeed:12,
  onChoose(event){
    // Leave the edited field before dragging so mobile selection changes do not scroll back to it.
    event.item.querySelector('.photo-drag-handle').focus({preventScroll:true});
  },
  onStart(event){
    photoList.classList.add('is-sorting');
    photoStatus(`Moving photo ${event.oldDraggableIndex+1}. Drop it in its new position.`);
  },
  onEnd(event){
    photoList.classList.remove('is-sorting');
    movePhoto(event.oldDraggableIndex,event.newDraggableIndex,'handle');
  }
});
reducedMotion.addEventListener('change',()=>photoSort.option('animation',reducedMotion.matches?0:150));
function photoStatus(message=''){ $('#photo-status').textContent=message; }
function syncPhotoControls(){
  photoSort.option('disabled',busy||photos.length<2);
  for(const button of photoList.querySelectorAll('[data-move]')){
    const destination=Number(button.dataset.move)+Number(button.dataset.direction);
    button.disabled=busy||destination<0||destination>=photos.length;
  }
  for(const handle of photoList.querySelectorAll('.photo-drag-handle'))handle.disabled=busy||photos.length<2;
}
function focusPhoto(index,control){
  const card=photoList.children[index];
  const selector=control==='handle'?'.photo-drag-handle':`[data-direction="${control}"]`;
  const button=card?.querySelector(selector);
  (button?.disabled?card.querySelector('[data-move]:not(:disabled)'):button)?.focus({preventScroll:true});
}
function movePhoto(from,to,control){
  if(busy||!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=photos.length||to>=photos.length)return;
  if(from===to){photoStatus('Photo order unchanged.');focusPhoto(to,control);return;}
  const [photo]=photos.splice(from,1);photos.splice(to,0,photo);
  dirty=true;renderPhotos();focusPhoto(to,control);
  photoStatus(`Moved photo ${from+1} to position ${to+1} of ${photos.length}.${to===0?' This is now the main listing photo.':''} Save your draft to keep this order.`);
}
const availability = value => ({unknown:'Confirm with us',available:'Available',coming_soon:'Coming soon',rented:'Rented'})[value]||'Confirm with us';
const panelNames = ['details','photos','description','terms','review'];
let activePanel='details', uploadQueue=[], uploadSequence=0, pendingPublish=null;
let previewProperty=null, previewReady=false, previewRequest=null, previewGeneration=0, previewTimeout=0;
function notice(message='',error=false) { $('#notice').textContent=message; $('#notice').classList.toggle('error',error); }
async function api(path,options={}) {
  const response=await fetch('/api/admin'+path,{credentials:'same-origin',...options});
  if(!(response.headers.get('Content-Type')||'').includes('application/json'))throw new Error('Your sign-in may have expired. Reload the admin to sign in again.');
  const value=await response.json();if(!response.ok)throw new Error(value.error||'The request could not be completed.');return value;
}
const send=(path,method,body)=>api(path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
function selectPanel(name,{focus=false}={}) {
  if(!panelNames.includes(name))return;
  activePanel=name;
  for(const button of document.querySelectorAll('[data-editor-tab]')){const active=button.dataset.editorTab===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
  for(const panel of document.querySelectorAll('[data-editor-panel]'))panel.hidden=panel.dataset.editorPanel!==name;
  if(name==='review')renderReview();
  if(focus)$('#panel-'+name).focus({preventScroll:true});
}
function lock(value) {
  busy=value;
  for(const control of form.querySelectorAll('input,textarea,select'))control.disabled=value;
  for(const button of document.querySelectorAll('#property-form button,#back,#new-property,#refresh,#editor-nav button,#publish-dialog button'))button.disabled=value;
  $('#photo-upload').disabled=value||!photosEnabled;
  syncPhotoControls();renderQueue();
}
async function task(fn) {
  if(busy)return;lock(true);
  try{await fn();}catch(error){notice(error.message,true);if($('#publish-dialog').open)$('#publish-error').textContent=error.message;}
  finally{lock(false);updateEditorState();}
}
function propertyChanges(property,live) {
  if(!live)return [{label:'Publication',value:'This home is not on the website. Publishing will make this draft visible.'}];
  const changes=[];
  for(const [key,label,format] of [['rent','Monthly rent',money],['deposit','Security deposit',money],['availability','Availability',availability],['bedrooms','Bedrooms',String],['bathrooms','Bathrooms',String]])if(property[key]!==live[key])changes.push({label,value:`${format(live[key])} → ${format(property[key])}`});
  const groups=[['Property details',['name','neighborhood','city']],['Description',['label','summary','description','features','labelEs','summaryEs','descriptionEs','featuresEs']],['Rental terms',['terms','termsEs']],['Listing link',['sourceUrl']]];
  for(const [label,keys] of groups)if(keys.some(key=>JSON.stringify(property[key])!==JSON.stringify(live[key])))changes.push({label,value:'Updated in this draft'});
  if(JSON.stringify(property.photos)!==JSON.stringify(live.photos))changes.push({label:'Photos',value:`${live.photos.length} live → ${property.photos.length} in draft${property.photos[0]?.url!==live.photos[0]?.url?' · Main photo changed':' · Order or descriptions changed'}`});
  return changes;
}
function changeMarkup(changes){return changes.length?`<ul class="change-list">${changes.map(c=>`<li><strong class="change-label">${escape(c.label)}</strong><span class="change-value">${escape(c.value)}</span></li>`).join('')}</ul>`:'<p>No changes from the version on the website.</p>';}
function renderList() {
  const counts={all:records.length,published:records.filter(r=>r.state==='published').length,changes:records.filter(r=>r.state==='draft'||r.unpublishedChanges).length,archived:records.filter(r=>r.state==='archived').length};
  $('#stats').innerHTML=[['all','Total homes'],['published','On website'],['changes','Needs publishing'],['archived','Archived']].map(([key,label])=>`<div class="stat"><strong>${counts[key]}</strong><span>${label}</span></div>`).join('');
  const query=$('#search').value.toLowerCase(),state=$('#state-filter').value;
  const shown=records.filter(r=>(state==='all'||(state==='changes'?(r.state==='draft'||r.unpublishedChanges):r.state===state))&&`${r.property.name} ${r.property.neighborhood} ${r.publishedProperty?.name||''} ${r.publishedProperty?.neighborhood||''}`.toLowerCase().includes(query));
  $('#empty-list').hidden=shown.length>0;
  $('#property-list').innerHTML=shown.map(r=>{
    const live=r.state==='published'?r.publishedProperty:null,p=live||r.property;
    const label=r.state==='published'?'On website':r.state==='archived'?'Archived':'Draft only';
    const changes=r.unpublishedChanges?propertyChanges(r.property,live):[];
    return `<article class="listing"><div class="listing-photo">${p.photos[0]?`<img src="${escape(photoSource(p.photos[0].url))}" alt="${escape(p.photos[0].alt)}" loading="lazy">`:''}<span class="badge">${label}</span></div><div class="listing-body"><div class="listing-statuses"><span class="badge">${escape(availability(p.availability))}</span>${r.unpublishedChanges?'<span class="badge draft-badge">Draft changes</span>':''}</div><p>${escape(p.neighborhood||'Neighborhood to be added')}</p><h3>${escape(p.name)}</h3><p>${p.bedrooms} beds · ${p.bathrooms} baths</p>${r.unpublishedChanges?`<div class="draft-delta"><strong>Saved draft · not on the website</strong>${changeMarkup(changes)}</div>`:''}<div class="listing-bottom"><strong data-live-rent>${money(p.rent)} <small>/ month${live?' · Live':' · Draft'}</small></strong><button class="secondary" data-edit="${escape(r.id)}">Edit listing</button></div><div class="listing-shortcuts"><button class="text-button" data-quick="${escape(r.id)}">Quick edit</button><button class="text-button" data-photos="${escape(r.id)}">Photos</button><button class="text-button" data-preview-record="${escape(r.id)}">Preview draft</button></div></div></article>`;
  }).join('');
}
async function refresh(){const data=await api('/properties');records=data.properties;renderList();}
function snapshot(){
  const result={photos:photos.map(p=>({...p}))};
  for(const key of textFields)result[key]=form.elements.namedItem(key).value.trim();
  for(const key of ['rent','deposit','bedrooms','bathrooms'])result[key]=Number(form.elements.namedItem(key).value);
  for(const key of arrays)result[key]=form.elements.namedItem(key).value.split(key.startsWith('description')?/\n\s*\n/:/\n/).map(s=>s.trim()).filter(Boolean);
  return result;
}
function fillFields(property){
  for(const key of textFields)form.elements.namedItem(key).value=property[key]||'';
  for(const key of ['rent','deposit','bedrooms','bathrooms'])form.elements.namedItem(key).value=property[key];
  for(const key of arrays)form.elements.namedItem(key).value=(property[key]||[]).join(key.startsWith('description')?'\n\n':'\n');
}
function readiness(property){
  const issues=[];const add=(condition,text,panel,field)=>issues.push({ready:condition,text,panel,field});
  add(!!property.name,'Add the property address','details','name');
  add(!!property.neighborhood&&!!property.city,'Add the neighborhood and city','details',property.neighborhood?'city':'neighborhood');
  add(Number.isFinite(property.rent)&&property.rent>0,'Enter the monthly rent','details','rent');
  add(!!property.summary,'Add a short listing summary','description','summary');
  add(property.description.length>0,'Add a full description','description','description');
  add(property.photos.length>0,'Add at least one photograph','photos','');
  add(property.photos.length>0&&property.photos.every(p=>!!p.alt.trim()),'Describe every photograph','photos','');
  if(uploadQueue.some(item=>item.status!=='complete'))issues.push({ready:false,text:'Retry or dismiss unfinished photo uploads',panel:'photos',field:''});
  return issues;
}
function renderReview(){
  if($('#editor').hidden)return;
  const property=snapshot(),live=current?.state==='published'?current.publishedProperty:null;
  $('#publication-summary').textContent=live?`On the website now: ${money(live.rent)} / month · ${availability(live.availability)}. Your form is a private draft until published.`:current?.state==='archived'?'This property is archived. Publishing will put this draft back on the website.':'This property is not on the website. Save privately, preview, then publish when ready.';
  $('#readiness-list').innerHTML=readiness(property).map(issue=>`<li class="readiness-item" data-level="${issue.ready?'ready':'missing'}">${issue.ready?`<span>Ready: ${escape(issue.text.replace(/^Add |^Enter |^Describe /,''))}</span>`:`<button type="button" class="text-button" data-readiness-target="${issue.panel}" data-readiness-field="${issue.field}">${escape(issue.text)}</button>`}</li>`).join('')+(property.availability==='unknown'?'<li class="readiness-item" data-level="warning">Availability is set to Confirm with us. Visitors will see Check availability, without an available-now claim.</li>':'');
  $('#change-summary').innerHTML=changeMarkup(propertyChanges(property,live));
  $('#view-live').hidden=!live;$('#view-live').href=live?'/#home/'+encodeURIComponent(live.slug):'#';
}
function updateEditorState(){
  if($('#editor').hidden)return;
  $('#record-state').textContent=current?.state==='published'?'On website':current?.state==='archived'?'Archived':current?'Draft only':'New draft';
  $('#editor-status').textContent=dirty?'Unsaved changes':current?.unpublishedChanges?'Draft saved · Website unchanged':current?.state==='published'?'Saved · On website':current?'Draft saved · Not on website':'New draft · Not saved';
  if(activePanel==='review')renderReview();
}
function openEditor(record,panel='details'){
  current=record;photos=record?record.property.photos.map(p=>({...p})):[];uploadQueue=[];form.reset();
  if(record)fillFields(record.property);
  form.elements.slug.readOnly=!!record;
  $('#editor-title').textContent=record?record.property.name:'Add a property';
  $('#editor-hint').textContent=record?.state==='published'?'You are editing a private draft. The website changes only when you publish.':'Start with the details, then add photos and a description. Save your draft at any time.';
  $('#archive').hidden=!record||record.state==='archived';$('#unpublish').hidden=!record||record.state!=='published';
  $('#collection').hidden=true;$('#editor').hidden=false;$('#new-property').hidden=true;
  dirty=false;renderPhotos();renderQueue();photoStatus();notice();selectPanel(panel);updateEditorState();window.scrollTo({top:0,behavior:'instant'});
  if(panel==='details')form.elements.name.focus({preventScroll:true});
}
function renderPhotos(){
  photoList.innerHTML=photos.map((p,i)=>`<article class="photo-card" role="listitem" aria-label="Photo ${i+1}${i===0?', main listing photo':''}"><div class="photo-card-top"><span class="badge">${i===0?'Main photo':'Photo '+(i+1)}</span><button class="photo-drag-handle" type="button" data-drag="${i}" aria-label="Reorder photo ${i+1}" aria-describedby="photo-reorder-help"><svg viewBox="0 0 16 24" width="16" height="24" aria-hidden="true"><g fill="currentColor"><circle cx="4" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="12" cy="19" r="2"/></g></svg><span>Drag</span></button></div><img src="${escape(photoSource(p.url))}" alt="${escape(p.alt)}" draggable="false"><label>Photo description<input data-caption="${i}" value="${escape(p.alt)}" maxlength="300" placeholder="Describe the room or exterior" ${busy?'disabled':''}></label><div class="photo-actions">${i?`<button class="secondary" type="button" data-main="${i}" ${busy?'disabled':''}>Set as main photo</button>`:''}<button type="button" data-move="${i}" data-direction="-1" aria-label="Move photo ${i+1} earlier">Earlier</button><button type="button" data-move="${i}" data-direction="1" aria-label="Move photo ${i+1} later">Later</button><button class="secondary" type="button" data-remove="${i}" aria-label="Remove photo ${i+1}" ${busy?'disabled':''}>Remove</button></div></article>`).join('');
  $('#photo-upload').disabled=!photosEnabled||busy;syncPhotoControls();updateEditorState();
}
function renderQueue(){
  $('#upload-queue').innerHTML=uploadQueue.map(item=>`<div class="upload-item" role="listitem" data-status="${item.status}"><div><strong class="upload-file-name">${escape(item.name)}</strong><span class="upload-state">${({pending:'Ready to upload',uploading:'Uploading…',complete:'Uploaded privately',failed:'Upload needs attention'})[item.status]}</span>${item.error?`<p class="upload-error">${escape(item.error)}</p>`:''}</div>${item.status==='failed'||item.status==='pending'?`<div><button class="secondary" type="button" data-retry-upload="${item.id}" ${busy?'disabled':''}>Retry</button><button class="text-button" type="button" data-dismiss-upload="${item.id}" ${busy?'disabled':''}>Dismiss</button></div>`:''}</div>`).join('');
}
function validateDraft(){
  const invalid=[...form.elements].find(control=>control.willValidate&&!control.checkValidity());
  if(invalid){const panel=invalid.closest('[data-editor-panel]');if(panel)selectPanel(panel.dataset.editorPanel);const detail=invalid.closest('details');if(detail)detail.open=true;invalid.reportValidity();return false;}
  if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.elements.slug.value)){selectPanel('details');$('#advanced-settings').open=true;form.elements.slug.focus();notice('Enter a property address or choose a web address using lowercase words and hyphens.',true);return false;}
  return true;
}
async function save(property=snapshot()){
  const saved=current?await send('/properties/'+current.id,'PUT',{version:current.version,property}):await send('/properties','POST',property);
  current=saved;photos=saved.property.photos.map(p=>({...p}));fillFields(saved.property);dirty=false;photoStatus();form.elements.slug.readOnly=true;
  $('#editor-title').textContent=saved.property.name;$('#archive').hidden=saved.state==='archived';$('#unpublish').hidden=saved.state!=='published';renderPhotos();await refresh();return saved;
}
function mayLeave(){return (!dirty&&!uploadQueue.some(item=>item.status!=='complete'))||window.confirm('Leave this property without saving your changes?');}
function showCollection(){current=null;dirty=false;uploadQueue=[];$('#editor').hidden=true;$('#collection').hidden=false;$('#new-property').hidden=false;notice();}
async function uploadItems(items){
  if(!validateDraft())return;
  await task(async()=>{
    try{await save();}catch(error){for(const item of items){item.status='failed';item.error='Save the property details, then retry this upload.';}renderQueue();throw error;}
    let completed=0;
    for(const item of items){
      if(!item.file||item.status==='complete')continue;
      if(photos.length>=20){item.status='failed';item.error='A property can have at most 20 photos.';continue;}
      if(item.file.size>8*1024*1024){item.status='failed';item.error='Choose a photo smaller than 8 MB.';continue;}
      if(!['image/jpeg','image/png','image/webp'].includes(item.file.type)){item.status='failed';item.error='Choose a JPG, PNG or WebP photo. Convert iPhone HEIC photos before uploading.';continue;}
      item.status='uploading';item.error='';renderQueue();notice(`Uploading ${item.name}…`);
      try{const photo=await api('/properties/'+current.id+'/photos',{method:'POST',headers:{'Content-Type':item.file.type},body:item.file});photos.push(photo);dirty=true;item.status='complete';item.file=null;completed++;renderPhotos();}
      catch(error){item.status='failed';item.error=error.message;}
      renderQueue();
    }
    const failed=uploadQueue.some(item=>item.status==='failed');
    notice(failed?'Some photos need attention. Successful uploads are kept; retry or dismiss the files below.':'Photos uploaded privately. Add descriptions and save your draft before publishing.',failed);
    photoStatus(`${completed} photo${completed===1?'':'s'} uploaded. Save your draft to keep the photo list.`);renderQueue();
  });
}
$('#new-property').addEventListener('click',()=>{if(mayLeave())openEditor(null);});
$('#back').addEventListener('click',()=>{if(mayLeave())showCollection();});
$('#search').addEventListener('input',renderList);$('#state-filter').addEventListener('change',renderList);
$('#refresh').addEventListener('click',()=>task(async()=>{await refresh();notice('Collection refreshed.');}));
$('#property-list').addEventListener('click',event=>{
  const button=event.target.closest('[data-edit],[data-quick],[data-photos],[data-preview-record]');if(!button||busy)return;
  const id=button.dataset.edit||button.dataset.quick||button.dataset.photos||button.dataset.previewRecord;
  openEditor(records.find(record=>record.id===id),button.hasAttribute('data-photos')?'photos':'details');
  if(button.hasAttribute('data-preview-record'))openPreview();
});
$('#editor-nav').addEventListener('click',event=>{const button=event.target.closest('[data-editor-tab]');if(button&&!busy)selectPanel(button.dataset.editorTab);});
$('#editor-nav').addEventListener('keydown',event=>{
  const button=event.target.closest('[data-editor-tab]');if(!button||busy)return;
  const index=panelNames.indexOf(button.dataset.editorTab),target={ArrowRight:(index+1)%5,ArrowLeft:(index+4)%5,Home:0,End:4}[event.key];
  if(target===undefined)return;event.preventDefault();selectPanel(panelNames[target]);$('#tab-'+panelNames[target]).focus();
});
form.noValidate=true;
form.addEventListener('input',event=>{
  dirty=true;if(event.target.hasAttribute('data-caption'))photos[Number(event.target.dataset.caption)].alt=event.target.value;
  if(event.target.name==='name'&&!current)form.elements.slug.value=event.target.value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  updateEditorState();
});
form.addEventListener('submit',event=>{event.preventDefault();if(validateDraft())task(async()=>{await save();notice('Draft saved. The live listing has not changed.');});});
$('#review-placeholder')?.remove();
$('#readiness-list').addEventListener('click',event=>{const button=event.target.closest('[data-readiness-target]');if(!button)return;selectPanel(button.dataset.readinessTarget,{focus:true});const field=button.dataset.readinessField?form.elements.namedItem(button.dataset.readinessField):null;(field||$('#panel-'+activePanel).querySelector('input,textarea,select'))?.focus();});
$('#publish').addEventListener('click',()=>{
  if(busy||!validateDraft())return;selectPanel('review');const property=snapshot();renderReview();
  if(readiness(property).some(issue=>!issue.ready)){notice('Finish the highlighted items before publishing. Your work can still be saved as a draft.',true);$('#readiness-list').querySelector('button')?.focus();return;}
  pendingPublish=property;$('#publish-error').textContent='';$('#publish-summary').innerHTML=changeMarkup(propertyChanges(property,current?.state==='published'?current.publishedProperty:null))+(property.availability==='unknown'?'<p>Availability remains Confirm with us. This does not mark the home as available now.</p>':'');$('#publish-dialog').showModal();
});
$('#cancel-publish').addEventListener('click',()=>{pendingPublish=null;$('#publish-dialog').close();});
$('#publish-dialog').addEventListener('cancel',()=>{pendingPublish=null;});
$('#confirm-publish').addEventListener('click',()=>{if(!pendingPublish||busy)return;const property=pendingPublish;task(async()=>{
  await save(property);current=await send('/properties/'+current.id+'/publish','POST',{version:current.version});pendingPublish=null;$('#publish-dialog').close();openEditor(current,'review');await refresh();notice('Listing published. The website now uses this version.');
});});
for(const action of ['archive','unpublish'])$('#'+action).addEventListener('click',()=>task(async()=>{
  if(!current||!window.confirm(`${action==='archive'?'Archive':'Unpublish'} ${current.property.name}? This removes it from the public website.${dirty?' Unsaved form edits will be discarded.':''}`))return;
  current=await send('/properties/'+current.id+'/'+action,'POST',{version:current.version});dirty=false;await refresh();showCollection();notice(action==='archive'?'Property archived. You can edit and republish it later.':'Listing unpublished and kept as a draft.');
}));
photoList.addEventListener('keydown',event=>{const handle=event.target.closest('[data-drag]');if(!handle||busy)return;const from=Number(handle.dataset.drag);const target={ArrowLeft:from-1,ArrowUp:from-1,ArrowRight:from+1,ArrowDown:from+1,Home:0,End:photos.length-1}[event.key];if(target===undefined)return;event.preventDefault();movePhoto(from,Math.max(0,Math.min(photos.length-1,target)),'handle');});
photoList.addEventListener('click',event=>{
  if(busy)return;const move=event.target.closest('[data-move]'),main=event.target.closest('[data-main]'),remove=event.target.closest('[data-remove]');
  if(main)movePhoto(Number(main.dataset.main),0,'handle');
  if(move)movePhoto(Number(move.dataset.move),Number(move.dataset.move)+Number(move.dataset.direction),move.dataset.direction);
  if(remove){const index=Number(remove.dataset.remove);photos.splice(index,1);dirty=true;renderPhotos();photoStatus(`Photo ${index+1} removed. Save your draft to keep this change.`);(photoList.children[Math.min(index,photos.length-1)]?.querySelector('[data-remove]')||$('#photo-upload')).focus();}
});
$('#photo-upload').addEventListener('change',()=>{
  const files=[...$('#photo-upload').files];$('#photo-upload').value='';if(!files.length||busy)return;
  if(files.length+photos.length+uploadQueue.filter(item=>item.status!=='complete').length>20){notice('A property can have at most 20 photos, including queued uploads.',true);return;}
  const items=files.map(file=>({id:String(++uploadSequence),file,name:file.name,status:'pending',error:''}));uploadQueue.push(...items);renderQueue();updateEditorState();uploadItems(items);
});
$('#upload-queue').addEventListener('click',event=>{
  if(busy)return;const retry=event.target.closest('[data-retry-upload]'),dismiss=event.target.closest('[data-dismiss-upload]');
  if(retry){const item=uploadQueue.find(item=>item.id===retry.dataset.retryUpload);if(item)uploadItems([item]);}
  if(dismiss){uploadQueue=uploadQueue.filter(item=>item.id!==dismiss.dataset.dismissUpload);renderQueue();updateEditorState();}
});
async function openPreview(){
  previewProperty=snapshot();previewReady=false;previewRequest=null;const generation=++previewGeneration;
  clearTimeout(previewTimeout);previewTimeout=setTimeout(()=>{if(generation===previewGeneration)$('#preview-content').textContent='The preview is taking longer than expected. Close it and try again, or reload the admin to sign in again.';},12000);
  const dialog=$('#preview-dialog');dialog.dataset.viewport=innerWidth<850?'mobile':'desktop';$('#preview-viewport').value=dialog.dataset.viewport;$('#preview-language').value='en';$('#preview-content').textContent='Loading your private website preview…';dialog.showModal();
  try{const response=await fetch('/admin/preview.html',{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw new Error('Your sign-in may have expired. Reload the admin to preview.');const html=await response.text();if(!html.includes('data-admin-preview="true"'))throw new Error('Your sign-in may have expired. Reload the admin to preview.');if(generation!==previewGeneration||!dialog.open)return;$('#preview-frame').srcdoc=html;}
  catch(error){if(generation===previewGeneration){clearTimeout(previewTimeout);$('#preview-content').textContent=error.message;}}
}
function sendPreview(){if(!previewReady||!previewProperty||!$('#preview-dialog').open)return;previewRequest=crypto.randomUUID();$('#preview-frame').contentWindow.postMessage({type:'oaktown-preview-render',requestId:previewRequest,property:previewProperty,language:$('#preview-language').value},location.origin);}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==$('#preview-frame').contentWindow||!$('#preview-dialog').open)return;
  const data=event.data||{};
  if(data.type==='oaktown-preview-ready'){previewReady=true;sendPreview();}
  if(data.type==='oaktown-preview-rendered'&&data.requestId===previewRequest){clearTimeout(previewTimeout);$('#preview-content').textContent='Private preview of this form. Saving or closing does not publish it.';}
  if(data.type==='oaktown-preview-error'&&(!data.requestId||data.requestId===previewRequest)){clearTimeout(previewTimeout);$('#preview-content').textContent=data.message||'The private preview could not load. Try closing and reopening it.';}
});
$('#preview').addEventListener('click',openPreview);
$('#preview-language').addEventListener('change',sendPreview);
$('#preview-viewport').addEventListener('change',()=>{$('#preview-dialog').dataset.viewport=$('#preview-viewport').value;});
$('#close-preview').addEventListener('click',()=>$('#preview-dialog').close());
$('#preview-dialog').addEventListener('close',()=>{previewGeneration++;clearTimeout(previewTimeout);previewProperty=null;previewReady=false;previewRequest=null;$('#preview-frame').srcdoc='';$('#preview-content').textContent='';});
document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement)event.target.setAttribute('data-failed','');},true);
window.addEventListener('beforeunload',event=>{if(dirty||uploadQueue.some(item=>item.status!=='complete')){event.preventDefault();event.returnValue='';}});
try{const session=await api('/session');photosEnabled=session.photosEnabled;$('#account-email').textContent=session.email;await refresh();$('#collection').hidden=false;$('#new-property').disabled=false;notice(photosEnabled?'':'Photo uploads will be available once photo storage is connected.');}catch(error){$('#account-email').textContent='Sign-in required';notice(error.message,true);}
