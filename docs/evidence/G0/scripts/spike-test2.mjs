const B='http://localhost:3000';
const j=async(m,u,b,h={})=>{const r=await fetch(B+u,{method:m,headers:{'content-type':'application/json',...h},body:b?JSON.stringify(b):undefined});let t=await r.text();let d;try{d=JSON.parse(t)}catch{d=t.slice(0,200)}return {s:r.status,d}};
const log=(k,v)=>console.log(k,'=>',typeof v==='string'?v:JSON.stringify(v).slice(0,300));
let r=await j('POST','/api/users/first-register',{email:'admin@example.test',password:'Spike-pass-123!',name:'Spike Admin'}); const A={Authorization:'JWT '+r.d.token};
r=await j('POST','/api/pages?draft=true',{title:'Spike page',slug:'spike-page',_status:'draft'},A);
const rt=(t)=>({root:{type:'root',children:[{type:'paragraph',version:1,direction:null,format:'',indent:0,textFormat:0,children:[{type:'text',text:t,version:1,detail:0,format:0,mode:'normal',style:''}]}],direction:null,format:'',indent:0,version:1}});
const layout=[{blockType:'content',columns:[{size:'full',richText:rt('Hello')}]}];
const id=1;
r=await j('PATCH','/api/pages/'+id,{_status:'published',title:'Spike page v2',layout,hero:{type:'none'}},A); log('publish',[r.s,r.d?.doc?._status,JSON.stringify(r.d?.errors)?.slice(0,200)]);
r=await j('GET','/api/pages?where[slug][equals]=spike-page'); log('anon sees published?',[r.s,r.d?.totalDocs]);
r=await j('PATCH','/api/pages/'+id+'?locale=ur',{title:'ٹیسٹ صفحہ',layout:[{blockType:'content',columns:[{size:'full',richText:rt('ہیلو')}]}],_status:'published'},A); log('write ur',[r.s,r.d?.doc?.title,JSON.stringify(r.d?.errors)?.slice(0,200)]);
r=await j('GET','/api/pages/'+id+'?locale=ur',null,A); log('read ur',r.d?.title);
r=await j('GET','/api/pages/'+id+'?locale=en',null,A); log('read en',r.d?.title);
r=await j('PATCH','/api/pages/'+id+'?locale=en',{title:'Spike page v3',_status:'published'},A);
r=await j('GET','/api/pages/'+id+'?locale=ur',null,A); log('ur title after en edit',r.d?.title);
r=await j('GET','/api/pages/'+id+'?locale=en',null,A); log('en title',r.d?.title);
r=await j('PATCH','/api/pages/'+id+'?locale=ur&draft=true',{title:'ٹیسٹ صفحہ (مسودہ)'},A); log('ur draft save',[r.s]);
r=await j('GET','/api/pages?where[slug][equals]=spike-page&locale=ur'); log('anon ur sees published title (not draft)',r.d?.docs?.[0]?.title);
r=await j('GET','/api/pages/versions?where[parent][equals]='+id+'&limit=50',null,A); log('versions',[r.s,r.d?.totalDocs]);
r=await j('GET','/api/pages?where[slug][equals]=spike-page&locale=zz'); log('bad locale',[r.s]);
// schedule publish via local-API-equivalent REST: job queue collection
r=await j('GET','/api/payload-jobs?limit=5',null,A); log('payload-jobs collection',[r.s,r.d?.totalDocs]);
// public page render
const pr=await fetch(B+'/spike-page'); log('frontend /spike-page',pr.status);
const ur=await fetch(B+'/admin/collections/pages'); log('admin pages route (unauth)',ur.status);
