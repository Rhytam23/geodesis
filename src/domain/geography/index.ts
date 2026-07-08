/**
 * GEOGRAPHY DOMAIN MODEL
 * Canonical types for all geospatial entities in Geodesis.
 * 
 * These types are the single source of truth for regions, locations,
 * and map-related domain concepts.
 */

export interface Coordinate {
  readonly lat: number;
  readonly lng: number;
}

export interface BoundingBox {
  readonly minLat: number;
  readonly minLng: number;
  readonly maxLat: number;
  readonly maxLng: number;
}

export interface MapViewport {
  readonly center: Coordinate;
  readonly zoom: number;
  readonly bounds?: BoundingBox;
}

export interface Region {
  readonly id: string;
  readonly name: string;
  readonly type: 'province' | 'district' | 'zone' | 'city';
  readonly parentId?: string;
  readonly centroid: Coordinate;
  readonly bbox: BoundingBox;
  readonly areaHa?: number;
}

export interface District extends Region {
  readonly type: 'district';
}

export interface Zone extends Region {
  readonly type: 'zone';
  readonly riskLevel: 'low' | 'medium' | 'high';
}

export interface MapFeature {
  readonly id: string;
  readonly type: 'point' | 'polygon' | 'line';
  readonly geometry: Coordinate[] | Coordinate;
  readonly properties: Record<string, unknown>;
  readonly layerId: string;
}

export interface MapLayer {
  readonly id: string;
  readonly name: string;
  readonly visible: boolean;
  readonly type: 'satellite' | 'soil' | 'yield' | 'risk' | 'infrastructure';
  readonly opacity?: number;
}

// Adapter-friendly aliases (for integration layer)
export interface MapLocation {
  readonly lat: number;
  readonly lng: number;
  readonly name: string;
  readonly region: string;
}

export interface MapState {
  currentLocation: MapLocation | null;
  layers: MapLayer[];
  viewport: {
    center: Coordinate;
    zoom: number;
  };
  status: 'idle' | 'loading' | 'ready' | 'error';
}
