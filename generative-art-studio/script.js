(() => {
    "use strict";
    const canvas = document.getElementById("artCanvas");
    const ctx = canvas.getContext("2d");
    const portraitCanvas = document.getElementById("portraitCanvas");

    // UI
    const toggleBtn = document.getElementById("togglePanel");
    const panel = document.getElementById("controls");
    const modeSelect = document.getElementById("modeSelect");
    const portraitControls = document.getElementById("portraitControls");
    const imageUpload = document.getElementById("imageUpload");
    const presetGrid = document.getElementById("presetGrid");
    const portraitEffect = document.getElementById("portraitEffect");
    const portraitIntensity = document.getElementById("portraitIntensity");
    const portraitIntensityValue = document.getElementById("portraitIntensityValue");

    const speedSlider = document.getElementById("speedSlider");
    const particleSlider = document.getElementById("particleSlider");
    const sizeSlider = document.getElementById("sizeSlider");
    const trailSlider = document.getElementById("trailSlider");
    const depthSlider = document.getElementById("depthSlider");
    const kaleidoSlider = document.getElementById("kaleidoSlider");
    const connectSlider = document.getElementById("connectSlider");
    const paletteSelect = document.getElementById("paletteSelect");
    const customColorsDiv = document.getElementById("customColors");
    const customColorInputs = [
        document.getElementById("customColor1"),
        document.getElementById("customColor2"),
        document.getElementById("customColor3"),
        document.getElementById("customColor4"),
        document.getElementById("customColor5"),
    ];
    const bgColorInput = document.getElementById("bgColor");
    const blendSelect = document.getElementById("blendSelect");
    const depthGroup = document.getElementById("depthGroup");
    const kaleidoGroup = document.getElementById("kaleidoGroup");

    const randomBtn = document.getElementById("randomBtn");
    const clearBtn = document.getElementById("clearBtn");
    const saveBtn = document.getElementById("saveBtn");
    const saveJpgBtn = document.getElementById("saveJpgBtn");
    const recordGifBtn = document.getElementById("recordGifBtn");
    const recordVideoBtn = document.getElementById("recordVideoBtn");
    const recordStatus = document.getElementById("recordStatus");
    const gifProgress = document.getElementById("gifProgress");
    const gifProgressFill = document.getElementById("gifProgressFill");
    const gifProgressText = document.getElementById("gifProgressText");

    const speedValue = document.getElementById("speedValue");
    const particleValue = document.getElementById("particleValue");
    const sizeValue = document.getElementById("sizeValue");
    const trailValue = document.getElementById("trailValue");
    const depthValue = document.getElementById("depthValue");
    const kaleidoValue = document.getElementById("kaleidoValue");
    const connectValue = document.getElementById("connectValue");

    let state = {
        mode: "flowField",
        speed: 50,
        particleCount: 200,
        particleSize: 2,
        trail: 15,
        depth: 8,
        kaleidoSegments: 6,
        connectDist: 120,
        palette: "aurora",
        blend: "source-over",
        bgColor: "#0a0a0f",
        portraitEffect: "particles",
        portraitIntensity: 50,
        mouse: { x: 0, y: 0, active: false },
        width: 0, height: 0,
        hueShift: 0,
    };

    const palettes = {
        aurora: ["#6366f1", "#8b5cf6", "#a78bfa", "#06b6d4", "#22d3ee", "#34d399"],
        sunset: ["#f97316", "#ef4444", "#eab308", "#f59e0b", "#fb923c", "#dc2626"],
        ocean: ["#0ea5e9", "#06b6d4", "#0891b2", "#0284c7", "#2563eb", "#1d4ed8"],
        neon: ["#ff00ff", "#00ffff", "#ffff00", "#00ff00", "#ff0066", "#9900ff"],
        monochrome: ["#f0f0f0", "#c0c0c0", "#a0a0a0", "#808080", "#606060", "#e8e8e8"],
        tropical: ["#ff6b6b", "#feca57", "#48dbfb", "#1dd1a1", "#ff9ff3", "#54a0ff"],
        cyberpunk: ["#ff006a", "#00f0ff", "#ffe600", "#7c3aed", "#ff3b30", "#00ff88"],
        pastel: ["#fecaca", "#fed7aa", "#fef08a", "#bbf7d0", "#bfdbfe", "#e9d5ff"],
        inferno: ["#450a0a", "#dc2626", "#f97316", "#facc15", "#ffffff", "#991b1b"],
        forest: ["#14532d", "#22c55e", "#86efac", "#a3e635", "#facc15", "#92400e"],
        candy: ["#ec4899", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#14b8a6"],
        nord: ["#2e3440", "#88c0d0", "#81a1c1", "#eceff4", "#5e81ac", "#bf616a"],
    };

    function getCustomPalette() {
        return customColorInputs.map(i => i.value);
    }
    function getPaletteColors() {
        if (state.palette === "custom") return getCustomPalette();
        if (state.palette === "rainbow") {
            const cols = [];
            for (let i = 0; i < 6; i++) {
                const h = (state.hueShift + i * 60) % 360;
                cols.push(`hsl(${h}, 100%, 60%)`);
            }
            return cols;
        }
        return palettes[state.palette] || palettes.aurora;
    }
    function hexToRgb(hex) {
        if (hex.startsWith("hsl")) return hex;
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }
    function colorWithAlpha(color, alpha) {
        if (color.startsWith("hsl")) {
            const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
            // convert hsl to hex-ish alpha by using hsla
            return color.replace("hsl", "hsla").replace(")", `, ${alpha})`);
        }
        const { r, g, b } = hexToRgb(color);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    // Resize
    function resize() {
        state.width = canvas.width = window.innerWidth;
        state.height = canvas.height = window.innerHeight;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        if (state.mode === "flowField") initFlowField();
        if (state.mode === "constellation") initConstellation();
        if (state.mode === "orbits") initOrbits();
        if (state.mode === "waves") initWaves();
        if (portraitImg) cachePortraitData();
    }
    window.addEventListener("resize", resize);

    // Mouse / Touch
    function updateMouse(x, y) { state.mouse.x = x; state.mouse.y = y; state.mouse.active = true; }
    canvas.addEventListener("mousemove", e => updateMouse(e.clientX, e.clientY));
    canvas.addEventListener("mouseleave", () => state.mouse.active = false);
    canvas.addEventListener("touchmove", e => {
        e.preventDefault();
        if (e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    canvas.addEventListener("touchstart", e => {
        if (e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    });
    canvas.addEventListener("dblclick", () => burstParticles());
    canvas.addEventListener("click", e => {
        if (state.mode === "reactiveParticles" || state.mode === "portrait") {
            for (let i = 0; i < 12; i++) spawnBurst(e.clientX, e.clientY);
        }
    });

    // Simplex
    const SimplexNoise = (() => {
        const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
        const grad3 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
        const perm = new Uint8Array(512);
        const seed = () => {
            const p = new Uint8Array(256);
            for (let i = 0; i < 256; i++) p[i]=i;
            for (let i=255;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [p[i],p[j]]=[p[j],p[i]]; }
            for(let i=0;i<512;i++) perm[i]=p[i & 255];
        }; seed();
        return { seed, noise2D(xin, yin){
            let n0,n1,n2;
            const s=(xin+yin)*F2, i=Math.floor(xin+s), j=Math.floor(yin+s);
            const t=(i+j)*G2, x0=xin-(i-t), y0=yin-(j-t);
            let i1,j1; if(x0>y0){i1=1;j1=0;}else{i1=0;j1=1;}
            const x1=x0-i1+G2, y1=y0-j1+G2, x2=x0-1+2*G2, y2=y0-1+2*G2;
            const ii=i&255, jj=j&255;
            let t0=0.5-x0*x0-y0*y0; if(t0<0) n0=0; else { t0*=t0; const gi=perm[ii+perm[jj]]%12; n0=t0*t0*(grad3[gi][0]*x0+grad3[gi][1]*y0);}
            let t1=0.5-x1*x1-y1*y1; if(t1<0) n1=0; else { t1*=t1; const gi=perm[ii+i1+perm[jj+j1]]%12; n1=t1*t1*(grad3[gi][0]*x1+grad3[gi][1]*y1);}
            let t2=0.5-x2*x2-y2*y2; if(t2<0) n2=0; else { t2*=t2; const gi=perm[ii+1+perm[jj+1]]%12; n2=t2*t2*(grad3[gi][0]*x2+grad3[gi][1]*y2);}
            return 70*(n0+n1+n2);
        }};
    })();

    // Helpers
    function getTrailAlpha() {
        // trail 0 = no trail (clear black each frame), 100 = max trail (almost no fade)
        const t = state.trail / 100; // 0..1
        return 0.5 * (1 - t * 0.95); // 0.5 down to ~0.025
    }
    function ensureCount(arr, target, factory) {
        while(arr.length < target) arr.push(factory());
        while(arr.length > target) arr.pop();
    }

    // === 1 FLOW FIELD ===
    let flowParticles=[]; let flowZOff=0; const FLOW_SCALE=0.005;
    function initFlowField(){
        flowParticles=[]; flowZOff=0;
        for(let i=0;i<state.particleCount;i++) flowParticles.push({
            x:Math.random()*state.width, y:Math.random()*state.height,
            vx:0,vy:0, color: randColor(), life: Math.random()*80
        });
    }
    function randColor(){ const c=getPaletteColors(); return c[Math.floor(Math.random()*c.length)]; }
    function drawFlowField(){
        const colors=getPaletteColors();
        const speedFactor=state.speed/50;
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=`rgba(${hexToBg(state.bgColor)}, ${getTrailAlpha()})`;
        // need rgb of bg
        ctx.fillRect(0,0,state.width,state.height);
        ctx.globalCompositeOperation=state.blend;
        flowZOff+=0.003*speedFactor;
        if(state.palette==="rainbow") state.hueShift=(state.hueShift+0.6*speedFactor)%360;
        ensureCount(flowParticles, state.particleCount, ()=>({x:Math.random()*state.width,y:Math.random()*state.height,vx:0,vy:0,color:randColor(),life:0}));
        for(const p of flowParticles){
            const angle=SimplexNoise.noise2D(p.x*FLOW_SCALE, p.y*FLOW_SCALE+flowZOff)*Math.PI*4;
            p.vx=Math.cos(angle)*speedFactor*2.2;
            p.vy=Math.sin(angle)*speedFactor*2.2;
            p.x+=p.vx; p.y+=p.vy;
            p.life+=0.6*speedFactor;
            // attract to mouse slightly
            if(state.mouse.active){
                const dx=state.mouse.x-p.x, dy=state.mouse.y-p.y, d=Math.hypot(dx,dy);
                if(d<120){ p.vx+=dx*0.0008*speedFactor; p.vy+=dy*0.0008*speedFactor; }
            }
            const alpha=Math.min(1, p.life/40);
            ctx.beginPath();
            ctx.arc(p.x,p.y, state.particleSize, 0, Math.PI*2);
            ctx.fillStyle=colorWithAlpha(p.color, alpha);
            ctx.fill();
            if(p.x<-20||p.x>state.width+20||p.y<-20||p.y>state.height+20){
                p.x=Math.random()*state.width; p.y=Math.random()*state.height; p.life=0; p.color=randColor();
            }
            // occasionally cycle color for rainbow
            if(state.palette==="rainbow" && Math.random()<0.02) p.color=randColor();
        }
    }

    // === 2 REACTIVE ===
    let reactiveParticles=[];
    function initReactiveParticles(){
        reactiveParticles=[];
        for(let i=0;i<state.particleCount;i++) reactiveParticles.push({
            x:Math.random()*state.width, y:Math.random()*state.height,
            vx:0,vy:0, size: 1+Math.random()*3, color: randColor(),
            baseX:Math.random()*state.width, baseY:Math.random()*state.height
        });
    }
    function drawReactiveParticles(){
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=`rgba(${hexToBg(state.bgColor)}, ${getTrailAlpha()+0.08})`;
        ctx.fillRect(0,0,state.width,state.height);
        ctx.globalCompositeOperation=state.blend;
        if(state.palette==="rainbow") state.hueShift=(state.hueShift+0.7)%360;
        const speedFactor=state.speed/50;
        const mouseRadius=140+state.particleSize*6;
        ensureCount(reactiveParticles, state.particleCount, ()=>({
            x:Math.random()*state.width,y:Math.random()*state.height,vx:0,vy:0,size:1+Math.random()*3,color:randColor(),baseX:Math.random()*state.width,baseY:Math.random()*state.height
        }));
        for(const p of reactiveParticles){
            if(state.mouse.active){
                const dx=p.x-state.mouse.x, dy=p.y-state.mouse.y, dist=Math.hypot(dx,dy);
                if(dist<mouseRadius){
                    const force=(mouseRadius-dist)/mouseRadius;
                    const angle=Math.atan2(dy,dx);
                    p.vx+=Math.cos(angle)*force*4*speedFactor;
                    p.vy+=Math.sin(angle)*force*4*speedFactor;
                }
            }
            p.vx+=(p.baseX-p.x)*0.005*speedFactor;
            p.vy+=(p.baseY-p.y)*0.005*speedFactor;
            p.vx*=0.94; p.vy*=0.94;
            p.x+=p.vx; p.y+=p.vy;
            const speed=Math.hypot(p.vx,p.vy);
            const alpha=Math.min(1, 0.35+speed*0.08);
            ctx.beginPath();
            ctx.arc(p.x,p.y, p.size* (state.particleSize/2), 0, Math.PI*2);
            if(state.palette==="rainbow" && Math.random()<0.02) p.color=randColor();
            ctx.fillStyle=colorWithAlpha(p.color, alpha);
            ctx.fill();
        }
    }

    // === 3 FRACTAL TREE ===
    function drawFractalTree(){
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=state.bgColor;
        ctx.fillRect(0,0,state.width,state.height);
        ctx.globalCompositeOperation=state.blend;
        if(state.palette==="rainbow") state.hueShift=(state.hueShift+0.4)%360;
        const colors=getPaletteColors();
        const depth=state.depth;
        const baseLen=Math.min(state.height*0.22, 160);
        const angleOffset=((state.speed/100)*Math.PI)/2.5 + 0.25;
        function branch(x,y,len,angle,d){
            if(d<=0||len<1.5) return;
            const x2=x+Math.cos(angle)*len;
            const y2=y+Math.sin(angle)*len;
            const alpha=0.35+(d/depth)*0.65;
            const colorIdx=(depth-d)%colors.length;
            ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2);
            ctx.strokeStyle=colorWithAlpha(colors[colorIdx], alpha);
            ctx.lineWidth=Math.max(1, d*0.7*(state.particleSize/2));
            ctx.stroke();
            const sway=state.mouse.active ? Math.atan2(state.mouse.y-y2, state.mouse.x-x2)*0.03 : Math.sin(Date.now()*0.001+depth)*0.05;
            const lenDecay=0.68 + Math.sin(state.hueShift*0.01)*0.02;
            branch(x2,y2,len*lenDecay, angle-angleOffset+sway, d-1);
            branch(x2,y2,len*lenDecay, angle+angleOffset+sway, d-1);
        }
        branch(state.width/2, state.height*0.88, baseLen, -Math.PI/2, depth);
    }

    // === 4 CONSTELLATION ===
    let stars=[];
    function initConstellation(){
        stars=[];
        for(let i=0;i<state.particleCount;i++) stars.push({
            x:Math.random()*state.width, y:Math.random()*state.height,
            vx:(Math.random()-0.5)*1.6, vy:(Math.random()-0.5)*1.6,
            size: 1+Math.random()*2.2, color: randColor()
        });
    }
    function drawConstellation(){
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=`rgba(${hexToBg(state.bgColor)}, ${getTrailAlpha()+0.12})`;
        ctx.fillRect(0,0,state.width,state.height);
        ctx.globalCompositeOperation=state.blend;
        const speedFactor=state.speed/50;
        const connectDist=state.connectDist;
        if(state.palette==="rainbow") state.hueShift=(state.hueShift+0.5)%360;
        ensureCount(stars, state.particleCount, ()=>({
            x:Math.random()*state.width,y:Math.random()*state.height,vx:(Math.random()-0.5)*1.6,vy:(Math.random()-0.5)*1.6,size:1+Math.random()*2.2,color:randColor()
        }));
        for(const s of stars){
            s.x+=s.vx*speedFactor; s.y+=s.vy*speedFactor;
            if(s.x<0||s.x>state.width) s.vx*=-1;
            if(s.y<0||s.y>state.height) s.vy*=-1;
            s.x=Math.max(0,Math.min(state.width,s.x));
            s.y=Math.max(0,Math.min(state.height,s.y));
            if(state.palette==="rainbow" && Math.random()<0.01) s.color=randColor();
        }
        // lines
        for(let i=0;i<stars.length;i++){
            for(let j=i+1;j<stars.length;j++){
                const dx=stars[i].x-stars[j].x, dy=stars[i].y-stars[j].y, dist=Math.hypot(dx,dy);
                if(dist<connectDist){
                    const alpha=(1-dist/connectDist)*0.55;
                    ctx.beginPath(); ctx.moveTo(stars[i].x,stars[i].y); ctx.lineTo(stars[j].x,stars[j].y);
                    ctx.strokeStyle=colorWithAlpha(stars[i].color, alpha*0.9);
                    ctx.lineWidth=0.6*(state.particleSize/2);
                    ctx.stroke();
                }
            }
            // mouse connect
            if(state.mouse.active){
                const dx=stars[i].x-state.mouse.x, dy=stars[i].y-state.mouse.y, d=Math.hypot(dx,dy);
                if(d<180){
                    ctx.beginPath(); ctx.moveTo(stars[i].x,stars[i].y); ctx.lineTo(state.mouse.x,state.mouse.y);
                    ctx.strokeStyle=colorWithAlpha(stars[i].color, (1-d/180)*0.5);
                    ctx.lineWidth=0.7; ctx.stroke();
                }
            }
        }
        for(const s of stars){
            ctx.beginPath(); ctx.arc(s.x,s.y, s.size*(state.particleSize/1.8), 0, Math.PI*2);
            ctx.fillStyle=s.color; ctx.fill();
        }
    }

    // === 5 WAVES (Perlin) ===
    let waveOffset=0;
    function initWaves(){ waveOffset=0; }
    function drawWaves(){
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=`rgba(${hexToBg(state.bgColor)}, ${0.18})`;
        ctx.fillRect(0,0,state.width,state.height);
        ctx.globalCompositeOperation=state.blend;
        const colors=getPaletteColors();
        if(state.palette==="rainbow") state.hueShift=(state.hueShift+0.6)%360;
        waveOffset+=0.02*state.speed/50;
        const rows= Math.floor(state.particleCount/25)+4;
        for(let y=0; y<rows; y++){
            const py=(y/rows)*state.height;
            const color=colors[y%colors.length];
            ctx.beginPath();
            ctx.strokeStyle=colorWithAlpha(color, 0.85);
            ctx.lineWidth=1.2*(state.particleSize/2);
            for(let x=0; x<state.width; x+=4){
                const nx=x*0.008, ny=py*0.004+waveOffset;
                const n=SimplexNoise.noise2D(nx, ny);
                const yy=py + n*80 + Math.sin(x*0.01+waveOffset*2)*14;
                if(x===0) ctx.moveTo(x,yy); else ctx.lineTo(x,yy);
            }
            ctx.stroke();
            // dots on wave
            if(y%2===0){
                for(let x=0;x<state.width;x+= 22 - state.particleSize){
                    const n=SimplexNoise.noise2D(x*0.008, py*0.004+waveOffset);
                    const yy=py + n*80 + Math.sin(x*0.01+waveOffset*2)*14;
                    ctx.beginPath();
                    ctx.arc(x,yy, state.particleSize*0.9, 0, Math.PI*2);
                    ctx.fillStyle=color; ctx.fill();
                }
            }
        }
    }

    // === 6 KALEIDOSCOPE ===
    function drawKaleidoscope(){
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=`rgba(${hexToBg(state.bgColor)}, ${getTrailAlpha()+0.06})`;
        ctx.fillRect(0,0,state.width,state.height);
        ctx.globalCompositeOperation=state.blend;
        if(state.palette==="rainbow") state.hueShift=(state.hueShift+0.5)%360;
        const colors=getPaletteColors();
        const seg=state.kaleidoSegments;
        const cx=state.width/2, cy=state.height/2;
        const time=Date.now()*0.0005*state.speed/50;
        const count=Math.min(state.particleCount, 400);
        for(let i=0;i<count;i++){
            const angle=(i/count)*Math.PI*2 + time*0.5;
            const radius= (SimplexNoise.noise2D(i*0.08, time))*120 + 160 + Math.sin(i*0.2+time*2)*60;
            const x=cx+Math.cos(angle)*radius*0.6;
            const y=cy+Math.sin(angle)*radius*0.6;
            const color=colors[i%colors.length];
            const sz=state.particleSize* (1.2 + Math.sin(i+time*3)*0.5);
            for(let s=0;s<seg;s++){
                const a=(Math.PI*2/seg)*s;
                const rx=Math.cos(a)*(x-cx)-Math.sin(a)*(y-cy)+cx;
                const ry=Math.sin(a)*(x-cx)+Math.cos(a)*(y-cy)+cy;
                ctx.beginPath();
                ctx.arc(rx,ry, sz, 0, Math.PI*2);
                ctx.fillStyle=colorWithAlpha(color, 0.95);
                ctx.fill();
                // trail mirror
                if(s%2===0){
                    ctx.beginPath();
                    ctx.moveTo(cx,cy); ctx.lineTo(rx,ry);
                    ctx.strokeStyle=colorWithAlpha(color, 0.08);
                    ctx.lineWidth=0.5; ctx.stroke();
                }
            }
        }
        // mouse draws kaleido too
        if(state.mouse.active){
            const mx=state.mouse.x, my=state.mouse.y;
            for(let s=0;s<seg;s++){
                const a=(Math.PI*2/seg)*s;
                const rx=Math.cos(a)*(mx-cx)-Math.sin(a)*(my-cy)+cx;
                const ry=Math.sin(a)*(mx-cx)+Math.cos(a)*(my-cy)+cy;
                ctx.beginPath(); ctx.arc(rx,ry, state.particleSize*2.5, 0, Math.PI*2);
                ctx.fillStyle="rgba(255,255,255,0.9)"; ctx.fill();
            }
        }
    }

    // === 7 ORBITS ===
    let orbits=[];
    function initOrbits(){
        orbits=[];
        const colors=getPaletteColors();
        const cx=state.width/2, cy=state.height/2;
        for(let i=0;i<state.particleCount;i++){
            const radius=30 + Math.random()*Math.min(state.width,state.height)*0.42;
            const angle=Math.random()*Math.PI*2;
            const speed=(0.002+Math.random()*0.008)*(state.speed/50)*(0.6+Math.random()*0.8);
            orbits.push({
                radius, angle, speed,
                size: 1+Math.random()*2.5,
                color: colors[Math.floor(Math.random()*colors.length)],
                cx: cx + (Math.random()-0.5)*40,
                cy: cy + (Math.random()-0.5)*40,
                ecc: 0.15+Math.random()*0.35
            });
        }
    }
    function drawOrbits(){
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=`rgba(${hexToBg(state.bgColor)}, ${getTrailAlpha()+0.07})`;
        ctx.fillRect(0,0,state.width,state.height);
        ctx.globalCompositeOperation=state.blend;
        if(state.palette==="rainbow") state.hueShift=(state.hueShift+0.5)%360;
        ensureCount(orbits, state.particleCount, ()=>{
            const colors=getPaletteColors();
            return { radius:30+Math.random()*200, angle:Math.random()*Math.PI*2, speed:(0.002+Math.random()*0.008)*(state.speed/50), size:1+Math.random()*2.5, color:colors[Math.floor(Math.random()*colors.length)], cx:state.width/2, cy:state.height/2, ecc:0.2+Math.random()*0.3 };
        });
        for(const o of orbits){
            o.angle+=o.speed*state.speed/30;
            if(state.palette==="rainbow" && Math.random()<0.01) o.color=randColor();
        }
        // draw connections near each other
        const connect=state.connectDist*0.9;
        for(let i=0;i<orbits.length;i++){
            const a=orbits[i], ax=a.cx+Math.cos(a.angle)*a.radius, ay=a.cy+Math.sin(a.angle)*a.radius*a.ecc;
            for(let j=i+1;j<orbits.length;j++){
                const b=orbits[j], bx=b.cx+Math.cos(b.angle)*b.radius, by=b.cy+Math.sin(b.angle)*b.radius*b.ecc;
                const d=Math.hypot(ax-bx, ay-by);
                if(d<connect){
                    ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
                    ctx.strokeStyle=colorWithAlpha(a.color, (1-d/connect)*0.28);
                    ctx.lineWidth=0.4*(state.particleSize/2); ctx.stroke();
                }
            }
        }
        for(const o of orbits){
            const x=o.cx+Math.cos(o.angle)*o.radius;
            const y=o.cy+Math.sin(o.angle)*o.radius*o.ecc;
            ctx.beginPath(); ctx.arc(x,y,o.size*(state.particleSize/1.7),0,Math.PI*2);
            ctx.fillStyle=o.color; ctx.fill();
            // orbit trail
            ctx.beginPath(); ctx.arc(o.cx,o.cy,o.radius, o.angle-0.18, o.angle);
            ctx.strokeStyle=colorWithAlpha(o.color,0.22); ctx.lineWidth=0.8; ctx.stroke();
        }
    }

    // === 8 PORTRAIT / POP ART ===
    let portraitImg=null;
    let portraitData=null;
    let portraitParticles=[];
    let portraitReady=false;
    let portraitTime=0;

    function cachePortraitData(){
        if(!portraitImg || !portraitCanvas) return;
        const w=160, h=Math.round(160*portraitImg.height/portraitImg.width);
        portraitCanvas.width=w; portraitCanvas.height=h;
        const pctx=portraitCanvas.getContext("2d");
        pctx.clearRect(0,0,w,h);
        pctx.drawImage(portraitImg,0,0,w,h);
        try{
            portraitData=pctx.getImageData(0,0,w,h);
            portraitReady=true;
        }catch(e){ portraitReady=false; }
        initPortraitParticles();
    }
    function loadPortraitFromSrc(src, isPreset=false){
        const img=new Image();
        img.crossOrigin="anonymous";
        img.onload=()=>{
            portraitImg=img;
            cachePortraitData();
            state.mode="portrait";
            modeSelect.value="portrait";
            portraitControls.classList.remove("hidden");
            depthGroup.style.display="none";
            recordStatus.textContent="Retrato cargado ✔"; recordStatus.className="record-status ok";
            setTimeout(()=>recordStatus.textContent="",2000);
        };
        img.onerror=()=>{
            // try without CORS
            if(isPreset){
                // fallback: create gradient placeholder
                const c=document.createElement("canvas"); c.width=400; c.height=400;
                const cx=c.getContext("2d");
                const g=cx.createLinearGradient(0,0,400,400);
                g.addColorStop(0, randColor()); g.addColorStop(1, randColor());
                cx.fillStyle=g; cx.fillRect(0,0,400,400);
                cx.fillStyle="white"; cx.font="bold 32px Segoe UI"; cx.textAlign="center";
                cx.fillText("Retrato",200,210);
                const dataURL=c.toDataURL();
                const img2=new Image();
                img2.onload=()=>{ portraitImg=img2; cachePortraitData(); };
                img2.src=dataURL;
            } else {
                recordStatus.textContent="Error cargando imagen (CORS)"; recordStatus.className="record-status";
            }
        };
        // add cache-bust?
        img.src=src;
    }
    function initPortraitParticles(){
        portraitParticles=[];
        const count=state.particleCount;
        for(let i=0;i<count;i++) portraitParticles.push({
            x:Math.random()*state.width, y:Math.random()*state.height,
            vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2,
            tx: Math.random()*state.width, ty: Math.random()*state.height,
            color:"#fff", brightness:0
        });
        // assign targets based on image sampling grid
        if(portraitData){
            for(const p of portraitParticles){
                const sx=Math.floor(Math.random()*portraitData.width);
                const sy=Math.floor(Math.random()*portraitData.height);
                const idx=(sy*portraitData.width+sx)*4;
                const r=portraitData.data[idx], g=portraitData.data[idx+1], b=portraitData.data[idx+2];
                const brightness=(r+g+b)/3;
                // map to canvas centered
                const scale=Math.min(state.width, state.height)*0.85 / Math.max(portraitData.width, portraitData.height);
                const offX=(state.width - portraitData.width*scale)/2;
                const offY=(state.height - portraitData.height*scale)/2 + 20;
                p.tx=offX + sx*scale;
                p.ty=offY + sy*scale;
                p.color=`rgb(${r},${g},${b})`;
                p.brightness=brightness;
                p.x=p.tx + (Math.random()-0.5)*120;
                p.y=p.ty + (Math.random()-0.5)*120;
            }
        }
    }
    function samplePortraitColor(x,y){
        if(!portraitData) return randColor();
        const scale=Math.min(state.width, state.height)*0.85 / Math.max(portraitData.width, portraitData.height);
        const offX=(state.width - portraitData.width*scale)/2;
        const offY=(state.height - portraitData.height*scale)/2 +20;
        const sx=Math.floor((x-offX)/scale), sy=Math.floor((y-offY)/scale);
        if(sx<0||sy<0||sx>=portraitData.width||sy>=portraitData.height) return null;
        const idx=(sy*portraitData.width+sx)*4;
        const r=portraitData.data[idx], g=portraitData.data[idx+1], b=portraitData.data[idx+2];
        return `rgb(${r},${g},${b})`;
    }

    function drawPortrait(){
        const effect=state.portraitEffect;
        const intensity=state.portraitIntensity/50; // 0.02 ..2
        portraitTime+=0.015*state.speed/50;
        if(!portraitImg || !portraitReady){
            // placeholder animate
            ctx.fillStyle=state.bgColor; ctx.fillRect(0,0,state.width,state.height);
            ctx.fillStyle="rgba(255,255,255,0.7)"; ctx.font="14px Segoe UI";
            ctx.textAlign="center";
            ctx.fillText("Carga una imagen o elige un retrato arriba", state.width/2, state.height/2);
            ctx.font="11px Segoe UI"; ctx.fillStyle="rgba(255,255,255,0.4)";
            ctx.fillText("Modo Retrato → sube tu foto o click en presets", state.width/2, state.height/2+22);
            return;
        }
        if(effect==="particles"){
            ctx.globalCompositeOperation="source-over";
            ctx.fillStyle=`rgba(${hexToBg(state.bgColor)}, ${0.22})`;
            ctx.fillRect(0,0,state.width,state.height);
            ctx.globalCompositeOperation=state.blend;
            ensureCount(portraitParticles, state.particleCount, ()=>{
                const sx=Math.floor(Math.random()*portraitData.width);
                const sy=Math.floor(Math.random()*portraitData.height);
                const idx=(sy*portraitData.width+sx)*4;
                const r=portraitData.data[idx], g=portraitData.data[idx+1], b=portraitData.data[idx+2];
                const scale=Math.min(state.width, state.height)*0.85 / Math.max(portraitData.width, portraitData.height);
                const offX=(state.width - portraitData.width*scale)/2;
                const offY=(state.height - portraitData.height*scale)/2+20;
                return { x:offX+sx*scale+(Math.random()-0.5)*60, y:offY+sy*scale+(Math.random()-0.5)*60, vx:0,vy:0, tx:offX+sx*scale, ty:offY+sy*scale, color:`rgb(${r},${g},${b})`, brightness:(r+g+b)/3 };
            });
            const speedFactor=state.speed/50;
            for(const p of portraitParticles){
                // spring to target + noise liquify
                const dx=p.tx-p.x, dy=p.ty-p.y;
                const n=SimplexNoise.noise2D(p.tx*0.006, portraitTime)* intensity * 22;
                p.vx+=dx*0.008*speedFactor + Math.cos(n)*0.18;
                p.vy+=dy*0.008*speedFactor + Math.sin(n)*0.18;
                // mouse repulse
                if(state.mouse.active){
                    const mdx=p.x-state.mouse.x, mdy=p.y-state.mouse.y, md=Math.hypot(mdx,mdy);
                    if(md<140){ p.vx+=mdx*0.012*intensity; p.vy+=mdy*0.012*intensity; }
                }
                p.vx*=0.90; p.vy*=0.90;
                p.x+=p.vx; p.y+=p.vy;
                const sz= state.particleSize * (0.5 + p.brightness/255*1.4);
                ctx.beginPath();
                ctx.arc(p.x,p.y, sz, 0, Math.PI*2);
                ctx.fillStyle=colorWithAlpha(p.color, 0.92);
                ctx.fill();
            }
        } else if(effect==="popart"){
            ctx.fillStyle=state.bgColor; ctx.fillRect(0,0,state.width,state.height);
            const w=state.width/2, h=state.height/2;
            const shifts=[0,60,120,180];
            const scales=[w/portraitCanvas.width, h/portraitCanvas.height];
            const positions=[[0,0],[w,0],[0,h],[w,h]];
            for(let q=0;q<4;q++){
                const offX=positions[q][0], offY=positions[q][1];
                const hue=shifts[q]- portraitTime*20;
                ctx.save();
                ctx.beginPath(); ctx.rect(offX,offY,w,h); ctx.clip();
                // draw tinted image
                ctx.drawImage(portraitImg, offX, offY, w, h);
                // overlay colorize
                ctx.globalCompositeOperation="color";
                ctx.fillStyle=`hsl(${ (hue+state.hueShift)%360}, 85%, 55%)`;
                ctx.globalAlpha=0.55*intensity;
                ctx.fillRect(offX,offY,w,h);
                ctx.globalAlpha=1;
                ctx.globalCompositeOperation="source-over";
                // halftone dots overlay
                const dotSize=3+intensity*3;
                for(let y=offY;y<offY+h;y+=dotSize*2){
                    for(let x=offX;x<offX+w;x+=dotSize*2){
                        const samp=samplePortraitColor((x-offX)/w*state.width, (y-offY)/h*state.height);
                        // simplified: use canvas pixels brightness
                    }
                }
                ctx.restore();
                ctx.strokeStyle="rgba(255,255,255,0.12)"; ctx.lineWidth=2; ctx.strokeRect(offX,offY,w,h);
            }
            // wiggle effect
            if(state.speed>10){
                const jx=Math.sin(portraitTime*2)*3*intensity, jy=Math.cos(portraitTime*2)*3*intensity;
                ctx.fillStyle=state.bgColor; // not
            }
        } else if(effect==="ascii"){
            ctx.fillStyle=state.bgColor; ctx.fillRect(0,0,state.width,state.height);
            const scale=Math.min(state.width, state.height)*0.88 / Math.max(portraitData.width, portraitData.height);
            const offX=(state.width - portraitData.width*scale)/2;
            const offY=(state.height - portraitData.height*scale)/2+10;
            const cols=Math.floor(portraitData.width*0.45* (0.5+intensity*0.5));
            const rows=Math.floor(portraitData.height*0.45* (0.5+intensity*0.5));
            const cellW=portraitData.width/cols, cellH=portraitData.height/rows;
            const chars=" .·-=+*%#@█";
            const pctx=portraitCanvas.getContext("2d");
            for(let y=0;y<rows;y++){
                for(let x=0;x<cols;x++){
                    const sx=Math.floor(x*cellW), sy=Math.floor(y*cellH);
                    const idx=(sy*portraitData.width+sx)*4;
                    const r=portraitData.data[idx], g=portraitData.data[idx+1], b=portraitData.data[idx+2];
                    const bright=(r*0.299+g*0.587+b*0.114)/255;
                    const charIdx=Math.floor(bright*(chars.length-1));
                    const ch=chars[charIdx];
                    const cx=offX + (sx/portraitData.width)*(portraitData.width*scale);
                    const cy=offY + (sy/portraitData.height)*(portraitData.height*scale);
                    const sz= (scale*cellW*0.85)*(0.6+bright*0.9) * (state.particleSize/2);
                    if(ch.trim()===""){
                        // dot for dark areas
                        ctx.beginPath(); ctx.arc(cx,cy, sz*0.35,0,Math.PI*2);
                        ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fill();
                    } else {
                        ctx.fillStyle=`rgb(${r},${g},${b})`;
                        ctx.font=`${Math.max(6, sz*2.2)}px monospace`;
                        ctx.textAlign="center"; ctx.textBaseline="middle";
                        // wobble
                        const wob=Math.sin(portraitTime*2 + x*0.1 + y*0.1)*1.2*intensity;
                        ctx.fillText(ch, cx+wob, cy);
                    }
                }
            }
        } else if(effect==="halftone"){
            ctx.fillStyle="#f8f8f6"; ctx.fillRect(0,0,state.width,state.height);
            const scale=Math.min(state.width, state.height)*0.92 / Math.max(portraitData.width, portraitData.height);
            const offX=(state.width - portraitData.width*scale)/2;
            const offY=(state.height - portraitData.height*scale)/2+10;
            const step= 6 - intensity*1.8; // 4..6
            for(let y=0;y<portraitData.height; y+=step){
                for(let x=0;x<portraitData.width; x+=step){
                    const idx=(y*portraitData.width+x)*4;
                    const r=portraitData.data[idx], g=portraitData.data[idx+1], b=portraitData.data[idx+2];
                    const bright=(r+g+b)/3/255;
                    const sz=(1-bright)* (step*0.95*scale) * (0.7+ Math.sin(portraitTime+x*0.02)*0.18);
                    const cx=offX + x*scale;
                    const cy=offY + y*scale + Math.sin(x*0.04+portraitTime*2)*4*intensity;
                    // CMYK-like: use original color
                    ctx.beginPath(); ctx.arc(cx,cy, Math.max(0.6, sz), 0, Math.PI*2);
                    ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fill();
                }
            }
        } else if(effect==="pixel"){
            ctx.globalCompositeOperation="source-over";
            ctx.fillStyle=`rgba(${hexToBg(state.bgColor)},0.18)`; ctx.fillRect(0,0,state.width,state.height);
            ctx.globalCompositeOperation=state.blend;
            const scale=Math.min(state.width, state.height)*0.88 / Math.max(portraitData.width, portraitData.height);
            const offX=(state.width - portraitData.width*scale)/2;
            const offY=(state.height - portraitData.height*scale)/2+10;
            const strips= Math.floor(80*intensity)+20;
            for(let i=0;i<strips;i++){
                const y= (i/strips)*portraitData.height;
                const wave=Math.sin(y*0.05+portraitTime*1.8)* 18*intensity + Math.cos(portraitTime*0.8+i)*6;
                const sy=Math.floor(y), sx=0;
                // draw strip slice
                const sh= portraitData.height/strips;
                const dh= sh*scale;
                const dx=offX + wave*scale*0.6;
                const dy=offY + y*scale;
                // tint per strip with palette
                const cols=getPaletteColors();
                const tint=cols[i%cols.length];
                ctx.globalAlpha=0.88;
                ctx.drawImage(portraitCanvas, 0, sy, portraitData.width, Math.ceil(sh), dx, dy, portraitData.width*scale, dh);
                if(intensity>0.7){
                    ctx.globalCompositeOperation="overlay";
                    ctx.fillStyle=colorWithAlpha(tint, 0.18);
                    ctx.fillRect(dx,dy, portraitData.width*scale, dh);
                    ctx.globalCompositeOperation=state.blend;
                }
                ctx.globalAlpha=1;
            }
            // scan line
            ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=1;
            for(let y=offY; y<offY+portraitData.height*scale; y+=4){
                ctx.beginPath(); ctx.moveTo(offX, y); ctx.lineTo(offX+portraitData.width*scale, y); ctx.stroke();
            }
        }
    }

    function hexToBg(hex){
        if(!hex || hex==="transparent") return "10,10,15";
        const c=hex.replace("#",""); const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16);
        return `${r},${g},${b}`;
    }

    // === BURST ===
    function spawnBurst(x,y){
        const cols=getPaletteColors();
        for(let i=0;i<8;i++){
            const a=Math.random()*Math.PI*2, s=2+Math.random()*6;
            if(state.mode==="flowField"){
                flowParticles.push({ x,y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, color: cols[Math.floor(Math.random()*cols.length)], life:0 });
            } else if(state.mode==="reactiveParticles"){
                reactiveParticles.push({ x,y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, size:2+Math.random()*3, color: cols[Math.floor(Math.random()*cols.length)], baseX:x+(Math.random()-0.5)*80, baseY:y+(Math.random()-0.5)*80 });
            } else if(state.mode==="constellation"){
                stars.push({ x,y, vx:Math.cos(a)*s*0.6, vy:Math.sin(a)*s*0.6, size:1+Math.random()*2, color: cols[Math.floor(Math.random()*cols.length)]});
            }
        }
    }
    function burstParticles(){
        for(let i=0;i<6;i++) spawnBurst(Math.random()*state.width, Math.random()*state.height);
    }

    // === ANIMATION LOOP ===
    function animate(){
        switch(state.mode){
            case "flowField": drawFlowField(); break;
            case "reactiveParticles": drawReactiveParticles(); break;
            case "fractalTree": drawFractalTree(); break;
            case "constellation": drawConstellation(); break;
            case "waves": drawWaves(); break;
            case "kaleidoscope": drawKaleidoscope(); break;
            case "orbits": drawOrbits(); break;
            case "portrait": drawPortrait(); break;
        }
        requestAnimationFrame(animate);
    }

    // === UI WIRING ===
    toggleBtn.addEventListener("click", ()=> panel.classList.toggle("hidden"));

    modeSelect.addEventListener("change", e=>{
        state.mode=e.target.value;
        const isPortrait=state.mode==="portrait";
        portraitControls.classList.toggle("hidden", !isPortrait);
        depthGroup.style.display = state.mode==="fractalTree" ? "block":"none";
        kaleidoGroup.style.display = state.mode==="kaleidoscope" ? "block":"none";
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=state.bgColor; ctx.fillRect(0,0,state.width,state.height);
        if(state.mode==="flowField") initFlowField();
        if(state.mode==="reactiveParticles") initReactiveParticles();
        if(state.mode==="constellation") initConstellation();
        if(state.mode==="waves") initWaves();
        if(state.mode==="orbits") initOrbits();
        if(state.mode==="portrait" && portraitData) initPortraitParticles();
    });

    speedSlider.addEventListener("input", e=>{ state.speed=parseInt(e.target.value); speedValue.textContent=state.speed; });
    particleSlider.addEventListener("input", e=>{
        state.particleCount=parseInt(e.target.value); particleValue.textContent=state.particleCount;
        if(state.mode==="portrait") initPortraitParticles();
    });
    sizeSlider.addEventListener("input", e=>{ state.particleSize=parseFloat(e.target.value); sizeValue.textContent=state.particleSize.toFixed(1); });
    trailSlider.addEventListener("input", e=>{ state.trail=parseInt(e.target.value); trailValue.textContent=state.trail; });
    depthSlider.addEventListener("input", e=>{ state.depth=parseInt(e.target.value); depthValue.textContent=state.depth; });
    kaleidoSlider.addEventListener("input", e=>{ state.kaleidoSegments=parseInt(e.target.value); kaleidoValue.textContent=state.kaleidoSegments; });
    connectSlider.addEventListener("input", e=>{ state.connectDist=parseInt(e.target.value); connectValue.textContent=state.connectDist; });

    paletteSelect.addEventListener("change", e=>{
        state.palette=e.target.value;
        customColorsDiv.classList.toggle("hidden", state.palette!=="custom");
        SimplexNoise.seed();
        if(state.mode==="flowField") initFlowField();
        if(state.mode==="reactiveParticles") initReactiveParticles();
        if(state.mode==="constellation") initConstellation();
        if(state.mode==="orbits") initOrbits();
    });
    customColorInputs.forEach(inp=> inp.addEventListener("input", ()=>{
        if(state.palette==="custom"){
            if(state.mode==="flowField") initFlowField();
        }
    }));
    bgColorInput.addEventListener("input", e=>{ state.bgColor=e.target.value; });
    blendSelect.addEventListener("change", e=>{ state.blend=e.target.value; });

    portraitEffect.addEventListener("change", e=>{ state.portraitEffect=e.target.value; });
    portraitIntensity.addEventListener("input", e=>{ state.portraitIntensity=parseInt(e.target.value); portraitIntensityValue.textContent=state.portraitIntensity; });

    imageUpload.addEventListener("change", e=>{
        const file=e.target.files[0];
        if(!file) return;
        const url=URL.createObjectURL(file);
        loadPortraitFromSrc(url, false);
    });
    presetGrid.querySelectorAll("img").forEach(img=>{
        img.addEventListener("click", ()=>{
            presetGrid.querySelectorAll("img").forEach(i=>i.classList.remove("selected"));
            img.classList.add("selected");
            const src=img.src.replace("200px","800px");
            loadPortraitFromSrc(src, true);
            // also try original small if CORS fails, gif.js fallback handled
        });
    });

    // drag & drop
    canvas.addEventListener("dragover", e=>{ e.preventDefault(); canvas.style.outline="2px dashed #7c6fef"; });
    canvas.addEventListener("dragleave", ()=> canvas.style.outline="none");
    canvas.addEventListener("drop", e=>{
        e.preventDefault(); canvas.style.outline="none";
        const file=e.dataTransfer.files[0];
        if(file && file.type.startsWith("image/")){
            const url=URL.createObjectURL(file);
            loadPortraitFromSrc(url, false);
        }
    });

    randomBtn.addEventListener("click", ()=>{
        const modes=["flowField","reactiveParticles","fractalTree","constellation","waves","kaleidoscope","orbits","portrait"];
        const pals=Object.keys(palettes).concat(["rainbow","custom"]);
        modeSelect.value=modes[Math.floor(Math.random()*modes.length)];
        state.mode=modeSelect.value;
        paletteSelect.value=pals[Math.floor(Math.random()*pals.length)];
        state.palette=paletteSelect.value;
        customColorsDiv.classList.toggle("hidden", state.palette!=="custom");
        if(state.palette==="custom"){
            customColorInputs.forEach(inp=> inp.value='#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'));
        }
        state.speed=15+Math.floor(Math.random()*85);
        speedSlider.value=state.speed; speedValue.textContent=state.speed;
        state.particleCount=40+Math.floor(Math.random()*600);
        particleSlider.value=state.particleCount; particleValue.textContent=state.particleCount;
        state.particleSize=(Math.random()*4+1).toFixed(1)*1; sizeSlider.value=state.particleSize; sizeValue.textContent=state.particleSize.toFixed(1);
        state.trail=Math.floor(Math.random()*80); trailSlider.value=state.trail; trailValue.textContent=state.trail;
        state.depth=4+Math.floor(Math.random()*10); depthSlider.value=state.depth; depthValue.textContent=state.depth;
        state.kaleidoSegments=3+Math.floor(Math.random()*8); kaleidoSlider.value=state.kaleidoSegments; kaleidoValue.textContent=state.kaleidoSegments;
        state.connectDist=40+Math.floor(Math.random()*180); connectSlider.value=state.connectDist; connectValue.textContent=state.connectDist;
        state.blend=["source-over","lighter","screen"][Math.floor(Math.random()*3)]; blendSelect.value=state.blend;
        bgColorInput.value='#'+Math.floor(Math.random()*0x222222).toString(16).padStart(6,'0'); state.bgColor=bgColorInput.value;
        const effects=["particles","popart","ascii","halftone","pixel"];
        state.portraitEffect=effects[Math.floor(Math.random()*effects.length)];
        portraitEffect.value=state.portraitEffect; state.portraitIntensity=20+Math.floor(Math.random()*80); portraitIntensity.value=state.portraitIntensity; portraitIntensityValue.textContent=state.portraitIntensity;
        // random portrait preset 50%
        if(state.mode==="portrait" && Math.random()<0.5){
            const imgs=presetGrid.querySelectorAll("img");
            const r=imgs[Math.floor(Math.random()*imgs.length)];
            r.click();
        }
        portraitControls.classList.toggle("hidden", state.mode!=="portrait");
        depthGroup.style.display= state.mode==="fractalTree"?"block":"none";
        kaleidoGroup.style.display= state.mode==="kaleidoscope"?"block":"none";
        SimplexNoise.seed();
        ctx.globalCompositeOperation="source-over"; ctx.fillStyle=state.bgColor; ctx.fillRect(0,0,state.width,state.height);
        if(state.mode==="flowField") initFlowField();
        if(state.mode==="reactiveParticles") initReactiveParticles();
        if(state.mode==="constellation") initConstellation();
        if(state.mode==="waves") initWaves();
        if(state.mode==="orbits") initOrbits();
        if(state.mode==="portrait" && portraitData) initPortraitParticles();
        // load random preset if portrait but no image
        if(state.mode==="portrait" && !portraitImg){
            const imgs=presetGrid.querySelectorAll("img");
            imgs[Math.floor(Math.random()*imgs.length)].click();
        }
    });

    clearBtn.addEventListener("click", ()=>{
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle=state.bgColor; ctx.fillRect(0,0,state.width,state.height);
        if(state.mode==="flowField") initFlowField();
        if(state.mode==="reactiveParticles") initReactiveParticles();
        if(state.mode==="constellation") initConstellation();
        if(state.mode==="orbits") initOrbits();
    });

    // EXPORT PNG/JPG
    function downloadCanvas(mime, ext){
        const link=document.createElement("a");
        link.download=`generative-art-${Date.now()}.${ext}`;
        // for jpg need white bg
        if(mime==="image/jpeg"){
            const tmp=document.createElement("canvas"); tmp.width=canvas.width; tmp.height=canvas.height;
            const tctx=tmp.getContext("2d");
            tctx.fillStyle="#ffffff"; tctx.fillRect(0,0,tmp.width,tmp.height);
            tctx.drawImage(canvas,0,0);
            link.href=tmp.toDataURL(mime,0.92);
        } else {
            link.href=canvas.toDataURL(mime);
        }
        link.click();
        recordStatus.textContent=`${ext.toUpperCase()} guardado ✔`; recordStatus.className="record-status ok";
        setTimeout(()=>recordStatus.textContent="",1800);
    }
    saveBtn.addEventListener("click", ()=> downloadCanvas("image/png","png"));
    saveJpgBtn.addEventListener("click", ()=> downloadCanvas("image/jpeg","jpg"));

    // === GIF RECORDING via gif.js ===
    let gifRecording=false;
    recordGifBtn.addEventListener("click", ()=>{
        if(gifRecording) return;
        if(typeof GIF==="undefined"){
            // fallback to video
            recordStatus.textContent="gif.js no cargó, grabando video...";
            startVideoRecording();
            return;
        }
        gifRecording=true;
        recordGifBtn.classList.add("recording");
        recordGifBtn.textContent="⏳ Grabando...";
        recordStatus.textContent="Capturando frames (3s)...";
        gifProgress.classList.remove("hidden");
        gifProgressFill.style.width="0%";
        gifProgressText.textContent="Capturando frames... 0%";

        const gif=new GIF({
            workers: 2,
            quality: 10,
            width: canvas.width,
            height: canvas.height,
            workerScript: "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js"
        });
        const fps=12;
        const duration=3000;
        const totalFrames=Math.floor(fps*duration/1000);
        let captured=0;

        const captureInterval=setInterval(()=>{
            gif.addFrame(canvas, {copy:true, delay: 1000/fps});
            captured++;
            const pct=Math.round((captured/totalFrames)*50);
            gifProgressFill.style.width=pct+"%";
            gifProgressText.textContent=`Capturando ${captured}/${totalFrames}`;
            if(captured>=totalFrames){
                clearInterval(captureInterval);
                gifProgressText.textContent="Codificando GIF...";
                gifProgressFill.style.width="50%";
                gif.on("progress", p=>{
                    gifProgressFill.style.width=(50+ p*50)+"%";
                    gifProgressText.textContent=`Codificando ${Math.round(p*100)}%`;
                });
                gif.on("finished", blob=>{
                    const url=URL.createObjectURL(blob);
                    const a=document.createElement("a");
                    a.href=url; a.download=`generative-art-${Date.now()}.gif`; a.click();
                    URL.revokeObjectURL(url);
                    gifRecording=false;
                    recordGifBtn.classList.remove("recording");
                    recordGifBtn.textContent="🎬 GIF 3s";
                    recordStatus.textContent="GIF guardado ✔"; recordStatus.className="record-status ok";
                    gifProgress.classList.add("hidden");
                    setTimeout(()=>recordStatus.textContent="",2200);
                });
                gif.render();
            }
        }, 1000/fps);
    });

    // === VIDEO RECORDING via MediaRecorder ===
    let mediaRecorder=null;
    let videoRecording=false;
    function startVideoRecording(){
        if(videoRecording) return;
        const stream=canvas.captureStream(30);
        const chunks=[];
        let mime="video/webm;codecs=vp9";
        if(!MediaRecorder.isTypeSupported(mime)) mime="video/webm;codecs=vp8";
        if(!MediaRecorder.isTypeSupported(mime)) mime="video/webm";
        try{
            mediaRecorder=new MediaRecorder(stream, {mimeType: mime});
        }catch(e){
            recordStatus.textContent="Grabación no soportada en este navegador";
            return;
        }
        mediaRecorder.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); };
        mediaRecorder.onstop=()=>{
            const blob=new Blob(chunks, {type: mime});
            const url=URL.createObjectURL(blob);
            const a=document.createElement("a");
            a.href=url; a.download=`generative-art-${Date.now()}.webm`; a.click();
            URL.revokeObjectURL(url);
            videoRecording=false;
            recordVideoBtn.classList.remove("recording");
            recordVideoBtn.textContent="⏺ VIDEO 5s";
            recordStatus.textContent="VIDEO guardado ✔ (WebM)"; recordStatus.className="record-status ok";
            setTimeout(()=>recordStatus.textContent="",2200);
        };
        mediaRecorder.start();
        videoRecording=true;
        recordVideoBtn.classList.add("recording");
        recordVideoBtn.textContent="⏹ Grabando...";
        recordStatus.textContent="Grabando video 5s...";
        setTimeout(()=>{
            if(mediaRecorder && mediaRecorder.state==="recording") mediaRecorder.stop();
        },5000);
    }
    recordVideoBtn.addEventListener("click", startVideoRecording);

    // INIT
    resize();
    initFlowField();
    initWaves();
    animate();

    // auto-hide hint after 4s: show panel initially
    setTimeout(()=>{},0);
})();
