import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const gameAreaWidth = 300;
const gameAreaHeight = 400;
const blockHeight = 26;
const holdOffset = 70;
const fallSpeed = 8;
const startWidthConst = 130;
const perfectTolerance = 8;
const growthFactor = 1.07;
const maxGrowWidth = 230;
const SCALE = 1 / 25;
const DEPTH = 4;

const theme = {
  bg: '#0C0A09',
  surface: '#1C1917',
  primary: '#8B1D1D',
  accent: '#A16207',
  accentLight: '#D9A93B',
  foreground: '#F5F0EA',
  muted: '#A39C93',
  border: 'rgba(161,98,7,0.35)',
  destructive: '#DC2626',
};

const fishTypes = [
  { name: 'סלמון', c1: '#ff9a76', c2: '#ff6f61' },
  { name: 'טונה', c1: '#b3352c', c2: '#7a1f1f' },
  { name: 'צהבהב', c1: '#f6e2c1', c2: '#e8c789' },
  { name: 'מקרל', c1: '#a9b7c6', c2: '#5c7a94' },
  { name: 'צלופח', c1: '#5a3a22', c2: '#3a2413' },
  { name: 'דניס', c1: '#f3ede0', c2: '#dcd0b8' },
];

const skyStops = [
  { h: 0, top: [110, 193, 232], bottom: [190, 231, 245] },
  { h: 12, top: [255, 183, 120], bottom: [255, 223, 186] },
  { h: 24, top: [130, 80, 150], bottom: [255, 183, 197] },
  { h: 36, top: [20, 20, 55], bottom: [70, 60, 110] },
];

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(c1, c2, t) {
  return [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))];
}
function getSkyColors(height) {
  const clamped = Math.min(height, skyStops[skyStops.length - 1].h);
  let i = 0;
  while (i < skyStops.length - 1 && clamped > skyStops[i + 1].h) i++;
  const a = skyStops[i], b = skyStops[Math.min(i + 1, skyStops.length - 1)];
  const range = (b.h - a.h) || 1;
  const t = Math.min(1, Math.max(0, (clamped - a.h) / range));
  return { top: lerpColor(a.top, b.top, t), bottom: lerpColor(a.bottom, b.bottom, t) };
}
function skyGradientCSS(top, bottom) {
  return `linear-gradient(180deg, rgb(${top.join(',')}) 0%, rgb(${bottom.join(',')}) 100%)`;
}
function randomFish() { return fishTypes[Math.floor(Math.random() * fishTypes.length)]; }
function worldX(pixelX, pixelWidth) { return (pixelX + pixelWidth / 2 - gameAreaWidth / 2) * SCALE; }
function worldY(pixelBottom) { return pixelBottom * SCALE; }
function jiggleScale(t) {
  const kf = [{ t: 0, x: 1, y: 1 }, { t: 0.25, x: 1.18, y: 0.82 }, { t: 0.5, x: 0.9, y: 1.12 }, { t: 0.75, x: 1.06, y: 0.95 }, { t: 1, x: 1, y: 1 }];
  for (let i = 0; i < kf.length - 1; i++) {
    if (t >= kf[i].t && t <= kf[i + 1].t) {
      const span = (kf[i + 1].t - kf[i].t) || 1;
      const lt = (t - kf[i].t) / span;
      return { x: lerp(kf[i].x, kf[i + 1].x, lt), y: lerp(kf[i].y, kf[i + 1].y, lt) };
    }
  }
  return { x: 1, y: 1 };
}

