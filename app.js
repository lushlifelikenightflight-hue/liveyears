const venues = archiveVenues;
const READ_ONLY=window.LIVEYEARS_PUBLIC===true;
const actAliases = {'しげなん':'OhNo BaNd','金田バンド':'天使たちと金田康平','omen session':'ジャズセッション','セッション':'ジャズセッション','セッション（名義未記載）':'ジャズセッション','かずしげソロ':'kazushige.','天使たち':'天使たちと金田康平','ソロ':'kazushige.','ソロ（名義未記載）':'kazushige.'};
const baseShows = archiveShows.map(show => {
  const update = recordUpdates[show.id] || {};
  const bands = [...new Set((update.bands||show.bands).map(name => actAliases[name] || name))];
  const correction = venueCorrections[show.id];
  return {...show,...update,bands,band:bands.join('＆'),...(correction?{venue:correction.venue,originalVenue:show.venue,locationEvidence:correction,note:[show.note?'元データ注記（会場照合前）：'+show.note:'',update.note||''].filter(Boolean).join(' / ')}:{})};
}).map(show=>({...show,researchNote:show.note||'',...(typeof recordDisplayDetails==='undefined'?{}:recordDisplayDetails[show.id]||{})}));
let userEdits=typeof initialUserEdits==='undefined'?{}:initialUserEdits.edits;
let editRevision=typeof initialUserEdits==='undefined'?0:initialUserEdits.revision;
function applyUserEdit(show) {
  const edit=userEdits[show.id];
  if(!edit)return {...show};
  const changedLocation=edit.venue!==show.venue||edit.date!==show.date;
  return {...show,...edit,band:edit.bands.join('＆'),kind:edit.kinds[0],userEdited:true,recordStatus:'ユーザー編集（元の記録は保持）',...(changedLocation?{locationEvidence:null,originalVenue:show.originalVenue||show.venue}:{})};
}
let recordState=typeof initialRecordState==='undefined'?{}:initialRecordState.edits;
let recordStateRevision=typeof initialRecordState==='undefined'?0:initialRecordState.revision;
const isUnannounced=id=>recordState[id]?.unannounced===true;
function applyRecordState(show){
  if(!isUnannounced(show.id))return show;
  return {...show,venue:recordState[show.id].area,unannounced:true,originalVenue:'',locationEvidence:null,event:'未解禁',note:'',researchNote:'',flyerInfo:null,sourceLine:'',sourceUrl:'',sourceLabel:'',repertoire:'',time:'',role:''};
}
function visibleShows(){return baseShows.filter(s=>!recordState[s.id]?.deleted).map(applyUserEdit).map(applyRecordState).sort((a,b)=>a.date.localeCompare(b.date));}
const shows=visibleShows();

