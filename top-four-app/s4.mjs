import { chromium } from '@playwright/test';
import fs from 'node:fs';
const state = JSON.parse(fs.readFileSync('.auth/session.json','utf8'));
const b = await chromium.launch();
const c = await b.newContext({ storageState: state, viewport:{width:1280,height:800} });
const p = await c.newPage();
await p.goto('http://localhost:5173/predict/fixture/27168c2c-f9ae-4852-a57b-bb17fcb1fb3c?leagueId=a9627e0b-6567-4c9d-a567-23085bfa78c0',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(3000);
const sc = p.locator('main').first();
await sc.evaluate(el => el.scrollTo(0, el.scrollHeight));
await p.waitForTimeout(600);
const info = await p.evaluate(() => {
  const m = document.querySelector('main');
  const last = m.lastElementChild?.lastElementChild;
  const r = last?.getBoundingClientRect();
  return { mainBottom: Math.round(m.getBoundingClientRect().bottom), lastBottom: r ? Math.round(r.bottom) : null,
           bodyBg: getComputedStyle(document.body).backgroundColor,
           mainBg: getComputedStyle(m).backgroundColor };
});
console.log(info);
await p.screenshot({ path:'/tmp/bottom.png' });
await c.close(); await b.close();