export default function SushiTower3D() {
  const mountRef = useRef(null);
  const g = useRef({});

  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [fishName, setFishName] = useState('-');
  const [growingActive, setGrowingActive] = useState(false);
  const [comboActive, setComboActive] = useState(false);
  const [comboText, setComboText] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [bestHeight, setBestHeight] = useState(0);
  const [bestPoints, setBestPoints] = useState(0);
  const [skyBg, setSkyBg] = useState(skyGradientCSS([110, 193, 232], [190, 231, 245]));

  useEffect(() => {
    const mount = mountRef.current;
    // הבטחת קנבס יחיד: מנקה כל שריד מ-mount קודם (StrictMode / Hot-Reload) לפני יצירת חדש.
    // (עמיד גם מול עדכוני קוד חמים בזמן שהמשחק פתוח)
    while (mount.firstChild) mount.removeChild(mount.firstChild);

    const scene = new THREE.Scene();

    // רקע שמיים בתוך ה-WebGL (נדרש כדי שאפקט הבלום יעבוד על קנבס אטום)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 4; skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext('2d');
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    function paintSky(top, bottom) {
      const grad = skyCtx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, `rgb(${top.join(',')})`);
      grad.addColorStop(1, `rgb(${bottom.join(',')})`);
      skyCtx.fillStyle = grad;
      skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
      skyTexture.needsUpdate = true;
    }
    paintSky([110, 193, 232], [190, 231, 245]);
    scene.background = skyTexture;

    // מצלמה אורתוגרפית מלמעלה - "מתרחקת" אוטומטית כדי שכל המגדל, מהצלחת ועד הפיסה העליונה, תמיד יהיה בתוך הפריים
    const cameraAspect = gameAreaWidth / gameAreaHeight;
    const THETA = 42 * (Math.PI / 180); // זווית תלת-רבע - רואים גם מלמעלה וגם מהצד בבירור
    const sinT = Math.sin(THETA), cosT = Math.cos(THETA);
    const camDir = new THREE.Vector3(0, sinT, cosT).normalize();
    const CAM_DIST = 25;
    const camera = new THREE.OrthographicCamera(-4 * cameraAspect, 4 * cameraAspect, 4, -4, 0.1, 100);
    camera.up.set(0, 1, 0);
    camera.position.set(0, 6, 6);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(gameAreaWidth, gameAreaHeight, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // Post-processing: bloom (זוהר) — נותן ברק לפיסות ה"בול" הזהובות ולנקודות האור.
    // render target עם MSAA (samples) שומר על אנטי-אליאסינג חד גם עם post-processing,
    // ו-HalfFloat נותן זוהר חלק בלי מדרגות צבע.
    const dbSize = renderer.getDrawingBufferSize(new THREE.Vector2());
    const composerTarget = new THREE.WebGLRenderTarget(dbSize.width, dbSize.height, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    const composer = new EffectComposer(renderer, composerTarget);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(gameAreaWidth, gameAreaHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(gameAreaWidth, gameAreaHeight),
      0.6,   // strength - עוצמת הזוהר
      0.4,   // radius - רדיוס הפיזור
      0.82   // threshold - סף הבהירות שממנו מתחיל הזוהר
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(4, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.bias = -0.002;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xbcdfff, 0.4);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffe8c2, 0.3);
    rimLight.position.set(0, 3, -8);
    scene.add(rimLight);

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(startWidthConst * SCALE * 0.75, startWidthConst * SCALE * 0.8, 0.3, 40),
      new THREE.MeshStandardMaterial({ color: 0x4a3320, roughness: 0.55, metalness: 0.05 })
    );
    plate.position.y = -0.15;
    plate.receiveShadow = true;
    scene.add(plate);

    const towerGroup = new THREE.Group();
    scene.add(towerGroup);

    function makeChopstick() {
      const geo = new THREE.CylinderGeometry(0.055, 0.055, 1, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0xdba25a, roughness: 0.4 });
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.visible = false;
      return m;
    }
    const stick1 = makeChopstick(), stick2 = makeChopstick();
    scene.add(stick1, stick2);

    function orientBetween(mesh, a, b) {
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = Math.max(0.001, dir.length());
      mesh.scale.set(1, len, 1);
      mesh.position.copy(a).addScaledVector(dir, 0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    }

    let noriTexture = null;
    function getNoriTexture() {
      if (noriTexture) return noriTexture;
      const size = 256;
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#171f13';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < size; x += size / 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
      }
      const sheen = ctx.createLinearGradient(0, 0, 0, size);
      sheen.addColorStop(0, 'rgba(255,255,255,0.08)');
      sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
      sheen.addColorStop(1, 'rgba(0,0,0,0.15)');
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, size, size);
      noriTexture = new THREE.CanvasTexture(c);
      noriTexture.wrapS = THREE.RepeatWrapping;
      return noriTexture;
    }

    let makiTexture = null;
    function getFishTexture() {
      if (makiTexture) return makiTexture;
      const size = 256;
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      const cx = size / 2, cy = size / 2;

      // טבעת נורי דקה בקצה החתך
      ctx.fillStyle = '#181f14';
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // בסיס אורז לבן
      ctx.fillStyle = '#f7f1e2';
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2 - size * 0.035, 0, Math.PI * 2);
      ctx.fill();

      // גרגירי אורז
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 34; i++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = size * 0.2 + Math.random() * (size * 0.28);
        const px = cx + Math.cos(ang) * rad;
        const py = cy + Math.sin(ang) * rad;
        ctx.beginPath();
        ctx.ellipse(px, py, size * 0.016, size * 0.026, ang, 0, Math.PI * 2);
        ctx.fill();
      }

      // סלמון - חלק עליון
      let g = ctx.createLinearGradient(cx - 40, cy - 55, cx + 40, cy - 15);
      g.addColorStop(0, '#ffab7a');
      g.addColorStop(1, '#ff6f4d');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 34, size * 0.19, size * 0.1, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - 34, cy - 34 + i * 6);
        ctx.lineTo(cx + 34, cy - 34 + i * 6 - 6);
        ctx.stroke();
      }

      // אבוקדו - שמאל תחתון
      g = ctx.createLinearGradient(cx - 55, cy + 10, cx - 10, cy + 55);
      g.addColorStop(0, '#a7d24a');
      g.addColorStop(1, '#5c8f2e');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx - 32, cy + 30, size * 0.16, size * 0.095, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(240,255,210,0.5)';
      ctx.beginPath();
      ctx.ellipse(cx - 32, cy + 30, size * 0.07, size * 0.04, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // גזר - ימין תחתון
      g = ctx.createLinearGradient(cx + 10, cy + 10, cx + 55, cy + 55);
      g.addColorStop(0, '#ffb347');
      g.addColorStop(1, '#e8730f');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx + 32, cy + 30, size * 0.135, size * 0.075, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(cx + 20 + i * 6, cy + 24 + (i % 2) * 8, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // וינייטה עדינה
      const vign = ctx.createRadialGradient(cx, cy, size * 0.32, cx, cy, size * 0.5);
      vign.addColorStop(0, 'rgba(0,0,0,0)');
      vign.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = vign;
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      makiTexture = tex;
      return tex;
    }

    function makePieceMesh(widthPixel, fish) {
      const radius = (widthPixel * SCALE) / 2;
      const geo = new THREE.CylinderGeometry(radius, radius, blockHeight * SCALE, 32);
      const sideMat = new THREE.MeshStandardMaterial({ map: getNoriTexture(), roughness: 0.75, metalness: 0.02 });
      const capMat = new THREE.MeshStandardMaterial({ map: getFishTexture(), roughness: 0.55, metalness: 0.02 });
      const mesh = new THREE.Mesh(geo, [sideMat, capMat, capMat]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    const state = {
      stack: [], current: null, currentMesh: null, currentPieceWorldWidth: 0,
      direction: 1, speed: 2, running: false, falling: false, animationId: null,
      nextWidth: startWidthConst, points: 0, perfectCount: 0, perfectStreak: 0,
      growing: false, bestHeight: 0, bestPoints: 0,
      currentSkyTop: [110, 193, 232], currentSkyBottom: [190, 231, 245], flyingPieces: [],
      bloomFlash: 0,
    };

    const ORTHO_MARGIN = 1.2;
    function updateCameraFraming() {
      const pieceTopPixel = state.current ? (state.current.bottom + blockHeight) : holdOffset;
      const topWorld = Math.max(state.stack.length * blockHeight * SCALE, pieceTopPixel * SCALE);
      const totalHeight = topWorld + 1.2; // מרווח קטן מתחת לצלחת
      const neededHalfHeight = ((totalHeight * sinT) + DEPTH * cosT) * ORTHO_MARGIN / 2;
      const neededHalfWidthAsHeight = ((gameAreaWidth * SCALE) * ORTHO_MARGIN / 2) / cameraAspect;
      const viewSize = Math.max(neededHalfHeight, neededHalfWidthAsHeight, 3);

      camera.left = -viewSize * cameraAspect;
      camera.right = viewSize * cameraAspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();

      const lookY = Math.max(0.6, totalHeight / 2 - 0.6);
      const lookPoint = new THREE.Vector3(0, lookY, 0);
      camera.position.copy(lookPoint).addScaledVector(camDir, CAM_DIST);
      camera.lookAt(lookPoint);
    }

    updateCameraFraming();

    function updateSticks() {
      if (!state.currentMesh) { stick1.visible = false; stick2.visible = false; return; }
      stick1.visible = true; stick2.visible = true;
      const p = state.currentMesh.position;
      const halfW = state.currentPieceWorldWidth / 2;
      const gripLeft = new THREE.Vector3(p.x - halfW * 0.44, p.y + 0.35, p.z + DEPTH * 0.3);
      const gripRight = new THREE.Vector3(p.x + halfW * 0.44, p.y + 0.35, p.z + DEPTH * 0.3);
      const origin1 = new THREE.Vector3(p.x + halfW * 0.7, p.y + 2.6, p.z - DEPTH * 1.6);
      const origin2 = new THREE.Vector3(p.x + halfW * 0.7, p.y + 2.2, p.z - DEPTH * 1.6);
      orientBetween(stick1, origin1, gripLeft);
      orientBetween(stick2, origin2, gripRight);
    }

    function updateCurrentPosition() {
      state.currentMesh.position.set(worldX(state.current.x, state.current.width), worldY(state.current.bottom) + (blockHeight * SCALE) / 2, 0);
      updateSticks();
    }

    function spawnPiece() {
      const width = Math.max(6, Math.round(state.nextWidth));
      const fish = randomFish();
      const dynamicHoldHeight = state.stack.length * blockHeight + holdOffset;
      state.current = { x: 0, width, bottom: dynamicHoldHeight, fish };
      state.direction = 1;
      state.speed = 2.2 + state.stack.length * 0.06;
      state.falling = false;
      setFishName(fish.name);
      if (state.currentMesh) scene.remove(state.currentMesh);
      state.currentMesh = makePieceMesh(width, fish);
      state.currentPieceWorldWidth = width * SCALE;
      scene.add(state.currentMesh);
      updateCameraFraming();
      updateCurrentPosition();
    }

    function addLandedPiece(pixelX, pixelWidth, fish, index, perfect) {
      const mesh = makePieceMesh(pixelWidth, fish);
      mesh.position.set(worldX(pixelX, pixelWidth), worldY(index * blockHeight) + (blockHeight * SCALE) / 2, 0);
      mesh.userData.jiggleStart = performance.now();
      if (perfect) {
        mesh.userData.goldUntil = performance.now() + 1400;
        mesh.material.forEach((m) => { m.emissive = new THREE.Color(0xffcc00); m.emissiveIntensity = 1.4; });
      }
      towerGroup.add(mesh);
      return mesh;
    }

    function fallAwayPiece(pixelX, pixelWidth, indexBottom, fish, toLeft) {
      const mesh = makePieceMesh(pixelWidth, fish);
      mesh.position.set(worldX(pixelX, pixelWidth), worldY(indexBottom) + (blockHeight * SCALE) / 2, 0);
      mesh.material.forEach((m) => { m.transparent = true; });
      scene.add(mesh);
      const dir = toLeft ? -1 : 1;
      state.flyingPieces.push({
        mesh,
        vx: dir * (0.09 + Math.random() * 0.05),
        vy: 0.03 + Math.random() * 0.02,
        vz: (Math.random() - 0.5) * 0.1,
        rx: (Math.random() - 0.5) * 0.14,
        ry: dir * (0.05 + Math.random() * 0.06),
        rz: dir * (0.1 + Math.random() * 0.08),
        born: performance.now(),
        life: 700,
      });
    }

    function triggerCombo(text) {
      setComboText(text);
      setComboActive(false);
      requestAnimationFrame(() => setComboActive(true));
      setTimeout(() => setComboActive(false), 1100);
    }

    function finishDrop() {
      if (state.stack.length === 0) {
        state.stack.push({ x: state.current.x, width: state.current.width, fish: state.current.fish, perfect: false });
        state.nextWidth = state.current.width;
        setScore(state.stack.length);
        state.points += 1;
        setPoints(state.points);
        addLandedPiece(state.current.x, state.current.width, state.current.fish, 0, false);
        scene.remove(state.currentMesh);
        state.currentMesh = null;
        spawnPiece();
        return;
      }
      const top = state.stack[state.stack.length - 1];
      const leftDiff = Math.abs(state.current.x - top.x);
      const rightDiff = Math.abs((state.current.x + state.current.width) - (top.x + top.width));
      const isPerfect = leftDiff <= perfectTolerance && rightDiff <= perfectTolerance;
      let placedX, placedWidth;

      if (isPerfect) {
        placedX = top.x; placedWidth = top.width;
        state.perfectStreak += 1;
        state.perfectCount += 1;
        state.bloomFlash = Math.min(1.3, 0.5 + state.perfectStreak * 0.06); // הבזק זוהר שגדל עם הרצף
        if (state.perfectStreak >= 6) { state.growing = true; setGrowingActive(true); }
      } else {
        const overlapStart = Math.max(top.x, state.current.x);
        const overlapEnd = Math.min(top.x + top.width, state.current.x + state.current.width);
        const overlapWidth = overlapEnd - overlapStart;
        if (overlapWidth <= 5) { endGame(); return; }
        const landingBottom = state.stack.length * blockHeight;
        if (state.current.x < overlapStart) fallAwayPiece(state.current.x, overlapStart - state.current.x, landingBottom, state.current.fish, true);
        if (state.current.x + state.current.width > overlapEnd) fallAwayPiece(overlapEnd, (state.current.x + state.current.width) - overlapEnd, landingBottom, state.current.fish, false);
        placedX = overlapStart; placedWidth = overlapWidth;
        state.perfectStreak = 0; state.growing = false; setGrowingActive(false);
      }

      state.points += 1;
      state.stack.push({ x: placedX, width: placedWidth, fish: state.current.fish, perfect: isPerfect });
      state.nextWidth = (state.growing && isPerfect) ? Math.min(maxGrowWidth, placedWidth * growthFactor) : placedWidth;

      setScore(state.stack.length);
      setPoints(state.points);
      setPerfectCount(state.perfectCount);
      addLandedPiece(placedX, placedWidth, state.current.fish, state.stack.length - 1, isPerfect);
      scene.remove(state.currentMesh);
      state.currentMesh = null;

      if (isPerfect) {
        let msg = null;
        if (state.perfectStreak % 10 === 0) msg = '10 ברצף! אלוף!';
        else if (state.perfectStreak % 5 === 0) msg = 'חמישייה מושלמת!';
        else if (state.perfectStreak % 3 === 0) msg = 'שלישייה מושלמת!';
        else {
          const praises = ['יפה!', 'מדויק!', 'בול!', 'מושלם!', 'וואו!'];
          msg = praises[Math.floor(Math.random() * praises.length)];
        }
        triggerCombo(msg);
      }

      spawnPiece();
    }

    function endGame() {
      state.running = false;
      state.bloomFlash = 0.9; // הבזק זוהר דועך ברגע הפסילה
      cancelAnimationFrame(state.animationId);
      if (state.stack.length > state.bestHeight) { state.bestHeight = state.stack.length; setBestHeight(state.bestHeight); }
      if (state.points > state.bestPoints) { state.bestPoints = state.points; setBestPoints(state.bestPoints); }
      if (state.currentMesh) {
        state.currentMesh.material.forEach((m) => { m.transparent = true; });
        state.flyingPieces.push({
          mesh: state.currentMesh,
          vx: (Math.random() - 0.5) * 0.09,
          vy: 0.015,
          vz: (Math.random() - 0.5) * 0.09,
          rx: (Math.random() - 0.5) * 0.16,
          ry: (Math.random() - 0.5) * 0.12,
          rz: (Math.random() - 0.5) * 0.16,
          born: performance.now(),
          life: 1100,
        });
        state.currentMesh = null;
      }
      stick1.visible = false; stick2.visible = false;
      setFinalText(`גובה ${state.stack.length} | ניקוד ${state.points}`);
      setGameOver(true);
      setGameStarted(false);

      const cleanupLoop = setInterval(() => {
        renderFrame();
        if (state.flyingPieces.length === 0) clearInterval(cleanupLoop);
      }, 16);
    }

    function renderFrame() {
      const now = performance.now();

      // בלום דינמי - עוצמה וגודל שמשתנים לאורך זמן, לפי גובה, מצב גדילה ובאירועים
      state.bloomFlash *= 0.9; // דעיכת ההבזק
      const ts = now * 0.001;
      const breathStrength = Math.sin(ts * 1.7) * 0.1 + Math.sin(ts * 0.6) * 0.05; // "נשימה" לא-מחזורית בעוצמה
      const breathRadius = Math.sin(ts * 1.1 + 1.3) * 0.13;                        // "נשימה" בגודל/פיזור
      const heightGlow = Math.min(0.3, state.stack.length * 0.012);                // יותר זוהר ככל שהמגדל עולה
      const growthBonus = state.growing ? 0.3 + Math.sin(ts * 6) * 0.12 : 0;       // מצב גדילה - פועם מהר
      bloomPass.strength = Math.max(0, 0.5 + breathStrength + heightGlow + growthBonus + state.bloomFlash);
      bloomPass.radius = Math.min(1, Math.max(0.15, 0.4 + breathRadius + state.bloomFlash * 0.45));

      towerGroup.children.forEach((mesh) => {
        if (mesh.userData.jiggleStart) {
          const t = (now - mesh.userData.jiggleStart) / 400;
          if (t <= 1) { const s = jiggleScale(t); mesh.scale.set(s.x, s.y, s.x); }
          else { mesh.scale.set(1, 1, 1); mesh.userData.jiggleStart = null; }
        }
        if (mesh.userData.goldUntil) {
          if (now > mesh.userData.goldUntil) { mesh.material.forEach((m) => { m.emissiveIntensity = 0; }); mesh.userData.goldUntil = null; }
          else { const remain = (mesh.userData.goldUntil - now) / 1400; mesh.material.forEach((m) => { m.emissiveIntensity = 1.4 * remain; }); }
        }
      });
      for (let i = state.flyingPieces.length - 1; i >= 0; i--) {
        const f = state.flyingPieces[i];
        f.vy -= 0.006;
        f.mesh.position.x += f.vx;
        f.mesh.position.y += f.vy;
        f.mesh.position.z += f.vz;
        f.mesh.rotation.x += f.rx;
        f.mesh.rotation.y += f.ry;
        f.mesh.rotation.z += f.rz;
        if (f.mesh.position.y < -8) {
          scene.remove(f.mesh);
          f.mesh.geometry.dispose();
          f.mesh.material.forEach((m) => m.dispose());
          state.flyingPieces.splice(i, 1);
        }
      }
      composer.render();
    }

    function gameLoop() {
      if (!state.running) return;

      const targetSky = getSkyColors(state.stack.length);
      state.currentSkyTop = lerpColor(state.currentSkyTop, targetSky.top, 0.015);
      state.currentSkyBottom = lerpColor(state.currentSkyBottom, targetSky.bottom, 0.015);
      setSkyBg(skyGradientCSS(state.currentSkyTop, state.currentSkyBottom));
      paintSky(state.currentSkyTop, state.currentSkyBottom);

      if (state.falling) {
        state.current.bottom -= fallSpeed;
        const targetBottom = state.stack.length * blockHeight;
        if (state.current.bottom <= targetBottom) {
          state.current.bottom = targetBottom;
          updateCurrentPosition();
          finishDrop();
          renderFrame();
          state.animationId = requestAnimationFrame(gameLoop);
          return;
        }
        updateCurrentPosition();
      } else {
        state.current.x += state.direction * state.speed;
        if (state.current.x <= 0) { state.current.x = 0; state.direction = 1; }
        if (state.current.x + state.current.width >= gameAreaWidth) { state.current.x = gameAreaWidth - state.current.width; state.direction = -1; }
        updateCurrentPosition();
      }
      renderFrame();
      state.animationId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
      setGameOver(false);
      setGameStarted(true);
      towerGroup.children.slice().forEach((m) => { towerGroup.remove(m); m.geometry.dispose(); m.material.forEach((mm) => mm.dispose()); });
      state.flyingPieces.forEach((f) => scene.remove(f.mesh));
      state.flyingPieces = [];
      if (state.currentMesh) { scene.remove(state.currentMesh); state.currentMesh = null; }

      state.stack = [];
      state.running = true;
      state.falling = false;
      state.nextWidth = startWidthConst;
      state.points = 0;
      state.perfectCount = 0;
      state.perfectStreak = 0;
      state.growing = false;
      setGrowingActive(false);
      setScore(0); setPoints(0); setPerfectCount(0);
      state.currentSkyTop = [110, 193, 232];
      state.currentSkyBottom = [190, 231, 245];
      setSkyBg(skyGradientCSS(state.currentSkyTop, state.currentSkyBottom));
      paintSky(state.currentSkyTop, state.currentSkyBottom);
      state.current = null;
      updateCameraFraming();

      spawnPiece();
      state.animationId = requestAnimationFrame(gameLoop);
    }

    function drop() {
      if (!state.running || state.falling) return;
      state.falling = true;
    }

    g.current = { startGame, drop, state };
    renderFrame();

    function handleKey(e) {
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.running) drop(); else startGame();
      }
    }
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(state.animationId);
      // מסירים קודם את הקנבס מההורה האמיתי שלו (עמיד ל-Hot-Reload), ורק אז משחררים משאבים
      const el = renderer.domElement;
      if (el.parentNode) el.parentNode.removeChild(el);
      try { composer.dispose(); } catch (e) {}
      try { renderer.dispose(); } catch (e) {}
    };
  }, []);

  function handleStartClick() { g.current.startGame(); }
  function handleAreaClick() { if (g.current.state && g.current.state.running) g.current.drop(); }
  function handleRestartClick(e) { e.stopPropagation(); g.current.startGame(); }

  return (
    <div dir="rtl" style={{ fontFamily: "'Noto Sans JP', -apple-system, Segoe UI, Arial, sans-serif", background: theme.bg, color: theme.foreground, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 12px', minHeight: '100vh' }}>
      <style>{`
        @keyframes growPulse { 0%,100% { transform: scale(1);} 50% { transform: scale(1.12);} }
        @keyframes bob { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-8px);} }
        @keyframes comboText {
          0% { opacity:0; transform: translateY(10px) scale(0.8);}
          20% { opacity:1; transform: translateY(0) scale(1.1);}
          35% { transform: scale(1);}
          80% { opacity:1;}
          100% { opacity:0; transform: translateY(-20px) scale(1);}
        }
      `}</style>

      <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 20, fontWeight: 600, letterSpacing: '0.01em', color: theme.foreground, margin: '0 0 4px' }}>מגדל סושי - תלת מימד</h1>
      <p style={{ fontSize: 14, color: theme.muted, margin: '0 0 8px' }}>לחץ <strong>רווח</strong> (או געו במסך) כדי להפיל את הסושי</p>
      <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 16, fontWeight: 600, color: theme.accentLight, margin: '0 0 4px' }}>גובה: {score}</p>
      <p style={{ fontSize: 12, color: theme.muted, margin: '0 0 12px' }}>דג: {fishName}</p>

      <div
        onClick={handleAreaClick}
        style={{ position: 'relative', width: 300, height: 400, background: skyBg, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: `0 8px 28px rgba(0,0,0,0.55), 0 0 0 1px ${theme.border}`, transition: 'background 1.2s ease', touchAction: 'manipulation' }}
      >
        <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

        <div style={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', fontSize: 26, fontWeight: 700, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>{points}</div>
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 11, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>בולים: {perfectCount}</div>
        <div style={{
          position: 'absolute', top: 26, right: 10, fontSize: 11, fontWeight: 700, color: '#ffcc00',
          textShadow: '0 1px 3px rgba(0,0,0,0.6)', pointerEvents: 'none',
          opacity: growingActive ? 1 : 0, transform: growingActive ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          animation: growingActive ? 'growPulse 0.9s ease-in-out infinite' : 'none',
        }}>🔥 מצב גדילה</div>

        <p style={{
          position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center', fontSize: 20, fontWeight: 700,
          color: theme.accent, textShadow: '0 0 8px white', pointerEvents: 'none', margin: 0,
          opacity: comboActive ? 1 : 0,
          animation: comboActive ? 'comboText 1.1s ease-out' : 'none',
        }}>{comboText}</p>

        {gameOver && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 20, fontWeight: 600, margin: 0 }}>נפסלת!</p>
            <p style={{ fontSize: 16, margin: 0 }}>{finalText}</p>
            <button onClick={handleRestartClick} style={{ padding: '10px 22px', borderRadius: 24, border: `1px solid rgba(0,0,0,0.15)`, background: theme.accent, color: theme.surface, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>שחק שוב</button>
          </div>
        )}

        {!gameStarted && !gameOver && (
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,20,10,0.55), rgba(10,5,0,0.72))', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', padding: '0 24px', cursor: 'pointer' }}>
            <div style={{ fontSize: 44, animation: 'bob 1.8s ease-in-out infinite' }}>🍣</div>
            <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 24, fontWeight: 600, margin: '4px 0 0', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>מגדל סושי - תלת מימד</h2>
            <p style={{ fontSize: 13, margin: 0, color: '#f0f0f0', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>הפילו פיסת סושי בדיוק מעל הקודמת<br />ובנו את המגדל הכי גבוה שאפשר</p>
            {bestHeight > 0 && (
              <p style={{ fontSize: 13, color: theme.accentLight, fontWeight: 700, margin: '2px 0 6px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>שיא: גובה {bestHeight} | ניקוד {bestPoints}</p>
            )}
            <button onClick={handleStartClick} style={{ padding: '10px 22px', borderRadius: 24, border: `1px solid rgba(0,0,0,0.15)`, background: theme.accent, color: theme.surface, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>התחילו לשחק</button>
          </div>
        )}
      </div>
    </div>
  );
}
