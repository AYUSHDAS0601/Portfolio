// script.js
// Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync GSAP with Lenis
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// Loader & WebGL Init
window.addEventListener('load', () => {
  initWebGL();
  const tl = gsap.timeline();
  tl.to('.loader-text', { opacity: 0, duration: 0.5, delay: 0.5 })
    .to('.loader', { height: 0, duration: 1, ease: 'power4.inOut' })
    .to('#gl', { opacity: 1, duration: 2 }, '-=0.5')
    .to('.fade-in', { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=1')
    .fromTo('.anim-word', { y: '110%' }, { y: '0%', duration: 1.2, stagger: 0.1, ease: 'power4.out' }, '-=1.2')
    .to('.hero-img-wrapper', { scale: 1, rotateY: 0, duration: 1.5, ease: 'expo.out' }, '-=1.2')
    .to('.scroll-down-tracker', { opacity: 1, duration: 1 }, '-=0.5');
});

// Three.js Abstract Flowing Object
function initWebGL() {
  const canvas = document.getElementById('gl');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xECF4E8, 5, 20);

  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);

  scene.add(new THREE.AmbientLight(0xffffff, 2.5));
  const l1 = new THREE.DirectionalLight(0xffffff, 1.5); l1.position.set(5, 10, 5); scene.add(l1);
  const l2 = new THREE.PointLight(0xCBF3BB, 3, 30); l2.position.set(-8, 5, 2); scene.add(l2);

  const group = new THREE.Group();
  scene.add(group);

  const geo = new THREE.TorusKnotGeometry(3, 0.8, 200, 32);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x93BFC7,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.9,
    thickness: 1.5,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);
  
  const geo2 = new THREE.IcosahedronGeometry(2, 4);
  const mat2 = new THREE.MeshPhysicalMaterial({ color: 0x1A2F24, wireframe: true, transparent: true, opacity: 0.08 });
  const mesh2 = new THREE.Mesh(geo2, mat2);
  group.add(mesh2);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.y += 0.001;
    mesh.rotation.x += 0.002;
    mesh2.rotation.y -= 0.002;
    mesh2.rotation.z -= 0.001;
    
    group.rotation.x += (mouseY * 0.1 - group.rotation.x) * 0.05;
    group.rotation.y += (mouseX * 0.1 - group.rotation.y) * 0.05;

    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
}

// Custom Cursor
const cr = document.getElementById('c-ring'), cd = document.getElementById('c-dot');
let mx = innerWidth / 2, my = innerHeight / 2, ox = mx, oy = my;
window.addEventListener('mousemove', e => { 
  mx = e.clientX; my = e.clientY; 
  cd.style.transform = `translate(${mx}px, ${my}px)`; 
});
gsap.ticker.add(() => {
  ox += (mx - ox) * 0.15; oy += (my - oy) * 0.15;
  cr.style.transform = `translate(${ox}px, ${oy}px)`; 
});

document.querySelectorAll('a, button, .card-inner, .s-link, .marquee-content img, .download-link').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
});

// Split Text manually for About Section
const aboutText = document.querySelector('.about-text');
if (aboutText) {
  const words = aboutText.innerText.split(' ');
  aboutText.innerHTML = '';
  words.forEach(word => {
    const span = document.createElement('span');
    span.className = 'word';
    span.innerText = word + ' ';
    aboutText.appendChild(span);
  });
}

// Reveal About
ScrollTrigger.create({
  trigger: '#about',
  start: 'top 65%',
  onEnter: () => {
    gsap.to('.word', { opacity: 1, duration: 0.05, stagger: 0.03, ease: 'none' });
    gsap.to('.fade-up', { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
  }
});

// Sticky Cards Parallax & Scaling
const cards = document.querySelectorAll('.card-sticky');
cards.forEach((card, index) => {
  const img = card.querySelector('.card-img');
  if(img) {
    gsap.to(img, {
      y: "15%",
      ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }
  
  if (index < cards.length - 1 && window.innerWidth > 900) {
    gsap.to(card.querySelector('.card-inner'), {
      scale: 0.94,
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: cards[index + 1],
        start: 'top 85%',
        end: 'top 15%',
        scrub: true
      }
    });
  }
});

// Reveal Contact Form
ScrollTrigger.create({
  trigger: '#contact',
  start: 'top 75%',
  onEnter: () => {
    gsap.to('.c-form', { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
  }
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const navMain = document.querySelector('.nav-main');
const mobileLinks = document.querySelectorAll('.mobile-link');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('open');
    navMain.classList.toggle('menu-open');
    if (mobileMenuOverlay.classList.contains('open')) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenuOverlay.classList.remove('open');
      navMain.classList.remove('menu-open');
      lenis.start();
    });
  });
}

// Contact Form Submit Handling
const contactForm = document.getElementById('cf');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const r = document.getElementById('form-resp');
    const n = document.querySelector('input[name="name"]').value;
    
    if(r) { r.style.display = 'block'; r.style.color = 'var(--ink2)'; r.textContent = 'Sending...'; }
    
    fetch("https://formsubmit.co/ajax/dasayush.0601@gmail.com", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: n,
        email: document.querySelector('input[name="email"]').value,
        message: document.querySelector('textarea[name="message"]').value,
        _captcha: false
      })
    })
    .then(response => response.json())
    .then(data => {
      if(r) { r.style.color = '#4ade80'; r.style.marginTop = '1rem'; r.textContent = `Message sent — I'll be in touch, ${n}.`; }
      contactForm.reset();
    })
    .catch(error => {
      if(r) { r.style.color = '#f87171'; r.textContent = 'Error sending message. Please try again.'; }
      console.log(error);
    });
  });
}