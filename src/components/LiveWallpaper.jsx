import React, { useEffect, useRef } from 'react';

export const LiveWallpaper = ({ type = 'video_rain' }) => {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);
  const isVideoRain = type === 'video_rain' || type === 'rain';

  useEffect(() => {
    if (type === 'off' || isVideoRain) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initScene();
    };

    window.addEventListener('resize', handleResize);

    // ==========================================
    // SCENE 1: LUSH FOREST CANOPY & DRIFTING LEAVES ('nature')
    // ==========================================
    let leaves = [];
    let sunbeams = [];

    const initNature = () => {
      // Drifting leaves
      leaves = Array.from({ length: 35 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 8 + Math.random() * 14,
        speedY: 0.6 + Math.random() * 1.0,
        speedX: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.02,
        oscillationSpeed: 0.02 + Math.random() * 0.02,
        oscillationAmp: 1.5 + Math.random() * 2,
        oscillationOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 
          ? 'rgba(52, 211, 153, ' // Emerald leaf
          : 'rgba(251, 191, 36, ', // Golden amber leaf
        opacity: 0.25 + Math.random() * 0.35,
      }));

      // Soft sunbeams filtering through tree canopy
      sunbeams = [
        { angle: 0.4, x: width * 0.2, width: 140, phase: 0 },
        { angle: 0.45, x: width * 0.5, width: 180, phase: 2 },
        { angle: 0.38, x: width * 0.8, width: 130, phase: 4 },
      ];
    };

    // ==========================================
    // SCENE 2: FOREST STREAM & RIPPLES ('stream')
    // ==========================================
    let streamRipples = [];
    let floatingFoliage = [];

    const initStream = () => {
      streamRipples = Array.from({ length: 18 }, () => ({
        x: Math.random() * width,
        y: height * 0.4 + Math.random() * (height * 0.6),
        radius: 10 + Math.random() * 40,
        maxRadius: 60 + Math.random() * 60,
        speed: 0.4 + Math.random() * 0.5,
        opacity: 0.15 + Math.random() * 0.2,
      }));

      floatingFoliage = Array.from({ length: 20 }, () => ({
        x: Math.random() * width,
        y: height * 0.45 + Math.random() * (height * 0.55),
        size: 7 + Math.random() * 11,
        speedX: 0.8 + Math.random() * 1.2,
        wobble: Math.random() * Math.PI * 2,
      }));
    };

    // ==========================================
    // SCENE 3: RAIN IN NATURE ('rain')
    // ==========================================
    let natureRain = [];
    let mistRings = [];

    const initRain = () => {
      natureRain = Array.from({ length: 110 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 22 + Math.random() * 28,
        speed: 7 + Math.random() * 10,
        opacity: 0.2 + Math.random() * 0.35,
      }));

      mistRings = Array.from({ length: 15 }, () => ({
        x: Math.random() * width,
        y: height * 0.75 + Math.random() * (height * 0.25),
        radius: 1,
        maxRadius: 25 + Math.random() * 30,
        opacity: 0.3,
      }));
    };

    // ==========================================
    // SCENE 4: MOUNTAIN MIST ('mountain')
    // ==========================================
    let mountainMistTime = 0;

    // ==========================================
    // SCENE 5: TWILIGHT WOODS WITH FIREFLIES ('fireflies')
    // ==========================================
    let fireflies = [];
    const initFireflies = () => {
      fireflies = Array.from({ length: 45 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.5 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.35,
        angle: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.3,
        glowPulse: Math.random() * Math.PI * 2,
      }));
    };

    const initScene = () => {
      if (type === 'nature') initNature();
      else if (type === 'stream') initStream();
      else if (type === 'rain') initRain();
      else if (type === 'fireflies') initFireflies();
    };

    initScene();

    // Helper: draw single organic leaf
    const drawLeaf = (x, y, size, angle, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size * 0.6, 0, 0, size);
      ctx.quadraticCurveTo(-size * 0.6, 0, 0, -size);
      ctx.fill();
      ctx.restore();
    };

    // Helper: draw silhouetted tree branch canopy
    const drawCanopySilhouette = () => {
      ctx.fillStyle = 'rgba(6, 26, 17, 0.45)';
      ctx.beginPath();
      // Top left foliage
      ctx.arc(0, 0, width * 0.3, 0, Math.PI * 0.5);
      ctx.fill();

      // Top right foliage
      ctx.beginPath();
      ctx.arc(width, 0, width * 0.28, Math.PI * 0.5, Math.PI);
      ctx.fill();
    };

    let tick = 0;

    // MAIN ANIMATION LOOP
    const render = () => {
      if (document.hidden) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      tick += 0.015;

      if (type === 'nature') {
        // --- Lush Sunlit Forest & Drifting Leaves ---
        
        // 1. Soft swaying sunbeams / light cones
        sunbeams.forEach((beam) => {
          const sway = Math.sin(tick * 0.5 + beam.phase) * 35;
          const beamX = beam.x + sway;
          const grad = ctx.createLinearGradient(beamX, 0, beamX + 180, height);
          grad.addColorStop(0, 'rgba(253, 224, 71, 0.05)');
          grad.addColorStop(0.5, 'rgba(52, 211, 153, 0.04)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(beamX - beam.width * 0.3, 0);
          ctx.lineTo(beamX + beam.width * 0.3, 0);
          ctx.lineTo(beamX + beam.width * 1.5, height);
          ctx.lineTo(beamX - beam.width * 0.5, height);
          ctx.closePath();
          ctx.fill();
        });

        // 2. Silhouetted canopy
        drawCanopySilhouette();

        // 3. Drifting falling leaves
        leaves.forEach((l) => {
          l.angle += l.angularSpeed;
          const sway = Math.sin(tick * l.oscillationSpeed * 60 + l.oscillationOffset) * l.oscillationAmp;
          l.x += l.speedX + sway;
          l.y += l.speedY;

          drawLeaf(l.x, l.y, l.size, l.angle, `${l.color}${l.opacity})`);

          if (l.y > height + 20) {
            l.y = -20;
            l.x = Math.random() * width;
          }
          if (l.x < -20) l.x = width + 20;
          if (l.x > width + 20) l.x = -20;
        });

        // 4. Ground mist
        const mistGrad = ctx.createLinearGradient(0, height * 0.75, 0, height);
        mistGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
        mistGrad.addColorStop(1, 'rgba(6, 78, 59, 0.15)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, height * 0.75, width, height * 0.25);

      } else if (type === 'stream') {
        // --- Forest Stream & Flowing Water ---
        drawCanopySilhouette();

        // Gentle water flow waves
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const yBase = height * 0.45 + i * 65;
          ctx.beginPath();
          ctx.moveTo(0, yBase);
          for (let x = 0; x <= width; x += 30) {
            const waveY = yBase + Math.sin(x * 0.005 + tick * 1.2 + i) * 12;
            ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }

        // Water ripples
        streamRipples.forEach((r) => {
          ctx.strokeStyle = `rgba(125, 211, 252, ${r.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius * 1.6, r.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.stroke();

          r.radius += r.speed;
          r.opacity *= 0.985;

          if (r.radius > r.maxRadius || r.opacity < 0.01) {
            r.x = Math.random() * width;
            r.y = height * 0.4 + Math.random() * (height * 0.6);
            r.radius = 8;
            r.opacity = 0.18 + Math.random() * 0.15;
          }
        });

        // Floating leaves on stream surface
        floatingFoliage.forEach((f) => {
          f.x += f.speedX;
          f.wobble += 0.03;
          const wobbleY = Math.sin(f.wobble) * 3;

          drawLeaf(f.x, f.y + wobbleY, f.size, f.wobble * 0.4, 'rgba(52, 211, 153, 0.4)');

          if (f.x > width + 30) {
            f.x = -30;
            f.y = height * 0.45 + Math.random() * (height * 0.55);
          }
        });

      } else if (type === 'rain') {
        // --- Rain in Misty Nature ---
        drawCanopySilhouette();

        // Rain falling through nature
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.lineCap = 'round';
        ctx.lineWidth = 1;

        natureRain.forEach((d) => {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 2, d.y + d.length);
          ctx.stroke();

          d.y += d.speed;
          d.x -= 0.4;

          if (d.y > height) {
            d.y = -d.length;
            d.x = Math.random() * (width + 40);
          }
        });

        // Soft ground mist rings from rain
        mistRings.forEach((m) => {
          ctx.strokeStyle = `rgba(224, 242, 254, ${m.opacity})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(m.x, m.y, m.radius * 1.8, m.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();

          m.radius += 0.6;
          m.opacity *= 0.96;

          if (m.radius > m.maxRadius || m.opacity < 0.01) {
            m.x = Math.random() * width;
            m.y = height * 0.75 + Math.random() * (height * 0.25);
            m.radius = 2;
            m.opacity = 0.25 + Math.random() * 0.15;
          }
        });

      } else if (type === 'mountain') {
        // --- Mountain Mist & Twilight Ridges ---
        mountainMistTime += 0.003;

        // Layered mountain silhouettes
        const ridges = [
          { yBase: height * 0.50, color: 'rgba(30, 41, 59, 0.4)', amp: 65, freq: 0.0012 },
          { yBase: height * 0.65, color: 'rgba(15, 23, 42, 0.65)', amp: 90, freq: 0.0016 },
          { yBase: height * 0.80, color: 'rgba(6, 15, 25, 0.85)', amp: 110, freq: 0.0020 },
        ];

        ridges.forEach((r, idx) => {
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 20) {
            const y = r.yBase + Math.sin(x * r.freq + idx * 2) * r.amp + Math.cos(x * 0.0008) * (r.amp * 0.4);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();

          // Drifting fog between ridges
          const fogGrad = ctx.createLinearGradient(0, r.yBase - 40, 0, r.yBase + 50);
          fogGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          fogGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.06)');
          fogGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = fogGrad;
          ctx.fillRect(0, r.yBase - 30 + Math.sin(mountainMistTime + idx) * 15, width, 70);
        });

      } else if (type === 'fireflies') {
        // --- Twilight Woods with Fireflies ---
        drawCanopySilhouette();

        fireflies.forEach((ff) => {
          ff.glowPulse += 0.025;
          const alpha = (Math.sin(ff.glowPulse) + 1) * 0.4 + 0.1;

          // Warm aura
          const aura = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, ff.r * 6);
          aura.addColorStop(0, `rgba(251, 191, 36, ${alpha * 0.5})`);
          aura.addColorStop(1, 'rgba(251, 191, 36, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(ff.x, ff.y, ff.r * 6, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
          ctx.beginPath();
          ctx.arc(ff.x, ff.y, ff.r, 0, Math.PI * 2);
          ctx.fill();

          ff.angle += (Math.random() - 0.5) * 0.1;
          ff.x += Math.cos(ff.angle) * ff.speed + ff.vx;
          ff.y += Math.sin(ff.angle) * ff.speed + ff.vy;

          if (ff.x < -10) ff.x = width + 10;
          if (ff.x > width + 10) ff.x = -10;
          if (ff.y < -10) ff.y = height + 10;
          if (ff.y > height + 10) ff.y = -10;
        });
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [type]);

  if (type === 'off') return null;

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const posterUrl = `${baseUrl}rain_scene_preview.jpg`;
  const videoUrl = `${baseUrl}rain_nature_loop.mp4`;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {isVideoRain ? (
        <video
          key="youtube-rain-video-loop"
          autoPlay
          loop
          muted
          playsInline
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover scale-[1.02] filter brightness-90 contrast-[1.05]"
        >
          <source src={videoUrl} type="video/mp4" />
          <img
            src={posterUrl}
            alt="Misty Rain Nature"
            className="w-full h-full object-cover"
          />
        </video>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full block" />
      )}
      {/* Darkening atmospheric vignette overlay for text contrast & eye comfort */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/70 pointer-events-none" />
    </div>
  );
};
