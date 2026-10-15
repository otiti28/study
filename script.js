const r=(c,n)=>Array(n).fill(c),R='RATT',$=i=>document.getElementById(i);
const C={
'1MLA3540':{t:'Anglais',p:'SORO Anne-Marie Epse KONAN',h:[8,10,0],c:'#22dd22',f:'#000'},
'1MAN3540':{t:'Entrepreneuriat',p:'M. SILUE Yacouba',h:[14,10,0],c:'#f7a8f7',f:'#000'},
'2MTH3400':{t:'Graphes et applications',p:'Dr DJANAN ATTOUNGBRE Franck',h:[10,14,0],c:'#996600',f:'#fff'},
'1INF3400':{t:'Structures de données complexes et Python',p:'Dr KOFFI DAGOU Dangui Augustin',h:[12,12,0],c:'#1de9a0',f:'#000'},
'1MTH3400':{t:'Optimisation linéaire',p:'Dr KONE Mamadou Ibrahima',h:[10,14,0],c:'#0aa5e8',f:'#fff'},
'2INF3400':{t:'Python pour la Science des données',p:"Dr DOUHA N'GUESSAN",h:[12,12,0],c:'#d3e6ef',f:'#000'},
'1INF3543':{t:'Cloud computing et IoT',p:"Dr N'GORAN Kouadio Rodrigue",h:[6,0,12],c:'#fcd5a6',f:'#000'},
'1INF3542':{t:'Logiciels scientifiques (R, LaTeX, Scilab…)',p:"Dr DOUHA N'GUESSAN",h:[12,12,0],c:'#ffee00',f:'#000'}
};
const X={SPORT:{t:'Sport',c:'#e8e8dc',f:'#c00'},COACHING:{t:'Coaching',c:'#9db4d6',f:'#c00'},APP3:{t:'APP 3',c:'#4ff0f0',f:'#000'},RATT:{t:'Devoirs et cours de rattrapage',c:'#ff6b9d',f:'#fff'}};
const I=c=>C[c]||X[c];
const D=['Lun','Mar','Mer','Jeu','Ven','Sam'];
const H=['7h30 – 10h00','10h15 – 12h45','14h30 – 17h00'];
const P=[
[r('1INF3542',5),r('1MLA3540',7),['SPORT','SPORT','COACHING','SPORT','SPORT','COACHING','SPORT']],
[r('1INF3543',7),r('1INF3400',5),[...r('1MAN3540',4),...r('APP3',3)]],
[r('1INF3542',5),r('2MTH3400',5),[]],
[r('2INF3400',7),r('1MAN3540',6),[...r('2INF3400',3),...r('1MTH3400',4)]],
[r('1MTH3400',6),r('1INF3400',5),r('2MTH3400',5)],
[['','',R,R,R,R,R],[],[]]
];
const W0=new Date(2026,7,31),E=new Date(2026,9,19);
const dt=(w,d)=>new Date(2026,7,31+7*w+d);
const fd=(t,l)=>t.toLocaleDateString('fr-FR',l?{weekday:'long',day:'numeric',month:'long'}:{day:'2-digit',month:'2-digit'});
const tm=(d,s)=>d==5?'8h – 12h':H[s];
const n0=new Date(),td=new Date(n0.getFullYear(),n0.getMonth(),n0.getDate());
function cw(){return Math.max(0,Math.min(7,Math.floor((td-W0+36e5)/6048e5)))}
const ses=k=>{const a=[];P.forEach((day,d)=>day.forEach((sl,s)=>sl.forEach((c,w)=>{if(c===k)a.push({w,d,s,date:dt(w,d)})})));return a.sort((a,b)=>a.date-b.date||a.s-b.s)};
const nxt=k=>ses(k).find(x=>x.date>=td);
let wk=cw(),q='',cat='',tch='',dys=new Set(),so='rel';

