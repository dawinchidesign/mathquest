/* Task-specific diagrams use the values given in the question. */
const DATA_VISUALS=[
[{type:'bars',values:[12,18,20],labels:['Дс','Сс','Ср']},{type:'bars',values:[35,28],labels:['A','B']}],
[{type:'bars',values:[24,36,30],labels:['A','B','C']},{type:'bars',values:[10,15,25,30],labels:['1','2','3','4']}],
[{type:'pie',values:[25,75],labels:['90°','Қалғаны']},{type:'pie',values:[40,60],labels:['40%','Қалғаны']}],
[{type:'line',values:[8,12,15,10],labels:['1-күн','2-күн','3-күн','4-күн'],unit:'°C'},{type:'line',values:[40,70],labels:['10:00','12:00'],unit:'дана'}],
[{type:'chips',values:[6,8,9,13]},{type:'chips',values:[10,14,'?']}],
[{type:'chips',values:[3,11,7,5,9]},{type:'chips',values:[2,4,8,10]}],
[{type:'chips',values:[2,4,4,5,7,4]},{type:'chips',values:[6,8,6,9,8,8,10]}],
[{type:'chips',values:[12,19,7,15]},{type:'chips',values:[-3,2,5,-1,4]}],
[{type:'bars',values:[48,60],labels:['A','B']},{type:'bars',values:[80,100],labels:['Өткен ай','Осы ай']}],
[{type:'line',values:[4,7,10],labels:['x = 1','x = 2','x = 3'],unit:'y'},{type:'line',values:[3,5,7],labels:['x = 0','x = 1','x = 2'],unit:'y'}],
[{type:'pie',values:[24,56],labels:['Футбол: 24','Қалғандары: 56']},{type:'pie',values:[45000,105000],labels:['Азық: 45 000','Қалғаны: 105 000']}]
];
DATA_VISUALS.forEach((vs,i)=>vs.forEach((v,j)=>{const q=BANK.find(q=>q.id===`course-data-${String(i+1).padStart(2,'0')}-${j+1}`);if(q)q.visual=v;}));
const motionGraph1=BANK.find(q=>q.id==='course-motion-09-1');if(motionGraph1)motionGraph1.visual={type:'line',values:[0,45,90],labels:['0 сағ','1 сағ','2 сағ'],unit:'км'};
const motionGraph2=BANK.find(q=>q.id==='course-motion-09-2');if(motionGraph2)motionGraph2.visual={type:'line',values:[0,100,100],labels:['0 сағ','2 сағ','3 сағ'],unit:'км',xs:[0,2,3]};
const rectQ=BANK.find(q=>q.id==='course-geometry-05-1');if(rectQ)rectQ.visual={type:'rect',w:9,h:4};
const originalVisual=visual;
visual=function(v){if(v.type==='chips')return `<div class="data-chips" role="group" aria-label="Деректер қатары">${v.values.map(n=>`<span>${esc(n)}</span>`).join('')}</div>`;
if(v.type==='pie'){const total=v.values.reduce((a,b)=>a+b,0),fraction=v.values[0]/total,r=48,length=2*Math.PI*r;return `<div class="pie-task"><svg viewBox="0 0 170 140" class="pie-chart" role="img" aria-label="${v.labels.join(', ')}"><circle cx="85" cy="70" r="${r}" stroke="#96a5c722" stroke-width="22" fill="none"/><circle class="pie-sector" cx="85" cy="70" r="${r}" stroke="#9cadd4" stroke-width="22" stroke-dasharray="${fraction*length} ${length}" fill="none" transform="rotate(-90 85 70)"/><text x="85" y="75" text-anchor="middle" fill="var(--text)" font-size="12">${total===100?'100%':'Барлығы: '+fmt(total)}</text></svg><div>${v.labels.map((l,i)=>`<span><i style="background:${i===0?'#9cadd4':'#c7cfdf'}"></i>${esc(l)}</span>`).join('')}</div></div>`;}
if(v.type==='line'){const max=Math.max(...v.values,1)*1.15,min=Math.min(0,...v.values),range=max-min||1,xs=v.xs||v.values.map((_,i)=>i),xMin=Math.min(...xs),xMax=Math.max(...xs),coordX=i=>40+(xs[i]-xMin)/Math.max(1,xMax-xMin)*280,coordY=n=>130-(n-min)/range*100,points=v.values.map((n,i)=>`${coordX(i)},${coordY(n)}`).join(' ');return `<svg class="line-task-chart" viewBox="0 0 360 175" role="img" aria-label="${v.labels.map((l,i)=>l+': '+v.values[i]).join(', ')}"><path d="M35 15v120h300" stroke="var(--plot-axis)" fill="none"/><text x="18" y="15" fill="var(--muted)" font-size="8">${esc(v.unit||'')}</text><text x="23" y="${coordY(0)+3}" fill="var(--muted)" font-size="8">0</text><polyline points="${points}" fill="none" stroke="#8fa6ce" stroke-width="2.5" class="plot-line"/>${v.values.map((n,i)=>`<circle cx="${coordX(i)}" cy="${coordY(n)}" r="4" fill="#b4ccab" stroke="var(--panel)" stroke-width="1.5"/><text x="${coordX(i)}" y="${coordY(n)-12}" text-anchor="middle" font-size="10" fill="var(--text)">${n}</text><text x="${coordX(i)}" y="157" text-anchor="middle" font-size="8" fill="var(--muted)">${esc(v.labels[i])}</text>`).join('')}</svg>`;}
return originalVisual(v);};
