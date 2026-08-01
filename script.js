const menuButton=document.querySelector('.menu-toggle');const nav=document.querySelector('.nav-links');menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const recipes={pastor:{kicker:'A street-food classic',title:'Tacos al Pastor',description:'A bold, family-style version built around Dos Aztecas Adobada al Pastor marinade.',ingredients:['2 lb thinly sliced pork shoulder','Dos Aztecas Adobada al Pastor marinade','Corn tortillas','Diced pineapple','Chopped onion and cilantro','Lime wedges'],steps:['Coat the pork evenly with marinade and refrigerate for 2–4 hours.','Cook over high heat until caramelized and fully cooked.','Chop the pork and warm the tortillas.','Finish with pineapple, onion, cilantro, and lime.']},flautas:{kicker:'Golden and crisp',title:'Tacos Dorados (Flautas)',description:'Crispy rolled tacos served with fresh toppings and Dos Aztecas Green Salsa.',ingredients:['Shredded chicken or potato filling','Corn tortillas','Oil for frying','Shredded lettuce','Crema and queso fresco','Dos Aztecas Green Salsa'],steps:['Warm tortillas until flexible and add the filling.','Roll tightly and secure if needed.','Fry until golden and crisp, then drain.','Top with lettuce, crema, cheese, and green salsa.']},chilaquiles:{kicker:'A comforting favorite',title:'Chilaquiles',description:'A satisfying breakfast or brunch dish made with crisp tortilla chips and salsa.',ingredients:['Thick tortilla chips','Dos Aztecas Red Salsa','Eggs','Crema and queso fresco','Thinly sliced onion','Cilantro and avocado'],steps:['Warm the salsa in a wide skillet.','Fold in the chips briefly so they stay slightly crisp.','Plate immediately and add egg, crema, cheese, onion, and cilantro.','Serve with avocado and extra salsa at the table.']}};
const modal=document.getElementById('recipe-modal');const close=document.querySelector('.modal-close');document.querySelectorAll('.recipe-button').forEach(btn=>btn.addEventListener('click',()=>{const r=recipes[btn.dataset.recipe];document.getElementById('modal-kicker').textContent=r.kicker;document.getElementById('modal-title').textContent=r.title;document.getElementById('modal-description').textContent=r.description;document.getElementById('modal-ingredients').innerHTML=r.ingredients.map(x=>`<li>${x}</li>`).join('');document.getElementById('modal-steps').innerHTML=r.steps.map(x=>`<li>${x}</li>`).join('');modal.showModal()}));close?.addEventListener('click',()=>modal.close());modal?.addEventListener('click',e=>{if(e.target===modal)modal.close()});


// Founder video playback control
const founderVideo = document.querySelector('.founder-video');
const videoControl = document.querySelector('.video-control');
if (founderVideo && videoControl) {
  videoControl.addEventListener('click', () => {
    if (founderVideo.paused) {
      founderVideo.play();
      videoControl.textContent = 'Pause';
      videoControl.setAttribute('aria-label', 'Pause founder video');
      videoControl.setAttribute('aria-pressed', 'false');
    } else {
      founderVideo.pause();
      videoControl.textContent = 'Play';
      videoControl.setAttribute('aria-label', 'Play founder video');
      videoControl.setAttribute('aria-pressed', 'true');
    }
  });
}

// Lightweight storefront cart. Stripe receives only validated product IDs and quantities.
const STORE_PRODUCTS = {
  'green-salsa': { name: 'Green Salsa', price: 899 },
  'carne-asada': { name: 'Carne Asada Marinade', price: 899 },
  'adobada-pastor': { name: 'Adobada al Pastor', price: 899 }
};
const cart = JSON.parse(localStorage.getItem('dos-aztecas-cart') || '{}');
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
const checkoutClose = document.querySelector('.checkout-close');
const checkoutSuccess = document.querySelector('.checkout-success');
const checkoutDone = document.querySelector('.checkout-done');
const stripe = window.Stripe?.('pk_live_51TzNhbLRmKQ3PcsTJ3CeZSQ3Pvj1ZNB9aCol6UmMmKqd3TeYhtKav0RwybMYsmQ1k515Oc0AMVxWJmkWSrFBbE5H00aNQEWxUW');
let embeddedCheckout;

const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const saveCart = () => localStorage.setItem('dos-aztecas-cart', JSON.stringify(cart));

function openCart() {
  cartDrawer?.classList.add('open');
  cartDrawer?.setAttribute('aria-hidden', 'false');
  if (cartBackdrop) cartBackdrop.hidden = false;
}

function closeCart() {
  cartDrawer?.classList.remove('open');
  cartDrawer?.setAttribute('aria-hidden', 'true');
  if (cartBackdrop) cartBackdrop.hidden = true;
}

function updateCart() {
  if (!cartItems) return;
  const entries = Object.entries(cart).filter(([id, quantity]) => STORE_PRODUCTS[id] && quantity > 0);
  const itemCount = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => sum + STORE_PRODUCTS[id].price * quantity, 0);
  cartCount.textContent = itemCount;
  cartTotal.textContent = money(total);
  cartEmpty.hidden = entries.length > 0;
  cartCheckout.hidden = entries.length === 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = STORE_PRODUCTS[id];
    return `<div class="cart-item" data-cart-id="${id}">
      <strong>${product.name}</strong><span class="cart-item-price">${money(product.price * quantity)}</span>
      <div class="quantity-controls"><button type="button" data-action="decrease" aria-label="Decrease ${product.name}">−</button><span>${quantity}</span><button type="button" data-action="increase" aria-label="Increase ${product.name}">+</button></div>
      <button class="remove-item" type="button" data-action="remove">Remove</button>
    </div>`;
  }).join('');
  saveCart();
}

