---
title: Real-Time Facial Emotion Recognition Service
date: 2026-01-01
github: ""
external: ""
tech:
  - Python
  - ONNX Runtime
  - OpenVINO
  - FastAPI
  - onnxruntime-web
showInProjects: true
---
Deployable emotion-recognition service wrapping a compact CNN (EfficientNet-B0, \~4M params) behind a local API, returning 8 emotion probabilities plus valence/arousal from a cropped face. Built with two interchangeable inference backends (ONNX Runtime and OpenVINO) verified to \~1e-6 relative parity against each other, and two deployment modes sharing one contract: a server-side FastAPI endpoint, and a client-side build running the same model directly in the browser via onnxruntime-web — verified byte-identical output between the two. Diagnosed and fixed a real production bug where sending whole webcam frames (instead of cropped faces) silently collapsed every prediction to " neutral."