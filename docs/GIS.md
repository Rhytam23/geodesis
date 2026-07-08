# GIS Documentation — MEKONG SMART LAND SYSTEM

## Core Component

`ProfessionalGISMap.tsx` — built on **Leaflet 1.9 + react-leaflet 4**

### Base Layers

- OpenStreetMap (default)
- Satellite (Esri World Imagery)
- Terrain (OpenTopoMap)
- Dark (CartoDB Dark Matter)

### Overlays

- Province boundaries (procedural + deterministic)
- District boundaries
- Commune points
- Salinity risk heatmap
- NDVI vegetation heatmap
- Water demand overlay

### Interactions

- Click anywhere → fires `onLocationSelect(lat, lng)`
- Search input supports:
  - Province names
  - "lat,lng" syntax
  - Partial district names
- Fly-to animation on selection
- Layer control (toggle visibility)
- Scale + attribution

### Data Sources for Boundaries

- Provinces: Hardcoded realistic centroids + shapes derived from public data (labeled DEMO)
- Dynamic polygons generated client-side for performance
- Future: Replace with GeoJSON from Vietnamese government or GADM

### Performance

- Memoized polygons and heatmaps
- Only re-renders layers when location or demo mode changes
- Uses `useMemo` heavily

### Accessibility

- Keyboard navigation supported for search
- ARIA labels on controls
- High-contrast mode compatible

## Recommended Future Enhancements

- Direct integration with Google Earth Engine (vector/raster tiles)
- Real-time WMS layers from MONRE
- Farmer-drawn field polygons (drawing tools)
- Mobile pinch-to-zoom optimizations

---

**Current Status**: Production-ready for hackathon + enterprise demo.