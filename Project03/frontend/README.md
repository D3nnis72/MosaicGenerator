# Mosaic Studio Frontend

Next.js 14 + shadcn/ui interface for Project03 photo mosaic generation.

## Features

- Drag & drop target uploader with instant preview
- Dataset selector powered by the `/datasets` endpoint
- Custom tile manager for mixing uploaded tiles with curated sets
- Advanced controls: Lab/HSV/Sobel features, top-k randomness, reuse limits, blending, GPU toggle
- Live preview with split-view slider and metadata analytics panel
- Toast notifications and inline feedback for errors or success

## Getting started

```bash
cd Project03/frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` to point at the FastAPI backend (defaults to `http://127.0.0.1:8000`).

## Environment variables

- `NEXT_PUBLIC_API_BASE_URL`: URL of the Mosaic Studio backend (FastAPI)

## Scripts

- `npm run dev` – start Next.js dev server with Tailwind
- `npm run build` – production build
- `npm run start` – serve production build
- `npm run lint` – run Next.js ESLint

## Directory overview

- `app/` – app router pages and layout
- `components/` – UI layers (upload, controls, preview, feedback, layout)
- `hooks/` – custom hooks for state & data fetching
- `services/` – API client and endpoint definitions
- `lib/` – utility helpers (e.g., Tailwind class merging)
- `styles/` – global Tailwind tokens and themes
