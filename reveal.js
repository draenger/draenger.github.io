// Close mobile menu on link click
document.querySelectorAll('nav a').forEach(a => {
  a.addEventListener('click', () => {
    const btn = document.querySelector('.hamburger');
    const ul = document.querySelector('nav ul');
    if (btn && ul) { btn.classList.remove('active'); ul.classList.remove('open'); }
  });
});

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
