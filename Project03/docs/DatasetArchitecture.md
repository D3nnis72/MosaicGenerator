## 🗂️ Dataset Architecture — Structured Tile Management

To make the mosaic generator both flexible and reusable, we add a **data management layer** that organizes tile images into structured datasets.
This allows users to easily choose from predefined folders of images (for example, _Animals_, _Architecture_, _Nature_, _Artworks_) without having to upload them manually every time.
It also gives the project a more “research-ready” structure, where datasets can be swapped or extended seamlessly.

---

### 🧠 Concept

The backend includes a `data/` directory that holds multiple **datasets**, each representing a thematic collection of tiles.
Each dataset can contain many subfolders and nested structures — the system will automatically scan all subdirectories and use every valid image file it finds.

```
/data/
│
├── AnimalsDataset/
│   ├── cats/
│   ├── dogs/
│   ├── birds/
│   └── ...
│
├── ArchitectureDataset/
│   ├── buildings/
│   ├── bridges/
│   ├── interiors/
│   └── ...
│
├── NatureDataset/
│   ├── trees/
│   ├── sky/
│   ├── landscapes/
│   └── ...
│
└── ArtworksDataset/
    ├── paintings/
    ├── sculptures/
    └── ...
```

When a user selects one of these datasets (for example, _AnimalsDataset_), the backend automatically loads all images inside that dataset and uses them as the available tile pool for the mosaic generation process.

---

### ⚙️ Integration into the Backend (Conceptual)

The backend includes a **Dataset Loader Module**, which performs the following steps:

1. **Dataset Discovery**

   - Scans the `/data/` folder on startup.
   - Builds a list of all available dataset names (the top-level folders).
   - Stores metadata such as the number of images and preview samples for the frontend.

2. **Dataset Selection**

   - The user can specify a dataset name via an API parameter (e.g. `dataset="AnimalsDataset"`).
   - The loader resolves this name into an absolute path (`data/AnimalsDataset/`).
   - It recursively collects all image files inside the folder and subfolders.

3. **Feature Precomputation**

   - Optionally, when a dataset is first used, the system can precompute its tile descriptors (mean Lab, HSV histograms, Sobel energy) and store them in a small metadata file for faster reuse.
   - This converts datasets into plug-and-play modules that load instantly the next time.

4. **Integration with Mosaic Engine**

   - The selected dataset path is passed into the `build_mosaic()` function, which loads all tile images as tensors, computes features if needed, and performs the normal matching and assembly steps.

---

### 🖥️ Integration into the Web Interface

The frontend includes a **dataset selector**, which lists all available datasets dynamically retrieved from the backend.
This selector appears next to the image upload controls.

**Features of the dataset selector:**

- Dropdown or segmented control for choosing between datasets.
- Each dataset shows its name and optionally a small sample thumbnail grid (4–6 representative images).
- “Custom upload” remains an option for users who prefer their own tiles.

**Example options in the interface:**

```
Dataset:
[ Animals ]  [ Architecture ]  [ Nature ]  [ Artworks ]  [ Upload Custom Tiles ]
```

When the user selects a dataset, the frontend sends its name in the `/generate` request instead of raw image files.
This allows fast switching between datasets and immediate experimentation.

---

### 📊 Dataset Metadata and Future Extensions

Each dataset folder can include a small `metadata.json` file containing optional details:

```json
{
  "name": "AnimalsDataset",
  "description": "A collection of animal photos grouped by species.",
  "source": "Kaggle Animal Faces, CC-BY 4.0",
  "num_images": 3200,
  "tags": ["animals", "nature", "wildlife"]
}
```

The backend can read this file to provide extra info to the frontend, and the frontend can display it in a small dataset info card.
This makes the system modular, allowing new datasets to be added by simply placing them inside the `data/` directory — no code changes needed.

---

### 💾 Storage and Performance Considerations

- **Preloading:** Only metadata is loaded at startup; actual image tensors are loaded on demand when the dataset is used.
- **Caching:** After the first use, feature descriptors can be cached in `.pt` or `.npy` files (e.g., `data/AnimalsDataset/features_lab.pt`), speeding up repeated requests.
- **Scalability:** The dataset loader can be extended later to support remote datasets (e.g., cloud folders or URLs).

---

### 💡 Design Principles

| Principle                | Description                                                              | Benefit                         |
| ------------------------ | ------------------------------------------------------------------------ | ------------------------------- |
| **Modularity**           | Each dataset lives in its own folder and can be added or removed easily. | Clear structure and reusability |
| **Discoverability**      | The system automatically detects new datasets.                           | No configuration needed         |
| **Scalability**          | Supports thousands of images via recursive loading and caching.          | Performance-friendly            |
| **Transparency**         | Metadata displayed in UI for clarity.                                    | User-friendly and informative   |
| **Fallback consistency** | Even if a dataset fails to load, the color mosaic fallback still works.  | Reliability guaranteed          |

---

### 🌟 Wow Factor: “Intelligent Dataset Ecosystem”

To elevate this beyond a basic data folder, you can add:

- **Thumbnail previews** generated automatically by the backend (a grid of random sample tiles).
- **Dataset statistics dashboard**, showing the number of tiles, average color diversity, or texture variance — demonstrating analytic depth.
- **Automatic feature caching**, where the system computes and stores descriptor embeddings for each dataset, turning your project into a reusable _image feature database_.
- **Dataset performance indicator**, showing generation time and GPU memory usage per dataset.

These additions make the backend not just a mosaic generator, but a _mini feature engine_, which gives the project a professional and research-quality feel.

---

### 🔗 Summary

The dataset architecture transforms the mosaic generator into a scalable, modular system.
Instead of relying solely on manual uploads, users can instantly select from pre-curated datasets organized under the `/data/` directory.
Each dataset can be analyzed, cached, and reused efficiently, providing both speed and variety.
This feature adds structure, usability, and an academic “wow” factor by showing that the system is designed for experimentation, comparison, and real-world scalability — not just for one-off image generation.
