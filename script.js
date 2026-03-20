/* ═══════════════════════════════
   LENIS SMOOTH SCROLL
═══════════════════════════════ */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync GSAP with Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* ═══════════════════════════════
   CURSOR & MAGNETIC UI
═══════════════════════════════ */
const cr = document.getElementById('c-ring'), cd = document.getElementById('c-dot');
let ox = 0, oy = 0, mx = innerWidth / 2, my = innerHeight / 2;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cd.style.left = mx + 'px'; cd.style.top = my + 'px' });
(function lp() { ox += (mx - ox) * .1; oy += (my - oy) * .1; cr.style.left = ox + 'px'; cr.style.top = oy + 'px'; requestAnimationFrame(lp) })();
const magElements = document.querySelectorAll('a,button,.proj-row,.btn-prim,.btn-ghost');
magElements.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  el.addEventListener('mouseleave', () => {
    document.body.classList.remove('hov');
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
  });
  // Magnetic effect for buttons
  if (el.classList.contains('btn-prim') || el.classList.contains('btn-ghost')) {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const hx = e.clientX - rect.left - rect.width / 2;
      const hy = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: hx * 0.3, y: hy * 0.3, duration: 0.3, ease: "power2.out" });
    });
  }
});
document.addEventListener('mousedown', () => document.body.classList.add('clk'));
document.addEventListener('mouseup', () => document.body.classList.remove('clk'));

/* ═══════════════════════════════
   WEBGL — THREE.JS
═══════════════════════════════ */
(function () {
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xECF4E8, 1);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, .1, 200);
  cam.position.set(0, 0, 18);

  /* ── FOG ── */
  scene.fog = new THREE.FogExp2(0xECF4E8, .035);

  /* ── LIGHTS ── */
  scene.add(new THREE.AmbientLight(0xffffff, 2.5));
  const l1 = new THREE.DirectionalLight(0xffffff, 1.5); l1.position.set(5, 10, 5); scene.add(l1);
  const l2 = new THREE.PointLight(0xCBF3BB, 3, 30); l2.position.set(-8, 5, 2); scene.add(l2);
  const l3 = new THREE.PointLight(0x93BFC7, 2, 30); l3.position.set(5, -5, -5); scene.add(l3);

  /* ── ABSTRACT SHAPES ── */
  const shapesGroup = new THREE.Group();
  scene.add(shapesGroup);

  const matOpts = {
    roughness: 0.15,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.6,
    thickness: 1.5
  };

  const colors = [0xCBF3BB, 0xABE7B2, 0x93BFC7, 0xffffff];
  const geos = [
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.TorusGeometry(1, 0.4, 64, 100),
    new THREE.IcosahedronGeometry(1, 4)
  ];

  const objects = [];
  for (let i = 0; i < 18; i++) {
    const geo = geos[Math.floor(Math.random() * geos.length)];
    const mat = new THREE.MeshPhysicalMaterial({
      ...matOpts,
      color: colors[i % colors.length]
    });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.set(
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 15 - 4
    );

    mesh.scale.setScalar(0.6 + Math.random() * 1.8);

    mesh.userData = {
      baseY: mesh.position.y,
      speed: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      rx: (Math.random() - 0.5) * 0.01,
      ry: (Math.random() - 0.5) * 0.01,
      rz: (Math.random() - 0.5) * 0.01
    };

    shapesGroup.add(mesh);
    objects.push(mesh);
  }

  /* ── SCROLL & MOUSE ── */
  let scrollY = 0, mouseX = 0, mouseY = 0;
  window.addEventListener('scroll', () => scrollY = window.scrollY);
  window.addEventListener('mousemove', e => { mouseX = (e.clientX / innerWidth - .5) * 2; mouseY = -(e.clientY / innerHeight - .5) * 2 });

  /* ── ANIMATE ── */
  let t = 0;
  let cx = 0, cy = 0;
  function tick() {
    requestAnimationFrame(tick);
    t += .005;
    const sf = scrollY / (document.body.scrollHeight - innerHeight) || 0;

    cx += (mouseX * .8 - cx) * 0.05;
    cy += (mouseY * .8 - sf * 3 - cy) * 0.05;

    cam.position.x = cx;
    cam.position.y = cy;
    cam.position.z = 18 - sf * 1.5;
    cam.lookAt(0, -sf, 0);

    objects.forEach((obj) => {
      const u = obj.userData;
      obj.position.y = u.baseY + Math.sin(t * u.speed + u.phase) * 1.8;
      obj.rotation.x += u.rx;
      obj.rotation.y += u.ry;
      obj.rotation.z += u.rz;
    });

    shapesGroup.rotation.y = t * 0.08;
    renderer.render(scene, cam);
  }
  tick();

  window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  });
})();

