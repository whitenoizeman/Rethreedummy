// Simple, robust calculation + settlement
const playerA = document.getElementById('playerA');
const playerB = document.getElementById('playerB');
const playerC = document.getElementById('playerC');
const poolInput = document.getElementById('pool');
const calcBtn = document.getElementById('calcBtn');
const resultCard = document.getElementById('resultCard');
const resultBody = document.getElementById('resultBody');
const paymentDetails = document.getElementById('paymentDetails');
const themeToggle = document.getElementById('themeToggle');

// theme persist
function setTheme(mode){
  if(mode==='dark') document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('theme', mode);
  themeToggle.textContent = mode==='dark' ? '☀️' : '🌙';
}
const savedTheme = localStorage.getItem('theme');
if(savedTheme) setTheme(savedTheme);
else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
else setTheme('light');
themeToggle.addEventListener('click',()=>{
  const cur = localStorage.getItem('theme')==='dark' ? 'light' : 'dark'; setTheme(cur);
});

function toNumber(v){ const n = parseFloat(String(v).replace(/,/g,'')); return isNaN(n)?0:n; }

function calcChips(A,B,C,pool){
  // formula: ((p - x) + (p - y)) * pool
  const chipA = ((A - B) + (A - C)) * pool;
  const chipB = ((B - A) + (B - C)) * pool;
  const chipC = ((C - A) + (C - B)) * pool;
  return {A: chipA, B: chipB, C: chipC};
}

function settlePayments(chips){
  // returns list of payments {from,to,amount}
  const players = Object.entries(chips).map(([name,val])=>({name, val: Number(val)}));
  const payers = players.filter(p=>p.val<0).map(p=>({name:p.name, owe:-p.val}));
  const receivers = players.filter(p=>p.val>0).map(p=>({name:p.name, gain:p.val}));
  const payments = [];
  // greedy match
  let i=0, j=0;
  while(i<payers.length && j<receivers.length){
    const owe = payers[i].owe;
    const gain = receivers[j].gain;
    const amt = Math.min(owe, gain);
    if(amt>0){
      payments.push({from:payers[i].name, to:receivers[j].name, amount: Number(amt.toFixed(2))});
      payers[i].owe = +(payers[i].owe - amt).toFixed(8);
      receivers[j].gain = +(receivers[j].gain - amt).toFixed(8);
    }
    if(payers[i].owe <= 0.00001) i++;
    if(receivers[j].gain <= 0.00001) j++;
  }
  return payments;
}

function showResults(chips, payments){
  resultBody.innerHTML = '';
  Object.keys(chips).forEach(k=>{
    const p = document.createElement('p');
    p.innerHTML = `<strong>${k}</strong> : ${chips[k].toFixed(2)}`;
    resultBody.appendChild(p);
  });
  paymentDetails.innerHTML = '';
  if(payments.length===0) paymentDetails.innerHTML = '<p>ไม่มีการชำระเงิน</p>';
  else{
    payments.forEach(p=>{
      const el = document.createElement('p');
      el.textContent = `${p.from} → ${p.to} : ${p.amount.toFixed(2)}`;
      paymentDetails.appendChild(el);
    });
  }
  resultCard.hidden = false;
  resultCard.scrollIntoView({behavior:'smooth'});
}

calcBtn.addEventListener('click', ()=>{
  const A = toNumber(playerA.value);
  const B = toNumber(playerB.value);
  const C = toNumber(playerC.value);
  const pool = toNumber(poolInput.value);
  const chips = calcChips(A,B,C,pool);
  const payments = settlePayments(chips);
  showResults(chips, payments);
});

// Service worker registration (PWA)
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
