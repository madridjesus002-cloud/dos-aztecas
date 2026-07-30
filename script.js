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
