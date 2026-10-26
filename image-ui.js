(() => {
  function failed(image){
    if(!(image instanceof HTMLImageElement)||!image.closest('.flyer-thumb,.flyer-stage'))return;
    const src=image.getAttribute('src');if(!src)return;
    if(image.dataset.retrySource!==src.split('?')[0]){
      image.dataset.retrySource=src.split('?')[0];
      image.src=src.split('?')[0]+'?retry='+Date.now();return;
    }
    image.classList.add('image-unavailable');
    const container=image.closest('.flyer-thumb,.flyer-stage');
    if(!container.querySelector('.image-error-message')){const message=document.createElement('span');message.className='image-error-message';message.textContent='画像を読み込めませんでした';container.append(message);}
  }
  document.addEventListener('error',event=>failed(event.target),true);
  document.addEventListener('load',event=>{
    const image=event.target;if(!(image instanceof HTMLImageElement))return;
    image.classList.remove('image-unavailable');image.closest('.flyer-thumb,.flyer-stage')?.querySelector('.image-error-message')?.remove();
  },true);
  document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.flyer-thumb img').forEach(image=>{if(image.complete&&!image.naturalWidth)failed(image);});});
})();
