/**
 * skyscraper-demo/js/payments.js
 *
 * PayPal button click handler — raycasts the current floor's buy-button
 * meshes and opens config.payments.buttons[].url on click/tap.
 */
import * as THREE from 'three';

export function wirePayments(engine, getButtons) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dom = engine.renderer.domElement;

  function pick(clientX, clientY) {
    const rect = dom.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, engine.camera);
    return raycaster.intersectObjects(getButtons(), false);
  }

  function activate(clientX, clientY) {
    const hits = pick(clientX, clientY);
    if (hits.length && hits[0].object.userData.isPayPal) {
      window.open(hits[0].object.userData.url, '_blank', 'noopener,noreferrer');
    }
  }

  function onClick(e) {
    activate(e.clientX, e.clientY);
  }
  function onTouchEnd(e) {
    const t = e.changedTouches[0];
    if (t) activate(t.clientX, t.clientY);
  }

  dom.addEventListener('click', onClick);
  dom.addEventListener('touchend', onTouchEnd);

  // Hover-free glow/pulse animation, called once per frame from animate().
  function pulse() {
    const now = Date.now();
    getButtons().forEach((btn, i) => {
      btn.material.opacity = 0.7 + Math.sin(now * 0.003 + i) * 0.15;
      btn.rotation.y = Math.sin(now * 0.001 + i) * 0.15;
    });
  }

  function dispose() {
    dom.removeEventListener('click', onClick);
    dom.removeEventListener('touchend', onTouchEnd);
  }

  return { pulse, dispose };
}

export default wirePayments;
