/**
 * floors/PlaceholderFloor.js
 *
 * Shared minimal FloorInterface implementation for Floor3-10's branded
 * stubs (and Floor1's HQ stub). No Three.js, no business logic — just
 * enough DOM to prove FloorManager's mount/unmount lifecycle works.
 */

export function createPlaceholderFloor({ title, subtitle, bg, fg }) {
  return class PlaceholderFloor {
    constructor() {
      this.el = null;
    }

    async init(container, data = {}) {
      this.el = document.createElement('div');
      this.el.className = 'floor-placeholder';
      this.el.style.cssText = [
        'width:100%', 'height:100%', 'display:flex', 'align-items:center',
        'justify-content:center', 'flex-direction:column', 'gap:8px',
        `background:${bg}`, `color:${fg}`, "font-family:system-ui,sans-serif",
      ].join(';');
      this.el.innerHTML = `
        <h1 style="margin:0;font-size:1.8rem;letter-spacing:0.04em;">${title}</h1>
        <p style="margin:0;color:${fg};opacity:0.7;font-size:0.85rem;">${subtitle}</p>
      `;
      container.appendChild(this.el);
      this.update(data);
    }

    update(data = {}) {
      if (!this.el) return;
      this.el.dataset.status = data.status ?? 'offline';
    }

    destroy() {
      if (this.el?.parentNode) this.el.parentNode.removeChild(this.el);
      this.el = null;
    }
  };
}

export default createPlaceholderFloor;
