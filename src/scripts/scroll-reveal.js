// Fuwari-style staggered entrances, with an immediate readable no-script fallback.
export function initScrollReveals({ signal, entrance = true } = {}) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const selector = '[data-reveal], .page-heading, .info-section, .award-entry, .contact-group, .contact-locked-card';
  const elements = [...document.querySelectorAll(selector)].filter(el => !el.dataset.revealed);
  if (preference.matches || !('IntersectionObserver' in window)) return;
  let frame;
  const show = (element, delay = 0) => {
    element.style.setProperty('--reveal-delay', `${delay}ms`);
    element.classList.remove('motion-pending');
    element.classList.add('motion-enter');
    element.dataset.revealed = 'true';
    element.addEventListener('animationend', () => {
      element.classList.remove('motion-enter');
      element.style.removeProperty('--reveal-delay');
    }, { once: true, signal });
  };
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      show(entry.target, Math.min(order++, 4) * 60);
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.04, rootMargin: '0px 0px -20px 0px' });
  const firstScreen = [];
  for (const element of elements) {
    const bounds = element.getBoundingClientRect();
    if (bounds.bottom <= 0) {
      element.dataset.revealed = 'true';
      continue;
    }
    if (bounds.top < window.innerHeight - 10 && !entrance) {
      // The router animates the new main panel; keep its snapshot populated.
      element.dataset.revealed = 'true';
    } else {
      element.classList.add('motion-pending');
      if (bounds.top < window.innerHeight - 10) firstScreen.push(element);
      else observer.observe(element);
    }
  }
  frame = requestAnimationFrame(() => firstScreen.forEach((el, index) => show(el, 80 + Math.min(index, 5) * 60)));
  const revealAll = () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    elements.forEach(el => el.classList.remove('motion-pending', 'motion-enter'));
  };
  preference.addEventListener('change', event => { if (event.matches) revealAll(); }, { signal });
  signal?.addEventListener('abort', revealAll, { once: true });
}
