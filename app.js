"use strict";

/* ─── Constants ─────────────────────────────────────────────── */
const CANVAS_W   = 900;
const H_PAD      = 10;
const V_PAD      = 5;
const LINE_COL_W = 95;
const TIME_COL_W = 185;
const DEST_X     = H_PAD + LINE_COL_W; // 105

/* ─── DOM ───────────────────────────────────────────────────── */
const previewCanvas = document.getElementById('preview');
const slider        = document.getElementById('slider');
const intervalValue = document.getElementById('intervalValue');
intervalValue.innerText = slider.value + ' ms';
slider.oninput = () => { intervalValue.innerText = slider.value + ' ms'; };

/* ─── Font ──────────────────────────────────────────────────── */
const fontReady = document.fonts.load('64px "24 LED"');

/* ─── Data ──────────────────────────────────────────────────── */
const ROW_NAMES = ['one', 'two', 'three', 'four'];

function getRows() {
  return [1, 2, 3, 4].map(i => {
    const mode     = document.querySelector(`input[name="line_${ROW_NAMES[i-1]}"]:checked`).value;
    const fontSize = parseInt(document.getElementById(`fontSize${i}`).value) || 64;
    switch (mode) {
      case 'departure':
        return { type: 'departure',
          line: document.getElementById(`line${i}`).value,
          dest: document.getElementById(`dest${i}`).value,
          time: document.getElementById(`time${i}`).value,
          fontSize };
      case 'textRow':
        return { type: 'text',
          content: document.getElementById(`textContent${i}`).value,
          fontSize };
      default: // infoText
        return { type: 'info',
          text: document.getElementById('infoText').value,
          fontSize };
    }
  });
}

/* ─── Canvas drawing ────────────────────────────────────────── */
function drawFrame(canvas, rows, tickerOffset = 0) {
  const ctx  = canvas.getContext('2d');
  const rowH = rows.map(r => Math.ceil(r.fontSize * 1.35));
  canvas.width  = CANVAS_W;
  canvas.height = rowH.reduce((a, b) => a + b, 0) + V_PAD * 2;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle    = 'yellow';
  ctx.textBaseline = 'middle';

  let y = V_PAD;
  rows.forEach((row, i) => {
    const mid = y + rowH[i] / 2;
    ctx.font      = `${row.fontSize}px "24 LED"`;
    ctx.textAlign = 'left';

    if (row.type === 'departure') {
      ctx.fillText(row.line, H_PAD, mid);

      const destW = CANVAS_W - DEST_X - TIME_COL_W - H_PAD;
      ctx.save();
      ctx.beginPath();
      ctx.rect(DEST_X, y, destW, rowH[i]);
      ctx.clip();
      ctx.fillText(row.dest, DEST_X, mid);
      ctx.restore();

      ctx.textAlign = 'right';
      ctx.fillText(row.time, CANVAS_W - H_PAD, mid);

    } else if (row.type === 'text') {
      ctx.textAlign = 'center';
      ctx.fillText(row.content, CANVAS_W / 2, mid);

    } else { // info
      ctx.fillText('i', H_PAD, mid);

      const tickerX = DEST_X;
      const tickerW = CANVAS_W - tickerX - H_PAD;
      ctx.save();
      ctx.beginPath();
      ctx.rect(tickerX, y, tickerW, rowH[i]);
      ctx.clip();
      // Tile text for seamless endless loop
      const tileText = row.text + '    ';
      const tileW    = ctx.measureText(tileText).width;
      if (tileW > 0) {
        const startX = tickerX - (tickerOffset % tileW);
        for (let x = startX; x < tickerX + tickerW; x += tileW)
          ctx.fillText(tileText, x, mid);
      }
      ctx.restore();
    }
    y += rowH[i];
  });
}

/* ─── Live preview ──────────────────────────────────────────── */
let previewPending = false;
function schedulePreview() {
  if (previewPending) return;
  previewPending = true;
  requestAnimationFrame(() => {
    previewPending = false;
    drawFrame(previewCanvas, getRows());
  });
}

