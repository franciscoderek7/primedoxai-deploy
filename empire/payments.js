/**
 * empire/payments.js
 *
 * Shared "Option A" PayPal buy-button system for every floor scene, per
 * Derek's "BUILD FOUR 3D SITES + PAYPAL INTEGRATION" order: a floating
 * holographic button next to each product that opens
 * `paypal.me/techpetcage/<amount>` in a new tab on click. No backend, no
 * in-scene overlay/card form — chosen because it ships today with zero
 * new infrastructure, unlike Option B (HTML overlay) or Option C (QR code).
 *
 * Every paypal.me amount a floor passes in here is expected to come from
 * stripe-config.js's already-standardized per-brand tiers (the single
 * source of truth for pricing) — this module only renders buttons and
 * handles the click, it does not own pricing data.
 */

function createBuyButtonCanvas(label, priceLabel, accentColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(5, 5, 10, 0.78)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  ctx.textAlign = 'center';
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 32px monospace';
  ctx.fillText('BUY NOW', canvas.width / 2, 76);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 46px monospace';
  ctx.fillText(priceLabel, canvas.width / 2, 138);
  ctx.fillStyle = accentColor;
  ctx.font = '18px monospace';
  ctx.fillText(label, canvas.width / 2, 174);
  return canvas;
}

/**
 * Builds one floating buy-button mesh. paypalUrl must be a full
 * https://paypal.me/techpetcage/AMOUNT URL — callers own the pricing data.
 */
export function createBuyButtonMesh(THREE, { label, priceLabel, accentColor = '#00ffae', paypalUrl, width = 2.4, height = 0.94 }) {
  if (!paypalUrl) throw new Error('createBuyButtonMesh: paypalUrl is required');
  const canvas = createBuyButtonCanvas(label, priceLabel, accentColor);
  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  mesh.userData.isBuyButton = true;
  mesh.userData.paypalUrl = paypalUrl;
  mesh.userData.baseOpacity = 0.92;
  return mesh;
}

/**
 * Owns the raycaster + window listeners for a floor's set of buy buttons.
 * One instance per floor scene; the floor calls .update() from its own
 * update() loop and .dispose() from its own dispose(), same lifecycle
 * pattern every other floor module already uses for its local listeners.
 */
export class PaymentHotspots {
  constructor(THREE, camera) {
    this.camera = camera;
    this.buttons = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hovered = null;

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onActivate = this._onActivate.bind(this);
    window.addEventListener('mousemove', this._onPointerMove);
    window.addEventListener('click', this._onActivate);
    window.addEventListener('touchend', this._onActivate, { passive: true });
  }

  add(mesh) {
    this.buttons.push(mesh);
    return mesh;
  }

  _pick(clientX, clientY) {
    this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.buttons);
  }

  _onPointerMove(event) {
    const hits = this._pick(event.clientX, event.clientY);
    this.hovered = hits.length ? hits[0].object : null;
    document.body.style.cursor = this.hovered ? 'pointer' : '';
  }

  _onActivate(event) {
    const point = event.changedTouches ? event.changedTouches[0] : event;
    if (!point) return;
    const hits = this._pick(point.clientX, point.clientY);
    if (!hits.length) return;
    const target = hits[0].object;
    // Every paypalUrl here is paypal.me/techpetcage/AMOUNT — Derek's single
    // confirmed empire-wide checkout account (EMPIRE.md 2026-06-28 entry).
    if (target.userData.isBuyButton && target.userData.paypalUrl) {
      window.open(target.userData.paypalUrl, '_blank', 'noopener,noreferrer');
    }
  }

  update() {
    const now = Date.now();
    this.buttons.forEach((mesh) => {
      const target = mesh === this.hovered ? 1 : 0;
      const glow = (mesh.userData.glow || 0) + (target - (mesh.userData.glow || 0)) * 0.15;
      mesh.userData.glow = glow;
      mesh.material.opacity = (mesh.userData.baseOpacity || 0.92) + glow * 0.08;
      const pulse = 1 + Math.sin(now * 0.004) * 0.015;
      mesh.scale.setScalar(mesh === this.hovered ? pulse * 1.06 : pulse);
    });
  }

  dispose() {
    window.removeEventListener('mousemove', this._onPointerMove);
    window.removeEventListener('click', this._onActivate);
    window.removeEventListener('touchend', this._onActivate);
    document.body.style.cursor = '';
  }
}

export default { createBuyButtonMesh, PaymentHotspots };
