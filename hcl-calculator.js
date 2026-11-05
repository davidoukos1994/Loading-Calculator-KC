(()=>{'use strict';
const $=id=>document.getElementById(id),ids=['hclRate','hclStart','hclMode','hclDensity','hclLevel1','hclLevelD'];
const num=id=>Number($(id).value),fmt=(v,d=2)=>v.toLocaleString('el-GR',{minimumFractionDigits:d,maximumFractionDigits:d});
const date=t=>new Date(t).toLocaleString('el-GR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
function save(){try{localStorage.setItem('kapachim_hcl_v2',JSON.stringify(Object.fromEntries(ids.map(k=>[k,$(k).value]))))}catch(e){}}
function now(){let d=new Date();$('hclStart').value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
function tile(label,value){return `<div class="hcl-tile"><span>${label}</span><strong>${value}</strong></div>`}
function calc(){let rate=num('hclRate'),level=num('hclLevel1'),vol=num('hclLevelD'),density=num('hclDensity'),mode=$('hclMode').value,start=new Date($('hclStart').value);
 document.querySelectorAll('[data-hcl-mode]').forEach(b=>{let active=b.dataset.hclMode===mode;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});
 if(![rate,level,vol,density].every(Number.isFinite)||rate<0||level<0||level>3.5||vol<0||vol>10||density<=0||Number.isNaN(start.getTime())){$('hclError').textContent='Έλεγξε παραγωγή, στάθμη (0–3,50 m), D-902 (0–10 m³) και ημερομηνία.';$('hclTankQuick').innerHTML='';$('hclDQuick').innerHTML='';return}
 $('hclError').textContent='';
 let meters=3.5-level,tons=meters*10.15*2,active=mode==='both',hours=active&&rate>0?tons*1000/rate:null;
 let eta=meters===0?'Ήδη γεμάτες':hours!==null?date(start.getTime()+hours*3600000):'—';
 $('hclTankQuick').innerHTML=tile('Απομένουν',fmt(meters)+' m')+tile('Απομένουν συνολικά',fmt(tons,3)+' tn')+tile('Χρόνος πλήρωσης',meters===0?'0 ώρες':hours===null?'—':fmt(hours)+' ώρες')+tile('Γεμίζουν στις',eta);
 let left=10-vol,td=left*density,hd=mode==='d'&&rate>0?td*1000/rate:null;
 $('hclDQuick').innerHTML=tile('Απομένουν',fmt(left)+' m³')+tile('Απομένουν',fmt(td,3)+' tn')+tile('Χρόνος πλήρωσης',left===0?'0 ώρες':hd===null?'—':fmt(hd)+' ώρες')+tile('Γεμίζει στις',left===0?'Ήδη γεμάτη':hd===null?'—':date(start.getTime()+hd*3600000));
}
function init(){let saved={};try{saved=JSON.parse(localStorage.getItem('kapachim_hcl_v2')||localStorage.getItem('kapachim_hcl_v1')||'{}')}catch(e){}
 for(let id of ids){if(saved[id]!==undefined)$(id).value=saved[id]}
 // Previous version had independent tank levels; common meter now follows Tank 1.
 if(!['both','d'].includes($('hclMode').value))$('hclMode').value='both';
 if(!$('hclStart').value)now();
 ids.forEach(id=>$(id).addEventListener('input',()=>{save();calc()}));
 $('hclNow').onclick=()=>{now();save();calc()};$('hclReset').onclick=$('hclNow').onclick;
 document.querySelectorAll('[data-hcl-mode]').forEach(b=>b.onclick=()=>{$('hclMode').value=b.dataset.hclMode;save();calc()});
 document.querySelectorAll('[data-hcl-adjust]').forEach(b=>b.onclick=()=>{let el=$(b.dataset.hclAdjust);el.value=Math.min(Number(el.max),Math.max(0,Number(el.value||0)+Number(b.dataset.delta))).toFixed(2);save();calc()});
 $('hclSave').onclick=()=>{save();let b=$('hclSave');b.textContent='✓ Αποθηκεύτηκε';setTimeout(()=>b.textContent='💾 Αποθήκευση',1300)};
 $('hclClear').onclick=()=>{if(!confirm('Να καθαριστούν τα δεδομένα HCl;'))return;localStorage.removeItem('kapachim_hcl_v1');localStorage.removeItem('kapachim_hcl_v2');$('hclRate').value=0;$('hclLevel1').value=0;$('hclLevelD').value=0;$('hclDensity').value=1.15;$('hclMode').value='both';now();save();calc()};calc()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();