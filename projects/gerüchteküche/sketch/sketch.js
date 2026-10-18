const W = 448;
const H = 256;

let currentScene = 1;
const CHANGE_LIMIT = 0.5;

let allImages = [];
let img1, img2, img3, img4, img5;
let tile5;

// ---------- SKETCH 1 ----------
let DOT_SPACING = 4;
let DOT_MAX = 7;
let THRESH = 220;

let radiusHover = 10;
let pushPerFrame = 2;
let friction = 0.9;

let points = [];

// ---------- SKETCH 2 ----------
let cell = 4;
let thresh = 180;
let corner = 0;

let baseFactor = 2.0;
let growSpeed = 0.08;
let maxFactor = 9.0;

let gradientSteps = 12;
let innerAlpha = 255;
let outerAlpha = 255;

const outerR = 255, outerG = 0, outerB = 0;
const innerR = 255, innerG = 255, innerB = 255;

let cols, rows;
let visited;
let factors;

// ---------- SKETCH 3 ----------
const SCAN_STEP_Y = 4;
const MIN_RUN = 5;
const BLACK_THR = 70;
const BAR_THICK = 30;

const HOVER_PAD = 2;
const GROW_ACCEL_Y = 1.0;
const GROW_FRICTION = 0.85;
const HOVER_HOLD_FRAMES = 7;
const MIN_TRIGGER_VY = 2.5;

const MAX_H_ABS = 0;
const SOFT_EDGE = 2;

let bars3 = [];

// ---------- SKETCH 4 ----------
let threshold4 = 100;
let basePixelSize4 = 4;
let bodyRadius4 = 7;
let bodyForce4 = 6.0;

let gravity4 = 0.25;
let damping4 = 0.995;
let bounce4 = 0.9;

let tiles4 = [];

// ---------- SKETCH 5 ----------
let step5 = 10;
let threshold5 = 40;
let tiles5 = [];

function preload() {
  allImages = [
    loadImage("1.jpeg"),
    loadImage("2.jpeg"),
    loadImage("3.jpeg"),
    loadImage("4.jpeg"),
    loadImage("5.jpeg"),
    loadImage("6.jpeg"),
    loadImage("7.jpeg"),
    loadImage("8.jpeg"),
    loadImage("9.jpeg"),
    loadImage("10.jpeg"),
    loadImage("11.jpeg"),
    loadImage("12.jpeg")
  ];

  tile5 = loadImage("money.png");
}

function setup() {
  createCanvas(W, H);
  pixelDensity(1);
  noStroke();

  let shuffledImages = shuffle([...allImages]);

  img1 = shuffledImages[0];
  img2 = shuffledImages[1];
  img3 = shuffledImages[2];
  img4 = shuffledImages[3];
  img5 = shuffledImages[4];

  setupSketch1();
  setupSketch2();
  setupSketch3();
  setupSketch4();
  setupSketch5();
}

function draw() {
  // Statt Kopfpositionen: der Mauszeiger als einziger "Punkt"
  let headPoints = getPointerPoints();

  if (currentScene === 1) {
    drawSketch1(headPoints);

    if (getSketch1Progress() >= CHANGE_LIMIT) {
      switchToScene(2);
      console.log("Wechsel zu Szene 2");
    }
  }

  else if (currentScene === 2) {
    drawSketch2(headPoints);

    if (getSketch2Progress() >= CHANGE_LIMIT) {
      switchToScene(3);
      console.log("Wechsel zu Szene 3");
    }
  }

  else if (currentScene === 3) {
    drawSketch3(headPoints);

    if (getSketch3Progress() >= CHANGE_LIMIT) {
      switchToScene(4);
      console.log("Wechsel zu Szene 4");
    }
  }

  else if (currentScene === 4) {
    drawSketch4(headPoints);

    if (getSketch4Progress() >= CHANGE_LIMIT) {
      switchToScene(5);
      console.log("Wechsel zu Szene 5");
    }
  }

  else {
    drawSketch5(headPoints);

    if (getSketch5Progress() >= 0.4) {
      switchToScene(1);
      console.log("Wechsel zu Szene 1");
    }
  }
}

