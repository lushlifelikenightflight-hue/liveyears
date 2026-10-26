(() => {
  const dialog = document.getElementById('flyer-dialog');
  const image = document.getElementById('flyer-image');
  let items = [], index = 0, trigger = null, currentShow = null, returnFocus = true;
  function performerLabel(info) {
    return '出演'+(info?.scope==='festival'?'（フェス全体）':'')+(info?.artistStatus==='partial'?'（判読できた範囲）':'');
  }
  function paint() {
    const item = items[index];
    const available=!!item;
    document.querySelector('.flyer-bottom').hidden=!available;
    document.querySelector('.flyer-stage').hidden=!available;
    document.getElementById('flyer-empty-message').hidden=available;
    document.getElementById('flyer-zoom').hidden=!available;
    document.getElementById('flyer-prev').hidden=!available;
    document.getElementById('flyer-next').hidden=!available;
    document.getElementById('flyer-empty-message').textContent=currentShow?.unannounced?'未解禁のためフライヤーは表示しません。':hasNoFlyer(currentShow?.id)?'No Flyer':'フライヤーはまだ見つかっていません。';
    if(!available){image.removeAttribute('src');document.getElementById('flyer-count').textContent=currentShow?.unannounced?'未解禁':hasNoFlyer(currentShow?.id)?'No Flyer':'フライヤー未掲載';document.getElementById('flyer-caption').textContent='このライブのフライヤーはまだ掲載されていません。';document.getElementById('flyer-source').hidden=true;document.getElementById('flyer-origin').textContent='';return;}
    document.querySelector('.flyer-stage').classList.remove('is-zoomed');
    document.querySelector('.flyer-stage').scrollTop=0;
    document.querySelector('.flyer-stage').scrollLeft=0;
    document.getElementById('flyer-zoom').setAttribute('aria-pressed','false');
    document.getElementById('flyer-zoom').textContent = 'さらに拡大';
    image.src = item.image;
    image.alt = currentShow.date+' '+venueLabel(currentShow.venue)+' / '+currentShow.band;
    const info=typeof flyerDetailsByImage==='undefined'?null:flyerDetailsByImage[item.image];
    const details=info?.perRecord?.[currentShow.id]||info;
    document.getElementById('flyer-caption').textContent = details?.title||currentShow.event||'フライヤー';
    document.getElementById('flyer-performers').textContent = details?.acts?.length
      ? performerLabel(details)+'：'+details.acts.join('／')
      : details?.artistStatus==='not-listed'?'この画像には出演者の一覧記載なし。':'';
    document.getElementById('flyer-count').textContent = `${index + 1} / ${items.length}`;
    document.getElementById('flyer-prev').disabled = index === 0;
    document.getElementById('flyer-next').disabled = index === items.length - 1;
    const source = document.getElementById('flyer-source');
    source.textContent = 'フライヤーの出典 ↗';
    source.href = item.sourceUrl || '';
    source.hidden = !item.sourceUrl;
    document.getElementById('flyer-origin').textContent = item.sourceUrl ? '' : '手元のフライヤーから照合';
  }
  document.getElementById('list').addEventListener('click', event => {
    const button = event.target.closest('[data-flyer], [data-id]');
    if (!button) return;
    currentShow=shows.find(s=>s.id===(button.dataset.flyer||button.dataset.id));
    if(!currentShow)return;
    items = hasNoFlyer(currentShow.id)?[]:flyersFor(currentShow.id);
    const s=currentShow,info=infoFor(s);
    document.getElementById('show-title').textContent=venueLabel(s.venue);
    document.getElementById('show-date').textContent=dateLabel(s,true);
    document.getElementById('show-act').textContent=s.band;
    const fields=[['種別',getKinds(s).join('・')],['タイトル',s.event],[performerLabel(s.flyerInfo),s.flyerInfo?.acts?.join('／')],['演奏曲',s.repertoire],['メモ',s.note],['住所',info.address]];
    document.getElementById('show-fields').innerHTML=fields.filter(([,value])=>value).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('');
    const source=s.locationEvidence?.source||s.sourceUrl;
    document.getElementById('show-evidence').innerHTML=source?`<a href="${esc(source)}" target="_blank" rel="noopener noreferrer">記録の確認資料 ↗</a>`:'';
    document.getElementById('show-map').disabled=!hasPoint(s);
    if(!READ_ONLY)document.getElementById('show-delete').dataset.deleteRecord=s.id;
    trigger = button;
    returnFocus=true;
    index = 0;
    paint();
    dialog.showModal();
    dialog.scrollTop=0;
    document.body.classList.add('flyer-open');
  });
  document.getElementById('show-map').onclick=()=>{returnFocus=false;dialog.close();focusShowOnMap(currentShow);};
  if(!READ_ONLY)document.getElementById('show-edit').onclick=()=>{returnFocus=false;dialog.close();const button=[...document.querySelectorAll('[data-edit]')].find(b=>b.dataset.edit===currentShow.id);button?.click();};
  document.getElementById('flyer-zoom').onclick = event => {
    const zoomed = document.querySelector('.flyer-stage').classList.toggle('is-zoomed');
    event.currentTarget.setAttribute('aria-pressed',String(zoomed));
    event.currentTarget.textContent = zoomed ? '全体を表示' : 'さらに拡大';
  };
  document.getElementById('flyer-close').onclick = () => dialog.close();
  document.getElementById('flyer-prev').onclick = () => { if (index > 0) { index--; paint(); } };
  document.getElementById('flyer-next').onclick = () => { if (index < items.length - 1) { index++; paint(); } };
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); index--; paint(); }
    if (event.key === 'ArrowRight' && index < items.length - 1) { event.preventDefault(); index++; paint(); }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('flyer-open');
    image.removeAttribute('src');
    if(returnFocus)trigger?.focus();
  });
})();
