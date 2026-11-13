/* Adapted from ScrollCraft's MIT-licensed canvas frame engine.
   Copyright (c) 2026 ScrollCraft. See assets/scrollcraft/LICENSE.txt.
   Oaktown adaptation: section-local progress, bounded cache, motion preferences,
   request throttling and teardown for client-side navigation. */
(() => {
  'use strict';
  window.OaktownScrollcraft = {
    mount(canvas) {
      const ctx = canvas?.getContext('2d');
      if (!ctx) return { render() {}, destroy() {} };
      const cache = new Map();
      const failed = new Set();
      let disposed = false, current = 0, directory = '', generation = 0;
      let pending = 0, wanted = [], animate = false, width = 0, height = 0;
      function draw(index) {
        const img = cache.get(index);
        if (!img?.naturalWidth || disposed) return;
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
        canvas.dataset.frame = String(index);
      }
      function pump() {
        if (disposed) return;
        while (pending < 3 && wanted.length) {
          const index = wanted.shift();
          if (cache.has(index) || failed.has(index)) continue;
          const img = new Image(), epoch = generation;
          cache.set(index, img);
          pending++;
          const settle = ok => {
            if (disposed || epoch !== generation) return;
            pending--;
            if (!ok) { cache.delete(index); failed.add(index); }
            if (ok && index === current) draw(index);
            for (const [key, value] of cache) {
              if (cache.size <= 8) break;
              if (key !== current && value.complete) cache.delete(key);
            }
            pump();
          };
          img.onload = () => settle(true);
          img.onerror = () => settle(false);
          img.src = `${directory}/frame_${String(index).padStart(4, '0')}.jpg`;
        }
      }
      return {
        render(progress, motion) {
          if (disposed) return;
          const portrait = matchMedia('(max-width: 850px)').matches;
          const nextDir = `/assets/scrollcraft/${portrait ? 'mobile' : 'desktop'}`;
          if (nextDir !== directory) {
            generation++; cache.clear(); failed.clear(); pending = 0; directory = nextDir;
          }
          animate = motion && !portrait && !navigator.connection?.saveData;
          current = animate ? Math.round(Math.max(0, Math.min(1, progress)) * 47) : 0;
          const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.5);
          if (width !== rect.width || height !== rect.height || canvas.width !== Math.round(rect.width * dpr)) {
            width = rect.width; height = rect.height;
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }
          draw(current);
          wanted = animate ? [current, Math.min(47, current + 1), Math.max(0, current - 1)] : [0];
          pump();
        },
        destroy() { disposed = true; generation++; wanted = []; cache.clear(); failed.clear(); }
      };
    }
  };
})();
