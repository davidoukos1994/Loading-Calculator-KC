(()=>{'use strict';
const ids=['hclRate','hclStart','hclMode','hclSplit','hclDensity','hclLevel1','hclLevel2','hclLevelD'];
const $=id=>document.getElementById(id), num=id=>Number($(id).value);
const fmt=(n,d=2)=>Number(n).toLocaleString('el-GR',{minimumFractionDigits:d,maximumFractionDigits:d});
const dt=t=>new Date(t).toLocaleString('el-GR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
function save(){try{localStorage.setItem('kapachim_hcl_v1',JSON.stringify(Object.fromEntries(ids.map(id=>[id,$(id).value]))));}catch(e){}}
function calc(){const error=$('hclError'),out=$('hclResults');error.textContent='';out.innerHTML='';
 const rate=num('hclRate'),den=num('hclDensity'),a=num('hclLevel1'),b=num('hclLevel2'),c=num('hclLevelD'),split=num('hclSplit'),start=new Date($('hclStart').value),mode=$('hclMode').value;
 $('hclSplitLabel').hidden=mode!=='both';
 if(!Number.isFinite(rate)||rate<0||!Number.isFinite(den)||den<=0||a<0||a>3.5||b<0||b>3.5||c<0||c>10||split<0||split>100||![rate,den,a,b,c,split].every(Number.isFinite)||Number.isNaN(start.getTime())){error.textContent='Έλεγξε τις τιμές, τα όρια των δεξαμενών και την ημερομηνία.';return;}
 const shares=mode==='both'?[split/100,1-split/100,0]:mode==='t1'?[1,0,0]:mode==='t2'?[0,1,0]:[0,0,1];
 const tanks=[['Tank 1',35.525,a*10.15],['Tank 2',35.525,b*10.15],['D-902',10*den,c*den]];
 let first=[];
 tanks.forEach(([name,cap,current],i)=>{let remaining=Math.max(0,cap-current),flow=rate*shares[i]/1000,eta=remaining===0?'Ήδη γεμάτη':flow>0?dt(start.getTime()+remaining/flow*3600000):'Δεν γεμίζει με την τρέχουσα επιλογή';
 if(flow>0&&remaining>0)first.push({name,h:remaining/flow});
 const card=document.createElement('div');card.className='hcl-result';const title=document.createElement('strong');title.textContent=name;card.append(title);
 for(const line of [`Χωρητικότητα: ${fmt(cap,3)} tn`,`Τώρα: ${fmt(current,3)} tn`,`Απομένουν: ${fmt(remaining,3)} tn`,`Παροχή: ${fmt(flow*1000,1)} kg/h`,`Πλήρωση: ${eta}`]){const row=document.createElement('div');row.textContent=line;card.append(row)}out.append(card);
 });
 const summary=document.createElement('p');summary.className='hcl-summary';if(first.length){first.sort((x,y)=>x.h-y.h);summary.textContent=`Πρώτη αλλαγή: ${first[0].name} — ${dt(start.getTime()+first[0].h*3600000)} (σε ${fmt(first[0].h,2)} ώρες).`;}else summary.textContent='Δεν υπάρχει ενεργή πλήρωση με τα τρέχοντα δεδομένα.';out.append(summary);
}
function init(){const saved=(()=>{try{return JSON.parse(localStorage.getItem('kapachim_hcl_v1')||'{}')}catch{return {}}})();
 ids.forEach(id=>{if(saved[id]!==undefined)$(id).value=saved[id];});if(!$('hclStart').value){const d=new Date();$('hclStart').value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
 ids.forEach(id=>$(id).addEventListener('input',()=>{save();calc()}));$('hclNow').onclick=()=>{const d=new Date();$('hclStart').value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);save();calc()};
 $('hclClear').onclick=()=>{if(!confirm('Να καθαριστούν τα δεδομένα HCl;'))return;try{localStorage.removeItem('kapachim_hcl_v1')}catch(e){}ids.forEach(id=>{if(id==='hclRate'||id.startsWith('hclLevel'))$(id).value='0';else if(id==='hclDensity')$(id).value='1.15';else if(id==='hclSplit')$(id).value='50';else if(id==='hclMode')$(id).value='both'});$('hclNow').click()};calc()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();