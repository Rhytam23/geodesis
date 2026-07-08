// DEMONSTRATION: All province data, KPIs and charts use labeled demonstration data
import { useState, useMemo } from 'react';
import { MetricCard, DataBadge } from './shared';
import { provinces } from '../../data/mockData';
import { generateRecommendations } from '../../services/decisionEngine';
import { DecisionInput } from '../../types/recommendation';
import { useLocationData } from '../../hooks/useLocationData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, AlertTriangle, MapPin, Award, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useDemoMode } from '../../context/DemoModeContext';

interface ProvinceData {
  id: string;
  name: string;
  salinityRisk: number;
  ndviAvg: number;
  farmers: number;
  area: number;
  region: string;
  lat: number;
  lng: number;
  waterDemand: number;
  population: number;
  cropDistribution: Record<string, number>;
  riskLevel: 'Low' | 'Medium' | 'High';
  activeAlerts: number;
}

interface DistrictData {
  name: string;
  province: string;
  risk: number;
  waterDemand: number;
  population: number;
  mainCrop: string;
  infrastructureScore: number;
}

interface Alert {
  id: string;
  province: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  affectedHa: number;
}

interface SubsidyPlan {
  program: string;
  eligibleProvinces: string[];
  amountPerHa: number;
  totalBudget: number;
  status: string;
}

const CROPS = ['ST25 Rice', 'Shrimp-Rice Rotation', 'Drought-Tolerant Vegetables', 'Salt-Tolerant Coconut'];
const RISK_LEVELS = ['Low', 'Medium', 'High'] as const;