document.querySelectorAll('.cart-toggle').forEach(button => button.addEventListener('click', openCart));
document.querySelector('.cart-close')?.addEventListener('click', closeCart);
cartBackdrop?.addEventListener('click', closeCart);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCart(); });

document.querySelectorAll('.add-to-cart').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.product;
  cart[id] = Math.min(10, (cart[id] || 0) + 1);
  updateCart();
  openCart();
  button.classList.add('added');
  button.firstChild.textContent = 'Added · $8.99 ';
  setTimeout(() => { button.classList.remove('added'); button.firstChild.textContent = 'Add to cart · $8.99 '; }, 1200);
}));

cartItems?.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  const row = event.target.closest('[data-cart-id]');
  if (!button || !row) return;
  const id = row.dataset.cartId;
  if (button.dataset.action === 'increase') cart[id] = Math.min(10, (cart[id] || 0) + 1);
  if (button.dataset.action === 'decrease') cart[id] = Math.max(0, (cart[id] || 0) - 1);
  if (button.dataset.action === 'remove') cart[id] = 0;
  updateCart();
});

document.querySelectorAll('input[name="fulfillment"]').forEach(input => input.addEventListener('change', () => {
  if (localZip) localZip.hidden = input.value !== 'local' || !input.checked;
  checkoutError.textContent = '';
}));

checkoutButton?.addEventListener('click', async () => {
  const fulfillment = document.querySelector('input[name="fulfillment"]:checked')?.value || 'shipping';
  const postalCode = document.querySelector('.local-zip input')?.value.trim() || '';
  checkoutError.textContent = '';
  checkoutButton.disabled = true;
  checkoutButton.textContent = 'Opening secure checkout…';
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fulfillment,
        postalCode,
        items: Object.entries(cart).map(([id, quantity]) => ({ id, quantity }))
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to start checkout.');
    if (!stripe || !data.clientSecret) throw new Error('Secure checkout could not be loaded.');
    closeCart();
    checkoutOverlay?.classList.add('open');
    checkoutOverlay?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('checkout-open');
    embeddedCheckout = await stripe.initEmbeddedCheckout({
      fetchClientSecret: async () => data.clientSecret,
      onComplete: () => {
        embeddedCheckout?.destroy();
        embeddedCheckout = undefined;
        document.querySelector('#embedded-checkout').replaceChildren();
        Object.keys(cart).forEach(id => delete cart[id]);
        updateCart();
        checkoutSuccess.hidden = false;
      }
    });
    embeddedCheckout.mount('#embedded-checkout');
    checkoutButton.disabled = false;
    checkoutButton.textContent = 'Continue to secure checkout';
  } catch (error) {
    checkoutError.textContent = error.message;
    checkoutButton.disabled = false;
    checkoutButton.textContent = 'Continue to secure checkout';
  }
});

function closeEmbeddedCheckout() {
  embeddedCheckout?.destroy();
  embeddedCheckout = undefined;
  document.querySelector('#embedded-checkout')?.replaceChildren();
  checkoutSuccess.hidden = true;
  checkoutOverlay?.classList.remove('open');
  checkoutOverlay?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('checkout-open');
}

checkoutClose?.addEventListener('click', closeEmbeddedCheckout);
checkoutDone?.addEventListener('click', closeEmbeddedCheckout);

updateCart();

// Play the two hero clips as one lightweight, accessible cooking reel.
const heroReelVideos = [...document.querySelectorAll('.hero-reel-video')];
const heroReelControl = document.querySelector('.hero-reel-control');
let heroReelIndex = 0;
let heroReelPaused = false;

function showHeroReelClip(index) {
  heroReelVideos.forEach((video, videoIndex) => {
    const active = videoIndex === index;
    video.classList.toggle('is-active', active);
    if (!active) {
      video.pause();
      video.currentTime = 0;
    }
  });
  const activeVideo = heroReelVideos[index];
  if (activeVideo && !heroReelPaused) activeVideo.play().catch(() => {});
}

heroReelVideos.forEach((video, index) => {
  video.addEventListener('ended', () => {
    if (heroReelPaused || index !== heroReelIndex) return;
    heroReelIndex = (heroReelIndex + 1) % heroReelVideos.length;
    showHeroReelClip(heroReelIndex);
  });
});

if (heroReelVideos.length && heroReelControl) {
  showHeroReelClip(heroReelIndex);
  heroReelControl.addEventListener('click', () => {
    heroReelPaused = !heroReelPaused;
    const activeVideo = heroReelVideos[heroReelIndex];
    if (heroReelPaused) activeVideo.pause();
    else activeVideo.play().catch(() => {});
    heroReelControl.textContent = heroReelPaused ? 'Play' : 'Pause';
    heroReelControl.setAttribute('aria-label', `${heroReelPaused ? 'Play' : 'Pause'} cooking reel`);
    heroReelControl.setAttribute('aria-pressed', String(heroReelPaused));
  });
}
