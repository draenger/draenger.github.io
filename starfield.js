const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let W = 0;
let H = 0;
let blobs = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function makeBlob(x, y, r, color, dx, dy, drift) {
  return { x, y, r, color, dx, dy, drift, phase: Math.random() * Math.PI * 2 };
}

function init() {
  resize();
  blobs = [
    makeBlob(W * 0.16, H * 0.14, Math.min(W, H) * 0.24, '83, 58, 253', 0.10, 0.05, 0.018),
    makeBlob(W * 0.82, H * 0.16, Math.min(W, H) * 0.20, '54, 122, 255', -0.08, 0.06, 0.014),
    makeBlob(W * 0.78, H * 0.58, Math.min(W, H) * 0.22, '34, 197, 94', -0.04, -0.05, 0.010),
    makeBlob(W * 0.20, H * 0.78, Math.min(W, H) * 0.18, '234, 88, 12', 0.07, -0.03, 0.012),
  ];
}

function drawBlob(blob) {
  blob.phase += blob.drift;
  blob.x += blob.dx * Math.sin(blob.phase);
  blob.y += blob.dy * Math.cos(blob.phase * 0.9);

  if (blob.x < -blob.r) blob.x = W + blob.r;
  if (blob.x > W + blob.r) blob.x = -blob.r;
  if (blob.y < -blob.r) blob.y = H + blob.r;
  if (blob.y > H + blob.r) blob.y = -blob.r;

  const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
  gradient.addColorStop(0, `rgba(${blob.color}, .22)`);
  gradient.addColorStop(0.45, `rgba(${blob.color}, .11)`);
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0)';
  ctx.fillRect(0, 0, W, H);

  for (const blob of blobs) {
    drawBlob(blob);
  }

  requestAnimationFrame(draw);
}

window.addEventListener('resize', () => {
  init();
});

init();
draw();