/* ═══════════════════════════════
   SKILLS DATA
═══════════════════════════════ */
const skillsA = [
  { n: 'React / Next.js', t: 'Amature', tier: 'ex', w: .60 },
  { n: 'OpenGL', t: 'Amature', tier: 'ex', w: .55 },
  { n: 'Node.js', t: 'Advanced', tier: 'ad', w: .78 },
];
const skillsB = [
  { n: 'Unreal Engine 5', t: 'Advanced', tier: 'ad', w: .8 },
  { n: 'C++ / Blueprints', t: 'Advanced', tier: 'ad', w: .74 },
  { n: 'Blender', t: 'Intermediate', tier: 'md', w: .65 },
  { n: 'GLSL Shaders', t: 'Intermediate', tier: 'md', w: .6 },
  { n: 'Python', t: 'Intermediate', tier: 'md', w: .58 },
];
function buildSkills(data, el) {
  data.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'skill-item';
    d.style.transitionDelay = `${i * .08}s`;
    d.innerHTML = `<span class="skill-name">${s.n}</span><div style="display:flex;align-items:center;gap:1rem"><span class="skill-tier ${s.tier}">${s.t}</span><div class="skill-bar-wrap"><div class="skill-bar" style="width:${s.w * 100}%"></div></div></div>`;
    document.getElementById(el).appendChild(d);
  });
}
buildSkills(skillsA, 'skills-a');
buildSkills(skillsB, 'skills-b');

