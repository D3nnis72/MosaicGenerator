## 🧩 Project Overview

The system consists of three coordinated layers:

1. **Backend (Python + FastAPI + PyTorch)** — handles computation, filtering, and image synthesis.
2. **Frontend (Next.js + shadcn/ui)** — handles user interaction, uploads, parameters, and visual presentation.
3. **Core Algorithm (Torch Mosaic Engine)** — shared logic module inside the backend that performs the actual mosaic generation.

Together, they form a complete, research-level yet user-friendly photo mosaic generator that bridges perceptual computing, convolution-based filtering, and modern web design.

---

## 🧠 Core Idea

Each image region (grid cell) is treated like a **local convolution kernel** that summarizes color and structure information.
The system computes a feature descriptor for every cell and finds the **most similar tile image** from a user-provided set.
If no tiles are provided, it falls back to a perceptually optimized color mosaic generated directly from the image.
The result is always a visually coherent mosaic, built on the principles of local filtering and nonlinear feature matching.

---

## ⚙️ 1. Backend (Python + FastAPI + PyTorch)

The backend is the computational heart of the system. It exposes REST endpoints for uploading an image, submitting parameters, and receiving the generated mosaic image.

### Core Components

**a) FastAPI Service**

- `/generate` endpoint for mosaic generation.
- Accepts input image (multipart), optional folder of tile images, and parameters (grid size, tile size, method, etc.).
- Streams the output image back as a PNG.
- Supports concurrent requests and integrates seamlessly with the Next.js frontend.

**b) Torch Mosaic Engine**
Implements the algorithm in modular stages:

1. **Preprocessing** — load and normalize input images, resize, and optionally convert color spaces.
2. **Feature Extraction** — compute patch features using convolution-based operations such as mean color, Sobel energy, or learned embeddings.
3. **Matching** — compute pairwise distances between target patches and tiles (using vectorized `torch.cdist` for GPU acceleration).
4. **Assembly** — reconstruct the mosaic as a tensor and blend it for smooth transitions.
5. **Fallback Generation** — create a high-quality color mosaic if no tiles are provided using palette quantization and optional dithering.

**c) GPU Acceleration and Efficiency**

- Uses `torch.nn.functional.avg_pool2d` for averaging features (fast and mathematically clean).
- Uses `torch.cdist` for large-scale parallel distance computation on GPU.
- Supports Sobel convolution kernels for texture energy extraction.
- Automatically falls back to CPU if GPU is not available.

**d) Output and Metadata**
The backend returns both:

- The final mosaic image (PNG stream).
- A JSON metadata object containing grid size, number of tiles used, runtime, and optional metrics like average ΔE color distance.

### Architectural Principles

- **Functional modularity**: each computation (feature extraction, matching, assembly) is a self-contained function.
- **No blocking UI**: heavy computation runs asynchronously, enabling smooth frontend updates.
- **Stateless design**: every request is independent and reproducible, improving reliability and testing.

---

## 🖥️ 2. Frontend (Next.js + shadcn/ui)

The frontend provides the visual interface for users to upload images, configure settings, and view results interactively. It communicates with the backend through HTTP requests and displays progress and results in real time.

### Main Features

**a) Input and Uploads**

- Drag-and-drop upload for the target image.
- Optional folder upload for tile images (multi-file input).
- Validation of file types and image formats.

**b) Parameter Controls**
Interactive UI elements (from shadcn/ui) allow fine-grained customization:

- Grid size (slider).
- Tile size (slider).
- Matching method (dropdown: Lab color, HSV histogram, Sobel texture, or hybrid).
- Top-k randomness and reuse limit (sliders).
- Blending intensity (slider).
- Random seed for deterministic results.

**c) Visualization**

- Split-view comparison between original image and mosaic (draggable slider).
- Runtime information panel (ΔE average, number of tiles, and elapsed time).
- Tile usage histogram or diversity indicator.
- Automatic dark/light mode via shadcn theme system.

**d) Feedback and Responsiveness**