const colors = {'茶封筒':'#527655','OhNo BaNd':'#b48044','タミフルズ':'#678fa8','PIB':'#a16a86','ダメバン':'#8270a4','よなよなJ.O':'#c48646','しげなん':'#4d9292','Oneside Marron Powder':'#a56950','がつぽんず':'#737ca9','金田バンド':'#927633','ダボクス':'#4c828c'};
Object.assign(colors,{'ラルクのコピバン':'#9077b2','リトルKing Gnuタクヤ':'#769253','SUNdals':'#aa8142','天使たちと金田康平':'#a76468','ジャズセッション':'#6e7c79','武蔵野オールスターズ':'#99795b','omen session':'#8d7090','onshitsu.':'#488d83'});
Object.assign(colors,{'etymon':'#887aab','かずしげ×トコ':'#ad8052','かずしげとモリカホ':'#838b50','モリカホ':'#a8778a','かよこ':'#5d8c85','The Accel Jazz Express':'#64839d','セッション（名義未記載）':'#7c8581'});
Object.assign(colors,{'Neon Boys Fan Club':'#9471a1','かずしげソロ':'#b47754','天使たち':'#6079a1'});
Object.assign(colors,{'ティンペッツ':'#a87552','モテギスミスバンド':'#658e9c','名義未記載':'#7d817a','ソロ（名義未記載）':'#8b789a'});
Object.assign(colors,{'The Accel Jazz Express Pocket':'#92729b'});
Object.assign(colors,{'ディズニーバンド':'#6683a4','ウルズズズ':'#cc7a30','ポルシェ':'#9077b2','らすてぃー＆まどろみ':'#387e8b'});
for (const oldName of Object.keys(actAliases)) delete colors[oldName];
Object.assign(colors,{'茶封筒':'#b9406b','OhNo BaNd':'#986011','天使たちと金田康平':'#6652ac','ジャズセッション':'#267767','kazushige.':'#276fa2'});
let availableYears = [...new Set(shows.map(s=>s.date.slice(0,4)))].sort();
let fullPeriod = availableYears[0] + '–' + availableYears.at(-1);
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hasPoint = show => !show.unannounced && Array.isArray(venues[show.venue]) && venues[show.venue].slice(0,2).every(Number.isFinite);
const getKinds = show => show.kinds || [show.kind || 'ライブ'];
const infoFor = show => {
  if(show.unannounced)return {status:'未解禁',address:'',note:'',source:'',coordinateSource:'',licenses:[],attributions:[]};
  const info=venueMeta[show.venue] || {status:'位置未特定',address:'',note:'会場未特定',source:'',coordinateSource:'未取得',licenses:[],attributions:[]};
  return show.locationEvidence?{...info,status:show.date==='2025-09-13'?'本人投稿で会場照合・広場代表位置':info.status,note:show.locationEvidence.note+(show.date==='2025-09-13'?'':' '+info.note)}:info;
};
const canonicalVenueName = name => String(name).replace(/渋谷(?:CLUB\s*)?CRAWL/gi,'渋谷CLUB CRAWL').replaceAll('下北沢ろく夜','下北沢ろくでもない夜').replace(/吉祥寺(?:ブラック[＆&]ブルー|black[＆&]blue)/gi,'吉祥寺BLACK&BLUE').replace(/渋谷(?:テイクオフ[７7]|TAKE\s*OFF\s*7)/gi,'渋谷TAKE OFF7').replace(/秋葉原(?:グッドマン|(?:CLUB\s*)?GOODMAN)/gi,'秋葉原CLUB GOODMAN').replace(/新宿(?:ロックカフェLOFT|ROCK\s*CAFE\s*LOFT)/gi,'新宿ROCK CAFE LOFT').replace(/新宿(?:マーブル|marble)/gi,'新宿Marble');
const searchText = value => canonicalVenueName(value ?? '').normalize('NFKC').toLowerCase().replace(/四ツ谷/g,'四谷').replace(/四谷outbreak!?/g,'四谷アウトブレイク').replace(/学芸大学maple\s*house/g,'学芸大学メイプルハウス');
const venueLabel = venue => canonicalVenueName(venueMeta[venue]?.displayName || venue);
function renderResearch() {
  if(READ_ONLY)return;
  const rows=locationResearch.findings,pending=rows.filter(r=>!r.resolved),resolved=rows.filter(r=>r.resolved);
  const cards=items=>items.map(r=>`<article class="research-item"><h3>${esc(canonicalVenueName(r.displayName||venueLabel(r.venue)))}</h3><span class="research-status">${esc(r.status)} · ${r.dates.length}記録</span><p>${esc(r.dates.join(' / '))}</p><p>${esc(r.finding)}</p>${r.address?`<p>住所：${esc(r.address)}</p>`:''}${r.source?`<a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">調査資料 ↗</a>`:''}</article>`).join('');
  $('research-summary').textContent=`位置の調査結果｜未特定 ${pending.length}項目・${pending.reduce((n,r)=>n+r.dates.length,0)}記録`;
  $('research-list').innerHTML=cards(pending);
  $('research-resolved-summary').textContent=`今回補完した ${resolved.length}項目・${resolved.reduce((n,r)=>n+r.dates.length,0)}記録`;
  $('research-resolved').innerHTML=cards(resolved);
}
let year = 'all', band = '', recordType = '', month = 0, query = '', venueQuery = '', selected = null, filtered = [];
let recordQuery='';
function matchesRecordContent(show,input){
  const text=searchText([show.date,show.date.replaceAll('-','.'),dateLabel(show),show.band,venueLabel(show.venue),show.event,show.note,show.flyerInfo?.acts?.join(' '),show.repertoire,getKinds(show).join(' ')].filter(Boolean).join(' '));
  return searchText(input).trim().split(/\s+/).filter(Boolean).every(word=>text.includes(word));
}
function renderYearOptions(){ $('year').innerHTML='<option value="all"'+(year==='all'?' selected':'')+'>すべて</option>'+[...availableYears].reverse().map(y=>'<option value="'+y+'"'+(year===y?' selected':'')+'>'+y+'</option>').join(''); }
renderYearOptions();
let flyerStatus=typeof initialFlyerStatus==='undefined'?{}:initialFlyerStatus.edits;
let flyerStatusRevision=typeof initialFlyerStatus==='undefined'?0:initialFlyerStatus.revision;
const hasNoFlyer=id=>flyerStatus[id]?.noFlyer===true;
const flyersFor=id=>isUnannounced(id)?[]:(typeof reviewedFlyerCatalog!=='undefined'?reviewedFlyerCatalog:typeof flyerCatalog!=='undefined'?flyerCatalog:{})[id]||[];
let map, layer;
const markers = {};
if (window.L) {
  map = L.map('map', {zoomControl:false,minZoom:0,maxZoom:19,bounceAtZoomLimits:false,zoomSnap:0.25,maxBounds:[[18,115],[49,157]],maxBoundsViscosity:1});
  L.control.zoom({position:'bottomright'}).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',maxZoom:19,noWrap:true}).addTo(map);
  layer = (L.markerClusterGroup ? L.markerClusterGroup({maxClusterRadius:48,showCoverageOnHover:false,spiderfyOnMaxZoom:true,spiderfyDistanceMultiplier:1.8,iconCreateFunction:cluster=>L.divIcon({className:'venue-cluster',html:`<span>${cluster.getChildCount()}</span><small>会場</small>`,iconSize:[54,54],iconAnchor:[27,27]})}) : L.layerGroup()).addTo(map);
} else {
  $('map').innerHTML = '<p class="empty">地図を読み込めませんでした。接続後に再読み込みしてください。一覧と検索は利用できます。</p>';
}
function LAYER_CLUSTER_NOTE() { return window.L?.markerClusterGroup ? '丸は会場数。拡大で分かれ、ピンは記録数。' : '会場ピンを表示中（まとめ表示を読み込めませんでした）。'; }
function inYear(show) { return year === 'all' || show.date.slice(0,4) === year; }
const japanBounds = [[21.5,119.3],[46,146.5]];
function updateJapanMinZoom() {
  if (!map) return;
  map.setMinZoom(0);
  map.setMinZoom(map.getBoundsZoom(japanBounds,false,[32,32]));
}
function japanView() { if(map) { updateJapanMinZoom(); map.fitBounds(japanBounds,{padding:[16,16]}); } }
if (map) map.on('resize',updateJapanMinZoom);
function fit() {
  const points = filtered.filter(hasPoint).map(s => venues[s.venue].slice(0,2));
  if (map && points.length) map.fitBounds(points,{padding:[70,70],maxZoom:14});
}
function dateLabel(show, full = false) {
  const date = show.date.replaceAll('-','.');
  return date + (show.endDate ? '–' + show.endDate.replaceAll('-','.') : '');
}
function showDetails(show) {
  const source=show.locationEvidence?.source||show.sourceUrl;
  return `<div class="popupshow">${esc(dateLabel(show,true))}　${esc(show.band)}<br>${esc(getKinds(show).join('・'))}${show.event?'<br>'+esc(show.event):''}${show.note?'<br>'+esc(show.note):''}${show.locationEvidence?`<br>会場照合：${esc(show.locationEvidence.note)}`:''}${source?`<br><a href="${esc(source)}" target="_blank" rel="noopener noreferrer">${esc(show.userEdited?'元記録の確認資料':show.locationEvidence?.sourceLabel||show.sourceLabel||'本人投稿で確認')} ↗</a>`:''}<br><span class="recordstatus">${esc(show.recordStatus)}</span></div>`;
}
function venueGroups(records){
  const grouped=new Map();
  for(const show of records){if(!grouped.has(show.venue))grouped.set(show.venue,[]);grouped.get(show.venue).push(show);}
  return [...grouped].map(([venue,records])=>({venue,records})).sort((a,b)=>b.records.length-a.records.length||venueLabel(a.venue).localeCompare(venueLabel(b.venue),'ja'));
}
function renderVenues(){
  const groups=venueGroups(filtered);
  $('venues-tab-count').textContent=groups.length;
  $('records-tab-count').textContent=filtered.length;
  $('venue-list-summary').textContent=`${groups.length}会場 · ${filtered.length}記録。表示中の年・絞り込みに連動しています。`;
  $('venues-list').innerHTML=groups.length?groups.map(({venue,records})=>{
    const show=records[0],placed=hasPoint(show),info=infoFor(show),dates=records.map(s=>s.date).sort(),lastDate=records.map(s=>s.endDate||s.date).sort().at(-1),bands=[...new Set(records.flatMap(s=>s.bands))];
    return `<button class="venue-row" data-venue-id="${esc(show.id)}" ${placed?'':'disabled'} aria-label="${esc(venueLabel(venue)+(placed?'を地図で表示':'：位置未特定'))}"><span class="venue-row-count">${records.length}<small>記録</small></span><span class="venue-row-info"><strong>${esc(venueLabel(venue))}</strong><span>${esc(info.address||venues[venue]?.[2]||'住所未特定')}</span><span>${esc(bands.join(' / '))}</span><small>${dates[0].replaceAll('-','.')} — ${lastDate.replaceAll('-','.')}</small></span><span class="venue-row-action">${placed?'地図で見る ↗':'位置未特定'}</span></button>`;
  }).join(''):'<p class="empty">条件に合う会場がありません。絞り込みを変更してください。</p>';
}
function render() {
  const annual = shows.filter(inYear);
  const scoped = annual.filter(s => !recordType || getKinds(s).includes(recordType));
  filtered = scoped.filter(s => matchesRecordContent(s,recordQuery) && (!venueQuery || [s.venue,venueLabel(s.venue)].some(v=>searchText(v).includes(venueQuery))) && (!band || s.bands.includes(band)) && (!month || +s.date.slice(5,7) === month) && (!query || [s.date,s.venue,venueLabel(s.venue),s.originalVenue,s.band,s.event,s.note,s.flyerInfo?.acts?.join(' '),s.sourceLine,venues[s.venue]?.[2],infoFor(s).address].some(v => searchText(v).includes(query))));
  $('venue-options').innerHTML=[...new Set(shows.map(s=>venueLabel(s.venue)))].sort((a,b)=>a.localeCompare(b,'ja')).map(v=>`<option value="${esc(v)}"></option>`).join('');
  const kinds = ['ライブ','セッション','出店','観覧','トーク','ラジオ','中止','延期','内容未確認'].filter(k=>annual.some(s=>getKinds(s).includes(k)));
  $('kind').innerHTML = '<option value="">すべての種別</option>' + kinds.map(k=>`<option value="${k}" ${recordType===k?'selected':''}>${k}</option>`).join('');
  const plotted = filtered.filter(hasPoint);
  const missing = filtered.length - plotted.length;
  $('total').textContent = filtered.length;
  $('venues').textContent = new Set(plotted.map(s=>s.venue)).size;
  $('mapcount').textContent = `${plotted.length} RECORDS`;
  $('resultcount').textContent = `${filtered.length} 件`;
  $('period').textContent = annual.length ? `${annual[0].date.replaceAll('-','.')} — ${annual.at(-1).endDate || annual.at(-1).date}`.replaceAll('-','.') : '';
  $('archive-description').textContent = '2017–2026年の活動アーカイブ。茶封筒でバンド活動を始めてちょうど10年が経つのでついでにこの10年でライブをした情報をすべてまとめた。まめなのでまいとしメモ帳にすべての予定を書き込んでおり平気で10年分のライブ予定がぜんぶ書かれていたのでたすかった。ありがて～。らーめんの記録も全部残ってるからやろうかな。';
  $('mapnote').textContent = `${LAYER_CLUSTER_NOTE()}${missing ? READ_ONLY?` 地図に表示しない記録 ${missing}件。`:` 位置未特定 ${missing}件は下の調査一覧へ。` : ''}`;
  $('position-summary').textContent = `地図上 ${plotted.length}件 / ${READ_ONLY?'地図に表示しない記録':'位置未特定'} ${missing}件。候補・参考位置を含みます。`;
  $('footer-period').textContent = year==='all'?fullPeriod:year;
  document.title = `LIVEYEARS | ${year==='all'?fullPeriod:year}`;
  for(const show of shows)for(const name of show.bands)if(!colors[name])colors[name]='#a16a86';
  const bands = Object.keys(colors).filter(b=>scoped.some(s=>s.bands.includes(b)));
  $('bands').innerHTML = [['','すべての名義・対象'],...bands.map(b=>[b,b])].map(([b,label])=>`<button class="band ${band===b?'active':''}" data-band="${esc(b)}" aria-pressed="${band===b}"><span class="dot" style="background:${colors[b]||'#23342d'}"></span>${esc(label)}<em>${b?scoped.filter(s=>s.bands.includes(b)).length:scoped.length}</em></button>`).join('');
  $('months').innerHTML = Array.from({length:12},(_,i)=>`<button data-month="${i+1}" class="${month===i+1?'active':''}" aria-pressed="${month===i+1}">${String(i+1).padStart(2,'0')}</button>`).join('');
  $('list').innerHTML = filtered.length ? filtered.map(s=>{
    const info = infoFor(s), placed = hasPoint(s);
    const flyers = flyersFor(s.id);
    const thumb = hasNoFlyer(s.id) ? '<span class="no-flyer-label">No Flyer</span>' : flyers.length ? `<button class="flyer-thumb" data-flyer="${esc(s.id)}" aria-label="${esc(s.date+' '+s.band+'のフライヤーを拡大')}" aria-haspopup="dialog"><img src="${esc(flyers[0].thumb)}" alt="${esc(s.date+' '+venueLabel(s.venue)+' / '+s.band+' フライヤー')}" loading="lazy" decoding="async" width="56" height="72"><span>${flyers.length>1?flyers.length+'枚':'拡大'}</span></button>` : '<span class="flyer-empty" aria-hidden="true"></span>';
    return `<div class="live-row"><div class="flyer-cell">${thumb}${READ_ONLY?'':`<button class="no-flyer-toggle" data-no-flyer="${esc(s.id)}" aria-pressed="${hasNoFlyer(s.id)}" aria-label="${esc(s.date+' '+s.band+(hasNoFlyer(s.id)?'のNo Flyerを取り消す':'をNo Flyerにする'))}">${hasNoFlyer(s.id)?'取り消す':'No Flyer'}</button>`}</div><button class="live ${selected===s.id?'selected':''}" data-id="${s.id}" aria-haspopup="dialog"><span class="date ${s.endDate?'rangedate':''}">${esc(dateLabel(s))}<small>${['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date(s.date+'T12:00:00').getDay()]}</small></span><span class="bandbadge"><i class="dot" style="background:${s.bands.length>1?'#23342d':colors[s.bands[0]]}"></i>${esc(s.band)}</span><span class="venuename">${esc(venueLabel(s.venue))}<span class="event"><span class="kind-tag">${esc(getKinds(s).join('・'))}</span> ${esc(s.event||venues[s.venue]?.[2]||'会場・位置未特定')}${s.flyerInfo?.acts?.length?' · 出演'+(s.flyerInfo.scope==='festival'?'（フェス全体）':'')+(s.flyerInfo.artistStatus==='partial'?'（一部）':'')+'：'+esc(s.flyerInfo.acts.join('／')):''}${s.note?' · '+esc(s.note):''}</span>${s.unannounced?'<span class="location-warning">未解禁</span>':!placed?'<span class="location-warning">位置未特定 · 地図表示なし</span>':''}</span><span class="arrow">${placed?'↗':'＋'}</span></button>${READ_ONLY?'':`<div class="record-actions"><button class="edit-show" data-edit="${esc(s.id)}" aria-label="${esc(s.date+' '+s.band+'の詳細を編集')}">編集${s.userEdited?' ✓':''}</button><button class="edit-show release-toggle" data-unannounced="${esc(s.id)}" aria-pressed="${!!s.unannounced}" aria-label="${esc(s.date+' '+s.band+(s.unannounced?'の未解禁を解除':'を未解禁にする'))}">${s.unannounced?'解禁する':'未解禁'}</button><button class="edit-show delete-record" data-delete-record="${esc(s.id)}" aria-label="${esc(s.date+' '+s.band+'の記録を削除')}">削除</button></div>`}</div>`;
  }).join('') : '<p class="empty">条件に合う記録がありません。絞り込みを変更してください。</p>';
  renderVenues();
  if (!layer) return;
  map.closePopup(); layer.clearLayers();
  for (const k of Object.keys(markers)) delete markers[k];
  for (const venue of new Set(plotted.map(s=>s.venue))) {
    const group = plotted.filter(s=>s.venue===venue), info = infoFor(group[0]);
    const groupBands = new Set(group.flatMap(s=>s.bands));
    const color = groupBands.size===1 ? colors[group[0].bands[0]] : '#23342d';
    const uncertain = !['施設候補照合済み','旧店舗候補'].includes(info.status);
    const html = `<div class="popupname">${esc(venueLabel(venue))}</div><div class="popupnote">${esc(info.address||venues[venue][2])}<br><strong>${esc(info.status)}</strong><br>${esc(info.note)}<br>座標：${esc(info.coordinateSource)} · 2026-10-26<br>${info.source?`<a href="${esc(info.source)}" target="_blank" rel="noopener noreferrer">${esc(info.sourceLabel||'参照資料')}</a> · `:''}<a href="sources.html">出典・確認状況</a></div>${group.map(showDetails).join('')}`;
    markers[venue] = L.marker(venues[venue].slice(0,2),{title:venueLabel(venue)+'：'+info.status,alt:venueLabel(venue)+'：'+info.status,icon:L.divIcon({className:'map-pin',html:`<div class="pin ${uncertain?'unverified':''}" style="--pin-color:${color}"><span>${group.length}</span></div>`,iconSize:[36,42],iconAnchor:[18,42],popupAnchor:[0,-38]})}).addTo(layer).bindPopup(html,{maxHeight:280});
  }
}
$('year').addEventListener('change',e=>{year=e.target.value;band='';recordType='';month=0;query='';selected=null;$('search').value='';render();japanView()});
$('kind').addEventListener('change',e=>{recordType=e.target.value;band='';selected=null;render();fit()});
$('bands').addEventListener('click',e=>{const b=e.target.closest('[data-band]');if(b){band=b.dataset.band;render();fit()}});
$('months').addEventListener('click',e=>{const b=e.target.closest('[data-month]');if(b){month=month===+b.dataset.month?0:+b.dataset.month;render();fit()}});
$('search').addEventListener('input',e=>{query=searchText(e.target.value.trim());render()});
$('record-search')?.addEventListener('input',e=>{recordQuery=e.target.value;render()});
$('record-search-clear')?.addEventListener('click',()=>{recordQuery='';$('record-search').value='';render();$('record-search').focus()});
$('reset').onclick=()=>{recordQuery='';if($('record-search'))$('record-search').value='';band='';recordType='';month=0;query='';venueQuery='';selected=null;$('search').value='';$('venue-search').value='';render();fit()};
$('venue-search').addEventListener('input',e=>{venueQuery=searchText(e.target.value.trim());selected=null;render();fit()});
$('venue-all-years').onclick=()=>{year='all';$('year').value='all';band='';recordType='';month=0;query='';$('search').value='';render();fit()};
$('fit').onclick=fit;
$('japan').onclick=japanView;
function focusShowOnMap(s){if(map&&hasPoint(s)){const marker=markers[s.venue];if(!marker)return;if(layer.zoomToShowLayer)layer.zoomToShowLayer(marker,()=>marker.openPopup());else{map.setView(venues[s.venue].slice(0,2),15);marker.openPopup();}$('map').scrollIntoView({behavior:'smooth',block:'center'})}}
function selectArchiveTab(name){
  for(const tab of ['records','venues']){const active=tab===name;$(tab+'-tab').setAttribute('aria-selected',String(active));$(tab+'-tab').tabIndex=active?0:-1;$(tab+'-panel').hidden=!active;}
}
for(const name of ['records','venues']){
  $(name+'-tab').onclick=()=>selectArchiveTab(name);
  $(name+'-tab').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?'records':event.key==='End'?'venues':name==='records'?'venues':'records';selectArchiveTab(next);$(next+'-tab').focus();});
}
$('venues-list').addEventListener('click',event=>{const row=event.target.closest('[data-venue-id]');if(!row||row.disabled)return;const show=shows.find(s=>s.id===row.dataset.venueId);if(show)focusShowOnMap(show);});
function csvText() {
  const rows = [['日付','終了日','会場','名義・対象','公演','備考','記録の状態','緯度','経度','位置の状態','住所','位置の備考','座標出典','参照URL','licenses','attributions','取得・照合日','原文','記録種別（複数可）','参加役割','原文の絵文字','演奏曲（原文）','元の会場表記','会場・出演の確認URL'],...filtered.map(s=>{
    const m=infoFor(s),point=hasPoint(s)?venues[s.venue].slice(0,2):['',''];
    return [s.date,s.endDate,venueLabel(s.venue),s.band,s.event,s.note,s.recordStatus,...point,m.status,m.address,m.note,m.coordinateSource,m.source,m.licenses.join(' / '),m.attributions.join(' / '),'2026-10-26',s.sourceLine||'',getKinds(s).join(' / '),s.role||'',s.instrumentMark||'',s.repertoire||'',s.originalVenue||s.venue,s.locationEvidence?.source||s.sourceUrl||''];
  })];
  return '\ufeff'+rows.map(r=>r.map(c=>'"'+String(c).replaceAll('"','""')+'"').join(',')).join('\r\n');
}
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([csvText()],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`ライブ履歴${year==='all'?fullPeriod:year}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
renderResearch();render();japanView();

function refreshEditedShows(id) {
  shows.splice(0,shows.length,...visibleShows());
  availableYears=[...new Set(shows.map(s=>s.date.slice(0,4)))].sort();
  fullPeriod=availableYears[0]+'–'+availableYears.at(-1);
  const show=shows.find(s=>s.id===id);if(show)year=show.date.slice(0,4);band='';recordType='';month=0;query='';venueQuery='';selected=show?id:null;$('search').value='';$('venue-search').value='';
  renderYearOptions();
  render();japanView();
}