function bindFilterControls(){
  const teacherWrap=$('ft');
  if(teacherWrap){
    teacherWrap.querySelectorAll('input[name="t"]').forEach((input)=>{
      input.addEventListener('change', () => {
        tch=input.checked ? input.dataset.p || '' : '';
        cards();
      });
    });
  }

  const dayWrap=$('fd');
  if(dayWrap){
    dayWrap.querySelectorAll('input[type="checkbox"]').forEach((input)=>{
      input.addEventListener('change', () => {
        const idx=Number(input.dataset.day);
        if(input.checked){dys.add(idx);}else{dys.delete(idx);}
        cards();
      });
    });
  }
}

function hero(){
  const w=Math.floor((td-W0+36e5)/6048e5),d=(td.getDay()+6)%7,l=[];
  if(w>=0&&w<7&&d<6)P[d].forEach((sl,s)=>{const c=sl[w];if(c)l.push(tm(d,s)+' : '+I(c).t)});
  $('hd').textContent=fd(td,1);
  $('hp').innerHTML=(w==7&&d<6)?'<span>Semaine d\'examens (première partie)</span>':l.length?l.map(x=>'<span>'+x+'</span>').join(''):'<span>Pas de cours aujourd\'hui</span>';
  const n=Math.round((E-td)/864e5);
  $('cd').textContent=n>0?'dans '+n+' jour'+(n>1?'s':''):'à partir du 19/10';
}

function plan(){
  $('pills').innerHTML=Array.from({length:8},(_,i)=>'<button type="button" class="'+(i==wk?'on':'')+'" data-action="week-select" data-week="'+i+'">'+(i==7?'Examens':'Semaine '+(i+1))+'</button>').join('');
  if(wk==7){$('tw').innerHTML='<div class="exam">EXAMENS PREMIÈRE PARTIE · SEMESTRES IMPAIRS<br><small>Semaine du 19/10/2026</small></div>';return}
  let h='<table><tr><th></th>'+D.map((d,i)=>{const t=dt(wk,i);return '<th class="'+(+t==+td?'today':'')+'">'+d+'<small>'+fd(t)+'</small></th>'}).join('')+'</tr>';
  for(let s=0;s<3;s++){
    h+='<tr><th class="rh">'+H[s]+'</th>';
    for(let d=0;d<6;d++){
      if(d==5&&s>0)continue;
      const c=P[d][s][wk],sp=d==5?' rowspan="3"':'';
      if(!c){h+='<td class="e"'+sp+'></td>';continue}
      const o=I(c),cl=C[c];
      h+='<td'+sp+'><button type="button" class="ev'+(cl?' c':'')+'" style="background:'+o.c+';color:'+o.f+'"'+(cl?' data-action="open-course" data-code="'+c+'"':'')+'>'+(cl?c+'<small>'+o.t+'</small>':o.t)+(d==5?'<small>8h – 12h</small>':'')+'</button></td>';
    }
    h+='</tr>';
  }
  $('tw').innerHTML=h+'</table>';
}

function cards(){
  const rg=cat?new RegExp(cat):null;
  let L=Object.keys(C).filter(k=>{const o=C[k];return (k+' '+o.t+' '+o.p).toLowerCase().includes(q.toLowerCase())&&(!rg||rg.test(k.slice(1,4)))&&(!tch||o.p===tch)&&(!dys.size||ses(k).some(x=>dys.has(x.d)))});
  const tot=k=>C[k].h[0]+C[k].h[1]+C[k].h[2];
  if(so=='h')L.sort((a,b)=>tot(b)-tot(a));
  if(so=='az')L.sort((a,b)=>C[a].t.localeCompare(C[b].t,'fr'));
  if(so=='next')L.sort((a,b)=>((nxt(a)||{date:9e15}).date-(nxt(b)||{date:9e15}).date));
  $('cnt').textContent=L.length+' unité'+(L.length>1?'s':'')+' d\'enseignement';
  $('grid').innerHTML=L.length?L.map(k=>{
    const o=C[k],n=nxt(k);
    const b=!n?'<span class="badge" style="background:#565959">Terminé</span>':+n.date==+td?'<span class="badge">Aujourd\'hui</span>':'';
    return '<article class="card"><div class="band" style="background:'+o.c+';color:'+o.f+'">'+k+'</div><div class="cb">'+b+
    '<h3>'+o.t+'</h3><p class="by">par <a>'+o.p+'</a></p>'+
    '<div class="price">'+tot(k)+'<small> h</small></div><p class="sub">CM '+o.h[0]+' h · TD '+o.h[1]+' h · TP '+o.h[2]+' h</p>'+
    '<p class="nx">'+(n?'Prochain cours : <b>'+fd(n.date,1)+'</b>, '+tm(n.d,n.s):'Cours terminés')+'</p>'+
    '<button type="button" class="btn" data-action="open-course" data-code="'+k+'">Voir les séances</button></div></article>'}).join('')
  :'<div class="box none">Aucune unité ne correspond à votre recherche. Effacez les filtres pour tout afficher.</div>';
}

