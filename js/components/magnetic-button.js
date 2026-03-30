export function init() {
  const btn = document.querySelector('.cta-portal');
  if (!btn) return;
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100);
    const y = ((e.clientY - rect.top) / rect.height * 100);
    btn.style.setProperty('--mx', x + '%');
    btn.style.setProperty('--my', y + '%');
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.setProperty('--mx', '50%');
    btn.style.setProperty('--my', '50%');
  });
}
