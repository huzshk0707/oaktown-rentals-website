/* Optional content API: file mode preserves the standalone static preview. */
window.OaktownContent = {
  async load(data) {
    const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    try {
      const response = await fetch('/api/properties',{signal:AbortSignal.timeout(5000),cache:'no-store'});
      if(response.status===404)return;
      if(!response.ok)throw new Error('Content unavailable');
      const value=await response.json();
      if(value.mode==='file')return;
      if(value.mode!=='database'||!Array.isArray(value.properties))throw new Error('Invalid content');
      data.photoAlts={};
      const properties=value.properties.map(p=>{
        const result={};
        for(const [key,value] of Object.entries(p)) {
          if(key==='photos')continue;
          result[key]=Array.isArray(value)?value.map(escape):typeof value==='string'?escape(value):value;
        }
        result.imageKey='cms-'+p.slug;
        data.images[result.imageKey]=p.photos.map(photo=>escape(photo.url));
        for(const photo of p.photos)data.photoAlts[escape(photo.url)]=escape(photo.alt);
        return result;
      });
      data.properties=properties;
    } catch {
      // A configured service outage must not resurrect archived file-based listings.
      data.properties=[];data.contentUnavailable=true;
    }
  }
};
