# LabelCraft Startup and Codebase Guide

This README is a practical quick-start for running LabelCraft locally.
It also explains how the project is organized.

## What this project is

LabelCraft is a full-stack app for designing product labels with:
- A React + TypeScript frontend (Vite)
- A FastAPI backend (Python)
- A C++ folder reserved for geometry-related native work

## Repository layout

- `frontend/`
  - Vite + React app
  - Main UI entry: `src/App.tsx`
  - API calls: `src/api/shapes.ts`
- `backend/`
  - FastAPI app package in `backend/app/`
  - API entrypoint: `backend/app/main.py`
  - DB/config setup: `backend/app/config.py`, `backend/app/database.py`
  - Python dependencies: `backend/requirements.txt`
- `cpp/`
  - Native/C++ workspace area (currently separate from startup flow)

## Ports used

- Frontend dev server: `http://localhost:5173`
- Backend API server: `http://localhost:8000`
- Health check: `http://localhost:8000/health`

The frontend is currently wired to call `http://localhost:8000/shapes/`.

## Prerequisites

- Node.js 18+
- npm
- Python 3.10+ (3.11+ recommended)

---

## Start the app (Windows PowerShell)

Open **two terminals** from the repository root (`d:\LabelCraft`).

### 1) Start backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --env-file app/.env
```

Backend should be running at:
- `http://localhost:8000`
- `http://localhost:8000/health`

### 2) Start frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend should be running at:
- `http://localhost:5173`

---

## Start the app (macOS/Linux)

Use two terminals from repo root:

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --env-file app/.env
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Useful commands

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --env-file app/.env
```

---

## Quick troubleshooting

- If backend fails with import/config errors, make sure the virtual environment is activated before running `uvicorn`.
- If frontend cannot load shapes, confirm backend is running on port 8000.
- If CORS errors appear, verify frontend origin is `http://localhost:5173`.
- If PowerShell blocks activation, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

and then activate the venv again.
