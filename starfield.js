const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let W, H, stars = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function makeStar() {
  const layer = Math.random();
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r: layer * 1.4 + 0.2,
    speed: layer * 0.18 + 0.02,
    opacity: layer * 0.7 + 0.15,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
  };
}

function init() {
  resize();
  stars = Array.from({ length: 220 }, makeStar);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  for (const s of stars) {
    s.twinkle += s.twinkleSpeed;
    const alpha = s.opacity + Math.sin(s.twinkle) * 0.15;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
    ctx.fill();

    if (s.r > 1.1) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 180, 255, ${alpha * 0.12})`;
      ctx.fill();
    }

    s.y -= s.speed;
    if (s.y + s.r < 0) { s.y = H + s.r; s.x = Math.random() * W; }
  }
  requestAnimationFrame(draw);
}

window.addEventListener('resize', () => { resize(); stars = Array.from({ length: 220 }, makeStar); });
init();
draw();