function openC(k){
  const o=C[k],a=ses(k),n=a.filter(x=>x.date<td).length;
  $('mc').innerHTML='<div class="mh" style="background:'+o.c+';color:'+o.f+'"><button type="button" class="x" data-action="close-modal" aria-label="Fermer">✕</button><small>'+k+'</small><h2>'+o.t+'</h2><p>'+o.p+'</p></div><div class="mb"><div class="bar"><i style="width:'+(n/a.length*100)+'%"></i></div><p class="sub">'+n+' séance'+(n>1?'s':'')+' passée'+(n>1?'s':'')+' sur '+a.length+' · CM '+o.h[0]+' h, TD '+o.h[1]+' h, TP '+o.h[2]+' h</p><ul>'+
  a.map(x=>'<li class="'+(x.date<td?'d':+x.date==+td?'t':'')+'"><b>S'+(x.w+1)+'</b>'+fd(x.date,1)+'<span>'+tm(x.d,x.s)+'</span></li>').join('')+'</ul></div>';
  $('ov').classList.add('show');
}

function cl(){$('ov').classList.remove('show')}
function go(i){$(i).scrollIntoView({behavior:'smooth',block:'start'})}

function filt(){
  const T=[...new Set(Object.values(C).map(o=>o.p))];
  $('ft').innerHTML='<label><input type="radio" name="t" data-p="" checked>Tous</label>'+T.map(p=>'<label><input type="radio" name="t" data-p="'+p.replace(/"/g,'&quot;')+'">'+p+'</label>').join('');
  $('fd').innerHTML=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<label><input type="checkbox" data-day="'+i+'">'+d+'</label>').join('');
  bindFilterControls();
}

function reset(){
  q='';cat='';tch='';dys.clear();so='rel';
  $('q').value='';
  $('cat').value='';
  $('sorter').value='rel';
  filt();cards();
}

function handleDocumentClick(event){
  const actionEl=event.target.closest('[data-action]');
  if(!actionEl)return;

  const action=actionEl.dataset.action;
  switch(action){
    case 'go-ue':
      go('ue');
      break;
    case 'today':
      wk=cw();plan();go('plan');
      break;
    case 'week-plan':
      go('plan');
      break;
    case 'ue':
      go('ue');
      break;
    case 'exams':
      wk=7;plan();go('plan');
      break;
    case 'reset':
      reset();
      break;
    case 'scroll-top':
      scrollTo({top:0,behavior:'smooth'});
      break;
    case 'week-select':
      wk=Number(actionEl.dataset.week);
      plan();
      if(wk!==7)go('plan');
      break;
    case 'open-course':
      openC(actionEl.dataset.code);
      break;
    case 'close-modal':
      cl();
      break;
    default:
      break;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $('cat').addEventListener('change', () => {
    cat=$('cat').value;
    cards();
  });

  $('q').addEventListener('input', () => {
    q=$('q').value;
    cards();
  });

  $('sorter').addEventListener('change', () => {
    so=$('sorter').value;
    cards();
  });

  $('#ov').addEventListener('click', (event) => {
    if(event.target===event.currentTarget)cl();
  });

  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', (event) => {
    if(event.key==='Escape')cl();
  });

  hero();
  plan();
  filt();
  cards();
});
