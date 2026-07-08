import { useState, useEffect } from 'react';
import { Check, Clock, Play, Pause } from 'lucide-react';
import { pipelineSteps } from '../data/mockData';

interface PipelineVisualizerProps {
  autoPlay?: boolean;
  onComplete?: () => void;
}

export default function PipelineVisualizer({ autoPlay = true, onComplete }: PipelineVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;

    if (isPlaying && currentStep < pipelineSteps.length) {
      interval = setTimeout(() => {
        const next = currentStep + 1;
        setCurrentStep(next);
        
        if (currentStep >= 0) {
          setCompleted(prev => [...prev, currentStep]);
        }

        if (next === pipelineSteps.length && onComplete) {
          setIsPlaying(false);
          onComplete();
        }
      }, pipelineSteps[currentStep].duration / 10); // Speed up for demo
    }

    return () => clearTimeout(interval);
  }, [isPlaying, currentStep, onComplete]);

  const togglePlay = () => {
    if (currentStep === pipelineSteps.length) {
      reset();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setCompleted([]);
    setIsPlaying(true);
  };

  const progress = ((currentStep + (completed.length ? 0.7 : 0)) / pipelineSteps.length) * 100;

  return (
    <div className="card p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-semibold tracking-tight text-xl">Data Processing Pipeline</div>
          <div className="text-xs text-emerald-700">Real-time satellite ingestion to decision intelligence</div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-medium"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'PAUSE' : currentStep === pipelineSteps.length ? 'RESTART' : 'RESUME'}
          </button>
          <button onClick={reset} className="px-4 py-2 text-sm border border-slate-300 rounded-2xl hover:bg-slate-50">Reset</button>
        </div>
      </div>

      <div className="relative mb-2">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-1.5 bg-emerald-600 transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 mt-5">
        {pipelineSteps.map((step, index) => {
          const isActive = index === currentStep && isPlaying;
          const isCompleted = completed.includes(index);
          
          return (
            <div 
              key={step.id} 
              className={`pipeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-2xl bg-white border border-slate-200 flex-shrink-0">
                {isCompleted ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : isActive ? (
                  <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono font-medium">{(index + 1).toString().padStart(2, '0')}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{step.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{step.duration}ms</div>
                </div>
                <div className="text-xs text-slate-500">{step.description}</div>
              </div>
              {step.dataSource && (
                <div className="text-xs px-2 py-px bg-slate-100 rounded text-slate-600">{step.dataSource}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-700 font-medium">
          <div className="status-dot online"></div>
          {currentStep === pipelineSteps.length ? 'PIPELINE COMPLETE' : 'PROCESSING'}
        </div>
        <div className="text-slate-500">All data sources synced • 6.1s avg runtime</div>
      </div>
    </div>
  );
}
