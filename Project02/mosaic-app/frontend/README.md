# Mosaic Frontend

Next.js + Tailwind UI for the mosaic generator.

## Setup

```bash
cd frontend
npm install
npm run dev
```

The development server expects the backend FastAPI app to be available at `http://localhost:8000`. Configure a proxy (e.g. Next.js rewrites) or run both services via Docker.

## Structure

- `app/` – Next.js app router entrypoints
- `src/components/` – Tailwind/shadcn-inspired UI building blocks
- `src/lib/api.ts` – client for the mosaic API
- `src/styles/globals.css` – Tailwind base styles

## TODO

- Hook up a proper toast system for errors
- Persist configuration in query params for shareable URLs
