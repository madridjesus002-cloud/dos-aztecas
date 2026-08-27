const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
});
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  nav?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation menu');
}));

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }
}), { threshold: .1 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const founderVideo = document.querySelector('.founder-video');
const founderControl = document.querySelector('.video-control');
founderControl?.addEventListener('click', () => {
  const play = founderVideo.paused;
  if (play) founderVideo.play().catch(() => {}); else founderVideo.pause();
  founderControl.textContent = play ? 'Pause' : 'Play';
  founderControl.setAttribute('aria-label', `${play ? 'Pause' : 'Play'} founder video`);
  founderControl.setAttribute('aria-pressed', String(!play));
});

const heroReelVideos = [...document.querySelectorAll('.hero-reel-video')];
const heroReelControl = document.querySelector('.hero-reel-control');
let heroReelIndex = 0;
let heroReelPaused = false;
function showHeroReelClip(index) {
  heroReelVideos.forEach((video, videoIndex) => {
    const active = videoIndex === index;
    video.classList.toggle('is-active', active);
    if (!active) { video.pause(); video.currentTime = 0; }
  });
  if (!heroReelPaused) heroReelVideos[index]?.play().catch(() => {});
}
heroReelVideos.forEach((video, index) => video.addEventListener('ended', () => {
  if (heroReelPaused || index !== heroReelIndex) return;
  heroReelIndex = (heroReelIndex + 1) % heroReelVideos.length;
  showHeroReelClip(heroReelIndex);
}));
if (heroReelVideos.length) showHeroReelClip(0);
heroReelControl?.addEventListener('click', () => {
  heroReelPaused = !heroReelPaused;
  const activeVideo = heroReelVideos[heroReelIndex];
  if (heroReelPaused) activeVideo.pause(); else activeVideo.play().catch(() => {});
  heroReelControl.textContent = heroReelPaused ? 'Play' : 'Pause';
  heroReelControl.setAttribute('aria-label', `${heroReelPaused ? 'Play' : 'Pause'} cooking reel`);
  heroReelControl.setAttribute('aria-pressed', String(heroReelPaused));
});

const STORE_PRODUCTS = {
  'green-salsa': { name: 'Green Salsa', price: 899 },
  'carne-asada': { name: 'Carne Asada Marinade', price: 899 },
  'adobada-pastor': { name: 'Adobada al Pastor', price: 899 },
  'corn-tortillas': { name: 'Heritage Corn Tortillas', price: 899 }
};
let cart = {};
try { cart = JSON.parse(localStorage.getItem('dos-aztecas-cart') || '{}'); } catch { cart = {}; }

document.body.insertAdjacentHTML('beforeend', `
  <div class="quick-toast" role="status" aria-live="polite">Added to your cart</div>
  <div class="cart-backdrop" hidden></div>
  <aside class="cart-drawer" aria-hidden="true" aria-labelledby="cart-title">
    <div class="cart-head"><div><p class="eyebrow">Your order</p><h2 id="cart-title">Shopping cart</h2></div><button class="cart-close" type="button" aria-label="Close cart">×</button></div>
    <div class="cart-items"></div><p class="cart-empty">Your cart is ready for some flavor.</p>
    <div class="cart-checkout" hidden><div class="cart-total"><span>Product total</span><strong>$0.00</strong></div>
      <fieldset class="fulfillment-options"><legend>How should we get it to you?</legend><label><input type="radio" name="fulfillment" value="shipping" checked><span><strong>U.S. shipping</strong><small>$4.99 · Free on orders $35+</small></span></label><label><input type="radio" name="fulfillment" value="local"><span><strong>Local drop-off</strong><small>$3.99 · Hartford area</small></span></label></fieldset>
      <label class="local-zip" hidden>Delivery ZIP code<input type="text" inputmode="numeric" maxlength="5" placeholder="06106"></label><p class="cart-note">Secure checkout is provided by Stripe. Shipping address and tax are confirmed at checkout.</p><button class="pill checkout-button" type="button">Continue to secure checkout</button><p class="checkout-error" role="alert"></p>
    </div>
  </aside>
  <section class="checkout-overlay" aria-hidden="true" aria-labelledby="checkout-title"><div class="checkout-shell"><div class="checkout-head"><div><p class="eyebrow">Secure payment</p><h2 id="checkout-title">Complete your order</h2></div><button class="checkout-close" aria-label="Close checkout">×</button></div><div id="embedded-checkout"></div><div class="checkout-success" hidden><p class="eyebrow">Order received</p><h2>Thank you for supporting Dos Aztecas.</h2><p>Stripe has sent your receipt. We’ll follow up with fulfillment details.</p><button class="pill checkout-done">Continue shopping</button></div></div></section>
`);

const cartDrawer = document.querySelector('.cart-drawer');
const cartBackdrop = document.querySelector('.cart-backdrop');
const cartItems = document.querySelector('.cart-items');
const cartEmpty = document.querySelector('.cart-empty');
const cartCheckout = document.querySelector('.cart-checkout');
const cartCount = document.querySelector('.cart-count');
const cartTotal = document.querySelector('.cart-total strong');
const localZip = document.querySelector('.local-zip');
const checkoutButton = document.querySelector('.checkout-button');
const checkoutError = document.querySelector('.checkout-error');
const checkoutOverlay = document.querySelector('.checkout-overlay');
const checkoutSuccess = document.querySelector('.checkout-success');
const quickToast = document.querySelector('.quick-toast');
const stripe = window.Stripe?.('pk_live_51TzNhbLRmKQ3PcsTJ3CeZSQ3Pvj1ZNB9aCol6UmMmKqd3TeYhtKav0RwybMYsmQ1k515Oc0AMVxWJmkWSrFBbE5H00aNQEWxUW');
let embeddedCheckout;
let toastTimer;
const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const saveCart = () => localStorage.setItem('dos-aztecas-cart', JSON.stringify(cart));
function openCart() { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); cartBackdrop.hidden = false; }
function closeCart() { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden', 'true'); cartBackdrop.hidden = true; }
function updateCart() {
  const entries = Object.entries(cart).filter(([id, quantity]) => STORE_PRODUCTS[id] && quantity > 0);
  const itemCount = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => sum + STORE_PRODUCTS[id].price * quantity, 0);
  cartCount.textContent = itemCount; cartTotal.textContent = money(total); cartEmpty.hidden = entries.length > 0; cartCheckout.hidden = entries.length === 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => `<div class="cart-item" data-cart-id="${id}"><strong>${STORE_PRODUCTS[id].name}</strong><span>${money(STORE_PRODUCTS[id].price * quantity)}</span><div class="quantity-controls"><button data-action="decrease" aria-label="Decrease ${STORE_PRODUCTS[id].name}">−</button><span>${quantity}</span><button data-action="increase" aria-label="Increase ${STORE_PRODUCTS[id].name}">+</button></div><button class="remove-item" data-action="remove">Remove</button></div>`).join('');
  saveCart();
}
function showQuickToast(name) { quickToast.textContent = `${name} added to your cart`; quickToast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => quickToast.classList.remove('show'), 1800); }
document.querySelectorAll('.cart-toggle').forEach(button => button.addEventListener('click', openCart));
document.querySelector('.cart-close').addEventListener('click', closeCart); cartBackdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCart(); });
document.querySelectorAll('.add-to-cart').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.product; if (!STORE_PRODUCTS[id]) return;
  cart[id] = Math.min(10, (cart[id] || 0) + 1); updateCart();
  if (button.dataset.mode === 'shop') openCart(); else showQuickToast(STORE_PRODUCTS[id].name);
  const original = button.textContent; button.classList.add('added'); button.textContent = 'Added ✓'; setTimeout(() => { button.classList.remove('added'); button.textContent = original; }, 1100);
}));
cartItems.addEventListener('click', event => { const button = event.target.closest('button[data-action]'); const row = event.target.closest('[data-cart-id]'); if (!button || !row) return; const id = row.dataset.cartId; if (button.dataset.action === 'increase') cart[id] = Math.min(10, (cart[id] || 0) + 1); if (button.dataset.action === 'decrease') cart[id] = Math.max(0, (cart[id] || 0) - 1); if (button.dataset.action === 'remove') cart[id] = 0; updateCart(); });
document.querySelectorAll('input[name="fulfillment"]').forEach(input => input.addEventListener('change', () => { localZip.hidden = input.value !== 'local' || !input.checked; checkoutError.textContent = ''; }));