document.getElementById('rowControls').addEventListener('input',  schedulePreview);
document.getElementById('rowControls').addEventListener('change', e => {
  if (e.target.type === 'radio') {
    const row = parseInt(e.target.closest('.rowControl').dataset.row);
    syncRowFields(row);
  }
  schedulePreview();
});

/* ─── Mode field sync ───────────────────────────────────────── */
function syncRowFields(rowNum) {
  const mode = document.querySelector(`input[name="line_${ROW_NAMES[rowNum-1]}"]:checked`).value;
  document.querySelectorAll(`.rowControl[data-row="${rowNum}"] .fields`).forEach(f => {
    f.hidden = f.dataset.mode !== mode;
  });
}
[1, 2, 3, 4].forEach(syncRowFields); // init

/* ─── GIF encoder (inline, 2-color: black + yellow) ─────────── */
function encodeGif(frames, frameMs) {
  const W = frames[0].width;
  const H = frames[0].height;
  const delay = Math.round(frameMs / 10); // centiseconds

  // Convert canvas pixels to palette indices (0=black, 1=yellow)
  function getIndices(canvas) {
    const d = canvas.getContext('2d').getImageData(0, 0, W, H).data;
    const out = new Uint8Array(W * H);
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4] > 127 ? 1 : 0;
    return out;
  }

  // GIF LZW encoder (min code size = 2; clear=4, eoi=5, alpha=4)
  // Reuse table across frames to avoid repeated large allocations
  const _table = new Int32Array(4096 * 4);
  function lzwEncode(pixels) {
    _table.fill(-1);
    let codeSize = 3, nextCode = 6;
    const bytes = [];
    let buf = 0, bufBits = 0;

    const emit = c => {
      buf |= c << bufBits; bufBits += codeSize;
      while (bufBits >= 8) { bytes.push(buf & 0xFF); buf >>>= 8; bufBits -= 8; }
    };
    const reset = () => { _table.fill(-1); codeSize = 3; nextCode = 6; };

    emit(4); // CLEAR
    let prefix = pixels[0];
    for (let i = 1; i < pixels.length; i++) {
      const k = pixels[i], key = prefix * 4 + k;
      const found = _table[key];
      if (found >= 0) {
        prefix = found;
      } else {
        emit(prefix);
        if (nextCode > 4095) { emit(4); reset(); } // CLEAR + reset
        else {
          _table[key] = nextCode++;
          if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
        }
        prefix = k;
      }
    }
    emit(prefix);
    emit(5); // EOI
    if (bufBits > 0) bytes.push(buf & 0xFF);
    return bytes;
  }

  const w16 = n => [n & 0xFF, n >> 8];
  const parts = [];
  const add = arr => parts.push(new Uint8Array(arr));

  // Header + Logical Screen Descriptor + GCT (2 colors)
  add([0x47,0x49,0x46,0x38,0x39,0x61]);           // "GIF89a"
  add([...w16(W), ...w16(H), 0x90, 0, 0]);         // LSD: gctFlag+size=0 (2 entries)
  add([0, 0, 0,  255, 255, 0]);                    // GCT: black, yellow
  // Netscape extension: loop forever
  add([0x21,0xFF,0x0B, 78,69,84,83,67,65,80,69,50,46,48, 0x03,0x01,0,0,0]);

  for (const frame of frames) {
    // Graphic Control Extension
    add([0x21,0xF9,0x04, 0x00, ...w16(delay), 0x00, 0x00]);
    // Image Descriptor
    add([0x2C, 0,0,0,0, ...w16(W), ...w16(H), 0x00, 2]); // LZW min code size = 2

    const lzw = lzwEncode(getIndices(frame));
    for (let i = 0; i < lzw.length; i += 255) {
      const chunk = lzw.slice(i, i + 255);
      add([chunk.length, ...chunk]);
    }
    add([0]); // block terminator
  }
  add([0x3B]); // Trailer

  const blob = new Blob(parts, { type: 'image/gif' });
  document.getElementById('gifAnimation').src = URL.createObjectURL(blob);
  document.getElementById('gifSize').innerText = '~' + Math.ceil(blob.size / 1024) + ' kB';
  const c = document.getElementById('gifAnimationContainer');
  c.style.display = 'block';
  c.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function encodeVideo(frames, frameMs) {
  const MAX = 15000;
  let writer, ok = true;
  try { writer = new WebMWriter({ quality: 0.75, frameDuration: frameMs }); }
  catch { ok = false; }

  if (ok) {
    let dur = 0;
    outer: while (dur < MAX) {
      for (const f of frames) {
        if (dur >= MAX) break outer;
        try { writer.addFrame(f); dur += frameMs; }
        catch { ok = false; break outer; }
      }
    }
  }

  if (ok) {
    writer.complete().then(blob => {
      const url = URL.createObjectURL(blob);
      document.getElementById('video').src   = url;
      document.getElementById('downloadVideo').href = url;
      document.getElementById('videoSize').innerText = '~' + Math.ceil(blob.size / 1024) + ' kB';
    });
  } else {
    document.getElementById('video-container').innerText = 'WebM video not supported in this browser.';
    document.getElementById('video-download-container').innerText = '';
  }
}

