---
date: '2026-07-02'
title: 'Language Detection Engine Evaluation'
github: 'https://github.com/paksopi/Language-Detection-Analysis'
external: ''
tech:
  - Python
  - NLP
  - Ensemble Learning
showInProjects: true
---

A weighted-voting ensemble (Lingua, OpenLID, pycld2, fastText, langdetect) built to fix short-text language detection for English/Malay/Indonesian, where the production baseline (`langdetect` alone) scored 29.1% overall accuracy and couldn't detect Malay at all. The best ensemble configuration reaches 70.8% overall accuracy — a +41.7pp improvement — while running 8.6-115.5x faster per call, evaluated across 1,273 real EN/MY/ID short-text cases bucketed by word count.