checkoutButton.addEventListener('click', async () => {
  const fulfillment = document.querySelector('input[name="fulfillment"]:checked')?.value || 'shipping'; const postalCode = document.querySelector('.local-zip input')?.value.trim() || '';
  checkoutError.textContent = ''; checkoutButton.disabled = true; checkoutButton.textContent = 'Opening secure checkout…';
  try {
    const response = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fulfillment, postalCode, items: Object.entries(cart).map(([id, quantity]) => ({ id, quantity })) }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to start checkout.'); if (!stripe || !data.clientSecret) throw new Error('Secure checkout could not be loaded.');
    closeCart(); checkoutOverlay.classList.add('open'); checkoutOverlay.setAttribute('aria-hidden', 'false'); document.body.classList.add('checkout-open');
    embeddedCheckout = await stripe.initEmbeddedCheckout({ fetchClientSecret: async () => data.clientSecret, onComplete: () => { embeddedCheckout?.destroy(); embeddedCheckout = undefined; document.querySelector('#embedded-checkout').replaceChildren(); cart = {}; updateCart(); checkoutSuccess.hidden = false; } });
    embeddedCheckout.mount('#embedded-checkout');
  } catch (error) { checkoutError.textContent = error.message; }
  checkoutButton.disabled = false; checkoutButton.textContent = 'Continue to secure checkout';
});
function closeCheckout() { embeddedCheckout?.destroy(); embeddedCheckout = undefined; document.querySelector('#embedded-checkout').replaceChildren(); checkoutSuccess.hidden = true; checkoutOverlay.classList.remove('open'); checkoutOverlay.setAttribute('aria-hidden', 'true'); document.body.classList.remove('checkout-open'); }
document.querySelector('.checkout-close').addEventListener('click', closeCheckout); document.querySelector('.checkout-done').addEventListener('click', closeCheckout);
updateCart();
