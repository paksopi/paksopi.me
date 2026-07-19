/* eslint-disable no-undef -- 'ort' is a runtime global loaded via a vendored <script> tag, not a module import */
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// Ported from a personal project (client-side ONNX Runtime Web + MediaPipe face
// detection, running entirely in the browser). Model: EmotiEffLib's enet_b0_8_va_mtl
// (Apache-2.0, https://github.com/sb-ai-lab/EmotiEffLib), no fine-tuning.
// Preprocessing mirrors cv2 INTER_LINEAR resize + ImageNet normalization so it
// matches the original Python model's expected input exactly.

const PP_MEAN = [0.485, 0.456, 0.406];
const PP_STD = [0.229, 0.224, 0.225];
const PP_SIZE = 224;
const EMOTIONS = [
  'Anger',
  'Contempt',
  'Disgust',
  'Fear',
  'Happiness',
  'Neutral',
  'Sadness',
  'Surprise',
];

function cv2LinearResize(srcRGBA, srcW, srcH, dst) {
  const out = new Uint8ClampedArray(dst * dst * 3);
  const sxRatio = srcW / dst;
  const syRatio = srcH / dst;
  for (let dy = 0; dy < dst; dy++) {
    let sy = (dy + 0.5) * syRatio - 0.5;
    if (sy < 0) {
      sy = 0;
    }
    const y0 = Math.min(srcH - 1, Math.floor(sy));
    const y1 = Math.min(srcH - 1, y0 + 1);
    const fy = sy - Math.floor(sy);
    for (let dx = 0; dx < dst; dx++) {
      let sx = (dx + 0.5) * sxRatio - 0.5;
      if (sx < 0) {
        sx = 0;
      }
      const x0 = Math.min(srcW - 1, Math.floor(sx));
      const x1 = Math.min(srcW - 1, x0 + 1);
      const fx = sx - Math.floor(sx);
      for (let ch = 0; ch < 3; ch++) {
        const p00 = srcRGBA[(y0 * srcW + x0) * 4 + ch];
        const p01 = srcRGBA[(y0 * srcW + x1) * 4 + ch];
        const p10 = srcRGBA[(y1 * srcW + x0) * 4 + ch];
        const p11 = srcRGBA[(y1 * srcW + x1) * 4 + ch];
        const top = p00 + (p01 - p00) * fx;
        const bot = p10 + (p11 - p10) * fx;
        out[(dy * dst + dx) * 3 + ch] = Math.round(top + (bot - top) * fy);
      }
    }
  }
  return out;
}

function preprocessCanvas(srcCanvas) {
  const ctx = srcCanvas.getContext('2d');
  const src = ctx.getImageData(0, 0, srcCanvas.width, srcCanvas.height).data;
  const resized = cv2LinearResize(src, srcCanvas.width, srcCanvas.height, PP_SIZE);
  const out = new Float32Array(3 * PP_SIZE * PP_SIZE);
  const plane = PP_SIZE * PP_SIZE;
  for (let i = 0; i < plane; i++) {
    for (let ch = 0; ch < 3; ch++) {
      const v = resized[i * 3 + ch] / 255.0;
      out[ch * plane + i] = (v - PP_MEAN[ch]) / PP_STD[ch];
    }
  }
  return out;
}

// A plain quadrant read of Russell's circumplex model — NOT the original
// project's 5-state "engagement" heuristic (that one fits sigmoid thresholds
// never validated against real labels; this is just "which quadrant is the
// point in", no fitted parameters at all).
function stateFromVA(valence, arousal) {
  if (valence >= 0 && arousal >= 0) {
    return 'Excited';
  }
  if (valence >= 0 && arousal < 0) {
    return 'Calm';
  }
  if (valence < 0 && arousal >= 0) {
    return 'Stressed';
  }
  return 'Sad';
}

function decodeOutput(raw) {
  const logits = raw.slice(0, 8);
  const mx = Math.max(...logits);
  const e = logits.map(v => Math.exp(v - mx));
  const s = e.reduce((a, b) => a + b, 0);
  const probs = e.map(v => v / s);
  const valence = raw[8];
  const arousal = raw[9];
  return {
    dominant_emotion: EMOTIONS[probs.indexOf(Math.max(...probs))],
    valence,
    arousal,
    state: stateFromVA(valence, arousal),
  };
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(el);
  });
}

