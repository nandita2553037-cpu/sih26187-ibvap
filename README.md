AI-Based Intelligent Video Analytics Platform for Border Surveillance

**Short name:** IBVAP  

**Problem Statement:** SIH26187  
**Event:** Smart India Hackathon 2026

## 1. Project Overview

IBVAP is an AI-based video analytics platform designed to support effective and timely border surveillance. It brings live camera feeds, intelligent detection, tracking, risk analysis, alerts, maps, and investigation tools into one operational dashboard.

The platform helps security teams monitor large and sensitive border areas more efficiently, identify suspicious activity early, and make informed decisions using clear visual and analytical insights.

## 2. Problem Statement

Border surveillance teams must monitor multiple CCTV feeds and large geographic areas continuously. Manual monitoring can be difficult at scale and may delay the identification of intrusions, movement through restricted zones, or other high-risk activity.

SIH26187 calls for an intelligent solution that can assist personnel by automatically analysing video, tracking objects and people, highlighting risk, and providing actionable alerts.

## 3. Proposed Solution

IBVAP combines computer vision, object tracking, geospatial monitoring, and a web-based command dashboard. Video input is analysed to detect people and vehicles, follow their movement, and identify activity in restricted or sensitive zones. The platform assigns risk scores and presents alerts with supporting camera, location, and event information.

This gives operators a unified view for real-time monitoring as well as post-event investigation and analytics.

## 4. Key Features

- **Real-time intrusion detection:** Identify possible unauthorised entry as events occur.
- **Object/person detection:** Detect and classify people, vehicles, and other relevant objects.
- **Person/vehicle tracking:** Follow movement across video frames and camera views.
- **Restricted zone monitoring:** Monitor virtual zones and flag unauthorised activity.
- **Risk scoring:** Prioritise events using risk levels based on detected activity and context.
- **Intelligent alerts:** Present actionable alerts with severity, time, location, and evidence.
- **Live camera monitoring:** View and manage active CCTV feeds from one interface.
- **Map-based surveillance:** See cameras, zones, alerts, and incidents in their geographic context.
- **Investigation/search:** Search historical events and review details for follow-up.
- **Analytics dashboard:** View trends, statistics, system status, and surveillance performance.

## 5. Frontend Technology Stack

- **React:** Component-based user interface development.
- **Vite:** Fast development server and production build tooling.
- **Tailwind CSS:** Utility-first styling and responsive interface design.
- **React Router:** Navigation between dashboard, alerts, cameras, map, investigation, analytics, and settings views.
- **Recharts:** Charts and visual analytics.
- **Leaflet / React-Leaflet:** Interactive map-based surveillance views.
- **Lucide React:** Consistent interface icons.

## 6. System Architecture

- **Frontend:** A React and Vite web application provides the operator dashboard, live monitoring views, alert workflows, maps, investigation tools, and analytics.
- **AI detection and tracking backend:** Computer vision services process CCTV frames, detect objects and people, track movement, monitor zones, and calculate risk indicators.
- **Database and API:** APIs exchange camera data, detections, tracking events, alerts, zones, users, and historical records between the frontend and backend. A database stores events and investigation history for later retrieval.
- **CCTV/video input:** Live or recorded CCTV streams provide the video input for analysis. Processed results are returned to the dashboard with event metadata and camera context.

## 7. Project Structure

```text
ibvap/
├── detection/             # Detection entry points and zone-aware processing
├── tracking/              # Tracking and restricted-zone logic
├── public/                # Static public assets
├── src/
│   ├── components/        # Reusable dashboard components
│   ├── dashboard/         # Alerts, cameras, status, and activity components
│   ├── layout/            # Sidebar and top navigation
│   ├── pages/             # Main application screens
│   ├── shared/            # Shared visual components
│   ├── data/              # Frontend data and mock data
│   ├── App.jsx            # Application routes and shell
│   └── main.jsx           # Frontend entry point
├── tests/                 # Detection and tracking tests
├── index.html             # Vite HTML entry point
├── package.json           # Frontend scripts and dependencies
└── vite.config.js         # Vite configuration
```

## 8. How to Run the Frontend

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
npm install
```

### Development server

```bash
npm run dev
```

Open the local URL shown by Vite in a browser.

### Production build

```bash
npx vite build
```

## 9. Team / Contributors

**Team IBVAP**  
Smart India Hackathon 2026

The project is developed collaboratively by the participating team. Contributor names and roles can be added here as the team information is finalised.

## 10. Future Enhancements

- Integrate additional AI models for improved detection in difficult weather and lighting conditions.
- Add multi-camera identity association and advanced trajectory analysis.
- Support edge processing for lower latency and reduced bandwidth usage.
- Add role-based access control, audit logs, and secure authentication.
- Enable configurable notification channels such as SMS, email, and mobile push alerts.
- Improve offline operation and synchronisation for low-connectivity border areas.
- Add model performance monitoring and feedback-driven improvement.
- Extend reporting with exportable incident reports and operational summaries.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