- Progress overlay or animated tile “build-up” effect while generating.
- Immediate fallback preview if backend takes longer to respond.
- Download button for the final mosaic (PNG).

### UX Principles

- **Minimal interaction friction**: clear upload area, intuitive controls.
- **Progressive disclosure**: advanced settings (e.g. hybrid methods) hidden until toggled.
- **Responsive layout**: optimized for both desktop and tablet displays.
- **Instant feedback**: live progress or skeleton UI while waiting for the result.

---

## 🧮 3. Algorithmic Methods (Shared Across Backend)

The engine supports multiple feature computation and matching strategies:

| Method                   | Description                                         | Type          |
| ------------------------ | --------------------------------------------------- | ------------- |
| **Mean Lab Color**       | Fast perceptual color average, ΔE distance          | Color-based   |
| **HSV Histogram**        | Color distribution matching via Chi-square distance | Color-based   |
| **Sobel Energy**         | Edge/texture magnitude comparison                   | Texture-based |
| **Hybrid**               | Weighted combination of Lab and Sobel               | Mixed         |
| **Perceptual Embedding** | Optional CNN-based embedding (CLIP, VGG)            | Semantic      |

Each method can be combined with top-k random selection for visual diversity and reuse limitation to prevent repeating tiles too often.

---

## 🌈 4. Fallback Mode (No Tiles Provided)

If no tile images are provided, the system automatically switches to a **color mosaic fallback**:

1. Compute the mean Lab color of each grid cell.
2. Apply a k-means color palette reduction to unify tones.
3. Optionally add Floyd–Steinberg dithering to preserve gradients.
4. Assemble and render the result using interpolation for smoothness.

This ensures that the output is always meaningful, even with zero input tiles, and visually demonstrates the connection to color quantization and local filtering.

---

## 🌐 5. Communication Between Frontend and Backend

- The **frontend** sends an HTTP POST request with form data:

  - target image
  - optional tiles
  - JSON parameters

- The **backend** processes the request and streams the resulting image.
- The **frontend** listens for completion, displays progress, and renders the mosaic preview once received.

All communication uses asynchronous HTTP, making the system reactive and scalable.

---

## ⚡ 6. Advanced / “Wow” Features

To make the project stand out and demonstrate innovation, several enhancements can be integrated:

- **GPU-based parallelization** via PyTorch for real-time mosaic generation.
- **Adaptive grid resolution**, using image gradients to make tiles smaller in detailed areas and larger in smooth regions.
- **Semantic tile matching** via pretrained vision embeddings for meaning-aware mosaics.
- **Tile diversity visualizer** that animates the assembly process as tiles appear progressively.
- **Instant AI preview mode** with low-resolution precomputation before full render.
- **Downloadable report**, summarizing metrics, parameters, and runtime statistics.

---

## 🧱 7. Architectural Summary

| Layer                 | Purpose                                          | Technologies                 | Key Features                                      |
| --------------------- | ------------------------------------------------ | ---------------------------- | ------------------------------------------------- |
| **Frontend**          | User interaction, upload, control, visualization | Next.js, shadcn/ui, Tailwind | Modern UI, live preview, parameter sliders        |
| **API Backend**       | Communication and orchestration                  | FastAPI                      | Clean REST endpoints, async processing            |
| **Mosaic Engine**     | Image processing core                            | PyTorch 2.2                  | GPU support, convolution-based feature extraction |
| **Fallback System**   | Guarantee visual output                          | Pillow, Torch, NumPy         | Palette quantization, dithering                   |
| **Storage / Runtime** | Temp image handling                              | Local or cloud storage       | Streams results, no blocking                      |

---

## 🧩 Final Concept

The complete system forms a **hybrid between an artistic image tool and a computer vision pipeline**.
It integrates _filtering theory_ (local receptive fields and convolution operations), _nonlinear decision-making_ (nearest-neighbor tile matching), and _modern UX design_ (Next.js + shadcn/ui).

The result is a technically sophisticated and visually engaging application that demonstrates deep understanding of both **image processing concepts** and **software architecture**.
