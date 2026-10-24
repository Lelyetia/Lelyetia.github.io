const storageKey = 'site-cover';

function coverOptions(root) {
  return [...root.querySelectorAll('[data-cover-src]')].map(button => ({
    button, src: button.dataset.coverSrc, title: button.dataset.coverTitle
  }));
}

export function applySavedCover(root = document) {
  const gallery = root.querySelector('[data-cover-gallery]');
  const cover = root.querySelector('.hero-cover');
  if (!gallery || !cover) return;
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch {}
  const selected = coverOptions(root).find(option => option.src === saved);
  cover.setAttribute('src', selected?.src ?? gallery.dataset.defaultCover);
}

export function initCoverGallery({ signal }) {
  const gallery = document.querySelector('[data-cover-gallery]');
  const toggle = document.querySelector('[data-cover-toggle]');
  const cover = document.querySelector('.hero-cover');
  if (!gallery || !toggle || !cover) return;
  const options = coverOptions(document);
  const preview = gallery.querySelector('[data-cover-preview]');
  const previewTitle = gallery.querySelector('[data-cover-preview-title]');
  const apply = gallery.querySelector('[data-cover-apply]');
  const reset = gallery.querySelector('[data-cover-reset]');
  const status = gallery.querySelector('[data-cover-status]');
  const defaultCover = gallery.dataset.defaultCover;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listen = (el, event, handler) => el.addEventListener(event, handler, { signal });
  let selected;
  let applying = false;
  let transition;
  let snapshot;

  function select(src) {
    selected = options.find(option => option.src === src) ?? options[0];
    preview.src = selected.src;
    preview.alt = `${selected.title}，封面预览`;
    previewTitle.textContent = selected.title;
    options.forEach(option => option.button.setAttribute('aria-pressed', String(option === selected)));
    status.textContent = '';
  }
  function finishTransition() {
    transition?.cancel();
    snapshot?.remove();
    transition = undefined;
    snapshot = undefined;
  }
  async function useCover(src, restoreDefault = false) {
    if (applying) return;
    applying = true;
    apply.disabled = reset.disabled = true;
    options.forEach(option => { option.button.disabled = true; });
    gallery.setAttribute('aria-busy', 'true');
    status.textContent = '正在准备封面…';
    try {
      // Decode first so a slow image never replaces the current cover with a blank.
      const image = new Image();
      image.src = src;
      await image.decode();
      if (signal.aborted || !gallery.open) return;
      let saved = true;
      try {
        if (restoreDefault) localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, src);
      } catch { saved = false; }
      finishTransition();
      if (cover.getAttribute('src') !== src && !preference.matches && typeof cover.animate === 'function') {
        snapshot = cover.cloneNode(false);
        snapshot.classList.remove('cover-enter');
        snapshot.classList.add('cover-snapshot');
        snapshot.removeAttribute('fetchpriority');
        snapshot.removeAttribute('loading');
        cover.after(snapshot);
        cover.src = src;
        transition = snapshot.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });
        transition.finished.then(finishTransition, () => {});
      } else cover.src = src;
      if (saved) gallery.close();
      else status.textContent = '封面已应用。当前浏览器无法保存选择，仅本次浏览有效。';
    } catch {
      if (!signal.aborted && gallery.open) status.textContent = '这张封面暂时无法加载，请换一张再试。';
    } finally {
      applying = false;
      apply.disabled = reset.disabled = false;
      options.forEach(option => { option.button.disabled = false; });
      gallery.removeAttribute('aria-busy');
    }
  }
  listen(toggle, 'click', () => {
    select(cover.getAttribute('src'));
    if (!gallery.open) gallery.showModal();
  });
  options.forEach(option => listen(option.button, 'click', () => select(option.src)));
  listen(apply, 'click', () => useCover(selected.src));
  listen(reset, 'click', () => { if (!applying) { select(defaultCover); useCover(defaultCover, true); } });
  listen(gallery.querySelector('[data-cover-close]'), 'click', () => gallery.close());
  listen(gallery, 'click', event => { if (event.target === gallery) gallery.close(); });
  listen(gallery, 'close', () => toggle.focus({ preventScroll: true }));
  listen(preference, 'change', () => { if (preference.matches) finishTransition(); });
  listen(window, 'storage', event => {
    if (event.key === storageKey || event.key === null) {
      finishTransition();
      applySavedCover();
      if (gallery.open && !applying) select(cover.getAttribute('src'));
    }
  });
  signal.addEventListener('abort', finishTransition, { once: true });
}