/* ─── Generate ──────────────────────────────────────────────── */
let isGenerating = false;

async function generateTickerAnimation() {
  if (isGenerating) return;
  await fontReady;

  const rows    = getRows();
  const infoRow = rows.find(r => r.type === 'info');
  if (!infoRow) { alert('Set one row to "Info" mode to generate a ticker animation.'); return; }

  isGenerating = true;
  const btn = document.getElementById('generateTickerBtn');
  btn.disabled  = true;
  btn.innerText = 'Generating\u2026';

  document.getElementById('gifAnimationContainer').style.display = 'none';

  // Measure tile width (text + separator) using a throw-away canvas
  const mc   = document.createElement('canvas');
  const mctx = mc.getContext('2d');
  mctx.font  = `${infoRow.fontSize}px "24 LED"`;
  const tileW = Math.round(mctx.measureText(infoRow.text + '    ').width);
  if (tileW <= 0) { isGenerating = false; btn.disabled = false; btn.innerText = '\u26a1 Generate'; return; }

  const pixelStep = Math.max(1, parseInt(document.getElementById('tickerStep').value) || 10);
  const nFrames   = Math.ceil(tileW / pixelStep);
  const frameMs   = parseInt(slider.value);

  const pb = document.getElementById('progressBar');
  const pt = document.getElementById('progressText');
  const pc = document.getElementById('progressContainer');
  pb.max = nFrames;
  pc.style.display = 'flex';

  const fc     = document.createElement('canvas');
  const frames = [];

  for (let n = 0; n < nFrames; n++) {
    drawFrame(fc, rows, n * pixelStep);

    const copy = document.createElement('canvas');
    copy.width  = fc.width;
    copy.height = fc.height;
    copy.getContext('2d').drawImage(fc, 0, 0);
    frames.push(copy);

    if (n % 20 === 0) {
      pb.value      = n;
      pt.innerText  = `Frame ${n + 1} / ${nFrames}`;
      await new Promise(r => setTimeout(r, 0));
    }
  }

  pt.innerText = 'Encoding\u2026';
  encodeGif(frames, frameMs);
  encodeVideo(frames, frameMs);

  pc.style.display = 'none';
  btn.disabled     = false;
  btn.innerText    = '\u26a1 Generate';
  isGenerating     = false;
}

function downloadCanvas() {
  const a = document.createElement('a');
  a.download = 'display.gif';
  a.href     = document.getElementById('gifAnimation').src;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ─── Init ──────────────────────────────────────────────────── */
fontReady.then(schedulePreview);
