import { initScrollReveals } from './scroll-reveal.js';
import { getCountdownState } from '../utils/countdown.js';
import { applySavedCover, initCoverGallery } from './cover-gallery.js';

let controller;
let initializedBody;
let firstVisit = true;
let searchIndexPromise;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function storedTheme() {
  try { return localStorage.getItem('site-theme') || 'auto'; } catch { return 'auto'; }
}
function resolvedTheme() {
  const stored = storedTheme();
  return stored === 'light' || stored === 'dark' ? stored : systemTheme.matches ? 'dark' : 'light';
}

function setupPage() {
  if (initializedBody === document.body) return;
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;
  initializedBody = document.body;
  document.documentElement.dataset.theme = resolvedTheme();
  document.documentElement.dataset.navigation = 'complete';
  applySavedCover();
  initCoverGallery({ signal });
  const listen = (element, event, handler, options = {}) => element?.addEventListener(event, handler, { ...options, signal });
  const header = document.querySelector('[data-site-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const themeToggle = document.querySelector('[data-theme-menu-toggle]');
  const themePanel = document.querySelector('[data-theme-menu-panel]');
  const themeMenu = document.querySelector('[data-theme-menu]');
  const themeOptions = document.querySelectorAll('[data-theme-option]');
  if (header) header.dataset.scrollHidden = 'false';
  document.querySelectorAll('.site-nav a').forEach(link => {
    const url = new URL(link.href);
    const active = url.origin === location.origin && (url.pathname === '/' ? location.pathname === '/' : location.pathname.startsWith(url.pathname));
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  function closeTheme() {
    if (themePanel) themePanel.hidden = true;
    themeToggle?.setAttribute('aria-expanded', 'false');
  }
  function closeNav() {
    if (header) header.dataset.menuOpen = 'false';
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', '展开主导航');
  }
  function syncTheme() {
    document.documentElement.dataset.theme = resolvedTheme();
    themeOptions.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeOption === storedTheme())));
  }
  syncTheme();
  listen(themeToggle, 'click', () => {
    const open = themePanel?.hidden;
    closeNav();
    if (themePanel) themePanel.hidden = !open;
    themeToggle.setAttribute('aria-expanded', String(open));
  });
  themeOptions.forEach(option => listen(option, 'click', () => {
    try { localStorage.setItem('site-theme', option.dataset.themeOption); } catch {}
    // Apply the requested choice even when storage is unavailable.
    document.documentElement.dataset.theme = option.dataset.themeOption === 'auto' ? (systemTheme.matches ? 'dark' : 'light') : option.dataset.themeOption;
    themeOptions.forEach(button => button.setAttribute('aria-pressed', String(button === option)));
    closeTheme();
    themeToggle?.focus({ preventScroll: true });
  }));
  listen(systemTheme, 'change', () => { if (storedTheme() === 'auto') syncTheme(); });
  listen(navToggle, 'click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    closeTheme();
    header.dataset.menuOpen = String(open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? '收起主导航' : '展开主导航');
  });
  document.querySelectorAll('.site-nav a').forEach(link => listen(link, 'click', closeNav));
  listen(document, 'click', event => {
    if (!themeMenu?.contains(event.target)) closeTheme();
    if (!header?.contains(event.target)) closeNav();
  });
  listen(document, 'keydown', event => {
    if (event.key !== 'Escape') return;
    if (themeToggle?.getAttribute('aria-expanded') === 'true') themeToggle.focus({ preventScroll: true });
    if (navToggle?.getAttribute('aria-expanded') === 'true') navToggle.focus({ preventScroll: true });
    closeTheme(); closeNav();
  });

  initScrollReveals({ signal, entrance: firstVisit });
  const cover = document.querySelector('.hero-cover');
  if (firstVisit && !reducedMotion.matches) {
    cover?.classList.add('cover-enter');
    header?.classList.add('header-enter');
    listen(cover, 'animationend', () => cover.classList.remove('cover-enter'), { once: true });
    listen(header, 'animationend', () => header.classList.remove('header-enter'), { once: true });
    document.querySelector('.hero-copy')?.classList.add('hero-enter');
  }
  firstVisit = false;
  let previousY = window.scrollY;
  let scrollFrame;
  let bannerHeight = document.querySelector('.site-banner')?.offsetHeight ?? 400;
  const topButton = document.querySelector('[data-back-to-top]');
  const toc = document.querySelector('[data-article-toc]');
  const tocItems = [...(toc?.querySelectorAll('a') ?? [])].map(link => ({ link, heading: document.getElementById(decodeURIComponent(link.hash.slice(1))) }));
  function updateScroll() {
    scrollFrame = undefined;
    const y = window.scrollY;
    const delta = y - previousY;
    const threshold = bannerHeight - 100;
    const keyboardInHeader = header?.contains(document.activeElement) && document.activeElement?.matches(':focus-visible');
    if (header && header.dataset.menuOpen !== 'true' && !keyboardInHeader) {
      if (y < 100 || delta < -2) header.dataset.scrollHidden = 'false';
      else if (y > threshold && delta > 0) header.dataset.scrollHidden = 'true';
    }
    if (topButton) topButton.dataset.visible = String(y > Math.max(240, bannerHeight - 80));
    if (toc) {
      toc.dataset.visible = String(y > bannerHeight - 120);
      let current = tocItems[0];
      for (const item of tocItems) if (item.heading && item.heading.getBoundingClientRect().top <= 160) current = item;
      if (y + window.innerHeight >= document.documentElement.scrollHeight - 3) current = tocItems.at(-1);
      for (const item of tocItems) {
        if (item === current) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      }
    }
    const banner = document.querySelector('.site-banner');
    if (banner) {
      const motion = !reducedMotion.matches;
      banner.style.setProperty('--cover-shift', `${motion ? Math.min(y * 0.1, 40) : 0}px`);
      banner.style.setProperty('--copy-shift', `${motion ? Math.min(y * 0.08, 30) : 0}px`);
      banner.style.setProperty('--copy-opacity', String(motion ? Math.max(0, 1 - y / (bannerHeight * 0.72)) : 1));
    }
    previousY = y;
  }
  const queueScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
  listen(window, 'scroll', queueScroll, { passive: true });
  listen(window, 'resize', () => { bannerHeight = document.querySelector('.site-banner')?.offsetHeight ?? 400; queueScroll(); }, { passive: true });
  listen(reducedMotion, 'change', queueScroll);
  updateScroll();

  const updateCountdowns = () => {
    const now = Date.now();
    document.querySelectorAll('[data-countdown]').forEach(card => {
      const output = card.querySelector('[data-countdown-days]');
      if (!output) return;
      const state = getCountdownState({ startsAt: card.dataset.countdownStart, endsAt: card.dataset.countdownEnd }, now);
      output.textContent = state.text;
      card.dataset.countdownStatus = state.status;
    });
  };
  updateCountdowns();
  const interval = window.setInterval(updateCountdowns, 1000);
  listen(document, 'visibilitychange', () => { if (!document.hidden) updateCountdowns(); });
  listen(window, 'pageshow', updateCountdowns);
  signal.addEventListener('abort', () => { clearInterval(interval); cancelAnimationFrame(scrollFrame); }, { once: true });

  const dialog = document.querySelector('[data-search-dialog]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const toggle = document.querySelector('[data-search-toggle]');
  let searchVersion = 0;
  async function renderSearch() {
    const version = ++searchVersion;
    const query = input.value.trim().normalize('NFKC').toLowerCase();
    results.replaceChildren();
    status.textContent = '正在加载站内索引…';
    try {
      if (!searchIndexPromise) {
        searchIndexPromise = fetch('/search-index.json').then(response => {
          if (!response.ok) throw new Error('Search index unavailable');
          return response.json();
        }).catch(error => { searchIndexPromise = undefined; throw error; });
      }
      const index = await searchIndexPromise;
      if (signal.aborted || version !== searchVersion) return;
      const tokens = query.split(/\s+/).filter(Boolean);
      const matches = index.filter(item => tokens.every(token => `${item.title} ${item.keywords} ${item.category}`.normalize('NFKC').toLowerCase().includes(token)));
      const shown = (query ? matches : index).slice(0, 10);
      status.textContent = query ? (matches.length ? `找到 ${matches.length} 项内容` : '没有找到匹配内容，换个关键词试试。') : '输入关键词，或选择以下内容。';
      for (const item of shown) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        const title = document.createElement('span');
        const category = document.createElement('small');
        link.href = item.href;
        title.textContent = item.title;
        category.textContent = item.category;
        link.append(title, category);
        li.append(link);
        results.append(li);
      }
    } catch {
      if (!signal.aborted && version === searchVersion) status.textContent = '搜索暂时不可用，请稍后重试。';
    }
  }
  function openSearch() {
    closeTheme(); closeNav();
    if (!dialog.open) dialog.showModal();
    input.focus({ preventScroll: true });
    renderSearch();
  }
  listen(toggle, 'click', openSearch);
  listen(input, 'input', renderSearch);
  listen(document.querySelector('[data-search-close]'), 'click', () => dialog.close());
  listen(dialog, 'click', event => { if (event.target === dialog) dialog.close(); });
  listen(results, 'click', event => { if (event.target.closest('a')) dialog.close(); });
  listen(dialog, 'close', () => toggle?.focus({ preventScroll: true }));
  listen(document, 'keydown', event => {
    if (event.target instanceof HTMLElement && (event.target.matches('input, textarea, select') || event.target.isContentEditable)) return;
    if (document.querySelector('dialog[open]')) return;
    if (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
      event.preventDefault(); openSearch();
    }
  });

  const viewer = document.querySelector('[data-image-viewer]');
  const preview = document.querySelector('[data-image-preview]');
  const caption = document.querySelector('[data-image-caption]');
  function openImage(image) {
    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt;
    caption.textContent = image.alt;
    if (!viewer.open) viewer.showModal();
  }
  document.querySelectorAll('.learning-detail-cover img, .learning-review img, .evidence-detail img, .evidence-image, .evidence-record-grid img').forEach(image => {
    if (image.closest('a')) return;
    image.classList.add('zoomable-image');
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `放大查看：${image.alt}`);
    listen(image, 'click', () => openImage(image));
    listen(image, 'keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openImage(image); } });
  });
  listen(document.querySelector('[data-image-close]'), 'click', () => viewer.close());
  listen(viewer, 'click', event => { if (event.target === viewer) viewer.close(); });
}

// Astro's router keeps this module alive. Rebind DOM behavior once per new body,
// and abort the old page's observers, timers and listeners before swapping it.
document.addEventListener('astro:before-preparation', () => { document.documentElement.dataset.navigation = 'loading'; });
document.addEventListener('astro:before-swap', event => {
  controller?.abort();
  event.newDocument.documentElement.dataset.theme = resolvedTheme();
  event.newDocument.documentElement.classList.add('js');
  applySavedCover(event.newDocument);
});
document.addEventListener('astro:after-swap', setupPage);
document.addEventListener('astro:page-load', setupPage);
setupPage();
