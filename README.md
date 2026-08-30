# SIH26187 – IBVAP: Intelligent Border Video Analytics Platform

AI-based Intelligent Video Analytics Platform for border surveillance using existing CCTV infrastructure — real-time intrusion detection, tracking, risk scoring, and alerting.

Built for **Smart India Hackathon 2026** — Problem Statement **SIH26187**.

---

## Problem Statement

| Field | Detail |
|---|---|
| **PS ID** | SIH26187 |
| **Title** | AI-Based Intelligent Video Analytics Platform for Border Surveillance using Existing CCTV Infrastructure |
| **Organization** | Ministry of Home Affairs |
| **Department** | Sashastra Seema Bal (SSB), Police-II Division |
| **Category** | Software |
| **Theme** | Blockchain & Cybersecurity |

Border outposts already operate large CCTV networks, but footage is watched manually — fatigue-prone and unable to scale. IBVAP is a software-only AI layer over existing cameras that detects intrusions, tracks subjects, scores risk, and alerts human operators in real time, without requiring new surveillance hardware.

---

## Core Design Principle

**AI generates alerts and risk scores — it never makes a final determination.**
Every high-risk event is reviewed and confirmed or dismissed by a human security officer.

---

## Workflow

```
Existing CCTV Cameras
      ↓
RTSP Video Stream
      ↓
OpenCV — frame acquisition & pre-processing
      ↓
YOLOv8 — person & vehicle detection
      ↓
ByteTrack / BoT-SORT — multi-object tracking
      ↓
Restricted-Zone & Loitering Analysis
      ↓
Risk Scoring Engine
      ↓
Real-Time Alert Generation (Redis de-duplication)
      ↓
FastAPI Backend + WebSocket
      ↓
React Command-Center Dashboard — officer review & confirm/dismiss
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Video Ingestion | RTSP, OpenCV |
| Detection | YOLOv8 (Ultralytics) |
| Tracking | ByteTrack / BoT-SORT |
| Face Recognition | InsightFace / ArcFace (authorized-personnel allowlist only) |
| Number-Plate OCR | PaddleOCR |
| Backend | Python, FastAPI, WebSocket |
| Caching / De-dup | Redis |
| Database | PostgreSQL |
| Frontend | React, Leaflet |
| Containerization | Docker |
| Security | JWT, RBAC, HTTPS/TLS |
| Audit Log | Permissioned blockchain (Hyperledger Fabric) — event hashes only |

---

## Repository Structure

```
sih26187-ibvap/
├── detection/          # Role 1 — video ingestion & YOLO detection
├── tracking/           # Role 2 — tracking & restricted-zone/loitering logic
├── backend/            # Role 3 — FastAPI, risk-scoring engine, WebSocket
├── frontend/           # Role 4 — React command-center dashboard
├── evaluation/         # Role 5 — test data, annotations, model evaluation reports
├── docs/                # Architecture diagrams, proposal, Q&A prep, presentation material
├── README.md
└── .gitignore
```

---

## Team & Roles

| Role | Owner | Responsibility |
|---|---|---|
| Detection & Video Pipeline Lead | _varshan sai https://github.com/varshansai _ | RTSP ingestion, YOLOv8 detection |
| Tracking & Zone Logic Lead | _darshni priya https://github.com/DarshniPriya_ | ByteTrack/BoT-SORT, zone intrusion & loitering |
| Backend & Risk Engine Lead | _vijai prasanna https://github.com/vijaiprasanna_ | FastAPI, Redis, risk-scoring engine |
| Frontend & Dashboard Lead | _anitha joy https://github.com/Anitha441738_ | React dashboard, alert UI, map view |
| Data & AI Model Evaluation Lead | _lokitha https://github.com/lokitha2553031_ | Dataset prep, annotation, precision/recall evaluation |
| Integration, Deployment & DevOps Lead | _nandita https://github.com/nandita2553037_ | Module integration, GitHub management, end-to-end pipeline |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/<org-or-username>/sih26187-ibvap.git
cd sih26187-ibvap

# Backend setup
cd backend
pip install -r requirements.txt --break-system-packages
uvicorn main:app --reload

# Frontend setup
cd frontend
npm install
npm run dev
```

*(Update with actual setup steps as each module comes online.)*

---

## Branching Strategy

- `main` — protected, stable/demo-ready code only
- `detection-pipeline` — Role 1
- `tracking-zone-logic` — Role 2
- `backend-risk-engine` — Role 3
- `frontend-dashboard` — Role 4
- `model-evaluation` — Role 5

Merge into `main` via pull request, reviewed by the Integration Lead (Role 6).

---

## License

No license — all rights reserved. This is a hackathon prototype developed for Smart India Hackathon 2026.

---

## Acknowledgements

Developed as part of Smart India Hackathon 2026 for the Ministry of Home Affairs / Sashastra Seema Bal, Problem Statement SIH26187.
