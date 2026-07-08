import { useState } from 'react';
import { historicalEvents, getHistoricalTimeSeries } from '../data/mockData';
import { HistoricalEvent } from '../types';
import GISMapComponent from '../components/GISMapComponent';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function HistoricalReplay() {
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent>(historicalEvents[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackYear, setPlaybackYear] = useState(selectedEvent.year);
  const [currentSimData, setCurrentSimData] = useState(getHistoricalTimeSeries(selectedEvent.year));

  const loadEvent = (event: HistoricalEvent) => {
    setSelectedEvent(event);
    setPlaybackYear(event.year);
    setCurrentSimData(getHistoricalTimeSeries(event.year));
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const simulatedYear = selectedEvent.year;
        const newData = getHistoricalTimeSeries(simulatedYear).map((p) => ({
          ...p,
          salinity: Math.min(33, p.salinity * (1 + step * 0.05)),
          ndvi: Math.max(0.2, p.ndvi - (step * 0.015)),
        }));
        setCurrentSimData(newData);
        setPlaybackYear(simulatedYear);
        if (step > 6) { clearInterval(interval); setIsPlaying(false); }
      }, 900);
    } else {
      setIsPlaying(false);
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentSimData(getHistoricalTimeSeries(selectedEvent.year));
    setPlaybackYear(selectedEvent.year);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-2 px-1">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-900 text-red-100 text-xs font-bold tracking-wider">
          ⚠️ ⚠️ DEMONSTRATION SIMULATION ONLY — NOT LIVE DATA — BASED ON PUBLISHED SUMMARIES
        </div>
      </div>

      <div className="mb-7">
        <div className="font-semibold text-4xl tracking-tighter">Historical Replay</div>
        <div className="text-xl text-slate-500">Demonstration simulation of 2016 &amp; 2020 events</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
          <div className="font-semibold tracking-tight mb-5">SELECT HISTORICAL EVENT</div>
          {historicalEvents.map((event) => (
            <div key={event.id} onClick={() => loadEvent(event)} className={`border rounded-2xl p-5 mb-3 cursor-pointer transition ${selectedEvent.id === event.id ? 'border-emerald-600 ring-1 ring-emerald-300' : 'hover:border-slate-300'}`}>
              <div className="flex items-baseline gap-2">
                <div className="font-semibold text-xl">{event.year}</div>
                <div className="text-xs px-2 py-px bg-red-100 text-red-700 rounded">{event.yieldLoss}% yield loss</div>
              </div>
              <div className="font-semibold tracking-tight mt-px mb-1">{event.name}</div>
              <div className="text-sm leading-tight text-slate-600">{event.description}</div>
              <div className="mt-4 text-xs flex justify-between">
                <div>Peak salinity: <span className="font-semibold">{event.peakSalinity} dS/m</span></div>
                <div className="font-medium">{event.affectedProvinces.length} provinces</div>
              </div>
            </div>
          ))}
          <div className="text-xs px-2 py-2 text-slate-500 mt-1">Based on published MONRE summaries (demonstration only)</div>
        </div>

        <div className="xl:col-span-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className="px-8 pt-5 pb-3 flex items-center justify-between bg-white">
              <div><span className="font-semibold">Playback (simulated): </span><span className="font-semibold text-red-700">{playbackYear}</span> — {selectedEvent.name}</div>
              <div className="flex items-center gap-2">
                <button onClick={togglePlayback} className="flex items-center gap-2 px-5 py-1.5 text-sm rounded-2xl bg-slate-900 text-white">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{isPlaying ? 'PAUSE' : 'PLAY SIMULATED'}
                </button>
                <button onClick={resetSimulation} className="p-2 rounded-2xl border hover:bg-white"><RotateCcw className="w-4 h-4" /></button>
              </div>
            </div>
            <GISMapComponent data={currentSimData} showTimeline={false} height="430px" />
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ label: 'Peak Salinity (historical)', val: selectedEvent.peakSalinity + ' dS/m' },{ label: 'Affected Area (reported)', val: selectedEvent.keyMetrics.affectedArea.toLocaleString() + ' ha' },{ label: 'Yield Loss (reported)', val: selectedEvent.yieldLoss + '%' },{ label: 'Economic Loss (reported)', val: (selectedEvent.keyMetrics.economicLoss / 1000) + 'B VND' }].map((m, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all"><div className="text-xs text-slate-500">{m.label}</div><div className="font-semibold text-2xl tracking-tighter mt-1">{m.val}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
        <div className="font-semibold text-red-900 mb-1">PROOF LOOP STATUS (DEMONSTRATION ONLY)</div>
        <div className="text-red-800">Published 2016/2020 event summaries → deterministic simulation → visual pattern timing. In a real system this would use live time-series with frozen thresholds. This is labeled demonstration data.</div>
      </div>
    </div>
  );
}
