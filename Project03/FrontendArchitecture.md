## 🧠 Frontend Architecture — “Mosaic Studio UI”

The frontend serves as the **interactive control and visualization layer**.
It allows users to upload images, select datasets, tune parameters, visualize progress, and download results — all through a responsive and modern interface built with **Next.js + shadcn/ui + Tailwind**.

The design follows **clean code principles**, a **modular component structure**, and **reactive state management**, ensuring that the logic, layout, and presentation remain easy to extend and maintain.

---

## 🧱 Core Architectural Layers

The frontend can be thought of as three layers that communicate in one direction — from user input to visualization.

```
User Interaction → Business Logic / Hooks → UI Rendering
```

### 1. UI Components Layer (Presentation)

Built with **shadcn/ui** components and Tailwind utilities.

- Contains reusable UI primitives: cards, sliders, file inputs, toggles, buttons, progress bars, etc.
- Handles user interaction and event triggers (e.g. “Generate Mosaic”).

### 2. Logic Layer (Hooks & Services)

- Custom React hooks handle data fetching, uploads, and state updates.
- Separates logic from UI components for cleaner code.
- Handles calls to the backend FastAPI service (via REST).

### 3. State & Data Layer

- Lightweight internal state (React state or Zustand) for current image, dataset, settings, progress, and result.
- Derived state drives live updates in the UI (progress animation, preview rendering, etc.).

This clear separation ensures the frontend remains **testable, modular, and maintainable**.

---

## 🗂️ Folder Structure (Clean Code Style)

```
/app
│
├── page.tsx                         # Main entry (Mosaic Generator Page)
│
├── components/                      # UI and visualization components
│   ├── upload/
│   │   ├── TargetImageUploader.tsx
│   │   ├── TileDatasetSelector.tsx
│   │   └── UploadHint.tsx
│   ├── controls/
│   │   ├── MosaicControlsCard.tsx
│   │   ├── MethodSelector.tsx
│   │   ├── SlidersGroup.tsx
│   │   └── GenerateButton.tsx
│   ├── preview/
│   │   ├── MosaicPreview.tsx
│   │   ├── SplitViewSlider.tsx
│   │   └── PreviewSkeleton.tsx
│   ├── feedback/
│   │   ├── ProgressOverlay.tsx
│   │   ├── MetricsPanel.tsx
│   │   └── NotificationToast.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── AppContainer.tsx
│
├── hooks/
│   ├── useMosaicEngine.ts            # Core logic for API calls, progress, error handling
│   ├── useImageUploader.ts           # Manages drag-and-drop uploads
│   ├── useDatasetList.ts             # Fetches available datasets from backend
│   └── useMosaicSettings.ts          # Global state for parameters
│
├── services/
│   ├── apiClient.ts                  # Centralized fetch logic (GET/POST)
│   └── endpoints.ts                  # Endpoint definitions (/generate, /datasets)
│
├── styles/
│   ├── globals.css                   # Tailwind base styles
│   ├── theme.css                     # Color palette and tone definitions
│   └── shadcn.config.ts              # Custom shadcn theme settings
│
└── lib/
    ├── utils.ts                      # Helper functions
    └── constants.ts                  # Default values and options
```

---

## 🎨 Design System and Styling

### Tailwind CSS

- Used for layout, spacing, and responsive design.
- Keeps the codebase clean by avoiding inline styles or external CSS clutter.
- Enables consistent spacing (`p-4`, `gap-6`, `rounded-2xl`) and shadow styles.

### shadcn/ui

- Provides polished, accessible base components that integrate seamlessly with Tailwind.
- Components like `Card`, `Slider`, `Select`, `Button`, `Input`, and `Dialog` make the interface feel coherent and modern.
- Theming handled via shadcn’s token system — supports dark/light modes automatically.

### Visual Language

- Rounded corners and subtle drop shadows (consistent with shadcn aesthetic).
- Muted backgrounds with accent highlights (inspired by image editing tools).
- Smooth transitions and micro-animations for user feedback.
- Light and dark modes with automatic theme switching based on system preference.

---

## ⚙️ Functional Flow

The entire user interaction can be visualized as a **data pipeline**:

```
[Upload Target]
     ↓
[Select Tiles or Dataset]
     ↓
[Adjust Parameters]
     ↓
[Click Generate]
     ↓
useMosaicEngine → FastAPI /generate → Mosaic result
     ↓
[Display Preview + Metrics]
     ↓
[Download / Save Mosaic]
```

Each step is event-driven and stateless in the UI — the backend handles all computation, while the frontend visualizes progress and results.

---

## 🧩 Key Functional Features

| Feature                 | Description                                         | Implementation        |
| ----------------------- | --------------------------------------------------- | --------------------- |
| **Target Image Upload** | Drag & drop or file picker                          | `TargetImageUploader` |
| **Dataset Selection**   | Dropdown from backend’s dataset list                | `TileDatasetSelector` |
| **Parameter Controls**  | Sliders for grid size, tile size, blend, randomness | `MosaicControlsCard`  |
| **Matching Method**     | Dropdown with Lab, HSV, Sobel, Hybrid               | `MethodSelector`      |
| **Progress Feedback**   | Animated overlay during generation                  | `ProgressOverlay`     |
| **Mosaic Preview**      | Split-view comparison with slider                   | `SplitViewSlider`     |
| **Metrics Display**     | ΔE, runtime, number of tiles                        | `MetricsPanel`        |
| **Download Option**     | Exports mosaic as PNG                               | `DownloadButton`      |
| **Error Handling**      | Toasts for network or backend errors                | `NotificationToast`   |

---

## 🧠 Clean Code Principles in the Frontend

| Principle                  | Description                                     | Example                                                   |
| -------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| **Single Responsibility**  | Each component handles one task                 | `TileDatasetSelector` only for dataset choice             |
| **Separation of Concerns** | UI and logic split into hooks                   | `useMosaicEngine` handles all API logic                   |
| **Reusability**            | Reusable shadcn components                      | Cards, sliders, and inputs follow a shared design pattern |
| **Type Safety**            | Strongly typed interfaces for all API data      | Using TypeScript + Zod validation                         |
| **Minimal State**          | Store only what changes in UI                   | Mosaic result, progress, settings                         |
| **Declarative Rendering**  | React-driven state updates, no DOM manipulation | Clean reactivity                                          |
| **Theming Consistency**    | Centralized Tailwind + shadcn theme             | Unified design across dark/light mode                     |

---

## 🌈 Wow-Effect Additions

To make the interface stand out and feel premium:

1. **Progress Animation**
   A “tile reveal” animation where the mosaic gradually assembles from left to right as the backend computes.

2. **Live Color Palette Extraction**
   Display the dominant colors of the mosaic below the preview as swatches (auto-generated from the result).

3. **Interactive Presets**
   Buttons for quick styles like _“Detailed Hybrid”_, _“Smooth Color Mosaic”_, _“High Diversity”_.

4. **Performance Feedback**
   Real-time runtime graph (simple sparkline) showing time per request.

5. **Adaptive Layout**
   Responsive grid layout that gracefully adjusts between desktop and tablet.

6. **Session Persistence**
   Automatically restore last settings and uploaded image from localStorage.

7. **Dataset Preview**
   When hovering over a dataset name, display 3–4 random sample images in a small hover card.

---

## 🧩 End-to-End Flow Summary

**Frontend → Backend Communication**

1. The user selects an image or dataset and adjusts parameters.
2. `useMosaicEngine` sends a POST request to FastAPI `/generate` endpoint.
3. The backend returns the generated mosaic as a stream.
4. The frontend converts it to a Blob URL and renders it in `MosaicPreview`.
5. The metadata (runtime, ΔE, grid size, etc.) is displayed in `MetricsPanel`.

---

## 📐 Summary

This frontend architecture combines modern **React design principles** with a refined **design system** using **shadcn/ui** and **Tailwind**.
It is modular, visually balanced, and architecturally clean:

- **Logic in hooks**, **state in context**, **UI in components**.
- **Reusable**, **type-safe**, and **easy to maintain**.
- **Beautiful, interactive interface** with analytical feedback and visual polish.

When paired with the PyTorch + FastAPI backend, the overall system feels like a professional, research-grade mosaic studio — demonstrating both deep technical understanding and design excellence.
