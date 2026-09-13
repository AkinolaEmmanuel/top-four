import { chromium } from '@playwright/test';
import fs from 'node:fs';
const state = JSON.parse(fs.readFileSync('.auth/session.json','utf8'));
const L='a9627e0b-6567-4c9d-a567-23085bfa78c0', FX='27168c2c-f9ae-4852-a57b-bb17fcb1fb3c';
const BASE='http://localhost:5173';
const ROUTES = [
  ['Home','/home'],['Predict','/predict'],['Leagues','/leagues'],['Me','/me'],['Alerts','/alerts'],
  ['Join','/leagues/join'],['Setup','/leagues/setup'],['Overview',`/leagues/${L}`],
  ['Fixtures',`/leagues/${L}/fixtures`],['Table',`/leagues/${L}/table`],['Rules',`/leagues/${L}/rules`],
  ['Questions',`/leagues/${L}/questions`],['More',`/leagues/${L}/more`],['Admin',`/leagues/${L}/admin`],
  ['Fixture',`/predict/fixture/${FX}?leagueId=${L}`],['FxResults',`/predict/fixture/${FX}/results?leagueId=${L}`],
  ['Name','/me/name'],['Email','/me/email'],['Password','/me/password'],
];

const a11y = () => {
  const out=[];
  // 1. controls with no accessible name
  document.querySelectorAll('button, a[href], input, select, textarea').forEach(el=>{
    const st=getComputedStyle(el);
    if(st.display==='none'||st.visibility==='hidden')return;
    const r=el.getBoundingClientRect(); if(!r.width||!r.height)return;
    const name=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').trim()
      || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent?.trim())
      || (el.closest('label')?.textContent||'').trim()
      || (el.getAttribute('aria-labelledby') && document.getElementById(el.getAttribute('aria-labelledby'))?.textContent?.trim())
      || '';
    if(!name) out.push({kind:'no-accessible-name', tag:el.tagName.toLowerCase(),
      cls:el.className.toString().slice(0,44), href:el.getAttribute('href')||''});
  });
  // 2. inputs with no label at all
  document.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(el=>{
    const has = el.getAttribute('aria-label') || el.closest('label')
      || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`));
    if(!has) out.push({kind:'input-unlabelled', type:el.getAttribute('type')||el.tagName.toLowerCase(),
      name:el.getAttribute('name')||el.id||''});
  });
  // 3. heading order — a jump implies a missing level
  const hs=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter(h=>getComputedStyle(h).display!=='none').map(h=>+h.tagName[1]);
  if(hs.length && hs[0]!==1) out.push({kind:'no-h1', detail:'first heading is h'+hs[0]});
  for(let i=1;i<hs.length;i++) if(hs[i]-hs[i-1]>1)
    out.push({kind:'heading-jump', detail:`h${hs[i-1]} -> h${hs[i]}`});
  // 4. images with no alt attribute at all
  document.querySelectorAll('img:not([alt])').forEach(img=>
    out.push({kind:'img-no-alt', src:(img.currentSrc||img.src||'').slice(-50)}));
  // 5. internal links to collect
  const hrefs=[...document.querySelectorAll('a[href^="/"]')].map(a=>a.getAttribute('href'));
  return { out, hrefs:[...new Set(hrefs)] };
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: state, viewport:{width:1440,height:900} });
const page = await ctx.newPage();
const findings=[]; const allHrefs=new Set();

for (const [name,path] of ROUTES) {
  try {
    await page.goto(BASE+path,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(1500);
    const { out, hrefs } = await page.evaluate(a11y);
    const seen=new Set();
    for(const f of out){ const k=JSON.stringify(f); if(seen.has(k))continue; seen.add(k);
      findings.push({screen:name,...f}); }
    hrefs.forEach(h=>allHrefs.add(h));
  } catch(e){ findings.push({screen:name,kind:'load-error',detail:e.message.slice(0,80)}); }
}

// Every internal destination, actually requested.
const checked=[];
for (const href of [...allHrefs]) {
  if (href.startsWith('/_next') || href.startsWith('/api')) continue;
  try {
    const res = await page.request.get(BASE+href, { maxRedirects: 0 });
    const s = res.status();
    checked.push({href, status:s});
    if (s>=400) findings.push({kind:'dead-link', href, status:s});
  } catch(e){ findings.push({kind:'link-error', href, detail:e.message.slice(0,60)}); }
}

await ctx.close(); await browser.close();
fs.writeFileSync('/tmp/links-a11y.json', JSON.stringify({findings, linksChecked:checked.length},null,2));
console.log('links checked:', checked.length, '| findings:', findings.length);
