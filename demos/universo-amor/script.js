// ============================================================
//  NUESTRO UNIVERSO DE AMOR — Cinematic Space Journey
//  Optimized for mobile + desktop
// ============================================================

(function () {
    'use strict';

    const canvas = document.getElementById('universe');
    const ctx = canvas.getContext('2d');
    let W, H, cx, cy, DPR, isMobile;

    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for performance
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * DPR;
        canvas.height = H * DPR;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        cx = W / 2;
        cy = H / 2;
        isMobile = W < 768;
    }
    resize();
    window.addEventListener('resize', resize);

    // ==================== UTILITIES ====================
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function lerp(a, b, t) { return a + (b - a) * t; }

    // ==================== SCENE STATE ====================
    let scene = {
        phase: 'idle',
        time: 0,
        starSpeed: 0.3,
        targetStarSpeed: 0.3,
        sunAlpha: 0.35,
        showPlanet: false,
        planetConfig: null,
        planetAlpha: 0,
        targetPlanetAlpha: 0,
        wormholeActive: false,
        wormholeProgress: 0,
        warpActive: false,
        nebulaAlpha: 0.15,
    };

    // ==================== STARS ====================
    let stars = [];
    function getStarCount() { return isMobile ? 400 : 900; }

    function initStars() {
        stars = [];
        let count = getStarCount();
        for (let i = 0; i < count; i++) {
            stars.push({
                x: rand(-W, W),
                y: rand(-H, H),
                z: rand(1, W),
                pz: 0,
                brightness: rand(0.3, 1),
                size: rand(0.4, 1.8),
                colorIdx: Math.floor(rand(0, 4))
            });
        }
        stars.forEach(s => s.pz = s.z);
    }
    initStars();

    const starColors = ['#ffffff', '#ffe4e8', '#e8d5f5', '#d4e5ff'];

    function updateAndDrawStars() {
        let isWarp = scene.warpActive || scene.starSpeed > 10;

        for (let i = 0; i < stars.length; i++) {
            let s = stars[i];
            s.pz = s.z;
            s.z -= scene.starSpeed;
            if (s.z <= 0) {
                s.z = W;
                s.pz = s.z;
                s.x = rand(-W, W);
                s.y = rand(-H, H);
            }

            let invZ = 1 / s.z;
            let halfW = W * 0.5;
            let halfH = H * 0.5;
            let sx = s.x * invZ * halfW + cx;
            let sy = s.y * invZ * halfH + cy;

            let depth = 1 - s.z / W;
            let alpha = depth * s.brightness;

            if (isWarp) {
                let px = s.x / s.pz * halfW + cx;
                let py = s.y / s.pz * halfH + cy;
                let size = s.size * depth * (isMobile ? 1.5 : 2);

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.strokeStyle = `rgba(255,142,155,${alpha})`;
                ctx.lineWidth = size;
                ctx.stroke();
            } else {
                let twinkle = 0.7 + 0.3 * Math.sin(scene.time * 3 + i);
                let size = s.size * depth * 2;

                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, 6.2832);
                ctx.fillStyle = starColors[s.colorIdx];
                ctx.globalAlpha = alpha * twinkle;
                ctx.fill();

                // glow only for big bright stars and not on low-end mobile
                if (!isMobile && s.brightness > 0.85 && size > 1.5) {
                    let glowR = size * 3;
                    let g = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
                    g.addColorStop(0, `rgba(255,200,220,${alpha * 0.25 * twinkle})`);
                    g.addColorStop(1, 'rgba(255,200,220,0)');
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(sx, sy, glowR, 0, 6.2832);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
        }
    }

    // ==================== NEBULAE ====================
    const nebulae = [];
    function initNebulae() {
        let count = isMobile ? 3 : 5;
        let colors = [
            [180, 80, 160], [100, 60, 180], [220, 100, 130], [60, 80, 170], [160, 60, 120]
        ];
        for (let i = 0; i < count; i++) {
            nebulae.push({
                x: rand(0, W), y: rand(0, H),
                radius: rand(isMobile ? 100 : 150, isMobile ? 250 : 400),
                color: colors[i % colors.length],
                dx: rand(-0.08, 0.08), dy: rand(-0.08, 0.08),
                phase: rand(0, 6.2832)
            });
        }
    }
    initNebulae();

    function drawNebulae() {
        for (let n of nebulae) {
            n.x += n.dx;
            n.y += n.dy;
            let pulse = 0.8 + 0.2 * Math.sin(scene.time * 0.5 + n.phase);
            let r = n.radius * pulse;
            let c = n.color;
            let a = scene.nebulaAlpha;
            let g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
            g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a * 0.5})`);
            g.addColorStop(0.5, `rgba(${c[0]},${c[1]},${c[2]},${a * 0.15})`);
            g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, 6.2832);
            ctx.fill();
        }
    }

    // ==================== SUN ====================
    function drawSun() {
        let sunX = W * 0.85;
        let sunY = H * 0.12;
        let baseR = isMobile ? 35 : 55;
        let pulse = 1 + 0.04 * Math.sin(scene.time * 2);
        let a = scene.sunAlpha;

        // corona layers
        for (let i = 4; i > 0; i--) {
            let cr = baseR + i * (isMobile ? 25 : 35);
            let g = ctx.createRadialGradient(sunX, sunY, baseR * 0.3, sunX, sunY, cr * pulse);
            g.addColorStop(0, `rgba(255,220,150,${a * 0.06})`);
            g.addColorStop(1, 'rgba(255,140,80,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(sunX, sunY, cr * pulse, 0, 6.2832);
            ctx.fill();
        }

        // core
        let cg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, baseR * pulse);
        cg.addColorStop(0, `rgba(255,250,220,${a})`);
        cg.addColorStop(0.4, `rgba(255,210,140,${a * 0.7})`);
        cg.addColorStop(1, 'rgba(255,160,80,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(sunX, sunY, baseR * pulse, 0, 6.2832);
        ctx.fill();

        // rays (skip on mobile for perf)
        if (!isMobile) {
            ctx.save();
            ctx.translate(sunX, sunY);
            ctx.rotate(scene.time * 0.08);
            for (let i = 0; i < 6; i++) {
                ctx.rotate(Math.PI / 3);
                let rg = ctx.createLinearGradient(0, 0, baseR * 2.5, 0);
                rg.addColorStop(0, `rgba(255,220,180,${a * 0.1})`);
                rg.addColorStop(1, 'rgba(255,220,180,0)');
                ctx.fillStyle = rg;
                ctx.beginPath();
                ctx.moveTo(0, -1.5);
                ctx.lineTo(baseR * 2.5 * pulse, 0);
                ctx.lineTo(0, 1.5);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // ==================== SHOOTING STARS ====================
    let shootingStars = [];

    function drawShootingStars() {
        if (Math.random() < (isMobile ? 0.005 : 0.008) && shootingStars.length < 2) {
            shootingStars.push({
                x: rand(W * 0.2, W * 0.9),
                y: rand(-20, H * 0.25),
                vx: rand(6, 12),
                vy: rand(3, 7),
                life: 1,
                decay: rand(0.01, 0.025),
                len: rand(60, 150)
            });
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            let ss = shootingStars[i];
            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.life -= ss.decay;
            if (ss.life <= 0) { shootingStars.splice(i, 1); continue; }

            let tx = ss.x - ss.vx * (ss.len / 10);
            let ty = ss.y - ss.vy * (ss.len / 10);
            let grad = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
            grad.addColorStop(0, 'rgba(255,200,220,0)');
            grad.addColorStop(1, `rgba(255,200,220,${ss.life})`);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(ss.x, ss.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 2, 0, 6.2832);
            ctx.fillStyle = `rgba(255,255,255,${ss.life})`;
            ctx.fill();
        }
    }

    // ==================== COSMIC DUST ====================
    let dust = [];
    function initDust() {
        let count = isMobile ? 25 : 50;
        let colors = ['#ff8e9b', '#c77dba', '#e8b4d8', '#8ec5fc'];
        for (let i = 0; i < count; i++) {
            dust.push({
                x: rand(0, W), y: rand(0, H),
                size: rand(0.8, 2.5),
                speed: rand(0.1, 0.4),
                alpha: rand(0.04, 0.15),
                color: colors[i % 4],
                phase: rand(0, 6.2832)
            });
        }
    }
    initDust();

    function drawDust() {
        for (let p of dust) {
            p.x += Math.sin(scene.time + p.phase) * p.speed;
            p.y -= p.speed * 0.25;
            if (p.y < -5) { p.y = H + 5; p.x = rand(0, W); }
            let flicker = 0.6 + 0.4 * Math.sin(scene.time * 2 + p.phase);
            ctx.globalAlpha = p.alpha * flicker;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, 6.2832);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // ==================== SATELLITES ====================
    let satellites = [];
    function initSatellites() {
        satellites = [];
        let count = isMobile ? 2 : 4;
        for (let i = 0; i < count; i++) {
            satellites.push({
                orbitR: rand(60, 200),
                angle: rand(0, 6.2832),
                speed: rand(0.006, 0.018) * (Math.random() > 0.5 ? 1 : -1),
                size: rand(1.5, 4),
                trailMax: isMobile ? 6 : 12,
                cx2: rand(W * 0.15, W * 0.85),
                cy2: rand(H * 0.15, H * 0.85),
                tilt: rand(0.3, 0.7),
                trail: []
            });
        }
    }
    initSatellites();

    function drawSatellites() {
        for (let sat of satellites) {
            sat.angle += sat.speed;
            let sx = sat.cx2 + Math.cos(sat.angle) * sat.orbitR;
            let sy = sat.cy2 + Math.sin(sat.angle) * sat.orbitR * sat.tilt;
            sat.trail.push({ x: sx, y: sy });
            if (sat.trail.length > sat.trailMax) sat.trail.shift();

            for (let t = 0; t < sat.trail.length; t++) {
                let a = (t / sat.trail.length) * 0.35;
                let sz = sat.size * (t / sat.trail.length);
                ctx.globalAlpha = a;
                ctx.fillStyle = '#e8b4d8';
                ctx.beginPath();
                ctx.arc(sat.trail[t].x, sat.trail[t].y, sz, 0, 6.2832);
                ctx.fill();
            }

            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(sx, sy, sat.size, 0, 6.2832);
            ctx.fill();

            let sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sat.size * 3);
            sg.addColorStop(0, 'rgba(232,180,216,0.25)');
            sg.addColorStop(1, 'rgba(232,180,216,0)');
            ctx.fillStyle = sg;
            ctx.beginPath();
            ctx.arc(sx, sy, sat.size * 3, 0, 6.2832);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    // ==================== PLANET RENDERING ====================
    const planetConfigs = [
        { name: 'Mercurio',   base: [255,154,158], accent: [254,207,239], ring: null,         moons: 0, size: isMobile ? 55 : 90 },
        { name: 'Etérea',     base: [161,140,209], accent: [251,194,235], ring: [200,170,240], moons: 1, size: isMobile ? 65 : 110 },
        { name: 'Rosalina',   base: [255,142,155], accent: [155,89,182],  ring: null,         moons: 1, size: isMobile ? 60 : 100 },
        { name: 'Esperanza',  base: [180,220,140], accent: [150,230,161], ring: [180,230,160], moons: 0, size: isMobile ? 52 : 85 },
        { name: 'Serenidad',  base: [132,250,176], accent: [143,211,244], ring: null,         moons: 1, size: isMobile ? 58 : 95 },
        { name: 'Pasión',     base: [252,203,144], accent: [213,126,235], ring: [240,180,200], moons: 1, size: isMobile ? 70 : 120 },
        { name: 'Venus',      base: [224,195,252], accent: [142,197,252], ring: [210,190,255], moons: 2, size: isMobile ? 75 : 130 },
    ];

    function drawPlanet(cfg, px, py, alpha, t) {
        if (alpha <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        let r = cfg.size;
        let wobble = Math.sin(t * 1.5) * 4;
        let pyW = py + wobble;

        // Atmosphere
        for (let i = 3; i > 0; i--) {
            let ar = r + i * (isMobile ? 15 : 22);
            let ag = ctx.createRadialGradient(px, pyW, r * 0.5, px, pyW, ar);
            ag.addColorStop(0, `rgba(${cfg.base[0]},${cfg.base[1]},${cfg.base[2]},0)`);
            ag.addColorStop(0.7, `rgba(${cfg.base[0]},${cfg.base[1]},${cfg.base[2]},${0.025 * alpha})`);
            ag.addColorStop(1, `rgba(${cfg.base[0]},${cfg.base[1]},${cfg.base[2]},0)`);
            ctx.fillStyle = ag;
            ctx.beginPath();
            ctx.arc(px, pyW, ar, 0, 6.2832);
            ctx.fill();
        }

        // Body
        let bg = ctx.createRadialGradient(px - r * 0.3, pyW - r * 0.3, r * 0.1, px, pyW, r);
        bg.addColorStop(0, `rgba(${cfg.accent[0]},${cfg.accent[1]},${cfg.accent[2]},1)`);
        bg.addColorStop(0.6, `rgba(${cfg.base[0]},${cfg.base[1]},${cfg.base[2]},1)`);
        bg.addColorStop(1, `rgba(${Math.floor(cfg.base[0]*0.3)},${Math.floor(cfg.base[1]*0.3)},${Math.floor(cfg.base[2]*0.3)},1)`);
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(px, pyW, r, 0, 6.2832);
        ctx.fill();

        // Surface bands
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, pyW, r, 0, 6.2832);
        ctx.clip();
        for (let b = 0; b < 3; b++) {
            let by2 = pyW - r + (b + 0.5) * (r * 2 / 3) + Math.sin(t + b) * 2;
            ctx.fillStyle = `rgba(${cfg.accent[0]},${cfg.accent[1]},${cfg.accent[2]},0.12)`;
            ctx.fillRect(px - r, by2, r * 2, r * 0.12);
        }
        ctx.restore();

        // Shadow
        let sg = ctx.createRadialGradient(px + r * 0.4, pyW + r * 0.2, r * 0.2, px + r * 0.3, pyW, r * 1.1);
        sg.addColorStop(0, 'rgba(0,0,0,0)');
        sg.addColorStop(0.6, 'rgba(0,0,0,0.1)');
        sg.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(px, pyW, r, 0, 6.2832);
        ctx.fill();

        // Rings
        if (cfg.ring) {
            ctx.save();
            ctx.translate(px, pyW);
            ctx.scale(1, 0.3);
            ctx.rotate(0.2);
            let rc = cfg.ring;
            for (let ri = 0; ri < 3; ri++) {
                ctx.beginPath();
                ctx.arc(0, 0, r * 1.35 + ri * 10, 0, 6.2832);
                ctx.strokeStyle = `rgba(${rc[0]},${rc[1]},${rc[2]},${0.35 - ri * 0.1})`;
                ctx.lineWidth = 3 - ri;
                ctx.stroke();
            }
            ctx.restore();
        }

        // Moons
        for (let m = 0; m < cfg.moons; m++) {
            let md = r * 1.6 + m * 25;
            let ma = t * (0.7 - m * 0.2) + m * 2;
            let mx = px + Math.cos(ma) * md;
            let my = pyW + Math.sin(ma) * md * 0.35;
            let ms = 3 + m * 1.5;

            // orbit
            ctx.beginPath();
            ctx.ellipse(px, pyW, md, md * 0.35, 0, 0, 6.2832);
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // moon
            let mg = ctx.createRadialGradient(mx - 1, my - 1, 0, mx, my, ms);
            mg.addColorStop(0, '#fff');
            mg.addColorStop(1, `rgba(${cfg.accent[0]},${cfg.accent[1]},${cfg.accent[2]},0.7)`);
            ctx.fillStyle = mg;
            ctx.beginPath();
            ctx.arc(mx, my, ms, 0, 6.2832);
            ctx.fill();
        }

        ctx.restore();
    }

    // ==================== WORMHOLE EFFECT ====================
    function drawWormhole(progress) {
        if (progress <= 0.01) return;
        ctx.save();
        ctx.translate(cx, cy);

        let ringCount = isMobile ? 18 : 28;
        let maxR = Math.max(W, H) * 0.7;
        for (let i = 0; i < ringCount; i++) {
            let t2 = (i / ringCount + scene.time * 0.5) % 1;
            let radius = t2 * maxR * progress;
            let alpha = (1 - t2) * 0.35 * progress;
            let hue = 300 + i * 4;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 6.2832);
            ctx.strokeStyle = `hsla(${hue},80%,70%,${alpha})`;
            ctx.lineWidth = 1.5 + (1 - t2) * 3;
            ctx.stroke();
        }

        // Core
        let cr = 60 * progress;
        let cg = ctx.createRadialGradient(0, 0, 0, 0, 0, cr);
        cg.addColorStop(0, `rgba(255,255,255,${0.7 * progress})`);
        cg.addColorStop(0.3, `rgba(255,142,155,${0.35 * progress})`);
        cg.addColorStop(1, 'rgba(155,89,182,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(0, 0, cr, 0, 6.2832);
        ctx.fill();

        // Swirling particles
        let pCount = isMobile ? 20 : 35;
        for (let p = 0; p < pCount; p++) {
            let angle = (p / pCount) * 6.2832 + scene.time * 3;
            let dist = (30 + (p / pCount) * maxR * 0.4) * progress;
            let px2 = Math.cos(angle) * dist;
            let py2 = Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(px2, py2, rand(0.8, 2.5), 0, 6.2832);
            ctx.fillStyle = `rgba(255,200,220,${rand(0.1, 0.4) * progress})`;
            ctx.fill();
        }

        ctx.restore();
    }

    // ==================== MUSIC (Web Audio API) ====================
    let audioCtx = null;
    let musicStarted = false;

    function startMusic() {
        if (musicStarted) return;
        musicStarted = true;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { return; }

        // Resume for mobile
        if (audioCtx.state === 'suspended') audioCtx.resume();

        let master = audioCtx.createGain();
        master.gain.setValueAtTime(0, audioCtx.currentTime);
        master.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 5);
        master.connect(audioCtx.destination);

        // Simple delay reverb
        let delay = audioCtx.createDelay(0.5);
        delay.delayTime.value = 0.35;
        let fb = audioCtx.createGain();
        fb.gain.value = 0.25;
        let lpf = audioCtx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 1800;
        delay.connect(lpf);
        lpf.connect(fb);
        fb.connect(delay);
        delay.connect(master);

        // Pad
        function pad(freq, detune) {
            let o = audioCtx.createOscillator();
            o.type = 'sine';
            o.frequency.value = freq;
            o.detune.value = detune;
            let g = audioCtx.createGain();
            g.gain.value = 0.045;
            let f = audioCtx.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.value = 700;
            o.connect(f);
            f.connect(g);
            g.connect(master);
            g.connect(delay);
            o.start();
        }

        pad(130.81, 0);
        pad(164.81, 5);
        pad(196.00, -5);
        pad(246.94, 3);

        // Melody
        const notes = [
            523.25, 659.25, 783.99, 987.77,
            880.00, 783.99, 659.25, 523.25,
            493.88, 587.33, 698.46, 880.00,
            783.99, 659.25, 523.25, 493.88,
        ];
        let ni = 0;

        function playNote() {
            if (!audioCtx || audioCtx.state === 'closed') return;
            let o = audioCtx.createOscillator();
            o.type = 'sine';
            o.frequency.value = notes[ni % notes.length];
            let g = audioCtx.createGain();
            let now = audioCtx.currentTime;
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.06, now + 0.15);
            g.gain.linearRampToValueAtTime(0.03, now + 1.5);
            g.gain.linearRampToValueAtTime(0, now + 3);
            let f = audioCtx.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.value = 1400;
            o.connect(f);
            f.connect(g);
            g.connect(master);
            g.connect(delay);
            o.start(now);
            o.stop(now + 3.5);
            ni++;
        }

        setInterval(playNote, 2200);
        setTimeout(playNote, 100);
    }

    // ==================== JOURNEY DATA ====================
    const reasons = [
        { title: 'Tu Humildad', text: 'Tu sencillez me cautivó desde el primer momento. En un mundo lleno de apariencias, tú eres real, genuina, y eso te hace infinitamente hermosa.' },
        { title: 'Tu Lealtad', text: 'Te quedaste a mi lado a pesar de todo. Cuando el mundo se puso difícil, tú no soltaste mi mano. Eso es algo que jamás olvidaré.' },
        { title: 'El Equipo que Somos', text: 'Juntos somos invencibles. No importa lo que venga, sé que contigo a mi lado puedo enfrentar cualquier cosa. Somos el mejor equipo del universo.' },
        { title: 'Tu Sonrisa', text: 'Esa sonrisa tuya tiene el poder de borrar cualquier mal día. Es mi refugio, mi paz, mi lugar favorito en todo el cosmos.' },
        { title: 'Tu Fuerza', text: 'Admiro profundamente tu valentía y la fortaleza con la que enfrentas cada desafío. Me inspiras cada día a ser una mejor persona por ti y para ti.' },
        { title: 'Tu Ternura', text: 'Esos pequeños detalles que tienes conmigo, esas palabras dulces, esas caricias... hacen que cada segundo a tu lado sea mágico e irrepetible.' },
        { title: 'Lo Especial que Eres', text: 'No existe nadie como tú en todo el universo, y lo digo con la certeza de haberlo recorrido entero buscándote. Eres única, eres mi todo.' },
    ];

    // ==================== SCENE SEQUENCER ====================
    const introScreen = document.getElementById('intro');
    const reasonOverlay = document.getElementById('reason-overlay');
    const wormholeTextEl = document.getElementById('wormhole-text');
    const outroScreen = document.getElementById('outro');
    const elNum = document.getElementById('reason-number');
    const elPlanet = document.getElementById('reason-planet-name');
    const elTitle = document.getElementById('reason-title');
    const elText = document.getElementById('reason-text');
    const startBtn = document.getElementById('startBtn');

    // Support both click and touch
    startBtn.addEventListener('click', handleStart);
    startBtn.addEventListener('touchend', function (e) {
        e.preventDefault();
        handleStart();
    });

    function handleStart() {
        if (scene.phase !== 'idle') return;
        scene.phase = 'starting';
        startMusic();
        introScreen.classList.remove('active');
        setTimeout(startJourney, 2000);
    }

    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function animateWormhole(fadeIn) {
        return new Promise(resolve => {
            let start = performance.now();
            let duration = fadeIn ? 1500 : 1000;
            function tick() {
                let elapsed = performance.now() - start;
                let t = Math.min(1, elapsed / duration);
                scene.wormholeProgress = fadeIn ? t : (1 - t);
                if (elapsed < duration) requestAnimationFrame(tick);
                else resolve();
            }
            tick();
        });
    }

    async function startJourney() {
        for (let i = 0; i < reasons.length; i++) {
            // Wormhole IN
            scene.phase = 'wormhole';
            scene.targetStarSpeed = 6;
            wormholeTextEl.classList.add('active');
            await animateWormhole(true);
            await wait(800);
            wormholeTextEl.classList.remove('active');

            // Wormhole OUT
            await animateWormhole(false);

            // Show planet
            scene.phase = 'planet';
            scene.targetStarSpeed = 0.3;
            scene.planetConfig = planetConfigs[i];
            scene.targetPlanetAlpha = 1;
            await wait(1500);

            // Show text
            elNum.textContent = String(i + 1).padStart(2, '0');
            elPlanet.textContent = 'Planeta ' + planetConfigs[i].name;
            elTitle.textContent = reasons[i].title;
            elText.textContent = reasons[i].text;
            reasonOverlay.classList.add('active');

            await wait(7000);

            // Hide text
            reasonOverlay.classList.remove('active');
            await wait(1000);

            // Hide planet
            scene.targetPlanetAlpha = 0;
            await wait(1200);
        }

        // === WARP OUT ===
        scene.phase = 'warp';
        scene.warpActive = true;
        scene.targetStarSpeed = 55;
        scene.sunAlpha = 0;
        scene.nebulaAlpha = 0;
        await wait(4000);

        // Slow & reveal
        scene.targetStarSpeed = 0.8;
        scene.warpActive = false;
        await wait(1500);

        outroScreen.classList.add('active');
        scene.nebulaAlpha = 0.08;
    }

    // ==================== MAIN LOOP ====================
    let lastT = 0;

    function render(ts) {
        let dt = Math.min((ts - lastT) / 1000, 0.05); // cap dt to avoid jumps
        lastT = ts;
        scene.time += dt;

        scene.starSpeed = lerp(scene.starSpeed, scene.targetStarSpeed, 0.025);
        scene.planetAlpha = lerp(scene.planetAlpha, scene.targetPlanetAlpha, 0.035);

        ctx.fillStyle = '#020108';
        ctx.fillRect(0, 0, W, H);

        drawNebulae();
        drawSun();
        updateAndDrawStars();
        drawDust();
        drawShootingStars();
        drawSatellites();

        if (scene.planetConfig && scene.planetAlpha > 0.01) {
            let planetY = isMobile ? cy * 0.55 : cy * 0.65;
            drawPlanet(scene.planetConfig, cx, planetY, scene.planetAlpha, scene.time);
        }

        if (scene.wormholeProgress > 0.01) {
            drawWormhole(scene.wormholeProgress);
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

})();
