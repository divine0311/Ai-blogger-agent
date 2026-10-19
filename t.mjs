const tests=[
 "https://placehold.co/1200x630/1e293b/e2e8f0.png?text=Local+SEO+Guide",
 "https://placehold.co/1200x315/1e293b/e2e8f0.png?text=Test"
];
for (const u of tests){
  try{ const r=await fetch(u,{redirect:"follow"}); console.log(r.status, r.headers.get("content-type"), u.slice(0,55)); }
  catch(e){ console.log("FAIL", e.message); }
}
