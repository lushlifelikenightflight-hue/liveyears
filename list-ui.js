(() => {
  const controls=[...document.querySelectorAll('[data-list-size]')];
  function setSize(size){if(!['small','medium','large'].includes(size))size='small';document.documentElement.dataset.listSize=size;controls.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.listSize===size)));try{localStorage.setItem('live-atlas-list-size',size)}catch{}}
  let saved='small';try{saved=localStorage.getItem('live-atlas-list-size')||saved}catch{}setSize(saved);
  controls.forEach(b=>b.onclick=()=>setSize(b.dataset.listSize));
})();