// ---------- MAUS-EINGABE ----------
// Liefert dieselbe Struktur wie früher getHeadPoints():
// [{ x, y, dx, dy, modeAxis }] – oder [] wenn die Maus ausserhalb ist.
function getPointerPoints() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return [];
  }

  const dx = mouseX - pmouseX;
  const dy = mouseY - pmouseY;

  let modeAxis = "none";
  if (abs(dx) > abs(dy)) {
    modeAxis = "x";
  } else if (abs(dy) > abs(dx)) {
    modeAxis = "y";
  }

  return [{ id: 0, x: mouseX, y: mouseY, dx, dy, modeAxis }];
}

// ---------- SKETCH 1 ----------
function setupSketch1() {
  img1.resize(W, H);
  img1.loadPixels();

  for (let y = 0; y < H; y += DOT_SPACING) {
    for (let x = 0; x < W; x += DOT_SPACING) {
      const idx = 4 * (y * W + x);

      const r = img1.pixels[idx + 0];
      const g = img1.pixels[idx + 1];
      const b = img1.pixels[idx + 2];

      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      let t = constrain((THRESH - luma) / THRESH, 0, 1);
      const rad = t * DOT_MAX;

      if (rad > 0.05) {
        points.push({
          x0: x,
          y0: y,
          x: x,
          y: y,
          r: rad,
          vx: 0,
          vy: 0
        });
      }
    }
  }
}

