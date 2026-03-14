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

      const tickerW = CANVAS_W - DEST_X - H_PAD;
      ctx.save();
      ctx.beginPath();
      ctx.rect(DEST_X, y, tickerW, rowH[i]);
      ctx.clip();
      ctx.fillText(row.text.slice(tickerOffset), DEST_X, mid);
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

/* ─── GIF + Video encoding ──────────────────────────────────── */
function encodeGif(frames, frameMs) {
  const gif = new GIF({ workers: 2, workerScript: './third-party/gif-js/gif.worker.js', quality: 6 });
  frames.forEach(f => gif.addFrame(f, { delay: frameMs, copy: true }));
  gif.on('finished', blob => {
    document.getElementById('gifAnimation').src = URL.createObjectURL(blob);
    document.getElementById('gifSize').innerText = '~' + Math.ceil(blob.size / 1024) + ' kB';
    const c = document.getElementById('gifAnimationContainer');
    c.style.display = 'block';
    c.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  gif.render();
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

  const step    = Math.max(1, parseInt(document.getElementById('tickerStep').value) || 1);
  const textLen = infoRow.text.length;
  const nFrames = Math.ceil(textLen / step) + 1;
  const frameMs = parseInt(slider.value);

  const pb = document.getElementById('progressBar');
  const pt = document.getElementById('progressText');
  const pc = document.getElementById('progressContainer');
  pb.max = nFrames;
  pc.style.display = 'flex';

  const fc     = document.createElement('canvas');
  const frames = [];

  for (let offset = 0, n = 0; offset <= textLen; offset += step, n++) {
    drawFrame(fc, rows, offset);

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
