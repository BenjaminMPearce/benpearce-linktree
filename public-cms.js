/* Public portfolio CMS: published Supabase records only, static HTML fallback. */
(()=>{'use strict';
const API='https://nvblesqvtscfiwpeunff.supabase.co/rest/v1/';
const KEY='sb_publishable_1G1n4lTLvXovovfjKR-Gyw_qkMpgSXt';
const headers={'apikey':KEY,'Content-Type':'application/json'};
const root=document.querySelector('.app-shell');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validUrl=u=>{try{const x=new URL(u);return ['https:','http:'].includes(x.protocol)?x.href:null}catch{return null}};
async function read(path){const response=await fetch(API+path,{headers});if(!response.ok)throw Error('CMS '+response.status);return response.json()}
function text(sel,val){if(typeof val==='string'){const el=document.querySelector(sel);if(el)el.textContent=val}}
function asset(path){if(!path)return null;if(path.startsWith('https://'))return path;if(!path.includes('/'))return './'+encodeURIComponent(path);return 'https://nvblesqvtscfiwpeunff.supabase.co/storage/v1/object/public/portfolio-media/'+path.split('/').map(encodeURIComponent).join('/')}
function addLinks(links){
 const visible=links.filter(x=>x.published&&x.is_visible).sort((a,b)=>a.position-b.position);
 const nav=document.querySelector('.social-row');
 if(nav){const share=nav.querySelector('.share-button');nav.querySelectorAll('a').forEach(a=>a.remove());visible.filter(x=>x.category==='social').forEach(x=>{const a=document.createElement('a');a.href=validUrl(x.url)||'#';a.target='_blank';a.rel='noopener noreferrer';a.textContent=x.label;a.dataset.linkId=x.id;nav.insertBefore(a,share)})}
 const feed=document.querySelector('.media-feed');
 if(!feed)return;
 const staticCards=[...feed.querySelectorAll('.static-card')];
 staticCards.forEach(x=>x.remove());
 visible.filter(x=>x.category!=='social'&&x.category!=='channel').forEach(x=>{const el=document.createElement('article');el.className='media-card static-card';el.innerHTML='<a class="card-compact static-link" target="_blank" rel="noopener noreferrer"><div><span class="source-pill"></span><h3></h3><p></p></div><span class="arrow">↗</span></a>';const a=el.querySelector('a');a.href=validUrl(x.url)||'#';a.dataset.linkId=x.id;el.querySelector('h3').textContent=x.label;el.querySelector('p').textContent=x.description||'';el.querySelector('.source-pill').textContent=x.category;feed.append(el)});
 // Keep Instagram and IMDb as showcase cards, but manage their destination through the links table.
 visible.filter(x=>x.category==='social'&&/instagram|imdb/i.test(x.label)).forEach(x=>{const el=document.createElement('article');el.className='media-card static-card';el.innerHTML='<a class="card-compact static-link" target="_blank" rel="noopener noreferrer"><div><span class="source-pill"></span><h3></h3><p></p></div><span class="arrow">↗</span></a>';const a=el.querySelector('a');a.href=validUrl(x.url)||'#';a.dataset.linkId=x.id;el.querySelector('.source-pill').textContent=x.label;el.querySelector('h3').textContent=x.label==='IMDb'?'Credits & Filmography':x.label;el.querySelector('p').textContent=x.description||'';feed.append(el)});
}
function addMedia(media,links){
 const feed=document.querySelector('.media-feed');if(!feed)return;
 const videos=media.filter(x=>x.published&&['youtube','tiktok'].includes(x.kind)).sort((a,b)=>a.position-b.position);
 const existing=[...feed.querySelectorAll('.media-card:not(.static-card)')];
 const templates={youtube:existing.find(x=>x.dataset.source==='youtube'),tiktok:existing.find(x=>x.dataset.source==='tiktok')};
 existing.forEach(x=>x.remove());
 videos.forEach(x=>{
  const template=templates[x.kind];if(!template)return;
  const card=template.cloneNode(true);card.dataset.source=x.kind;
  const ids=(x.alt_text||'').split(',').map(s=>s.trim()).filter(Boolean);
  if(!ids.length&&x.external_url){const match=x.kind==='youtube'?x.external_url.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/):x.external_url.match(/video\/(\d+)/);if(match)ids.push(match[1])}
  if(!ids.length)return;
  card.dataset.playlist=ids.join(',');card.dataset.collection=x.placement||'films';
  card.querySelectorAll('h3').forEach(el=>el.textContent=x.title);
  card.querySelectorAll('.embed-poster span').forEach(el=>el.textContent=x.title);
  const link=links.find(l=>l.category==='channel'&&l.label.toLowerCase()===x.title.toLowerCase()) || links.filter(l=>l.category==='channel').sort((a,b)=>a.position-b.position)[videos.filter(v=>v.kind==='youtube').findIndex(v=>v.id===x.id)];
  const url=validUrl(x.external_url);
  card.querySelectorAll('.visit-button').forEach(a=>{if(link){a.href=validUrl(link.url)||url||'#';a.dataset.linkId=link.id}else if(url)a.href=url});
  feed.insertBefore(card,feed.querySelector('.static-card'));
 });
 const photos=media.filter(x=>x.published&&x.kind==='photo');
 const profile=photos.filter(x=>x.placement==='profile').at(-1);
 const hero=photos.filter(x=>x.placement==='hero').at(-1);
 if(profile){const img=document.querySelector('.premiere-portrait img');if(img)img.src=asset(profile.storage_path)}
 if(hero){const el=document.querySelector('.director-art');if(el){const url=asset(hero.storage_path);if(url){el.style.setProperty('--cms-director-image','url("'+url.replaceAll('"','%22')+'")');el.classList.add('cms-director-art')}}}
}
function applyContent(data){
 const get=k=>data.find(x=>x.key===k)?.content||{};
 const p=get('profile'),h=get('hero'),s=get('site_settings');
 text('.hero-copy .eyebrow',p.eyebrow);text('.hero-copy h1',p.name);text('.hero-copy .lede',p.lede);
 if(typeof h.kicker==='string'){const el=document.querySelector('.director-kicker');if(el){const dot=el.querySelector('.on-air-dot');const edition=el.querySelector('.edition');el.replaceChildren();if(dot)el.append(dot);el.append(document.createTextNode(' '+h.kicker+' '));if(edition)el.append(edition)}}
 text('.director-overline',h.overline);text('#directorTitle',h.title);text('.director-content > p:not(.director-kicker):not(.director-overline)',h.description);
 if(typeof h.action==='string'){const el=document.querySelector('.director-action');if(el){el.replaceChildren(document.createTextNode(h.action+' '));const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';el.append(arrow)}}text('.showcase-eyebrow',s.eyebrow);
 if(typeof s.heading==='string'){const el=document.querySelector('.showcase-heading h2');if(el){el.textContent=s.heading;const dot=document.createElement('span');dot.className='showcase-period';dot.textContent='.';el.append(dot)}}
 text('.showcase-count',s.count);
}
async function record(type,id=null){try{await fetch(API+'site_events',{method:'POST',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({event_type:type,link_id:id})})}catch{}}
document.addEventListener('click',e=>{const a=e.target.closest('a[data-link-id]');if(a)record('link_click',a.dataset.linkId)});
async function init(){
 try{
  const [content,links,media]=await Promise.all([read('rpc/get_published_site_content'),read('site_links?select=*&published=eq.true&is_visible=eq.true&order=position.asc'),read('site_media?select=*&published=eq.true&order=position.asc')]);
  applyContent(content);addLinks(links);addMedia(media,links);
 }catch(err){console.warn('Using static portfolio fallback:',err)}
 finally{const script=document.createElement('script');script.src='./app.js';document.body.append(script);record('page_view')}
}
init();
})();
