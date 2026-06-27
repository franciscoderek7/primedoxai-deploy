/**
 * floors/Floor1/index.js
 *
 * Placeholder: Francisco Holdings HQ. Minimal branded stub per the
 * runtime-engine spec — no Three.js scene yet, just a FloorInterface-
 * compliant DOM placeholder so FloorManager has something real to mount.
 */

export default class Floor1 {
  constructor() {
    this.container = null;
    this.el = null;
  }

  async init(container, data = {}) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'floor-placeholder floor-placeholder--gold';
    this.el.style.cssText = [
      'width:100%', 'height:100%', 'display:flex', 'align-items:center',
      'justify-content:center', 'flex-direction:column', 'gap:8px',
      'background:#0a0a0a', 'color:#d4af37',
      "font-family:Georgia,'Times New Roman',serif",
    ].join(';');
    this.el.innerHTML = `
      <h1 style="margin:0;font-size:2rem;letter-spacing:0.05em;">Francisco Holdings Inc.</h1>
      <p style="margin:0;color:#999;font-size:0.9rem;">Floor 1 — Headquarters (placeholder)</p>
    `;
    container.appendChild(this.el);
    this.update(data);
  }

  update(data = {}) {
    if (!this.el) return;
    const status = data.status ?? 'offline';
    this.el.dataset.status = status;
  }

  destroy() {
    if (this.el?.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
    this.container = null;
  }
}