// Loaded as a runtime <script type="module"> (string, not a literal import())
// so webpack never sees it and can't try to bundle/resolve it at build time —
// this ESM bundle is a large vendored asset meant to stay outside the app bundle.
function loadMediapipeVision() {
  return new Promise((resolve, reject) => {
    if (window.__mediapipeVision) {
      resolve(window.__mediapipeVision);
      return;
    }
    const el = document.createElement('script');
    el.type = 'module';
    el.textContent = `
      import { FaceDetector, FilesetResolver } from '/emotion/mediapipe/vision_bundle.mjs';
      window.__mediapipeVision = { FaceDetector, FilesetResolver };
      window.dispatchEvent(new Event('mediapipe-vision-ready'));
    `;
    window.addEventListener('mediapipe-vision-ready', () => resolve(window.__mediapipeVision), {
      once: true,
    });
    document.head.appendChild(el);
    setTimeout(() => reject(new Error('mediapipe module load timed out')), 15000);
  });
}

const StyledWidget = styled.div`
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  padding: 20px;
  max-width: 340px;
  background-color: var(--light-navy);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);

  .label {
    color: var(--light-slate);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: var(--fz-xxs);
    margin-bottom: 10px;
  }

  video {
    width: 100%;
    border-radius: 6px;
    background: #000;
    display: block;
    transform: scaleX(-1);
  }
  canvas {
    display: none;
  }

  button {
    ${({ theme }) => theme.mixins.smallButton};
    margin-top: 12px;
    margin-right: 8px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    color: var(--slate);
  }
  .emotion {
    color: var(--green);
    font-weight: 600;
  }
  .status {
    color: var(--slate);
    font-size: var(--fz-xxs);
    margin-top: 10px;
  }
  .privacy {
    color: var(--slate);
    font-size: var(--fz-xxs);
    margin-top: 10px;
    line-height: 1.5;
  }
`;

