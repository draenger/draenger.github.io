// Close mobile menu on link click
document.querySelectorAll('nav a').forEach(a => {
  a.addEventListener('click', () => {
    const btn = document.querySelector('.hamburger');
    const ul = document.querySelector('nav ul');
    if (btn && ul) { btn.classList.remove('active'); ul.classList.remove('open'); }
  });
});

const progress = document.querySelector('.scroll-progress span');
function updateProgress() {
  if (!progress) return;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const value = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

const els = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
els.forEach(el => io.observe(el));

// Fallback: keep content readable even if an observer or layout quirk misses it.
window.setTimeout(() => {
  els.forEach(el => el.classList.add('visible'));
}, 0);
