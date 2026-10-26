(() => {
  const key='live-atlas-theme';
  let theme='dark';
  try { theme=localStorage.getItem(key)==='light'?'light':'dark'; localStorage.setItem(key,theme); } catch {}
  function apply(value) {
    theme=value;document.documentElement.dataset.theme=theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
      button.textContent=theme==='dark'?'☀ ライト':'☾ ダーク';
      button.setAttribute('aria-label',theme==='dark'?'ライトテーマに切り替え':'ダークテーマに切り替え');
    });
  }
  apply(theme);
  document.addEventListener('DOMContentLoaded',()=>{
    apply(theme);
    document.addEventListener('click',event=>{
      if(!event.target.closest('[data-theme-toggle]'))return;
      apply(theme==='dark'?'light':'dark');
      try{localStorage.setItem(key,theme);}catch{}
    });
  });
  window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue==='light'?'light':'dark');});
})();