const EmotionDetector = () => {
  const [phase, setPhase] = useState('idle'); // idle | loading | ready | running | error
  const [emotion, setEmotion] = useState(null);
  const [status, setStatus] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cropRef = useRef(null);
  const sessionRef = useRef(null);
  const detectorRef = useRef(null);
  const streamRef = useRef(null);
  const runningRef = useRef(false);
  const framesRef = useRef([]);
  const t0Ref = useRef(0);
  const [sessionResult, setSessionResult] = useState(null);

  useEffect(
    () => () => {
      runningRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    },
    [],
  );

  // Does NOT touch `phase` itself — the caller (start()) owns phase transitions
  // so the button stays disabled continuously from click through to running,
  // with no gap where a second click could interrupt an in-flight play().
  const init = async () => {
    setStatus('loading onnxruntime-web…');
    await loadScript('/emotion/ort.min.js');
    ort.env.wasm.wasmPaths = '/emotion/';
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;

    setStatus('loading emotion model (~16MB, one-time)…');
    sessionRef.current = await ort.InferenceSession.create('/emotion/enet_b0_8_va_mtl.onnx', {
      executionProviders: ['wasm'],
    });

    setStatus('loading face detector…');
    const { FaceDetector, FilesetResolver } = await loadMediapipeVision();
    const fileset = await FilesetResolver.forVisionTasks('/emotion/mediapipe');
    detectorRef.current = await FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: '/emotion/mediapipe/blaze_face_short_range.tflite' },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.5,
    });

    setStatus('warming up…');
    const warm = new Float32Array(3 * 224 * 224);
    await sessionRef.current.run({ input: new ort.Tensor('float32', warm, [1, 3, 224, 224]) });
  };

  const frameToCanvas = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    return c;
  };

  const detectCrop = frameCanvas => {
    const res = detectorRef.current.detect(frameCanvas);
    if (!res.detections || !res.detections.length) {
      return null;
    }
    let best = res.detections[0];
    for (const d of res.detections) {
      if (
        d.boundingBox.width * d.boundingBox.height >
        best.boundingBox.width * best.boundingBox.height
      ) {
        best = d;
      }
    }
    const b = best.boundingBox;
    const x = Math.max(0, b.originX);
    const y = Math.max(0, b.originY);
    const w = Math.min(frameCanvas.width - x, b.width);
    const h = Math.min(frameCanvas.height - y, b.height);
    if (w <= 0 || h <= 0) {
      return null;
    }
    const cc = cropRef.current;
    cc.width = w;
    cc.height = h;
    cc.getContext('2d').drawImage(frameCanvas, x, y, w, h, 0, 0, w, h);
    return cc;
  };

  const tick = async () => {
    if (!runningRef.current) {
      return;
    }
    const frame = frameToCanvas();
    const crop = detectCrop(frame);
    if (!crop) {
      setStatus('no face detected…');
    } else {
      const pre = preprocessCanvas(crop);
      const out = await sessionRef.current.run({
        input: new ort.Tensor('float32', pre, [1, 3, 224, 224]),
      });
      const raw = Array.from(out[Object.keys(out)[0]].data);
      const dec = decodeOutput(raw);
      setEmotion(dec);
      setStatus('running…');
      framesRef.current.push(dec);
    }
    setTimeout(tick, 150);
  };

  // Mirrors the original project's client/server contract: the browser computes
  // everything (inference already ran client-side above); on stop, it summarizes
  // the session into a small digest and POSTs that ONLY (no images/frames) to a
  // separate "server side" that does no inference of its own — just receives and
  // displays it. See https://emotion-api.paksopi.me
  const summarizeAndSend = async () => {
    const frames = framesRef.current;
    if (!frames.length) {
      setStatus('stopped — no frames captured');
      return;
    }
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const counts = {};
    frames.forEach(f => {
      counts[f.dominant_emotion] = (counts[f.dominant_emotion] || 0) + 1;
    });
    const dominant_emotion = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
    const stateCounts = {};
    frames.forEach(f => {
      stateCounts[f.state] = (stateCounts[f.state] || 0) + 1;
    });
    const dominant_state = Object.keys(stateCounts).reduce((a, b) =>
      stateCounts[a] > stateCounts[b] ? a : b,
    );
    const summary = {
      duration_sec: +((performance.now() - t0Ref.current) / 1000).toFixed(2),
      n_frames: frames.length,
      mean_valence: +avg(frames.map(f => f.valence)).toFixed(4),
      mean_arousal: +avg(frames.map(f => f.arousal)).toFixed(4),
      emotion_counts: counts,
      dominant_emotion,
      state_counts: stateCounts,
      dominant_state,
    };
    setStatus('sending session digest to server…');
    try {
      const r = await fetch('https://emotion-api.paksopi.me/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });
      const res = await r.json();
      setSessionResult({ summary, res });
      setStatus(`stored on server — session #${res.total_sessions}`);
    } catch (e) {
      setStatus(`stopped — couldn't reach server: ${e.message}`);
    }
  };

  const stop = () => {
    runningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setPhase('ready');
    setEmotion(null);
    summarizeAndSend();
  };

  // startingRef is a synchronous guard against double-clicks: React state
  // (`phase`) only updates on re-render, so two clicks in the same tick would
  // both read the same stale phase and both proceed. A ref updates immediately.
  const startingRef = useRef(false);

  const start = async () => {
    if (startingRef.current || phase === 'running') {
      return;
    }
    startingRef.current = true;
    setPhase('loading');
    try {
      if (!sessionRef.current) {
        await init();
      }
      setStatus('requesting camera access…');
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
      framesRef.current = [];
      t0Ref.current = performance.now();
      setSessionResult(null);
      runningRef.current = true;
      setPhase('running');
      tick();
      setTimeout(() => stop(), 10000);
    } catch (e) {
      setPhase('error');
      setStatus(`camera error: ${e.message}`);
    } finally {
      startingRef.current = false;
    }
  };

  return (
    <StyledWidget>
      <div className="label">Live emotion detection (experimental)</div>
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} />
      <canvas ref={cropRef} />

      {phase !== 'running' ? (
        <button onClick={start} disabled={phase === 'loading'}>
          {phase === 'loading' ? 'Loading…' : 'Start 10s session'}
        </button>
      ) : (
        <button onClick={stop}>Stop</button>
      )}

      {emotion && (
        <>
          <div className="row">
            <span>emotion</span>
            <span className="emotion">{emotion.dominant_emotion}</span>
          </div>
          <div className="row">
            <span>valence</span>
            <span>{emotion.valence.toFixed(2)}</span>
          </div>
          <div className="row">
            <span>arousal</span>
            <span>{emotion.arousal.toFixed(2)}</span>
          </div>
          <div className="row">
            <span>state (V/A quadrant)</span>
            <span className="emotion">{emotion.state}</span>
          </div>
        </>
      )}

      {sessionResult && (
        <div className="row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>
            session sent — dominant:{' '}
            <span className="emotion">{sessionResult.summary.dominant_emotion}</span>
          </span>
          <span>
            see it server-side:{' '}
            <a href="https://emotion-api.paksopi.me" target="_blank" rel="noreferrer">
              emotion-api.paksopi.me
            </a>
          </span>
        </div>
      )}

      {status && <div className="status">{status}</div>}

      <div className="privacy">
        Runs entirely in your browser (ONNX Runtime Web + MediaPipe) — no video or image ever leaves
        this page.
      </div>
    </StyledWidget>
  );
};

export default EmotionDetector;