function drawSketch1(headPoints) {
  background(255, 41, 41);

  for (let hp of headPoints) {
    fill(0, 255, 255, 120);
    circle(hp.x, hp.y, radiusHover * 2);
  }

  const ctx = drawingContext;

  for (const p of points) {
    for (let hp of headPoints) {
      const dx = p.x - hp.x;
      const dy = p.y - hp.y;
      const d = Math.hypot(dx, dy);

      if (d < radiusHover && hp.modeAxis !== "none") {
        const falloff = smoothstep(1, 0, d / radiusHover);

        if (hp.modeAxis === "x") {
          const dirX = dx >= 0 ? 1 : -1;
          p.vx += dirX * pushPerFrame * falloff;
        } else if (hp.modeAxis === "y") {
          const dirY = dy >= 0 ? 1 : -1;
          p.vy += dirY * pushPerFrame * falloff;
        }
      }
    }

    p.vx *= friction;
    p.vy *= friction;

    p.x += p.vx;
    p.y += p.vy;

    p.x = constrain(p.x, 0, W);
    p.y = constrain(p.y, 0, H);

    const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    gr.addColorStop(0.0, "#101010");
    gr.addColorStop(0.5, "#3297ff");
    gr.addColorStop(0.7, "#FBFCFD");

    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------- SKETCH 2 ----------
function setupSketch2() {
  img2.resize(W, H);
  img2.loadPixels();
  buildGrid();
}

function drawSketch2(headPoints) {
  background(255);

  for (let hp of headPoints) {
    fill(255);
    circle(hp.x, hp.y, 20);
  }

  for (let gy = 0; gy < H; gy += cell) {
    for (let gx = 0; gx < W; gx += cell) {
      const sx = min(gx + (cell >> 1), W - 1);
      const sy = min(gy + (cell >> 1), H - 1);

      const idx = 4 * (sy * W + sx);
      const r = img2.pixels[idx + 0];
      const g = img2.pixels[idx + 1];
      const b = img2.pixels[idx + 2];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      if (luma < thresh) {
        const col = floor(gx / cell);
        const row = floor(gy / cell);

        let isHover = false;

        for (let hp of headPoints) {
          const d = dist(gx + cell / 2, gy + cell / 2, hp.x, hp.y);

          if (d < 5) {
            isHover = true;
            break;
          }
        }

        if (isHover) {
          if (!visited[row][col]) {
            visited[row][col] = true;
            factors[row][col] = baseFactor;
          } else {
            factors[row][col] = min(maxFactor, factors[row][col] + growSpeed);
          }
        }

        if (visited[row][col]) {
          const cx = gx + cell / 2;
          const cy = gy + cell / 2;
          const f = factors[row][col];
          drawRadialEllipse(cx, cy, cell * f, cell * f);
        } else {
          drawRadialRect(gx, gy, cell, cell, corner);
        }
      }
    }
  }
}

// ---------- SKETCH 3 ----------
function setupSketch3() {
  img3.resize(W, H);
  img3.loadPixels();

  bars3 = [];

  for (let y = 0; y < H; y += SCAN_STEP_Y) {
    let inRun = false;
    let start = 0;

    for (let x = 0; x <= W; x++) {
      let isDark = false;

      if (x < W) {
        isDark = luminanceAt(img3, x, y) <= BLACK_THR;
      }

      if (isDark && !inRun) {
        inRun = true;
        start = x;
      }

      if ((!isDark || x === W) && inRun) {
        let end = x;
        let runLen = end - start;

        if (runLen >= MIN_RUN) {
          const x0 = Math.max(start, 0);
          const w0 = Math.min(runLen, width - x0);
          const y0 = clamp(y, 0, height - BAR_THICK);
          const h0 = BAR_THICK;

          if (w0 > 0) {
            bars3.push({
              x: x0,
              y: y0,
              w: w0,
              h: h0,
              w0,
              h0,
              vy: 0,
              hoverFrames: 0
            });
          }
        }

        inRun = false;
      }
    }
  }
}

function drawSketch3(headPoints) {
  background(0);
  const ctx = drawingContext;

  for (const b of bars3) {
    let hit = false;

    for (let hp of headPoints) {
      if (
        hp.x >= b.x - HOVER_PAD &&
        hp.x <= b.x + b.w + HOVER_PAD &&
        hp.y >= b.y - HOVER_PAD &&
        hp.y <= b.y + b.h + HOVER_PAD
      ) {
        hit = true;
        break;
      }
    }

    if (hit) {
      b.hoverFrames++;

      if (b.hoverFrames >= HOVER_HOLD_FRAMES) {
        b.vy += GROW_ACCEL_Y;
      }
    } else {
      b.hoverFrames = 0;
    }

    b.vy *= GROW_FRICTION;

    if (b.vy > MIN_TRIGGER_VY) {
      const grow = b.vy;
      const bottom = b.y + b.h;

      b.h += grow;
      b.y = bottom - b.h;
    }

    if (b.y < 0) {
      const overflow = -b.y;
      b.y = 0;
      b.h = Math.max(0, b.h - overflow);
    }

    if (b.y + b.h > height) {
      b.h = Math.max(0, height - b.y);
    }

    if (b.x < 0) {
      const overflow = -b.x;
      b.x = 0;
      b.w = Math.max(0, b.w - overflow);
    }

    if (b.x + b.w > width) {
      b.w = Math.max(0, width - b.x);
    }

    if (MAX_H_ABS > 0 && b.h > MAX_H_ABS) {
      const bottom = b.y + b.h;
      b.h = MAX_H_ABS;
      b.y = bottom - b.h;
    }

    drawBar(ctx, b.x, b.y, b.w, b.h);
  }

  for (let hp of headPoints) {
    noStroke();

    fill(255, 0, 0, 40);
    circle(hp.x, hp.y, 70);

    fill(255, 0, 0, 120);
    circle(hp.x, hp.y, 40);

    fill(255, 0, 0);
    circle(hp.x, hp.y, 15);
  }
}

// ---------- SKETCH 4 ----------
function setupSketch4() {
  for (let i = 0; i < 4000; i++) {
    tiles4.push({
      px: 0,
      py: 0,
      vx: 0,
      vy: 0,
      s: basePixelSize4,
      alive: false,
      falling: false,
      personalForce: 1.0
    });
  }

  resetSketch4();
}

function resetSketch4() {
  img4.resize(W, H);
  img4.loadPixels();

  let poolIndex = 0;

  for (let y = 0; y < img4.height; y += basePixelSize4) {
    for (let x = 0; x < img4.width; x += basePixelSize4) {
      const idx = (y * img4.width + x) * 4;

      const avg =
        (img4.pixels[idx] +
          img4.pixels[idx + 1] +
          img4.pixels[idx + 2]) / 3;

      if (avg < threshold4 && poolIndex < tiles4.length) {
        let t = tiles4[poolIndex];

        t.px = x;
        t.py = y;
        t.vx = 0;
        t.vy = 0;
        t.s = basePixelSize4;
        t.alive = true;
        t.falling = false;
        t.personalForce = random(0.5, 2.0);

        poolIndex++;
      }
    }
  }

  for (let i = poolIndex; i < tiles4.length; i++) {
    tiles4[i].alive = false;
  }
}

function drawSketch4(headPoints) {
  background(255, 243, 74);
  noStroke();

  for (let hp of headPoints) {
    fill(255, 0, 0);
    circle(hp.x, hp.y, bodyRadius4 * 5);
  }

  const r2 = bodyRadius4 * bodyRadius4;

  fill(0);

  for (let t of tiles4) {
    if (!t.alive) continue;

    for (let hp of headPoints) {
      const dx = hp.x - t.px;
      const dy = hp.y - t.py;
      const d2 = dx * dx + dy * dy;

      if (d2 < r2) {
        t.falling = true;

        const d = sqrt(d2) + 0.0001;
        const nx = dx / d;
        const ny = dy / d;
        const falloff = 1 - d / bodyRadius4;
        const punch =
          bodyForce4 *
          falloff *
          falloff *
          5.0 *
          t.personalForce;

        t.vx -= nx * punch;
        t.vy -= ny * punch;
      }
    }

    if (t.falling) {
      t.vy += gravity4;

      t.vx *= damping4;
      t.vy *= damping4;

      t.px += t.vx;
      t.py += t.vy;

      if (t.px <= 0 || t.px + t.s >= width) {
        t.px = constrain(t.px, 0, width - t.s);
        t.vx *= -bounce4;
      }

      if (t.py <= 0 || t.py + t.s >= height) {
        t.py = constrain(t.py, 0, height - t.s);
        t.vy *= -bounce4;
      }
    }

    rect(t.px, t.py, max(1, t.s - 1.5), max(1, t.s - 1.5));
  }
}

// ---------- SKETCH 5 ----------
function setupSketch5() {
  img5.resize(W, H);
  img5.loadPixels();

  imageMode(CENTER);

  tiles5 = [];

  for (let y = 0; y < H; y += step5) {
    for (let x = 0; x < W; x += step5) {
      let c = img5.get(x, y);
      let b = brightness(c);

      if (b < threshold5) {
        tiles5.push({
          x: x,
          y: y,
          y0: y,
          vy: 0,
          state: "still",
          rot: random(-0.1, 0.1),
          targetRot: HALF_PI
        });
      }
    }
  }
}

function drawSketch5(headPoints) {
  background(0);

  for (let hp of headPoints) {
    fill(255, 0, 0);
    circle(hp.x, hp.y, step5 * 2);
  }

  for (let t of tiles5) {
    let tileH = step5 * (tile5.height / tile5.width);
    let floorY = H - tileH / 2;

    for (let hp of headPoints) {
      let d = dist(hp.x, hp.y, t.x, t.y);

      if (d < step5 * 3 && t.state === "still") {
        t.vy = random(-4, -1);
        t.state = "falling";
        break;
      }
    }

    if (t.state === "falling") {
      t.y += t.vy;
      t.vy += 0.05;

      t.rot = lerp(t.rot, t.targetRot, 0.08);

      if (t.y >= floorY) {
        t.y = floorY;
        t.vy = 0;
        t.rot = t.targetRot;
        t.state = "landed";
      }
    }

    push();
    translate(t.x, t.y);
    rotate(t.rot);
    image(tile5, 0, 0, step5, tileH);
    pop();
  }
}

// ---------- SHAPES ----------
function drawRadialEllipse(cx, cy, w, h) {
  for (let i = gradientSteps; i >= 1; i--) {
    const t = i / gradientSteps;

    fill(
      lerp(outerR, innerR, 1 - t),
      lerp(outerG, innerG, 1 - t),
      lerp(outerB, innerB, 1 - t),
      lerp(outerAlpha, innerAlpha, 1 - t)
    );

    ellipse(cx, cy, w * t, h * t);
  }
}

function drawRadialRect(x, y, w, h, r = 0) {
  const cx = x + w / 2;
  const cy = y + h / 2;

  rectMode(CENTER);

  for (let i = gradientSteps; i >= 1; i--) {
    const t = i / gradientSteps;

    fill(
      lerp(outerR, innerR, 1 - t),
      lerp(outerG, innerG, 1 - t),
      lerp(outerB, innerB, 1 - t),
      lerp(outerAlpha, innerAlpha, 1 - t)
    );

    rect(cx, cy, w * t, h * t, r * t);
  }

  rectMode(CORNER);
}

function drawBar(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0.0, "#FBFCFD");
  g.addColorStop(0.4, "#3297ff");
  g.addColorStop(1.0, "#FBFCFD");

  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  if (SOFT_EDGE > 0) {
    const s = ctx.createLinearGradient(x, y + h, x, y + h + SOFT_EDGE);
    s.addColorStop(0.0, "rgba(0,0,0,0.45)");
    s.addColorStop(1.0, "rgba(0,0,0,0.0)");

    ctx.fillStyle = s;
    ctx.fillRect(x, y + h, w, SOFT_EDGE);
  }

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(x, y, w, 1);
}

// ---------- HELPERS ----------
function smoothstep(a, b, t) {
  t = constrain((t - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function luminanceAt(img, x, y) {
  x = int(constrain(x, 0, img.width - 1));
  y = int(constrain(y, 0, img.height - 1));

  const idx = 4 * (y * img.width + x);
  const r = img.pixels[idx];
  const g = img.pixels[idx + 1];
  const b = img.pixels[idx + 2];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function buildGrid() {
  cols = Math.ceil(W / cell);
  rows = Math.ceil(H / cell);

  visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  factors = Array.from({ length: rows }, () => Array(cols).fill(0));
}

function resetStates() {
  for (let r = 0; r < rows; r++) {
    visited[r].fill(false);
    factors[r].fill(0);
  }

  for (let b of bars3) {
    b.h = b.h0;
    b.y = clamp(b.y, 0, height - b.h);
    b.vy = 0;
    b.hoverFrames = 0;
  }

  resetSketch4();
}

function getSketch1Progress() {
  let changed = 0;

  for (let p of points) {
    let d = dist(p.x, p.y, p.x0, p.y0);

    if (d > 5) {
      changed++;
    }
  }

  return changed / max(1, points.length);
}

function getSketch2Progress() {
  let changed = 0;
  let total = 0;

  for (let gy = 0; gy < H; gy += cell) {
    for (let gx = 0; gx < W; gx += cell) {
      const sx = min(gx + (cell >> 1), W - 1);
      const sy = min(gy + (cell >> 1), H - 1);

      const idx = 4 * (sy * W + sx);
      const r = img2.pixels[idx + 0];
      const g = img2.pixels[idx + 1];
      const b = img2.pixels[idx + 2];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      if (luma < thresh) {
        const col = floor(gx / cell);
        const row = floor(gy / cell);

        total++;

        if (visited[row][col]) {
          changed++;
        }
      }
    }
  }

  return changed / max(1, total);
}

function getSketch3Progress() {
  let changed = 0;

  for (let b of bars3) {
    if (b.h > b.h0 * 1.5) {
      changed++;
    }
  }

  return changed / max(1, bars3.length);
}

function getSketch4Progress() {
  let changed = 0;
  let total = 0;

  for (let t of tiles4) {
    if (!t.alive) continue;

    total++;

    if (t.falling) {
      changed++;
    }
  }

  return changed / max(1, total);
}

function getSketch5Progress() {
  let changed = 0;

  for (let t of tiles5) {
    if (t.state !== "still") {
      changed++;
    }
  }

  return changed / max(1, tiles5.length);
}

function switchToScene(nextScene) {
  currentScene = nextScene;

  let newImg = random(allImages);

  if (currentScene === 1) {
    img1 = newImg;
    points = [];
    setupSketch1();
  }

  else if (currentScene === 2) {
    img2 = newImg;
    setupSketch2();
  }

  else if (currentScene === 3) {
    img3 = newImg;
    bars3 = [];
    setupSketch3();
  }

  else if (currentScene === 4) {
    img4 = newImg;
    resetSketch4();
  }

  else if (currentScene === 5) {
    img5 = newImg;
    tiles5 = [];
    setupSketch5();
  }

  console.log("Neue Szene:", currentScene);
}

function nextScene() {
  let n = currentScene + 1;
  if (n > 5) n = 1;
  switchToScene(n);
}

function keyPressed() {
  if (key.toUpperCase() === "R") resetStates();

  if (key === "f" || key === "F") {
    fullscreen(!fullscreen());
  }

  // Szene manuell wechseln (früher per Mausklick)
  if (key === "n" || key === "N") {
    nextScene();
  }
}
function mousePressed() {
  nextScene();
}