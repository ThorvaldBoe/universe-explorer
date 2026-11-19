(() => {
  const currentScript = document.currentScript;
  const siteBase = new URL('./', currentScript.src);
  const path = window.location.pathname;
  const currentVersion = path.includes('/versions/v1/') ? 'v1' : path.includes('/versions/v2/') ? 'v2' : 'v3';
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const picker = document.createElement('label');
  picker.className = 'experience-version-picker';
  picker.innerHTML = '<span aria-hidden="true">EXPERIENCE</span><select aria-label="Select experience version"><option value="v1">V1 · Four scenes</option><option value="v2">V2 · Full journey</option><option value="v3">V3 · Cesium city journey</option></select>';
  const select = picker.querySelector('select');
  select.value = currentVersion;
  select.addEventListener('change', () => {
    const target = select.value === 'v3' ? './' : `versions/${select.value}/`;
    window.location.assign(new URL(target, siteBase));
  });
  (topbar.querySelector('.topbar-actions') || topbar).append(picker);

  const style = document.createElement('style');
  style.textContent = `
    .experience-version-picker { display:inline-flex; align-items:center; gap:.55rem; color:#7e8ba7; font:700 .56rem/1 ui-sans-serif,system-ui,sans-serif; letter-spacing:.13em; white-space:nowrap }
    .experience-version-picker select { max-width:12rem; min-height:40px; padding:.45rem 1.8rem .45rem .7rem; border:1px solid #65dfff55; border-radius:8px; color:#d6edff; background:#091322; font:600 .72rem ui-sans-serif,system-ui,sans-serif; letter-spacing:.01em; cursor:pointer }
    .experience-version-picker select:focus-visible { outline:2px solid #b7d0ff; outline-offset:3px }
    @media(max-width:900px) { .experience-version-picker { gap:.35rem; font-size:.48rem } .experience-version-picker select { max-width:8rem; min-height:38px; font-size:.65rem } }
    @media(max-width:500px) { .topbar { gap:.4rem } .topbar-note { display:none } .topbar-actions { gap:.4rem } .wordmark { flex:none; font-size:0; letter-spacing:0 } .wordmark .mark { margin-right:0 } .experience-version-picker { gap:0 } .experience-version-picker>span { display:none } .experience-version-picker select { max-width:6.2rem; min-height:36px; padding:.35rem .4rem; font-size:.58rem } .text-toggle-label { display:none } .deep-zoom-link { font-size:0 } .deep-zoom-link::before { content:'LAB'; font-size:.52rem } }
  `;
  document.head.append(style);
})();
