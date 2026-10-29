import { MetricCard, DataBadge } from './shared';
import { provinces } from '../../data/mockData';

export default function ResearchDashboard() {
  const sample = provinces[2]; // Kien Giang for demo

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="role-badge researcher">RESEARCHER</div>
        <div className="text-3xl font-semibold tracking-tighter">Mekong Delta Research Institute</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="NDVI (avg)" value={sample.ndviAvg} />
        <MetricCard label="Scoring method" value="Rule-based" />
        <MetricCard label="Data mode" value="Simulated" />
        <MetricCard label="Field validation" value="Not yet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="font-semibold mb-3">Satellite-style layers (simulated)</div>
          <div className="text-sm grid grid-cols-2 gap-y-2">
            <div>Sentinel-1 SAR</div><div className="text-emerald-700">Salinity</div>
            <div>Sentinel-2 MSI</div><div className="text-emerald-700">NDVI / NDWI</div>
            <div>CHIRPS</div><div className="text-emerald-700">Rainfall</div>
            <div>NASA MODIS</div><div className="text-emerald-700">LST / EVI</div>
          </div>
          <DataBadge source="Simulated, modelled on Sentinel / CHIRPS / MODIS" />
        </div>

        <div className="card p-5">
          <div className="font-semibold mb-3">Raw Metrics (Current Point)</div>
          <div className="text-sm space-y-1.5 font-mono">
            <div>Salinity: {sample.salinityRisk / 10} dS/m</div>
            <div>NDVI: {sample.ndviAvg}</div>
            <div>Groundwater: 1.9 m</div>
            <div>Soil Moisture: 41%</div>
          </div>
          <div className="mt-3 text-xs">Source: simulated demonstration values</div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="font-semibold mb-2">Methodology &amp; limitations</div>
        <div className="text-xs grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>Rule-based weighted scoring<br />No trained ML model</div>
          <div>Not yet validated<br />against field or yield data</div>
          <div>Live: Open-Meteo, SoilGrids<br />Place names: Nominatim</div>
          <div>Simulated: satellite-style<br />layers, station values</div>
        </div>
      </div>
    </div>
  );
}
