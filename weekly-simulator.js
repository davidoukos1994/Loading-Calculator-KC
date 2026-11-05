(()=>{
'use strict';
const $=id=>document.getElementById(id), fmt=n=>Number(n).toLocaleString('el-GR',{maximumFractionDigits:2,minimumFractionDigits:2});
const num=v=>Number(String(v??'').replace(',','.'));
const datefmt=d=>d.toLocaleString('el-GR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
const local=d=>{const z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`};
const ids=['Z1','Z2','Z3','D1','D2'];
const saved=()=>{try{return JSON.parse(localStorage.getItem('kc.weekly.simulator.v1')||'{}')}catch{return {}}};
const save=()=>{const d={};['kcRate','kcStart','kcEnd','kcTrucks','kcCurrent','kcOrder','kcCustom'].forEach(k=>d[k]=$(k).value);localStorage.setItem('kc.weekly.simulator.v1',JSON.stringify(d))};
function render(){
 const box=$('kcResults'); if(!box)return;
 const rate=num($('kcRate').value), trucks=num($('kcTrucks').value), start=new Date($('kcStart').value),end=new Date($('kcEnd').value);
 const error=message=>{box.innerHTML='<p class="kc-error"></p>';box.firstChild.textContent=message};
 if(!Number.isFinite(rate)||rate<=0||!Number.isInteger(trucks)||trucks<0||!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<=start)return error('Συμπλήρωσε θετική παραγωγή, σωστές ημερομηνίες και ακέραιο αριθμό βυτίων.');
 if(typeof weekProduction==='undefined')return error('Δεν φορτώθηκαν τα δεδομένα δεξαμενών.');
 const active=weekProduction.tanks.filter(t=>ids.includes(t.id));
 let order=$('kcOrder').value==='custom'?$('kcCustom').value.toUpperCase().split(',').map(x=>x.trim()).filter(Boolean):ids.filter(id=>active.some(t=>t.id===id));
 if(order.some(id=>!active.some(t=>t.id===id))||new Set(order).size!==order.length||!order.length)return error('Η σειρά πρέπει να περιέχει μοναδικές ενεργές δεξαμενές, χωρισμένες με κόμμα.');
 const current=$('kcCurrent').value;if(!order.includes(current))return error('Η τρέχουσα δεξαμενή πρέπει να υπάρχει στη σειρά.');
 order=[...order.slice(order.indexOf(current)),...order.slice(0,order.indexOf(current))];
 let total=0,cap=0;const tanks={};
 for(const t of active){const m=num(t.m),max=num(t.maxM),tnm=num(t.tnm),target=t.targetM===''?max:num(t.targetM);
 if(t.m===''||!Number.isFinite(m)||m<0||m>max||!Number.isFinite(target)||target<m||target>max||max<=0||tnm<=0)return error('Συμπλήρωσε έγκυρα πραγματικά μέτρα και στόχους για όλες τις ενεργές δεξαμενές στον πίνακα παρακάτω.');
 tanks[t.id]={m,target,tnm};total+=m*tnm;cap+=max*tnm;
 }
 const horizon=(end-start)/3600000, produced=rate*horizon/1000,sold=trucks*24.5,final=total+produced-sold;
 let cursor=new Date(start),events=[],used=0;
 for(const id of order){const t=tanks[id],tons=Math.max(0,(t.target-t.m)*t.tnm),hours=tons*1000/rate;used+=tons;
 const finish=new Date(cursor.getTime()+hours*3600000);
 events.push({id,tons,finish,within:finish<=end});cursor=finish;
 }
 const allFull=events.every(e=>e.within),firstFull=events.find(e=>e.tons>0);
 const headline=final>cap?'Το τελικό ισοζύγιο ξεπερνά τη μέγιστη χωρητικότητα.':final<0?'Το τελικό ισοζύγιο είναι αρνητικό.':'Το τελικό ισοζύγιο είναι εντός συνολικής χωρητικότητας.';
 box.replaceChildren();const summary=document.createElement('div');summary.className='kc-summary';
 summary.innerHTML=`<div>Απόθεμα τώρα<strong>${fmt(total)} tn</strong></div><div>Παραγωγή διαστήματος<strong>${fmt(produced)} tn</strong></div><div>Βυτία<strong>${fmt(sold)} tn</strong></div><div>Υπόλοιπο στο τέλος<strong>${fmt(final)} tn</strong></div>`;box.append(summary);
 const h=document.createElement('h4');h.textContent='Πότε αλλάζεις δεξαμενή (θεωρητικά)';box.append(h);
 const ol=document.createElement('ol');ol.className='kc-events';for(const e of events){const li=document.createElement('li');li.textContent=`${e.id}: ${e.tons===0?'Ήδη στον στόχο':`+${fmt(e.tons)} tn → ${datefmt(e.finish)}`}${e.within?'':' (μετά το επιλεγμένο τέλος)'}`;ol.append(li)}box.append(ol);
 const note=document.createElement('p');note.className='kc-outcome';note.textContent=(allFull?'Όλοι οι δηλωμένοι στόχοι επιτυγχάνονται μέχρι τη λήξη.':'Δεν επιτυγχάνονται όλοι οι στόχοι μέχρι τη λήξη.')+' '+headline;box.append(note);
}
function init(){if(!$('kcSimple'))return;const current=$('kcCurrent');ids.forEach(id=>{const o=document.createElement('option');o.value=id;o.textContent=id;current.append(o)});
 const d=saved();for(const k of ['kcRate','kcStart','kcEnd','kcTrucks','kcCurrent','kcOrder','kcCustom'])if(d[k]!==undefined)$(k).value=d[k];
 if(!ids.includes(current.value))current.value='Z1';
 if(!d.kcStart)$('kcStart').value=local(new Date());if(!d.kcEnd)$('kcEnd').value=local(new Date(Date.now()+7*86400000));
 $('kcOrder').onchange=()=>{$('kcCustomWrap').hidden=$('kcOrder').value!=='custom';save();render()};$('kcCustomWrap').hidden=$('kcOrder').value!=='custom';
 $('kcNow').onclick=()=>{$('kcStart').value=local(new Date());save();render()};$('kcCalc').onclick=()=>{save();render()};
 $('kcClear').onclick=()=>{localStorage.removeItem('kc.weekly.simulator.v1');$('kcRate').value='';$('kcTrucks').value='0';$('kcStart').value='';$('kcEnd').value='';$('kcCurrent').value='Z1';$('kcOrder').value='forward';$('kcCustom').value='Z1,Z2,Z3,D1,D2';$('kcCustomWrap').hidden=true;render()};
 ['kcRate','kcStart','kcEnd','kcTrucks','kcCurrent','kcCustom'].forEach(id=>$(id).addEventListener('change',()=>{save();render()}));
 // Listen for edits to the existing tank grid without changing its own handlers.
 $('productionTankGrid').addEventListener('input',()=>requestAnimationFrame(render));
 $('productionTankGrid').addEventListener('change',()=>requestAnimationFrame(render));
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
