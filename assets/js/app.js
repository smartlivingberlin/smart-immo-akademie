async function getJSON(u){ try{ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw 0; return await r.json(); }catch(e){ console.error('JSON-Fehler', u, e); return null; } }
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
async function loadModules(){
  const data = await getJSON('data/lehrplan.json'); const grid = document.querySelector('#moduleGrid'); if(!data||!grid) return;
  data.modules.slice(0,4).forEach(m=>{
    const c = el(`<div class="col-md-6 col-lg-3"><div class="card h-100 card-hover"><div class="card-body">
      <h3 class="h6">${m.title}</h3><div class="text-muted small mb-2">${m.days} Tage · ${m.ue} UE</div>
      <a class="btn btn-sm btn-outline-primary" href="pages/lehrplan.html#mod-${m.id}">Details</a>
    </div></div></div>`); grid.appendChild(c); });
}
async function loadLehrplan(){
  const data = await getJSON('../data/lehrplan.json'); const acc = document.querySelector('#lehrplanAccordion'); if(!data||!acc) return;
  data.modules.forEach((m,i)=>{
    const item = el(`<div class="accordion-item" id="mod-${m.id}">
      <h2 class="accordion-header"><button class="accordion-button ${i?'collapsed':''}" type="button" data-bs-toggle="collapse" data-bs-target="#c-${m.id}">
        <span class="me-2 badge bg-primary-subtle text-primary-emphasis summary-badge">${m.days} Tage · ${m.ue} UE</span>${m.title}
      </button></h2>
      <div id="c-${m.id}" class="accordion-collapse collapse ${i?'':'show'}"><div class="accordion-body" id="body-${m.id}"></div></div></div>`);
    acc.appendChild(item);
    const body = item.querySelector('#body-'+m.id);
    (m.sections||[]).forEach(s=>{
      const sec = el(`<div class="mb-3"><div class="fw-semibold">${s.title} <span class="text-muted small">(${s.ue||'?'} UE)</span></div>
        <ul class="mb-0">${(s.topics||[]).map(t=>`<li>${t}</li>`).join('')}</ul></div>`);
      body.appendChild(sec);
    });
  });
}
async function loadCourses(){
  const data = await getJSON('../data/lehrplan.json'); const grid = document.querySelector('#courseGrid'); if(!data||!grid) return;
  const all = data.modules.map(m=>({ title:m.title, tags:(m.sections||[]).flatMap(s=>(s.topics||[])).join(' ').toLowerCase(), meta:`${m.days} Tage · ${m.ue} UE`, link:`lehrplan.html#mod-${m.id}` }));
  function render(list){ grid.innerHTML=''; list.forEach(k=>{ grid.appendChild(el(`<div class="col-md-6 col-lg-4"><div class="card h-100 card-hover"><div class="card-body">
    <h3 class="h6">${k.title}</h3><div class="text-muted small mb-2">${k.meta}</div><a class="btn btn-sm btn-outline-primary" href="${k.link}">Zum Lehrplan</a>
  </div></div></div>`)); }); }
  render(all);
  const inp = document.querySelector('#courseFilter'); if(inp){ inp.addEventListener('input', e=>{ const q=e.target.value.trim().toLowerCase(); render(!q? all : all.filter(k=>k.title.toLowerCase().includes(q)||k.tags.includes(q))); }); }
}
async function initChat(){
  const log=document.querySelector('#chatLog'), input=document.querySelector('#chatInput'), send=document.querySelector('#chatSend');
  if(!log||!input||!send) return; const data=await getJSON('data/lehrplan.json');
  function add(sender,text){ const row=el(`<div class="${sender==='Du'?'text-end':''}"><div class="d-inline-block p-2 mb-1 rounded ${sender==='Du'?'bg-primary text-white':'bg-white border'}"><strong>${sender}:</strong> ${text}</div></div>`); log.appendChild(row); log.scrollTop=log.scrollHeight; }
  send.addEventListener('click', ()=>{ const q=input.value.trim(); if(!q) return; add('Du',q); input.value=''; const ql=q.toLowerCase(); let hits=[]; for(const m of data.modules){ if(m.title.toLowerCase().includes(ql)) hits.push(`Modul: ${m.title} (${m.days} Tage, ${m.ue} UE)`); for(const s of m.sections||[]){ if(s.title.toLowerCase().includes(ql)) hits.push(`Abschnitt in ${m.title}: ${s.title} (${s.ue||'?'} UE)`); for(const t of s.topics||[]){ if(t.toLowerCase().includes(ql)) hits.push(`Thema in ${m.title} › ${s.title}: ${t}`); } } }
    add('Assistent', hits.length? hits.slice(0,5).join('<br>') : 'Nichts im Lehrplan gefunden. Nutze andere Begriffe oder öffne die Lehrplan-Seite.'); });
}
document.addEventListener('DOMContentLoaded', ()=>{ if(document.querySelector('#moduleGrid')) loadModules(); if(document.querySelector('#lehrplanAccordion')) loadLehrplan(); if(document.querySelector('#courseGrid')) loadCourses(); if(document.querySelector('#chatSend')) initChat(); });