/* ═══════════════════════════════
   GSAP SCROLL TRIGGERS
═══════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

// Split Text implementation for Hero
const heroTitle = document.querySelector('.hero-name');
if (heroTitle) {
  const chars = heroTitle.textContent.trim().split('');
  heroTitle.innerHTML = '';
  chars.forEach(c => {
    if (c === ' ') {
      heroTitle.appendChild(document.createTextNode(' '));
    } else {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = c;
      if (c === ',') {
        const em = document.createElement('em');
        em.style.display = 'inline-block';
        em.appendChild(span);
        heroTitle.appendChild(em);
      } else {
        heroTitle.appendChild(span);
      }
    }
  });
  // Since we replaced the HTML entirely, let's fix the structure: "Building <br> <em>worlds,</em> systems."
  heroTitle.innerHTML = `
    <span style="display:inline-block; overflow:hidden;"><span class="char" style="display:inline-block">B</span><span class="char" style="display:inline-block">u</span><span class="char" style="display:inline-block">i</span><span class="char" style="display:inline-block">l</span><span class="char" style="display:inline-block">d</span><span class="char" style="display:inline-block">i</span><span class="char" style="display:inline-block">n</span><span class="char" style="display:inline-block">g</span></span><br>
    <em><span style="display:inline-block; overflow:hidden;"><span class="char" style="display:inline-block">w</span><span class="char" style="display:inline-block">o</span><span class="char" style="display:inline-block">r</span><span class="char" style="display:inline-block">l</span><span class="char" style="display:inline-block">d</span><span class="char" style="display:inline-block">s</span><span class="char" style="display:inline-block">,</span></span></em>
    <span style="display:inline-block; overflow:hidden;"><span class="char" style="display:inline-block">s</span><span class="char" style="display:inline-block">y</span><span class="char" style="display:inline-block">s</span><span class="char" style="display:inline-block">t</span><span class="char" style="display:inline-block">e</span><span class="char" style="display:inline-block">m</span><span class="char" style="display:inline-block">s</span><span class="char" style="display:inline-block">.</span></span>
  `;
}

// Section titles
document.querySelectorAll('.sec-h').forEach(el => {
  ScrollTrigger.create({ trigger: el, start: 'top 85%', onEnter: () => el.classList.add('vis') });
});

// Animate Hero text dynamically
gsap.to('.char', {
  opacity: 1,
  y: 0,
  rotation: 0,
  stagger: 0.05,
  duration: 1.4,
  ease: "power2.out",
  delay: 0.3
});

// About paragraphs
document.querySelectorAll('.about-body p').forEach((el, i) => {
  ScrollTrigger.create({ trigger: el, start: 'top 88%', onEnter: () => el.classList.add('vis') });
});

// Stats
document.querySelectorAll('.stat').forEach(el => {
  ScrollTrigger.create({ trigger: el, start: 'top 88%', onEnter: () => el.classList.add('vis') });
});

// Project cards reveal
document.querySelectorAll('.proj-card').forEach(el => {
  ScrollTrigger.create({ trigger: el, start: 'top 90%', onEnter: () => el.classList.add('vis') });
});

// Image parallax scrub
document.querySelectorAll('.proj-img').forEach(img => {
  gsap.to(img, {
    y: "15%",
    ease: "none",
    scrollTrigger: {
      trigger: img.closest('.proj-card'),
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});

// Skills
ScrollTrigger.create({
  trigger: '#skills', start: 'top 70%',
  onEnter: () => document.querySelectorAll('.skill-item').forEach(e => e.classList.add('vis'))
});

// Contact
ScrollTrigger.create({
  trigger: '#contact', start: 'top 75%',
  onEnter: () => {
    document.getElementById('cf').classList.add('vis');
    document.getElementById('ca').classList.add('vis');
  }
});

// Subtle parallax on hero name
gsap.to('.hero-name', {
  y: -50, // enhanced slightly for lenis
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
});
gsap.to('.hero-tagline, .hero-eyebrow', {
  y: -15, opacity: 0,
  scrollTrigger: { trigger: '#hero', start: '30% top', end: 'bottom top', scrub: 1 }
});

/* ═══════════════════════════════
   FORM
═══════════════════════════════ */
const contactForm = document.getElementById('cf');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const n = document.getElementById('fn').value;
    const email = document.getElementById('fe').value;
    const subj = document.getElementById('fs').value;
    const m = document.getElementById('fm').value;
    const r = document.getElementById('form-resp');
    
    if (!n || !m || !email) { 
      if(r) { r.style.display = 'block'; r.style.color = '#f87171'; r.textContent = 'Please fill out required fields.'; }
      return; 
    }
    
    if(r) { r.style.display = 'block'; r.style.color = 'var(--ink2)'; r.textContent = 'Sending...'; }
    
    fetch("https://formsubmit.co/ajax/dasayush.0601@gmail.com", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: n,
        email: email,
        subject: subj || "New Portfolio Message",
        message: m,
        _captcha: false
      })
    })
    .then(response => response.json())
    .then(data => {
      if(r) { r.style.color = '#4ade80'; r.textContent = `Message sent — I'll be in touch, ${n}.`; }
      contactForm.reset();
    })
    .catch(error => {
      if(r) { r.style.color = '#f87171'; r.textContent = 'Error sending message. Please try again.'; }
      console.log(error);
    });
  });
}

/* ═══════════════════════════════
   KONAMI
═══════════════════════════════ */
const K = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; let ki = 0;
document.addEventListener('keydown', e => {
  ki = e.keyCode === K[ki] ? ki + 1 : 0;
  if (ki === K.length) {
    ki = 0;
    const o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(5,4,10,.96);display:flex;align-items:center;justify-content:center;cursor:none';
    o.innerHTML = `<div style="border:1px solid rgba(232,201,122,.2);padding:4rem;text-align:center;max-width:360px;font-family:DM Mono,monospace">
      <div style="font-size:9px;letter-spacing:.2em;color:rgba(232,201,122,.5);margin-bottom:2rem;text-transform:uppercase">— Hidden —</div>
      <div style="font-family:Cormorant Garamond,serif;font-size:48px;font-weight:300;font-style:italic;color:#e8c97a;margin-bottom:1.5rem">NightCrawler</div>
      <div style="font-size:11px;color:#7a7898;line-height:1.8;margin-bottom:2rem">A stealth rogue-like currently in development.<br>Wishlist for early access.</div>
      <div style="font-size:9px;letter-spacing:.15em;color:rgba(232,201,122,.4);text-transform:uppercase;cursor:none" onclick="this.closest('div').remove()">[ close ]</div>
    </div>`;
    document.body.appendChild(o); o.addEventListener('click', () => o.remove());
  }
});