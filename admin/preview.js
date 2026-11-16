/* Private, in-memory adapter for the shared public listing renderer. */
(() => {
  'use strict';
  let parentOrigin = '', authenticated = false, target = null, pending = null, update = null;
  let resolveFirst;
  const first = new Promise(resolve => { resolveFirst = resolve; });
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const post = message => { if(parentOrigin)window.parent.postMessage(message,parentOrigin); };
  const failure = message => {
    const content=document.getElementById('app');
    if(content){content.textContent=message;content.classList.add('section');}
    document.body.dataset.previewReady='false';
    post({type:'oaktown-preview-error',message});resolveFirst(false);
  };
  function allowedParent() {
    try {
      const address=new URL(window.parent.location.href);
      return window.parent!==window&&address.origin===window.origin&&address.pathname.startsWith('/admin/')&&location.href.startsWith('about:srcdoc');
    } catch { return false; }
  }
  function photographURL(value) {
    if(typeof value!=='string')return '';
    if(/^\/media\/[a-zA-Z0-9-]+$/.test(value))return '/api/admin'+value;
    try {
      const url=new URL(value);
      if(url.protocol==='https:'&&url.hostname==='images.squarespace-cdn.com'&&!url.username&&!url.password&&!url.hash&&!/[<>"'\\\s]/.test(value))return value;
    } catch {}
    return '';
  }
  function cleanSnapshot(input) {
    if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Choose a property to preview.');
    const property={slug:'private-preview',imageKey:'private-preview'};
    for(const key of ['name','city','neighborhood','label','labelEs','summary','summaryEs'])property[key]=escape(typeof input[key]==='string'?input[key].slice(0,key.startsWith('summary')?1000:160):'');
    if(!property.name)property.name='Your property';
    if(!property.label)property.label=property.name;
    for(const key of ['rent','deposit','bedrooms','bathrooms'])property[key]=typeof input[key]==='number'&&Number.isFinite(input[key])&&input[key]>=0?Math.min(input[key],key==='rent'||key==='deposit'?1000000:100):0;
    for(const key of ['description','descriptionEs','features','featuresEs','terms','termsEs'])property[key]=Array.isArray(input[key])?input[key].filter(value=>typeof value==='string').slice(0,40).map(value=>escape(value.slice(0,5000))):[];
    property.availability=['available','coming_soon','rented'].includes(input.availability)?input.availability:'unknown';
    property.sourceUrl='';
    try { const source=new URL(input.sourceUrl);if(source.protocol==='https:'&&!source.username&&!source.password&&!source.hash)property.sourceUrl=escape(source.href); } catch {}
    const photos=(Array.isArray(input.photos)?input.photos:[]).slice(0,20).map(photo=>({url:photographURL(photo?.url),alt:escape(typeof photo?.alt==='string'?photo.alt.slice(0,300):'')})).filter(photo=>photo.url);
    return {property,photos};
  }
  function apply(message) {
    const {property,photos}=cleanSnapshot(message.property);
    target.properties.splice(0,target.properties.length,property);
    target.images['private-preview']=photos.map(photo=>escape(photo.url));
    target.photoAlts=Object.fromEntries(photos.map(photo=>[escape(photo.url),photo.alt]));
    target.contentUnavailable=false;
    preview.language=message.language==='es'?'es':'en';
    preview.requestId=typeof message.requestId==='string'?message.requestId.slice(0,100):'';
    try { history.replaceState(null,'','#home/private-preview'); } catch { location.hash='home/private-preview'; }
  }
  const preview=window.OaktownAdminPreview={
    language:'en',requestId:'',
    async load(data) {
      target=data;target.properties=[];target.images={};target.photoAlts={};
      const available=await first;
      if(!available)return false;
      apply(pending);return true;
    },
    onUpdate(handler){update=handler;},
    rendered() {
      document.body.dataset.previewReady='true';
      const motion=document.getElementById('motion-toggle');
      if(motion){motion.disabled=true;motion.title='Motion follows your website preference in this preview.';}
      post({type:'oaktown-preview-rendered',requestId:preview.requestId,language:preview.language});
    }
  };
  // A preview is for checking the listing. Applications, SMS, external links
  // and navigation out of the current listing remain inactive here.
  document.addEventListener('click',event=>{
    if(event.target.closest('a')){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  document.addEventListener('submit',event=>event.preventDefault(),true);
  window.addEventListener('message',event=>{
    if(!authenticated||!allowedParent()||event.source!==window.parent||event.origin!==parentOrigin||event.data?.type!=='oaktown-preview-render')return;
    try {
      if(JSON.stringify(event.data).length>128*1024)throw new Error('This draft is too large to preview. Shorten the listing text and try again.');
      cleanSnapshot(event.data.property);
      if(!target||!pending){pending=event.data;resolveFirst(true);return;}
      apply(event.data);update?.();
    } catch(error){post({type:'oaktown-preview-error',requestId:event.data?.requestId,message:error.message});}
  });
  (async()=>{
    if(document.documentElement.dataset.adminPreview!=='true'||!allowedParent()){failure('Open this private preview from the property admin.');return;}
    parentOrigin=window.parent.location.origin;
    try {
      const response=await fetch('/api/admin/session',{credentials:'same-origin',cache:'no-store',redirect:'error'});
      if(!response.ok||!response.headers.get('Content-Type')?.includes('application/json'))throw new Error('Sign in again, then reopen the private preview.');
      await response.json();authenticated=true;
      post({type:'oaktown-preview-ready'});
    } catch { failure('Sign in again, then reopen the private preview.'); }
  })();
})();
