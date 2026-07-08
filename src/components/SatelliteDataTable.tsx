import { SatelliteDataPoint } from '../types';

interface Props {
  data: SatelliteDataPoint[];
  limit?: number;
}

export default function SatelliteDataTable({ data, limit = 7 }: Props) {
  const displayData = data.slice(0, limit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm data-table">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 font-medium">Location</th>
            <th className="text-right py-3">Salinity (dS/m)</th>
            <th className="text-right py-3">NDVI</th>
            <th className="text-right py-3">Rainfall</th>
            <th className="text-right py-3">Groundwater</th>
            <th className="text-left py-3">Source</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((point, idx) => (
            <tr key={idx} className="border-b border-slate-100 last:border-0">
              <td className="py-3 font-medium">{point.lat.toFixed(2)}, {point.lng.toFixed(2)}</td>
              <td className={`text-right py-3 font-medium ${point.salinity > 5.5 ? 'text-red-600' : point.salinity > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {point.salinity}
              </td>
              <td className="text-right py-3 font-mono">{point.ndvi}</td>
              <td className="text-right py-3">{point.rainfall} mm</td>
              <td className="text-right py-3">{point.groundwater} m</td>
              <td className="text-xs py-3 text-slate-500">{point.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
