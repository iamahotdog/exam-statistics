/* Demonstration values estimated from the supplied screenshot, not official statistics. */
const DATA = [
 [91,20200,23400],[92,12500,29300],[93,15400,26800],[94,18200,38800],
 [95,13900,36100],[96,15300,39800],[97,16600,35500],[98,20300,44300],
 [99,17400,47000],[100,16500,45400],[101,16900,63100],[102,18000,31000],
 [103,18400,32400],[104,17300,35000],[105,18800,32700],[106,20100,38600],
 [107,19800,41000],[108,20000,35100],[109,19700,31600],[110,13500,28600],
 [111,16300,27300],[112,14800,29000],[113,17100,23400],[114,17400,24600]
].map(([year,civil,professional])=>({year,civil,professional}));
// Illustrative education counts: preserve the prior proportions using synthetic annual totals.
// Annual totals are 320,000–334,000 people, not official statistics.
const EDUCATION_DATA=[
 [100,10,155,380,295,155],[101,11,165,395,275,149],[102,11,178,410,266,131],
 [103,12,190,421,257,117],[104,12,202,436,248,100],[105,13,211,443,239,93],
 [106,13,220,450,230,86],[107,14,226,456,221,82],[108,14,231,465,214,75],
 [109,14,236,472,204,73],[110,15,242,476,195,71],[111,15,245,488,185,66],
 [112,16,249,493,179,62],[113,16,252,505,176,50],[114,16,253,516,166,48]
].map(([year,doctor,master,bachelor,associate,high])=>{const scale=320+year-100;return {year,doctor:doctor*scale,master:master*scale,bachelor:bachelor*scale,associate:associate*scale,high:high*scale,junior:(1000-doctor-master-bachelor-associate-high)*scale}});
const REPORTS={
 certificates:{title:'國家考試證書製發數量',section:'國家考試',short:'證書製發',eyebrow:'國家考試統計',intro:'依年度與人員類別，檢視證書製發數量與年度占比。',category:'人員類別',trend:'歷年證書製發趨勢',detail:'歷年證書製發明細',unit:'張',data:DATA,defaultChart:'stacked',series:[{key:'civil',name:'公務人員',color:'#175f91',text:'#fff'},{key:'professional',name:'專技人員',color:'#36a4a1',text:'#103b3d'}]},
 education:{title:'公務員教育程度',section:'人事統計',short:'教育程度',eyebrow:'公務人員統計',intro:'依年度與教育程度，檢視公務員學歷組成的變化。',category:'教育程度',trend:'歷年教育程度占比',detail:'歷年教育程度明細',unit:'人',data:EDUCATION_DATA,defaultChart:'percent',series:[{key:'doctor',name:'博士',color:'#b77553',text:'#fff'},{key:'master',name:'碩士',color:'#dfb956',text:'#3c341f'},{key:'bachelor',name:'大學',color:'#278985',text:'#fff'},{key:'associate',name:'專科',color:'#83c3d0',text:'#173f48'},{key:'high',name:'高中（職）',color:'#697eb1',text:'#fff'},{key:'junior',name:'國（初）中以下',color:'#bdc9d8',text:'#263a50'}]}
};
function annualTotal(d,report){return report.series.reduce((sum,s)=>sum+d[s.key],0)}
function annualShare(d,key,report){const denominator=annualTotal(d,report);return denominator?d[key]/denominator*100:0}
const $=id=>document.getElementById(id),fmt=n=>n.toLocaleString('en-US'),pct=n=>n.toFixed(1)+'%';
let topic='certificates',view='chart',timer,displayRows=[],selectedSeries=[],states={};
function report(){return REPORTS[topic]}
function selection(){return report().series.filter(s=>$(s.key).checked)}
function rows(){return report().data.filter(d=>d.year>=+$('start').value&&d.year<=+$('end').value)}
function total(d){return selectedSeries.reduce((a,s)=>a+d[s.key],0)}
function share(d,s){return annualShare(d,s.key,report())}
function isPercentage(){return $('chart-type').value==='percent'}
function value(d,s){return isPercentage()?share(d,s):d[s.key]}
function chartUnit(){return isPercentage()?'%':report().unit}
function formatValue(n){return isPercentage()?pct(n):fmt(n)}
function toast(message){$('status').textContent=message;$('status').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('status').hidden=true,3300)}
function remember(){states[topic]={start:$('start').value,end:$('end').value,categories:selection().map(s=>s.key),type:$('chart-type').value,view,labels:$('labels').checked,shares:$('percent-labels').checked,grid:$('grid').checked}}
function selectTopic(next,save=true){
 if(save)remember();topic=next;const r=report(),saved=states[topic];document.body.classList.toggle('education',topic==='education');
 document.title=r.title+'｜考試統計';$('page-title').textContent=r.title;$('page-eyebrow').textContent=r.eyebrow;$('page-intro').textContent=r.intro;$('breadcrumb-section').textContent=r.section;$('breadcrumb-current').textContent=r.short;$('category-label').textContent=r.category;$('table-caption').textContent=r.title+'；示意資料';
 $('category-inputs').innerHTML=r.series.map(s=>`<label><input id="${s.key}" type="checkbox" ${!saved||saved.categories.includes(s.key)?'checked':''}><span>${s.name}</span></label>`).join('');
 for(const id of ['start','end'])$(id).innerHTML=r.data.map(d=>`<option value="${d.year}">${d.year} 年</option>`).join('');
 $('start').value=saved?.start??r.data[0].year;$('end').value=saved?.end??r.data.at(-1).year;
 $('chart-type').innerHTML=(topic==='education'?[['percent','100%堆疊圖'],['grouped','並列長條圖'],['line','折線圖']]:[['stacked','堆疊長條圖'],['percent','100%堆疊圖'],['grouped','並列長條圖'],['line','折線圖']]).map(([v,label])=>`<option value="${v}">${label}</option>`).join('');
 $('chart-type').value=saved?.type??r.defaultChart;$('labels').checked=saved?.labels??false;$('percent-labels').checked=saved?.shares??true;$('grid').checked=saved?.grid??true;
 for(const id of Object.keys(REPORTS)){const b=$(id+'-topic'),active=id===topic;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1}
 $('topic-panel').setAttribute('aria-labelledby',topic+'-topic');setView(saved?.view??'chart');$('chart-scroll').scrollLeft=0;
}
function render(){
 displayRows=rows();selectedSeries=selection();const empty=!displayRows.length||!selectedSeries.length,r=report();
 $('empty-state').hidden=!empty;$('chart-panel').hidden=empty||view!=='chart';$('table-panel').hidden=empty||view!=='table';
 $('result-title').textContent=view==='chart'?(topic==='education'&&!isPercentage()?'歷年教育程度人數':r.trend):r.detail;
 const categoryText=selectedSeries.length===r.series.length?'全部'+r.category:selectedSeries.length===1?selectedSeries[0].name:`已選 ${selectedSeries.length} 種${r.category}`;
 $('result-description').textContent=`民國 ${$('start').value}–${$('end').value} 年 · ${displayRows.length} 個年度 · ${categoryText}`;
 $('download').disabled=empty;document.querySelector('.chart-controls').hidden=view==='table';
 document.querySelector('.report-meta').classList.toggle('table-meta',view==='table');
 $('chart-unit').textContent='單位：'+(view==='table'?r.unit+'、%':chartUnit());
 $('legend').innerHTML=selectedSeries.map(s=>`<span><i class="swatch" style="background:${s.color}"></i>${s.name}</span>`).join('');
 const stacked=['stacked','percent'].includes($('chart-type').value);
 $('percent-labels').disabled=!stacked;
 $('percentage-note').textContent=topic==='certificates'?'占比＝該類證書數量 ÷ 當年兩類證書總數。篩選類別不改變分母；圖內百分比四捨五入至小數1位。':'年度占比＝該學歷人數 ÷ 當年全部學歷人數；篩選類別不改變分母。'+(isPercentage()?'較小區段的占比請於提示或資料表查看。':'');
 $('interaction-hint').textContent=window.innerWidth<700?'左右滑動查看年度，點選長條查看占比':'移至圖表，查看'+(topic==='certificates'?'數量與年度占比':'各教育程度人數與占比');
 $('tooltip').hidden=true;if(empty)return;renderChart();renderTable();
}
function renderChart(){
 const W=Math.max(1160,displayRows.length*49+100),H=400,left=76,right=20,top=28,bottom=43,pw=W-left-right,ph=H-top-bottom;
 const type=$('chart-type').value,stacked=['stacked','percent'].includes(type),labels=$('labels').checked;
 const max=Math.max(...displayRows.map(d=>stacked?selectedSeries.reduce((a,s)=>a+value(d,s),0):Math.max(...selectedSeries.map(s=>value(d,s)))));
 const step=isPercentage()?25:Math.max(1000,Math.ceil(max/4/5000)*5000),ceiling=step*4;
 const y=n=>top+ph-n/ceiling*ph,band=pw/displayRows.length,x=i=>left+band*(i+.5);
 let svg=`<title id="chart-title">${report().title}：示意資料</title><desc id="chart-desc">占比以當年全部類別為分母，可切換資料表查看完整數值。使用 Tab 鍵可逐年查看資料。</desc>`;
 for(let j=0;j<=4;j++){const v=step*j,yy=y(v);if($('grid').checked||j===0)svg+=`<line x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}" stroke="${j===0?'#cdd8e0':'#e9eef2'}"/>`;svg+=`<text x="${left-13}" y="${yy+5}" text-anchor="end" fill="#748390" font-size="14">${isPercentage()?v+'%':fmt(v)}</text>`}
 displayRows.forEach((d,i)=>{svg+=`<text x="${x(i)}" y="${H-15}" text-anchor="middle" font-size="13" fill="#748390">${d.year}</text>`});
 if(type==='line'){
  selectedSeries.forEach(s=>{const path=displayRows.map((d,i)=>`${i?'L':'M'}${x(i)},${y(value(d,s))}`).join(' ');svg+=`<path d="${path}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
   displayRows.forEach((d,i)=>{svg+=`<circle cx="${x(i)}" cy="${y(value(d,s))}" r="${displayRows.length===1?5:2.8}" fill="${s.color}" stroke="white" stroke-width="1.5"/>`;if(labels)svg+=`<text x="${x(i)}" y="${y(value(d,s))-11}" fill="#445d70" font-size="12" text-anchor="middle" transform="rotate(-40 ${x(i)} ${y(value(d,s))-11})">${formatValue(value(d,s))}</text>`});
  });
 }else{
  displayRows.forEach((d,i)=>{
   let running=0;const bw=Math.min(stacked?58:76,band*.86),sw=type==='grouped'?bw/selectedSeries.length:bw;
   const separators=[],inside=[];
   selectedSeries.forEach((s,j)=>{
    const v=value(d,s),height=v/ceiling*ph,xx=type==='grouped'?x(i)-bw/2+j*sw:x(i)-bw/2,yy=stacked?y(running+v):y(v);
    svg+=`<rect x="${xx}" y="${yy}" width="${type==='grouped'?Math.max(1,sw-2):sw}" height="${height}" fill="${s.color}"/>`;
    if(stacked&&j>0)separators.push(`<line x1="${xx}" x2="${xx+sw}" y1="${y(running)}" y2="${y(running)}" stroke="white" stroke-width="1.6"/>`);
    if(stacked&&$('percent-labels').checked&&height>=19)inside.push(`<text class="share-label" x="${x(i)}" y="${yy+height/2}" dy=".35em" fill="${s.text}" font-size="12" font-weight="600" text-anchor="middle">${pct(share(d,s))}</text>`);
    if(type==='grouped'&&labels)svg+=`<text x="${xx+(sw-2)/2}" y="${yy-8}" fill="#445d70" font-size="12" text-anchor="middle" transform="rotate(-55 ${xx+(sw-2)/2} ${yy-8})">${formatValue(v)}</text>`;
    running+=v;
   });
   svg+=separators.join('')+inside.join('');
   if(stacked&&labels)svg+=`<text x="${x(i)}" y="${y(running)-9}" fill="#445d70" font-size="12" text-anchor="middle">${formatValue(running)}</text>`;
  });
 }
 displayRows.forEach((d,i)=>{svg+=`<rect class="hit-area" data-index="${i}" tabindex="0" role="img" aria-label="民國${d.year}年，${selectedSeries.map(s=>s.name+(fmt(d[s.key])+report().unit+'，')+'占比'+pct(share(d,s))).join('；')}；示意資料" x="${left+band*i}" y="${top}" width="${band}" height="${ph}" fill="transparent"/>`});
 $('chart').setAttribute('viewBox',`0 0 ${W} ${H}`);$('chart').style.minWidth=Math.max(660,displayRows.length*46+96)+'px';$('chart').innerHTML=svg;
 $('chart').querySelectorAll('.hit-area').forEach(el=>{el.addEventListener('pointerenter',()=>showTooltip(el));el.addEventListener('click',()=>showTooltip(el));el.addEventListener('focus',()=>showTooltip(el));el.addEventListener('pointerleave',()=>{$('tooltip').hidden=true;el.setAttribute('fill','transparent')});el.addEventListener('blur',()=>{$('tooltip').hidden=true;el.setAttribute('fill','transparent')})});
}
function showTooltip(el){
 const d=displayRows[+el.dataset.index],tip=$('tooltip'),frame=$('chart-frame').getBoundingClientRect(),box=el.getBoundingClientRect();el.setAttribute('fill','#20364a06');
 tip.innerHTML=`<strong>民國 ${d.year} 年 <small style="color:#748390;font-weight:400">／示意</small></strong>`+selectedSeries.map(s=>`<div class="tooltip-row"><i class="swatch" style="background:${s.color}"></i>${s.name}<b>${fmt(d[s.key])}</b><span class="tooltip-percent">${pct(share(d,s))}</span></div>`).join('')+(topic==='certificates'?`<div class="tooltip-foot">年度兩類合計：${fmt(annualTotal(d,report()))} 張</div>`:`<div class="tooltip-foot">年度全部學歷合計：${fmt(annualTotal(d,report()))} 人</div>`);
 tip.hidden=false;const tw=tip.offsetWidth;tip.style.left=Math.max(4,Math.min(frame.width-tw-4,box.x-frame.x+box.width/2+10))+'px';tip.style.top='12px';
}
function renderTable(){
 const unit=report().unit;
 $('table-head').innerHTML='<tr><th scope="col">年度（民國）</th>'+selectedSeries.map(s=>`<th scope="col">${s.name}<span class="cell-share">${topic==='education'?'人數':'數量'}／年度占比</span></th>`).join('')+`<th scope="col">已選${topic==='education'?'人數':'數量'}合計</th></tr>`;
 $('table-body').innerHTML=displayRows.map(d=>`<tr><td>${d.year} 年</td>${selectedSeries.map(s=>`<td>${fmt(d[s.key])}<span class="cell-share">${pct(share(d,s))}</span></td>`).join('')}<td>${fmt(total(d))}</td></tr>`).join('');
 $('table-count').textContent=`共 ${displayRows.length} 筆年度資料 · 單位：${unit}、% · 示意資料`;
}
function setView(next){view=next;for(const v of ['chart','table']){const active=v===view,b=$(v+'-tab');b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1}closePopovers();render()}
for(const v of ['chart','table']){$(v+'-tab').addEventListener('click',()=>setView(v));$(v+'-tab').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?'chart':e.key==='End'?'table':view==='chart'?'table':'chart';setView(n);$(n+'-tab').focus()}})}
for(const v of Object.keys(REPORTS)){$(v+'-topic').addEventListener('click',()=>selectTopic(v));$(v+'-topic').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?'certificates':e.key==='End'?'education':topic==='certificates'?'education':'certificates';selectTopic(n);$(n+'-topic').focus()}})}
for(const id of ['start','end','chart-type','labels','percent-labels','grid'])$(id).addEventListener('change',()=>{if(+$('start').value>+$('end').value){if(id==='start')$('end').value=$('start').value;else $('start').value=$('end').value;toast('已同步調整年度，讓起訖期間保持有效。')}render()});
$('category-inputs').addEventListener('change',render);
$('reset').addEventListener('click',()=>{const r=report();$('start').value=r.data[0].year;$('end').value=r.data.at(-1).year;for(const s of r.series)$(s.key).checked=true;render();toast('已重設為全部年度與類別。')});
function closePopovers(){for(const [button,panel] of [['download','download-menu'],['settings','settings-panel']]){$(panel).hidden=true;$(button).setAttribute('aria-expanded','false')}}
for(const [button,panel] of [['download','download-menu'],['settings','settings-panel']])$(button).addEventListener('click',()=>{const open=$(panel).hidden;closePopovers();$(panel).hidden=!open;$(button).setAttribute('aria-expanded',String(open));if(open)$(panel).querySelector('button,input')?.focus()});
document.addEventListener('click',e=>{if(!e.target.closest('.download-wrap,.settings-wrap'))closePopovers()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const b=!$('download-menu').hidden?'download':!$('settings-panel').hidden?'settings':null;closePopovers();$('tooltip').hidden=true;if(b)$(b).focus()}});
$('chart-scroll').addEventListener('scroll',()=>{$('tooltip').hidden=true});
function saveBlob(blob,extension){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${report().title}_${$('start').value}-${$('end').value}年_示意資料.${extension}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportSVG(){
 const source=$('chart').cloneNode(true);source.querySelectorAll('.hit-area').forEach(n=>n.remove());const vb=$('chart').viewBox.baseVal,W=vb.width,H=vb.height;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H+180}" viewBox="0 0 ${W} ${H+180}"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif"><text x="30" y="34" fill="#20364a" font-size="23">${report().title}</text><text x="30" y="61" fill="#657586" font-size="14">民國 ${$('start').value}–${$('end').value} 年 · 示意資料</text><text x="${W-30}" y="61" text-anchor="end" fill="#657586" font-size="14">單位：${chartUnit()}</text>${selectedSeries.map((s,i)=>{const x=W-30-(selectedSeries.length-i)*149;return `<rect x="${x}" y="79" width="10" height="10" rx="2" fill="${s.color}"/><text x="${x+17}" y="89" font-size="14" fill="#20364a">${s.name}</text>`}).join('')}<g transform="translate(0 108)">${source.innerHTML}</g><text x="30" y="${H+139}" fill="#657586" font-size="12">占比以該年全部${topic==='certificates'?'兩類證書數量':'教育程度'}為基準；篩選不改變分母。</text><text x="30" y="${H+161}" fill="#657586" font-size="12">介面提案：使用概略重建或模擬資料，非正式統計。</text></g></svg>`;
}
function csvRows(){const unit=report().unit;return [['年度（民國）',...selectedSeries.flatMap(s=>[s.name+'（'+unit+'）',s.name+'年度占比（%）']),'已選'+(topic==='education'?'人數':'數量')+'合計（'+unit+'）',topic==='education'?'年度全部學歷人數（占比分母）':'年度兩類總數（占比分母）','資料性質'],...displayRows.map(d=>[d.year,...selectedSeries.flatMap(s=>[d[s.key],share(d,s).toFixed(1)]),total(d),annualTotal(d,report()),'示意資料（非正式統計）'])]}
async function exportFile(kind){
 closePopovers();if(kind==='csv'){saveBlob(new Blob(['\ufeff'+csvRows().map(r=>r.join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'csv');toast('已下載目前查詢結果（含年度占比）。');return}
 if(kind==='print'){window.print();return}const svg=exportSVG();if(kind==='svg'){saveBlob(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),'svg');toast('已下載圖表（示意資料）。');return}
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
 img.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=img.width*2;canvas.height=img.height*2;const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.drawImage(img,0,0);canvas.toBlob(b=>{if(b){saveBlob(b,'png');toast('已下載高解析度圖表（示意資料）。')}else toast('圖片匯出失敗，請改用 SVG 格式。')},'image/png')}catch{toast('圖片匯出失敗，請改用 SVG 格式。')}finally{URL.revokeObjectURL(url)}};
 img.onerror=()=>{URL.revokeObjectURL(url);toast('圖片匯出失敗，請改用 SVG 格式。')};img.src=url;
}
document.querySelectorAll('[data-export]').forEach(b=>b.addEventListener('click',()=>exportFile(b.dataset.export)));
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,120)});
selectTopic('certificates',false);
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 try{Promise.resolve(document.modelContext.registerTool({name:'configure_exam_report',title:'設定考試統計報表',description:'切換統計主題與查詢條件，並回傳目前畫面的示意數值及以當年全部類別為分母的占比。',inputSchema:{type:'object',properties:{topic:{type:'string',enum:['certificates','education']},startYear:{type:'integer',minimum:91,maximum:114},endYear:{type:'integer',minimum:91,maximum:114},categories:{type:'array',items:{type:'string'},minItems:1,uniqueItems:true},chartType:{type:'string',enum:['stacked','percent','grouped','line']}},required:['startYear','endYear','categories','chartType'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
  const next=input?.topic??topic,r=REPORTS[next];
  if(!input||typeof input!=='object'||!r||Object.keys(input).some(k=>!['topic','startYear','endYear','categories','chartType'].includes(k))||!Number.isInteger(input.startYear)||!Number.isInteger(input.endYear)||input.startYear<r.data[0].year||input.endYear>r.data.at(-1).year||input.startYear>input.endYear||!Array.isArray(input.categories)||!input.categories.length||input.categories.some(c=>!r.series.some(s=>s.key===c))||new Set(input.categories).size!==input.categories.length||!(next==='education'?['percent','grouped','line']:['stacked','percent','grouped','line']).includes(input.chartType))throw Error('查詢條件無效');
  selectTopic(next);$('start').value=input.startYear;$('end').value=input.endYear;for(const s of r.series)$(s.key).checked=input.categories.includes(s.key);$('chart-type').value=input.chartType;setView('chart');
  return {topic,dataNature:'示意資料，非正式統計',shareBase:'當年全部類別',rows:displayRows.map(d=>({year:d.year,values:Object.fromEntries(selectedSeries.map(s=>[s.key,d[s.key]])),shares:Object.fromEntries(selectedSeries.map(s=>[s.key,+share(d,s).toFixed(1)]))}))};
 }},{signal:lifecycle.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
