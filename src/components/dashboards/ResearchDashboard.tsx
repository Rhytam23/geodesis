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
        <MetricCard label="Model Confidence" value="91" unit="%" />
        <MetricCard label="Salinity RMSE" value="1.09" unit="dS/m" />
        <MetricCard label="Yield MAE" value="0.42" unit="t/ha" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="font-semibold mb-3">Satellite Layers Active</div>
          <div className="text-sm grid grid-cols-2 gap-y-2">
            <div>Sentinel-1 SAR</div><div className="text-emerald-700">Salinity</div>
            <div>Sentinel-2 MSI</div><div className="text-emerald-700">NDVI / NDWI</div>
            <div>CHIRPS</div><div className="text-emerald-700">Rainfall</div>
            <div>NASA MODIS</div><div className="text-emerald-700">LST / EVI</div>
          </div>
          <DataBadge source="Google Earth Engine" />
        </div>

        <div className="card p-5">
          <div className="font-semibold mb-3">Raw Metrics (Current Point)</div>
          <div className="text-sm space-y-1.5 font-mono">
            <div>Salinity: {sample.salinityRisk / 10} dS/m</div>
            <div>NDVI: {sample.ndviAvg}</div>
            <div>Groundwater: 1.9 m</div>
            <div>Soil Moisture: 41%</div>
          </div>
          <div className="mt-3 text-xs">Source: Sentinel-1/2 + CHIRPS + MONRE</div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="font-semibold mb-2">Model Performance &amp; Datasets</div>
        <div className="text-xs grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>XGBoost + LSTM Ensemble<br />F1 (High Risk): 0.91</div>
          <div>Training: 2016–2025<br />Validation: 2020 event (92.4%)</div>
          <div>SoilGrids v2.0<br />Open-Meteo ECMWF</div>
          <div>MONRE ground stations<br />10 provincial sites</div>
        </div>
      </div>
    </div>
  );
}
