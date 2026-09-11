/* Demonstration values estimated from the supplied screenshot, not official statistics. */
const DATA = [
 [91,20200,23400],[92,12500,29300],[93,15400,26800],[94,18200,38800],
 [95,13900,36100],[96,15300,39800],[97,16600,35500],[98,20300,44300],
 [99,17400,47000],[100,16500,45400],[101,16900,63100],[102,18000,31000],
 [103,18400,32400],[104,17300,35000],[105,18800,32700],[106,20100,38600],
 [107,19800,41000],[108,20000,35100],[109,19700,31600],[110,13500,28600],
 [111,16300,27300],[112,14800,29000],[113,17100,23400],[114,17400,24600]
].map(([year,civil,professional])=>({year,civil,professional}));
const SERIES=[{key:'civil',name:'公務人員',color:'#175f91'},{key:'professional',name:'專技人員',color:'#36a4a1'}];
const $=id=>document.getElementById(id), fmt=n=>n.toLocaleString('en-US');
let view='chart', timer, displayRows=[], selectedSeries=[];
for(const id of ['start','end']) $(id).innerHTML=DATA.map(d=>`<option value="${d.year}">${d.year} 年</option>`).join('');
$('start').value=91; $('end').value=114;
function selection(){return SERIES.filter(s=>$(s.key).checked)}
function rows(){return DATA.filter(d=>d.year>=+$('start').value&&d.year<=+$('end').value)}
function total(d){return selectedSeries.reduce((a,s)=>a+d[s.key],0)}
function toast(message){$('status').textContent=message;$('status').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('status').hidden=true,3300)}
function render(){
 displayRows=rows();selectedSeries=selection();const empty=!displayRows.length||!selectedSeries.length;
 $('empty-state').hidden=!empty;$('chart-panel').hidden=empty||view!=='chart';$('table-panel').hidden=empty||view!=='table';
 $('result-title').textContent=view==='chart'?'歷年證書製發趨勢':'歷年證書製發明細';
 $('result-description').textContent=`民國 ${$('start').value}–${$('end').value} 年 · ${displayRows.length} 個年度 · ${selectedSeries.length===2?'全部人員類別':selectedSeries[0]?.name||'未選擇人員類別'}`;
 $('download').disabled=empty;document.querySelector('.chart-controls').hidden=view==='table';
 $('legend').innerHTML=selectedSeries.map(s=>`<span><i class="swatch" style="background:${s.color}"></i>${s.name}</span>`).join('');
 $('tooltip').hidden=true;
 if(empty)return;
 renderChart();renderTable();
}
function renderChart(){
 const narrow=window.innerWidth<700, W=narrow?610:1160,H=narrow?380:370;
 const left=narrow?66:76,right=18,top=28,bottom=43, pw=W-left-right, ph=H-top-bottom;
 const type=$('chart-type').value, labels=$('labels').checked;
 const max=Math.max(...displayRows.map(d=>type==='stacked'?total(d):Math.max(...selectedSeries.map(s=>d[s.key]))));
 const step=Math.max(1000,Math.ceil(max/4/5000)*5000), ceiling=step*4;
 const y=n=>top+ph-(n/ceiling)*ph, band=pw/displayRows.length, x=i=>left+band*(i+.5);
 let svg='<title id="chart-title">國家考試證書製發數量：示意資料</title><desc id="chart-desc">依年度及人員類別顯示概略重建數值，可切換資料表查看完整數值。使用 Tab 鍵可逐年查看資料。</desc>';
 for(let j=0;j<=4;j++){
  const v=step*j,yy=y(v);
  if($('grid').checked||j===0)svg+=`<line x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}" stroke="${j===0?'#cdd8e0':'#e9eef2'}" stroke-width="1"/>`;
  svg+=`<text x="${left-13}" y="${yy+5}" text-anchor="end" fill="#748390" font-size="${narrow?15:13}">${fmt(v)}</text>`;
 }
 const interval=Math.max(1,Math.ceil(displayRows.length/(narrow?7:14)));
 displayRows.forEach((d,i)=>{if(i%interval===0||i===displayRows.length-1) svg+=`<text x="${x(i)}" y="${H-15}" text-anchor="middle" font-size="${narrow?15:13}" fill="#748390">${d.year}</text>`});
 if(type==='line'){
  selectedSeries.forEach(s=>{
   const path=displayRows.map((d,i)=>`${i?'L':'M'}${x(i)},${y(d[s.key])}`).join(' ');
   svg+=`<path d="${path}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
   displayRows.forEach((d,i)=>{svg+=`<circle cx="${x(i)}" cy="${y(d[s.key])}" r="${displayRows.length===1?5:2.8}" fill="${s.color}" stroke="white" stroke-width="1.5"/>`;if(labels)svg+=`<text x="${x(i)}" y="${y(d[s.key])-11}" fill="${s.color}" font-size="12" text-anchor="middle"${displayRows.length>14?' transform="rotate(-45 '+x(i)+' '+(y(d[s.key])-11)+')"':''}>${fmt(d[s.key])}</text>`;});
  });
 } else {
  displayRows.forEach((d,i)=>{
   let running=0;const bw=Math.min(type==='stacked'?42:66,band*.66), sw=type==='grouped'?bw/selectedSeries.length:bw;
   selectedSeries.forEach((s,j)=>{
    const height=d[s.key]/ceiling*ph,xx=type==='grouped'?x(i)-bw/2+j*sw:x(i)-bw/2;
    const yy=type==='stacked'?y(running+d[s.key]):y(d[s.key]);
    svg+=`<rect x="${xx}" y="${yy}" width="${type==='grouped'?sw-2:sw}" height="${height}" fill="${s.color}" rx="1"/>`;
    if(type==='grouped'&&labels)svg+=`<text x="${xx+(sw-2)/2}" y="${yy-8}" fill="#445d70" font-size="12" text-anchor="middle" transform="rotate(-45 ${xx+(sw-2)/2} ${yy-8})">${fmt(d[s.key])}</text>`;
    running+=d[s.key];
   });
   if(type==='stacked'&&labels)svg+=`<text x="${x(i)}" y="${y(total(d))-9}" fill="#445d70" font-size="12" text-anchor="middle"${displayRows.length>14?' transform="rotate(-45 '+x(i)+' '+(y(total(d))-9)+')"':''}>${fmt(total(d))}</text>`;
  });
 }
 displayRows.forEach((d,i)=>{svg+=`<rect class="hit-area" data-index="${i}" tabindex="0" role="img" aria-label="民國${d.year}年，${selectedSeries.map(s=>s.name+fmt(d[s.key])+'張').join('，')}，合計${fmt(total(d))}張；示意資料" x="${left+band*i}" y="${top}" width="${band}" height="${ph}" fill="transparent"/>`});
 $('chart').setAttribute('viewBox',`0 0 ${W} ${H}`);$('chart').innerHTML=svg;
 $('chart').querySelectorAll('.hit-area').forEach(el=>{
  el.addEventListener('pointerenter',()=>showTooltip(el));el.addEventListener('focus',()=>showTooltip(el));
  el.addEventListener('pointerleave',()=>{$('tooltip').hidden=true;el.setAttribute('fill','transparent')});
  el.addEventListener('blur',()=>{$('tooltip').hidden=true;el.setAttribute('fill','transparent')});
 });
}
function showTooltip(el){
 const d=displayRows[+el.dataset.index],tip=$('tooltip'),frame=$('chart-frame').getBoundingClientRect(),box=el.getBoundingClientRect();
 el.setAttribute('fill','#20364a08');
 tip.innerHTML=`<strong>民國 ${d.year} 年 <small style="color:#748390;font-weight:400">／示意</small></strong>`+selectedSeries.map(s=>`<div class="tooltip-row"><i class="swatch" style="background:${s.color}"></i>${s.name}<b>${fmt(d[s.key])}</b></div>`).join('')+`<div class="tooltip-row">合計<b>${fmt(total(d))} 張</b></div>`;
 tip.hidden=false;const tw=tip.offsetWidth;
 tip.style.left=Math.max(4,Math.min(frame.width-tw-4,box.x-frame.x+box.width/2+10))+'px';tip.style.top='18px';
}
function renderTable(){
 $('table-head').innerHTML='<tr><th scope="col">年度（民國）</th>'+selectedSeries.map(s=>`<th scope="col">${s.name}</th>`).join('')+'<th scope="col">合計</th></tr>';
 $('table-body').innerHTML=displayRows.map(d=>`<tr><td>${d.year} 年</td>${selectedSeries.map(s=>`<td>${fmt(d[s.key])}</td>`).join('')}<td>${fmt(total(d))}</td></tr>`).join('');
 $('table-count').textContent=`共 ${displayRows.length} 筆年度資料 · 單位：張 · 示意資料`;
}
function setView(next){view=next;for(const v of ['chart','table']){const active=v===view,b=$(v+'-tab');b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1}closePopovers();render()}
for(const v of ['chart','table']){$(v+'-tab').addEventListener('click',()=>setView(v));$(v+'-tab').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?'chart':e.key==='End'?'table':view==='chart'?'table':'chart';setView(n);$(n+'-tab').focus()}})}
for(const id of ['start','end','civil','professional','chart-type','labels','grid'])$(id).addEventListener('change',()=>{
 if(+$('start').value>+$('end').value){if(id==='start')$('end').value=$('start').value;else $('start').value=$('end').value;toast('已同步調整年度，讓起訖期間保持有效。')}
 render();
});
$('reset').addEventListener('click',()=>{$('start').value=91;$('end').value=114;$('civil').checked=true;$('professional').checked=true;render();toast('已重設為全部年度與人員類別。')});
function closePopovers(){for(const [button,panel] of [['download','download-menu'],['settings','settings-panel']]){$(panel).hidden=true;$(button).setAttribute('aria-expanded','false')}}
for(const [button,panel] of [['download','download-menu'],['settings','settings-panel']])$(button).addEventListener('click',()=>{const open=$(panel).hidden;closePopovers();$(panel).hidden=!open;$(button).setAttribute('aria-expanded',String(open));if(open)$(panel).querySelector('button,input')?.focus()});
document.addEventListener('click',e=>{if(!e.target.closest('.download-wrap,.settings-wrap'))closePopovers()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const b=!$('download-menu').hidden?'download':!$('settings-panel').hidden?'settings':null;closePopovers();$('tooltip').hidden=true;if(b)$(b).focus()}});
function saveBlob(blob,extension){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`國家考試證書製發數量_${$('start').value}-${$('end').value}年_示意資料.${extension}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportSVG(){
 const source=$('chart').cloneNode(true);source.querySelectorAll('.hit-area').forEach(n=>n.remove());
 const vb=$('chart').viewBox.baseVal,W=vb.width,H=vb.height;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H+150}" viewBox="0 0 ${W} ${H+150}"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif"><text x="30" y="34" fill="#20364a" font-size="23">國家考試證書製發數量</text><text x="30" y="61" fill="#657586" font-size="14">民國 ${$('start').value}–${$('end').value} 年 · 單位：張 · 示意資料</text>${selectedSeries.map((s,i)=>`<rect x="${30+i*155}" y="77" width="10" height="10" rx="2" fill="${s.color}"/><text x="${47+i*155}" y="87" font-size="14" fill="#20364a">${s.name}</text>`).join('')}<g transform="translate(0 100)">${source.innerHTML}</g><text x="30" y="${H+132}" fill="#657586" font-size="12">介面提案：數值依原始截圖概略重建，非正式統計。</text></g></svg>`;
}
async function exportFile(kind){
 closePopovers();
 if(kind==='csv'){const lines=[['年度（民國）',...selectedSeries.map(s=>s.name),'合計','單位','資料性質'],...displayRows.map(d=>[d.year,...selectedSeries.map(s=>d[s.key]),total(d),'張','示意資料（非正式統計）'])];saveBlob(new Blob(['\ufeff'+lines.map(r=>r.join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'csv');toast('已下載目前查詢結果（示意資料）。');return}
 if(kind==='print'){window.print();return}
 const svg=exportSVG();if(kind==='svg'){saveBlob(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),'svg');toast('已下載圖表（示意資料）。');return}
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
 img.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=img.width*2;canvas.height=img.height*2;const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.drawImage(img,0,0);canvas.toBlob(b=>{if(b){saveBlob(b,'png');toast('已下載高解析度圖表（示意資料）。')}else toast('圖片匯出失敗，請改用 SVG 格式。')},'image/png')}catch{toast('圖片匯出失敗，請改用 SVG 格式。')}finally{URL.revokeObjectURL(url)}};
 img.onerror=()=>{URL.revokeObjectURL(url);toast('圖片匯出失敗，請改用 SVG 格式。')};img.src=url;
}
document.querySelectorAll('[data-export]').forEach(b=>b.addEventListener('click',()=>exportFile(b.dataset.export)));
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,120)});
render();
// Optional structured access shares exactly the same state as the visible controls.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 try{Promise.resolve(document.modelContext.registerTool({
  name:'configure_exam_report',title:'設定考試統計報表',
  description:'設定示意報表的年度、人員類別與圖表類型，並回傳目前畫面的示意資料。',
  inputSchema:{type:'object',properties:{startYear:{type:'integer',minimum:91,maximum:114},endYear:{type:'integer',minimum:91,maximum:114},categories:{type:'array',items:{type:'string',enum:['civil','professional']},minItems:1,uniqueItems:true},chartType:{type:'string',enum:['stacked','grouped','line']}},required:['startYear','endYear','categories','chartType'],additionalProperties:false},
  annotations:{readOnlyHint:false,untrustedContentHint:false},
  execute(input){
   if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['startYear','endYear','categories','chartType'].includes(k))||!Number.isInteger(input.startYear)||!Number.isInteger(input.endYear)||input.startYear<91||input.endYear>114||input.startYear>input.endYear||!Array.isArray(input.categories)||input.categories.length<1||input.categories.some(c=>!['civil','professional'].includes(c))||new Set(input.categories).size!==input.categories.length||!['stacked','grouped','line'].includes(input.chartType))throw Error('查詢條件無效');
   $('start').value=input.startYear;$('end').value=input.endYear;for(const s of SERIES)$(s.key).checked=input.categories.includes(s.key);$('chart-type').value=input.chartType;setView('chart');
   return {dataNature:'示意資料，非正式統計',count:displayRows.length,rows:displayRows.map(d=>({year:d.year,...Object.fromEntries(selectedSeries.map(s=>[s.key,d[s.key]])),total:total(d)}))};
  }
 },{signal:lifecycle.signal})).catch(()=>{});}catch{}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
