const B='http://localhost:3000';
const j=async(m,u,b,h={})=>{const r=await fetch(B+u,{method:m,headers:{'content-type':'application/json',...h},body:b?JSON.stringify(b):undefined});let t=await r.text();let d;try{d=JSON.parse(t)}catch{d=t.slice(0,200)}return {s:r.status,d}};
const out=[];const log=(k,v)=>{out.push([k,v]);console.log(k,'=>',typeof v==='string'?v:JSON.stringify(v).slice(0,260))};
let r=await j('POST','/api/users/first-register',{email:'admin@example.test',password:'Spike-pass-123!',name:'Spike Admin'});
log('first-register',r.s); const tok=r.d.token; const A={Authorization:'JWT '+tok};
// 1 draft create
r=await j('POST','/api/pages?draft=true',{title:'Spike page',slug:'spike-page',_status:'draft'},A); log('create draft page',[r.s,r.d?.doc?.id,r.d?.doc?._status,r.d?.errors?.[0]?.message]); const id=r.d?.doc?.id;
// anonymous cannot see draft
r=await j('GET','/api/pages?where[slug][equals]=spike-page'); log('anon sees draft?',[r.s,r.d?.totalDocs]);
// publish
r=await j('PATCH','/api/pages/'+id,{_status:'published',title:'Spike page v2'},A); log('publish',[r.s,r.d?.doc?._status,r.d?.errors?.[0]?.message]);
r=await j('GET','/api/pages?where[slug][equals]=spike-page'); log('anon sees published?',[r.s,r.d?.totalDocs]);
// versions
r=await j('GET','/api/pages/versions?where[parent][equals]='+id,null,A); log('versions',[r.s,r.d?.totalDocs]);
// localization
r=await j('PATCH','/api/pages/'+id+'?locale=ur',{title:'ٹیسٹ صفحہ'},A); log('write ur title',[r.s,r.d?.doc?.title]);
r=await j('GET','/api/pages/'+id+'?locale=ur',null,A); log('read ur',r.d?.title);
r=await j('GET','/api/pages/'+id+'?locale=en',null,A); log('read en',r.d?.title);
r=await j('PATCH','/api/pages/'+id+'?locale=en',{title:'Spike page v3'},A);
r=await j('GET','/api/pages/'+id+'?locale=ur&fallback-locale=en',null,A); log('read ur after en edit (ur kept?)',r.d?.title);
r=await j('GET','/api/globals/header?locale=ur',null,A); log('global ur',r.s);
// redirects/search/form collections exist
for(const c of ['redirects','search','forms','form-submissions','media','categories','posts']){r=await j('GET','/api/'+c+'?limit=1',null,A); log('collection '+c,r.s);}
// jobs endpoint auth
r=await fetch(B+'/api/payload-jobs/run?queue=default',{headers:{Authorization:'Bearer spike-cron-secret'}}); log('jobs run with cron secret',r.status);
r=await fetch(B+'/api/payload-jobs/run?queue=default',{headers:{Authorization:'Bearer wrong'}}); log('jobs run with wrong secret',r.status);
r=await fetch(B+'/api/payload-jobs/run?queue=default'); log('jobs run no auth',r.status);
import fs from 'fs'; fs.writeFileSync('spike-results.json',JSON.stringify(out,null,1));
