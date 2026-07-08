/**
 * MapAdapter
 * 
 * Uses canonical domain types from @/domain.
 */

import { MapState, MapLocation, MapLayer } from '../../domain/geography';

const MOCK_LOCATION: MapLocation = {
  lat: 10.3,
  lng: 105.8,
  name: 'An Giang - Chau Doc',
  region: 'Mekong Delta',
};

const MOCK_LAYERS: MapLayer[] = [
  { id: 'satellite', name: 'Satellite', visible: true, type: 'satellite' },
  { id: 'soil', name: 'Soil Salinity', visible: false, type: 'soil' },
  { id: 'yield', name: 'Yield Potential', visible: false, type: 'yield' },
  { id: 'risk', name: 'Risk Heatmap', visible: false, type: 'risk' },
];

export class MapAdapter {
  private state: MapState = {
    currentLocation: MOCK_LOCATION,
    layers: [...MOCK_LAYERS],
    viewport: {
      center: { lat: 10.3, lng: 105.8 },
      zoom: 9,
    },
    status: 'ready',
  };

  async initialize(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
    this.state.status = 'ready';
  }

  getCurrentLocation(): MapLocation | null {
    return this.state.currentLocation;
  }

  getLayers(): MapLayer[] {
    return [...this.state.layers];
  }

  getViewport() {
    return this.state.viewport;
  }

  getMapStatus() {
    return this.state.status;
  }

  getMapState(): MapState {
    return {
      ...this.state,
      layers: [...this.state.layers],
    };
  }
}
