(function(){
  "use strict";

  /* =====================================================
     EDIT ALL WEDDING DETAILS HERE
  ===================================================== */
  var WEDDING = {
    weddingDateISO: "2026-12-12T10:00:00",
  };

  /* ---------- Preloader date sync ---------- */
  (function syncDates(){
    var d = new Date(WEDDING.weddingDateISO);
    var opts = { day:'2-digit', month:'long', year:'numeric' };
    // Preloader / hero copy already hardcoded to match WEDDING.weddingDateISO by default.
  })();

  /* ---------- Floating petals ---------- */
  var petalHost = document.getElementById('petals');
  var petalCount = window.innerWidth < 700 ? 14 : 22;
  for (var i=0;i<petalCount;i++){
    var p = document.createElement('div');
    var cls = 'petal';
    var r = Math.random();
    if (r < .33) cls += ' alt'; else if (r < .5) cls += ' gold';
    p.className = cls;
    p.style.left = (Math.random()*100) + 'vw';
    p.style.setProperty('--drift', (Math.random()*80-40)+'px');
    var dur = 10 + Math.random()*14;
    p.style.animationDuration = dur + 's';
    p.style.animationDelay = (Math.random()*dur) + 's';
    p.style.opacity = (0.4 + Math.random()*0.5).toFixed(2);
    petalHost.appendChild(p);
  }

  /* ---------- Preloader open ---------- */
  var preloader = document.getElementById('preloader');
  var openBtn = document.getElementById('open-btn');
  var audio = document.getElementById('bg-audio');
  var musicBtn = document.getElementById('music-toggle');

  openBtn.addEventListener('click', function(){
    preloader.classList.add('hide');
    document.body.style.overflow = 'auto';
    // attempt autoplay after user gesture; fail silently if track missing/blocked
    var p = audio.play();
    if (p && p.catch){
      p.then(function(){ musicBtn.classList.add('playing'); }).catch(function(){ /* autoplay blocked or file missing — user can tap the button */ });
    }
  });
  document.body.style.overflow = 'hidden';

  musicBtn.addEventListener('click', function(){
    if (audio.paused){
      audio.play().then(function(){ musicBtn.classList.add('playing'); }).catch(function(){});
    } else {
      audio.pause();
      musicBtn.classList.remove('playing');
    }
  });

  /* ---------- Scroll progress bar ---------- */
  var progress = document.getElementById('progress');
  window.addEventListener('scroll', function(){
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal, .story-item');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold:0.18 });
  revealEls.forEach(function(el){ io.observe(el); });

  /* ---------- Wedding video play ---------- */
  var videoFrame = document.getElementById('video-frame');
  var playBtn = document.getElementById('play-btn');
  var videoEl = videoFrame.querySelector('video');
  playBtn.addEventListener('click', function(){
    videoFrame.classList.add('playing');
    videoEl.play().catch(function(){});
  });

  /* ---------- Gallery lightbox ---------- */
  var figs = Array.prototype.slice.call(document.querySelectorAll('#masonry img'));
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbIndex = 0;
  function openLightbox(i){
    lbIndex = i;
    lbImg.src = figs[i].src.replace(/w=\d+/, 'w=1400');
    lightbox.classList.add('open');
  }
  figs.forEach(function(img, i){ img.addEventListener('click', function(){ openLightbox(i); }); });
  document.getElementById('lb-close').addEventListener('click', function(){ lightbox.classList.remove('open'); });
  document.getElementById('lb-prev').addEventListener('click', function(){ openLightbox((lbIndex-1+figs.length)%figs.length); });
  document.getElementById('lb-next').addEventListener('click', function(){ openLightbox((lbIndex+1)%figs.length); });
  lightbox.addEventListener('click', function(e){ if (e.target === lightbox) lightbox.classList.remove('open'); });

  /* ---------- Scratch card ---------- */
  var canvas = document.getElementById('scratch-canvas');
  var ctx = canvas.getContext('2d');
  var wrap = document.getElementById('scratch-wrap');
  var hint = document.getElementById('scratch-hint');
  var revealed = false;

  function sizeCanvas(){
    var rect = wrap.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawScratchLayer();
  }
  function drawScratchLayer(){
    var g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    g.addColorStop(0,'#e9d4a3');
    g.addColorStop(1,'#c69a4e');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(110,20,35,.5)';
    ctx.font = '600 15px Jost, sans-serif';
    ctx.textAlign = 'center';
    for (var y=30; y<canvas.height; y+=40){
      ctx.fillText('SCRATCH HERE', canvas.width/2, y);
    }
  }
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  var scratching = false;
  function getPos(e){
    var rect = canvas.getBoundingClientRect();
    var x,y;
    if (e.touches && e.touches[0]){ x = e.touches[0].clientX - rect.left; y = e.touches[0].clientY - rect.top; }
    else { x = e.clientX - rect.left; y = e.clientY - rect.top; }
    return {x:x,y:y};
  }
  function scratchAt(pos){
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 24, 0, Math.PI*2);
    ctx.fill();
  }
  function checkProgress(){
    var data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    var transparent = 0, total = data.length/4;
    for (var k=3;k<data.length;k+=4*8){ if (data[k] === 0) transparent++; }
    var pct = transparent / (total/8);
    if (pct > 0.45 && !revealed){
      revealed = true;
      canvas.style.transition = 'opacity .6s ease';
      canvas.style.opacity = '0';
      hint.textContent = 'Revealed! ✨';
      burstSparkles();
      setTimeout(function(){ canvas.style.display='none'; }, 650);
    }
  }
  function burstSparkles(){
    for (var i=0;i<18;i++){
      var s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = (40 + Math.random()*20) + '%';
      s.style.top = (40 + Math.random()*20) + '%';
      var ang = Math.random()*Math.PI*2, dist = 40+Math.random()*60;
      s.style.setProperty('--sx', Math.cos(ang)*dist + 'px');
      s.style.setProperty('--sy', Math.sin(ang)*dist + 'px');
      wrap.appendChild(s);
      (function(el){ setTimeout(function(){ el.remove(); }, 850); })(s);
    }
  }
  function startScratch(e){ scratching = true; scratchAt(getPos(e)); }
  function moveScratch(e){ if (!scratching) return; e.preventDefault(); scratchAt(getPos(e)); checkProgress(); }
  function endScratch(){ scratching = false; checkProgress(); }

  canvas.addEventListener('mousedown', startScratch);
  canvas.addEventListener('mousemove', moveScratch);
  window.addEventListener('mouseup', endScratch);
  canvas.addEventListener('touchstart', startScratch, {passive:true});
  canvas.addEventListener('touchmove', moveScratch, {passive:false});
  canvas.addEventListener('touchend', endScratch);

  /* ---------- Countdown ---------- */
  var target = new Date(WEDDING.weddingDateISO).getTime();
  function tick(){
    var now = Date.now();
    var diff = Math.max(0, target - now);
    var d = Math.floor(diff/86400000);
    var h = Math.floor((diff%86400000)/3600000);
    var m = Math.floor((diff%3600000)/60000);
    var s = Math.floor((diff%60000)/1000);
    document.getElementById('cd-days').textContent = String(d).padStart(2,'0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
    document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- RSVP form toggle ---------- */
  var rsvpBtn = document.getElementById('rsvp-open-form');
  var rsvpForm = document.getElementById('rsvp-form');
  rsvpBtn.addEventListener('click', function(){
    rsvpForm.classList.toggle('open');
    if (rsvpForm.classList.contains('open')) rsvpForm.scrollIntoView({behavior:'smooth', block:'center'});
  });
  rsvpForm.addEventListener('submit', function(e){
    e.preventDefault();
    rsvpBtn.textContent = 'Thank you for your RSVP!';
    rsvpForm.classList.remove('open');
  });

  /* ---------- Map buttons (placeholder — replace with real venue map link) ---------- */
  document.querySelectorAll('[data-map]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      window.open('https://maps.google.com/?q=Royal+Heritage+Gardens+Ludhiana', '_blank');
    });
  });

})();