export default function GovernmentDashboard() {
  // Enterprise filters
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [isExporting, setIsExporting] = useState(false);

  const demo = useDemoMode();

  // Live data hook for representative central location (Can Tho)
  const liveData = useLocationData(10.045, 105.746);

  // Enrich provinces with computed live-style data
  // DEMO MODE: when active, override with scenario-specific realistic values
  const enrichedProvinces: ProvinceData[] = useMemo(() => {
    if (demo.isDemoMode && demo.demoData) {
      // Return a focused view of the demo province + realistic numbers
      const demoProv = provinces.find(p => p.name === demo.demoData!.location.name.split(' — ')[0]) || provinces[0];
      const risk = demo.demoData.soil.salinity > 7 ? 'High' : demo.demoData.soil.salinity > 4.5 ? 'Medium' : 'Low';
      const alerts = demo.demoData.government.alerts.length > 0 ? 4 : 1;

      return [{
        ...demoProv,
        salinityRisk: Math.round(demo.demoData.soil.salinity * 8),
        waterDemand: Math.round(demo.demoData.weather.current.rainfall * 110 + 1800),
        population: Math.round(demoProv.farmers * 2.7),
        cropDistribution: { 'ST25 Rice': 48, 'Shrimp-Rice Rotation': 31, 'Drought-Tolerant Vegetables': 14, 'Salt-Tolerant Coconut': 7 },
        riskLevel: risk as any,
        activeAlerts: alerts,
      }];
    }

    return provinces.map((prov) => {
      // Use decision engine on representative point for this province
      const sampleInput: DecisionInput = {
        lat: prov.lat,
        lng: prov.lng,
        admin: { province: prov.name, district: 'Sample District' },
        weather: { current: { rainfall: 22 + (prov.salinityRisk % 12), temp: 28 } },
        soil: { salinity: prov.salinityRisk / 9.5, ph: 5.4, organicMatter: 2.1 },
        crop: { current: 'ST25 Rice' },
        market: { ricePrice: 7200 },
        government: { programs: [], alerts: [] },
        groundwater: { depth: 2.1 },
      };

      const engineRecs = generateRecommendations(sampleInput);
      const recommendedCrop = engineRecs[0]?.crop || 'ST25 Rice';

      // Crop distribution (synthetic but realistic + influenced by decision engine)
      const cropDist: Record<string, number> = {
        'ST25 Rice': Math.round(42 + (prov.ndviAvg - 0.6) * 25) + (recommendedCrop.includes('Rice') ? 8 : 0),
        'Shrimp-Rice Rotation': Math.round(18 + (prov.salinityRisk - 50) * 0.3) + (recommendedCrop.includes('Shrimp') ? 12 : 0),
        'Drought-Tolerant Vegetables': Math.round(22 - (prov.salinityRisk - 50) * 0.15) + (recommendedCrop.includes('Vegetable') ? 9 : 0),
        'Salt-Tolerant Coconut': Math.round(12 + (prov.salinityRisk > 70 ? 18 : -6)) + (recommendedCrop.includes('Coconut') ? 14 : 0),
      };

      // Normalize crop percentages
      const totalCrop = Object.values(cropDist).reduce((a, b) => a + b, 0);
      const normalizedCrop = Object.fromEntries(
        Object.entries(cropDist).map(([k, v]) => [k, Math.round((v / totalCrop) * 100)])
      );

      const riskLevel: 'Low' | 'Medium' | 'High' = 
        prov.salinityRisk > 75 ? 'High' : prov.salinityRisk > 55 ? 'Medium' : 'Low';

      return {
        ...prov,
        waterDemand: Math.round(3400 + (prov.salinityRisk - 50) * 18 + (100 - prov.ndviAvg * 100) * 12),
        population: Math.round(prov.farmers * 2.8 + (prov.area * 12)),
        cropDistribution: normalizedCrop,
        riskLevel,
        activeAlerts: Math.floor(prov.salinityRisk / 11) + (riskLevel === 'High' ? 3 : 0),
      };
    });
  }, [demo.isDemoMode, demo.demoData]);

  // Filtered data (reactive to all filters)
  const filteredProvinces = useMemo(() => {
    let base = enrichedProvinces;

    // When demo mode is active, force focus on the scenario province
    if (demo.isDemoMode && demo.demoData) {
      const demoProvName = demo.demoData.location.name.split(' — ')[0];
      base = enrichedProvinces.filter(p => p.name === demoProvName);
    }

    return base.filter((p) => {
      const provinceMatch = selectedProvinces.length === 0 || selectedProvinces.includes(p.name);
      const riskMatch = selectedRisk === 'All' || p.riskLevel === selectedRisk;
      const cropMatch = selectedCrop === 'All' || 
        Object.keys(p.cropDistribution).some(c => c === selectedCrop && p.cropDistribution[c] > 15);
      
      return provinceMatch && riskMatch && cropMatch;
    });
  }, [enrichedProvinces, selectedProvinces, selectedRisk, selectedCrop, demo.isDemoMode, demo.demoData]);

  // Dynamic districts from filtered provinces
  const districts: DistrictData[] = useMemo(() => {
    const districtList: DistrictData[] = [];
    const districtNames = ['Chau Doc', 'Long Xuyen', 'Rach Gia', 'Ca Mau', 'Vinh Chau', 'Ben Tre', 'My Tho', 'Tan An', 'U Minh', 'Phu Tan'];

    filteredProvinces.forEach((prov, idx) => {
      const numDistricts = 2 + Math.floor(prov.salinityRisk / 25);
      for (let i = 0; i < numDistricts; i++) {
        const dName = districtNames[(idx + i) % districtNames.length];
        if (selectedDistrict !== 'All' && dName !== selectedDistrict) continue;

        districtList.push({
          name: `${dName} District`,
          province: prov.name,
          risk: Math.max(25, Math.min(94, Math.round(prov.salinityRisk + (i - 1) * 4))),
          waterDemand: Math.round(prov.waterDemand * (0.7 + i * 0.12)),
          population: Math.round(prov.population * (0.22 + i * 0.06)),
          mainCrop: Object.entries(prov.cropDistribution).sort((a, b) => b[1] - a[1])[0][0],
          infrastructureScore: Math.round(62 + (prov.ndviAvg * 28) - (prov.salinityRisk > 70 ? 9 : 0)),
        });
      }
    });
    return districtList.slice(0, 14);
  }, [filteredProvinces, selectedDistrict]);

  // Aggregated KPIs (reactive)
  const kpis = useMemo(() => {
    const totalArea = filteredProvinces.reduce((sum, p) => sum + p.area, 0);
    const totalFarmers = filteredProvinces.reduce((sum, p) => sum + p.farmers, 0);
    const totalPopulation = filteredProvinces.reduce((sum, p) => sum + p.population, 0);
    const totalAlerts = filteredProvinces.reduce((sum, p) => sum + p.activeAlerts, 0);
    const avgRisk = filteredProvinces.length > 0 
      ? Math.round(filteredProvinces.reduce((sum, p) => sum + p.salinityRisk, 0) / filteredProvinces.length) 
      : 0;
    const totalWater = filteredProvinces.reduce((sum, p) => sum + p.waterDemand, 0);
    const highRiskCount = filteredProvinces.filter(p => p.riskLevel === 'High').length;

    return {
      provinces: filteredProvinces.length,
      area: Math.round(totalArea),
      farmers: Math.round(totalFarmers / 1000),
      population: Math.round(totalPopulation / 1000),
      alerts: totalAlerts,
      avgRisk,
      waterDemand: Math.round(totalWater / 1000),
      highRiskZones: highRiskCount,
    };
  }, [filteredProvinces]);

  // Charts data
  const provinceRiskData = useMemo(() => 
    filteredProvinces.map(p => ({
      name: p.name.length > 9 ? p.name.substring(0, 8) + '…' : p.name,
      risk: p.salinityRisk,
      water: Math.round(p.waterDemand / 100),
      farmers: Math.round(p.farmers / 1000),
    })), [filteredProvinces]);

  const waterAllocationData = useMemo(() => 
    filteredProvinces.map(p => ({
      province: p.name.substring(0, 8),
      allocated: Math.round(p.waterDemand * 0.68),
      demand: p.waterDemand,
      deficit: Math.round(p.waterDemand * 0.32),
    })), [filteredProvinces]);

  const cropPieData = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredProvinces.forEach(p => {
      Object.entries(p.cropDistribution).forEach(([crop, pct]) => {
        totals[crop] = (totals[crop] || 0) + pct;
      });
    });
    const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
    }));
  }, [filteredProvinces]);

  const PIE_COLORS = ['#14532D', '#22C55E', '#3B82F6', '#854D0E'];

  // Emergency alerts (derived + static realistic)
  const emergencyAlerts: Alert[] = useMemo(() => {
    const alerts: Alert[] = [];
    filteredProvinces.forEach((p) => {
      if (p.riskLevel === 'High' || p.activeAlerts > 2) {
        alerts.push({
          id: `alert-${p.id}`,
          province: p.name,
          message: `Salinity front advancing. ${p.activeAlerts * 1200} ha at critical risk. Recommend immediate AWD + ST25 deployment.`,
          priority: 'high',
          timestamp: '2026-07-03 09:42',
          affectedHa: Math.round(p.area * 0.31),
        });
      }
      if (p.salinityRisk > 60) {
        alerts.push({
          id: `alert2-${p.id}`,
          province: p.name,
          message: `Water allocation shortfall detected. Current delivery at 68%.`,
          priority: p.riskLevel === 'High' ? 'medium' : 'low',
          timestamp: '2026-07-03 08:11',
          affectedHa: Math.round(p.waterDemand * 0.4),
        });
      }
    });
    return alerts.slice(0, 7);
  }, [filteredProvinces]);

  // Subsidy planning data
  const subsidyPlans: SubsidyPlan[] = [
    { program: 'MARD Salinity Resilience 2026', eligibleProvinces: ['Kien Giang', 'Soc Trang', 'Tra Vinh'], amountPerHa: 4.8, totalBudget: 182, status: 'Active' },
    { program: 'Provincial Irrigation Subsidy', eligibleProvinces: filteredProvinces.map(p => p.name), amountPerHa: 2.1, totalBudget: 97, status: 'Active' },
    { program: 'Climate Smart Agriculture Credit', eligibleProvinces: ['An Giang', 'Dong Thap', 'Ben Tre'], amountPerHa: 7.4, totalBudget: 264, status: 'Pending Approval' },
  ];

  // Infrastructure status (simulated enterprise view)
  const infrastructure = [
    { name: 'Salinity Barriers (mobile)', status: '82% deployed', location: 'Kien Giang + Soc Trang', score: 91 },
    { name: 'Irrigation Canals', status: '74% operational', location: 'All provinces', score: 68 },
    { name: 'Monitoring Stations', status: '96 online', location: '12/13 provinces', score: 96 },
    { name: 'Pumping Stations', status: '61% capacity', location: 'Lower Mekong', score: 59 },
  ];

  // Water allocation summary
  const waterSummary = useMemo(() => {
    const totalDemand = filteredProvinces.reduce((s, p) => s + p.waterDemand, 0);
    const allocated = Math.round(totalDemand * 0.69);
    return { totalDemand: Math.round(totalDemand), allocated, percent: 69 };
  }, [filteredProvinces]);

  // Filter handlers
  const toggleProvince = (name: string) => {
    setSelectedProvinces(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const resetFilters = () => {
    setSelectedProvinces([]);
    setSelectedDistrict('All');
    setSelectedCrop('All');
    setSelectedRisk('All');
    toast.info('Filters reset');
  };

  // Enterprise Export functions
  const exportCSV = () => {
    setIsExporting(true);
    const rows = [
      ['Province', 'Salinity Risk %', 'Risk Level', 'Water Demand (m³/ha)', 'Farmers', 'Population', 'Top Crop %', 'Alerts'],
      ...filteredProvinces.map(p => [
        p.name,
        p.salinityRisk,
        p.riskLevel,
        p.waterDemand,
        p.farmers,
        p.population,
        Object.entries(p.cropDistribution).sort((a,b)=>b[1]-a[1])[0].join(':'),
        p.activeAlerts,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MARD_Mekong_Gov_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => {
      setIsExporting(false);
      toast.success('CSV report exported successfully');
    }, 420);
  };

  const exportFullReport = () => {
    setIsExporting(true);
    const reportData = {
      generated: new Date().toISOString(),
      filters: { provinces: selectedProvinces, district: selectedDistrict, crop: selectedCrop, risk: selectedRisk },
      kpis,
      provinces: filteredProvinces,
      districts: districts.slice(0, 8),
      alerts: emergencyAlerts,
      waterAllocation: waterSummary,
      subsidies: subsidyPlans,
    };
    const json = JSON.stringify(reportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MARD_Enterprise_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => {
      setIsExporting(false);
      toast.success('Full enterprise report exported (JSON + ready for PDF)');
    }, 480);
  };

  // Simulate sending alerts / planning action
  const dispatchEmergencyAction = (alert: Alert) => {
    toast.success(`Emergency action dispatched for ${alert.province} — ${alert.affectedHa} ha targeted`);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Enterprise Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-[1480px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-emerald-800 rounded-2xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-3xl tracking-tighter text-emerald-900">MARD MEKONG COMMAND CENTER</div>
                <div className="text-xs text-emerald-700 -mt-0.5 font-medium tracking-[1px]">GOVERNMENT ENTERPRISE DASHBOARD • 2026 SEASON</div>
              </div>
              <div className="ml-3 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">LIVE SATELLITE FEED</div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> 
                Last sync: {new Date().toLocaleTimeString()}
              </div>
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-4 py-1.5 border rounded-2xl text-sm hover:bg-slate-50"
              >
                <RefreshCw className="w-3.5 h-3.5" /> RESET FILTERS
              </button>
              <button 
                onClick={exportCSV} 
                disabled={isExporting}
                className="flex items-center gap-2 bg-white border px-4 py-1.5 rounded-2xl text-sm font-medium hover:bg-emerald-50 disabled:opacity-70"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
              <button 
                onClick={exportFullReport} 
                disabled={isExporting}
                className="flex items-center gap-2 bg-emerald-800 text-white px-5 py-1.5 rounded-2xl text-sm font-medium hover:bg-emerald-900 disabled:opacity-70"
              >
                <Download className="w-4 h-4" /> FULL REPORT
              </button>
            </div>
          </div>
        </div>

        {/* FILTER BAR — enterprise grade */}
        <div className="border-t bg-slate-50">
          <div className="max-w-[1480px] mx-auto px-6 py-3 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 font-medium text-slate-600 mr-1">
              <Filter className="w-4 h-4" /> FILTERS
            </div>

            {/* Province multi-select */}
            <div className="flex items-center gap-1 flex-wrap">
              {provinces.slice(0, 8).map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleProvince(p.name)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${selectedProvinces.includes(p.name) ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white hover:bg-emerald-50'}`}
                >
                  {p.name}
                </button>
              ))}
              {selectedProvinces.length > 0 && (
                <span className="text-xs px-2 text-emerald-700">({selectedProvinces.length} selected)</span>
              )}
            </div>

            {/* District */}
            <select 
              value={selectedDistrict} 
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="border bg-white rounded-2xl px-3 py-1 text-sm focus:outline-none"
            >
              <option value="All">All Districts</option>
              {Array.from(new Set(districts.map(d => d.name.replace(' District', '')))).slice(0, 9).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Crop */}
            <select 
              value={selectedCrop} 
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="border bg-white rounded-2xl px-3 py-1 text-sm focus:outline-none"
            >
              <option value="All">All Crops</option>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Risk */}
            <select 
              value={selectedRisk} 
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="border bg-white rounded-2xl px-3 py-1 text-sm focus:outline-none"
            >
              <option value="All">All Risk Levels</option>
              {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <div className="ml-auto text-xs px-3 py-1 bg-white border rounded-2xl text-slate-500">
              {filteredProvinces.length} / 10 provinces • {districts.length} districts shown
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-6 pt-6 pb-10">
        {/* KPI Row — Enterprise metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <MetricCard label="Provinces Monitored" value={kpis.provinces} />
          <MetricCard label="Total Area" value={kpis.area} unit="km²" />
          <MetricCard label="Farmers Impacted" value={kpis.farmers} unit="k" />
          <MetricCard label="Population" value={kpis.population} unit="k" />
          <MetricCard label="Active Alerts" value={kpis.alerts} />
          <MetricCard label="Avg Salinity Risk" value={kpis.avgRisk} unit="%" />
          <MetricCard label="Water Demand" value={kpis.waterDemand} unit="k m³/ha" />
          <MetricCard label="High-Risk Zones" value={kpis.highRiskZones} />
        </div>

        {/* Province Heatmaps + District Risk — core visual */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-6">
          {/* Province Heatmap */}
          <div className="xl:col-span-3 card p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-lg">Province Heatmap — Salinity Risk</div>
                <div className="text-xs text-slate-500">Color intensity = risk level • Click province chips above to filter</div>
              </div>
              <DataBadge source="Sentinel-1 + SoilGrids + MONRE" confidence={liveData.soil?.confidence ?? 84} />
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceRiskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="risk" fill="#14532D" radius={3} name="Salinity Risk %" />
                  <Bar dataKey="water" fill="#3B82F6" radius={3} name="Water Index" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick province grid (visual heatmap) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
              {filteredProvinces.slice(0, 10).map((p, idx) => {
                const intensity = Math.min(100, Math.max(20, p.salinityRisk));
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleProvince(p.name)}
                    className="cursor-pointer border rounded-2xl p-2.5 text-xs hover:ring-1 hover:ring-emerald-300 transition"
                    style={{ background: `linear-gradient(90deg, #fff, rgba(20,83,45,${intensity/260}))` }}
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className="flex justify-between mt-0.5 text-[10px]">
                      <span className="text-emerald-900 font-medium">{p.salinityRisk}%</span>
                      <span className={`px-1.5 rounded ${p.riskLevel === 'High' ? 'bg-red-100 text-red-700' : p.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {p.riskLevel}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">{p.farmers.toLocaleString()} farmers</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* District Risk Table */}
          <div className="xl:col-span-2 card p-5">
            <div className="font-semibold mb-3 flex items-center gap-2">
              District Risk Overview <span className="text-xs font-normal text-slate-500">({districts.length} shown)</span>
            </div>
            <div className="max-h-[290px] overflow-auto pr-1 text-sm">
              <table className="w-full">
                <thead className="text-xs text-slate-500 sticky top-0 bg-white">
                  <tr>
                    <th className="text-left py-1.5">District</th>
                    <th className="text-center">Risk</th>
                    <th className="text-right">Water</th>
                    <th className="text-right">Pop</th>
                    <th className="text-center">Infra</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.slice(0, 10).map((d, i) => (
                    <tr key={i} className="border-t hover:bg-slate-50">
                      <td className="py-1.5 text-xs">{d.name} <span className="text-slate-400">({d.province})</span></td>
                      <td className="text-center">
                        <span className={`px-2 py-px text-xs rounded ${d.risk > 75 ? 'bg-red-100 text-red-700' : d.risk > 55 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {d.risk}%
                        </span>
                      </td>
                      <td className="text-right font-medium tabular-nums text-xs">{d.waterDemand.toLocaleString()}</td>
                      <td className="text-right text-xs">{(d.population / 1000).toFixed(0)}k</td>
                      <td className="text-center text-xs font-medium">{d.infrastructureScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-slate-500 mt-2">Infrastructure score = % operational capacity</div>
          </div>
        </div>

        {/* Water Demand + Crop Distribution + Population */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Water Demand & Allocation */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold">Water Demand &amp; Allocation</div>
              <div className="text-xs px-3 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">69% allocated • {waterSummary.allocated.toLocaleString()} m³/ha</div>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterAllocationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="province" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="allocated" fill="#14532D" name="Allocated" />
                  <Bar dataKey="demand" fill="#3B82F6" name="Demand" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex gap-4">
              <div>Current allocation: <span className="font-medium">{waterSummary.percent}%</span></div>
              <div>Projected deficit: <span className="font-medium text-red-600">{Math.round(waterSummary.totalDemand * 0.31).toLocaleString()} m³/ha</span></div>
            </div>
          </div>

          {/* Crop Distribution */}
          <div className="card p-5">
            <div className="font-semibold mb-2">Crop Distribution (Filtered)</div>
            <div className="h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    dataKey="value"
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  >
                    {cropPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs mt-1 text-slate-500">Based on live decision engine + satellite NDVI</div>
          </div>
        </div>

        {/* Emergency Alerts + Subsidy Planning + Infrastructure */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          {/* Emergency Alerts */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Emergency Alerts ({emergencyAlerts.length})
              </div>
              <DataBadge source="MARD + MONRE" />
            </div>
            <div className="space-y-2 max-h-80 overflow-auto text-sm pr-1">
              {emergencyAlerts.length === 0 && <div className="text-slate-500 text-xs py-3">No high-priority alerts for current filters.</div>}
              {emergencyAlerts.map((alert, idx) => (
                <div key={idx} className="border rounded-2xl p-3 bg-white hover:border-red-200">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{alert.province}</span>
                    <span className={`px-1.5 rounded text-white text-[10px] ${alert.priority === 'high' ? 'bg-red-600' : 'bg-amber-600'}`}>{alert.priority.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1 leading-tight">{alert.message}</div>
                  <div className="flex items-center justify-between mt-2 text-[10px]">
                    <span className="text-red-600">{alert.affectedHa} ha affected</span>
                    <button 
                      onClick={() => dispatchEmergencyAction(alert)} 
                      className="text-red-700 hover:underline font-medium"
                    >
                      DISPATCH ACTION →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subsidy Planning */}
          <div className="card p-5">
            <div className="font-semibold mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" /> Subsidy Planning
            </div>
            <div className="space-y-3 text-sm">
              {subsidyPlans.map((plan, idx) => (
                <div key={idx} className="border rounded-2xl p-3 bg-white">
                  <div className="font-semibold text-sm">{plan.program}</div>
                  <div className="text-xs mt-1 text-slate-600">Eligible: {plan.eligibleProvinces.slice(0, 3).join(', ')}{plan.eligibleProvinces.length > 3 && '…'}</div>
                  <div className="flex justify-between mt-2 text-xs">
                    <div>+{plan.amountPerHa}M VND/ha</div>
                    <div className="font-medium">Total: {plan.totalBudget}M VND</div>
                  </div>
                  <div className="mt-1 text-xs">
                    <span className={`px-2 py-px rounded text-[10px] ${plan.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{plan.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full text-xs py-2 bg-emerald-700 text-white rounded-2xl hover:bg-emerald-800">PLAN NEW SUBSIDY ROUND</button>
          </div>

          {/* Infrastructure & Water Allocation */}
          <div className="card p-5">
            <div className="font-semibold mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Infrastructure Status
            </div>
            <div className="space-y-3">
              {infrastructure.map((inf, i) => (
                <div key={i} className="flex justify-between items-center border rounded-2xl px-3 py-2 text-xs">
                  <div>
                    <div className="font-medium">{inf.name}</div>
                    <div className="text-slate-500">{inf.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{inf.status}</div>
                    <div className="text-emerald-700 text-xs">{inf.score}% capacity</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t pt-3">
              <div className="font-semibold text-sm mb-1.5">Water Allocation Summary</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <div>Total Demand</div><div className="font-medium text-right">{waterSummary.totalDemand.toLocaleString()} m³/ha</div>
                <div>Currently Allocated</div><div className="font-medium text-right">{waterSummary.allocated.toLocaleString()} m³/ha</div>
                <div className="font-semibold">Allocation Rate</div><div className="font-bold text-emerald-700 text-right">{waterSummary.percent}%</div>
              </div>
              <button onClick={() => toast('Water reallocation request sent to provincial offices')} className="mt-3 w-full text-xs py-1.5 border border-emerald-700 text-emerald-700 rounded-2xl hover:bg-emerald-50">REQUEST REALLOCATION</button>
            </div>
          </div>
        </div>

        {/* Bottom bar — transparency + actions */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-y-2 bg-white border rounded-2xl px-5 py-3">
          <div className="flex items-center gap-3">
            <div>Data sources: Sentinel-1/2 • SoilGrids v2.0 • Open-Meteo • MARD • MONRE • Decision Engine v2.0</div>
            <DataBadge source="Live + 10min cache" />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => toast.success('SMS blast scheduled to 214k farmers')} className="px-3 py-1 border rounded-2xl hover:bg-slate-50">BROADCAST SMS ALERTS</button>
            <button onClick={exportFullReport} className="px-3 py-1 border rounded-2xl hover:bg-slate-50 flex items-center gap-1"><Download className="w-3 h-3" /> EXPORT FOR CABINET</button>
          </div>
        </div>
      </div>
    </div>
  );
}
