import { API_ENDPOINTS } from './endpoints';

export interface DatasetApiResponse {
  datasets: Array<{
    name: string;
    num_images: number;
    samples: string[];
    metadata?: Record<string, unknown>;
  }>;
}

export interface MosaicApiPayload {
  target: File;
  tiles?: File[];
  dataset?: string | null;
  settings: Record<string, unknown>;
}

export interface MosaicApiResponse {
  image: string;
  metadata: Record<string, unknown>;
}

export async function fetchDatasets(): Promise<DatasetApiResponse> {
  const response = await fetch(API_ENDPOINTS.datasets, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load datasets (${response.status})`);
  }

  return (await response.json()) as DatasetApiResponse;
}

export async function generateMosaic(
  payload: MosaicApiPayload
): Promise<MosaicApiResponse> {
  console.log(payload);
  const formData = new FormData();
  formData.append('target_image', payload.target);

  if (payload.tiles) {
    payload.tiles.forEach((file) => {
      if (file instanceof File) {
        formData.append('tiles', file, file.name || 'tile.png');
      }
    });
  }
  if (payload.dataset) {
    formData.append('dataset', payload.dataset);
  }
  formData.append('settings', JSON.stringify(payload.settings));

  let response: Response;
  try {
    response = await fetch(API_ENDPOINTS.generate, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    throw new Error(
      'Could not reach mosaic backend. Is it running at NEXT_PUBLIC_API_BASE_URL?'
    );
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const detail =
      (errorBody as { detail?: string }).detail ?? response.statusText;
    throw new Error(detail);
  }

  return (await response.json()) as MosaicApiResponse;
}
