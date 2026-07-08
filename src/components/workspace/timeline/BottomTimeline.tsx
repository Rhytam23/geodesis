import React from 'react';
import { Button } from '../../common/Button';
import { useGeodesisTwin } from '../../../hooks/useGeodesisTwin';

/**
 * BottomTimeline - The Hero of the Digital Twin.
 * 
 * Fully reactive. Changing year updates the entire twin state.
 */
export const BottomTimeline: React.FC = () => {
  const { timeline, currentYear, selectYear, toggleTimelinePlay } = useGeodesisTwin();

  const { state } = timeline;
  const { years, isPlaying } = state;

  const progress = ((years.indexOf(currentYear) / (years.length - 1)) * 100);

  return (
    <div className="h-full w-full px-4 flex items-center bg-white border-t border-[var(--geodesis-border)]">
      <div className="flex items-center gap-3 w-full">
        {/* Play / Pause */}
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTimelinePlay}
          className="flex-shrink-0 px-3 font-mono"
          aria-label={isPlaying ? 'Pause timeline animation' : 'Play timeline animation'}
        >
          {isPlaying ? '⏸' : '▶'}
        </Button>

        {/* Timeline scrubber - now the primary control */}
        <div className="flex-1 relative">
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--geodesis-text-muted)] mb-1 px-1">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => selectYear(year)}
                className={`px-1.5 py-0.5 rounded-md transition-all duration-150 hover:text-[var(--geodesis-primary)] hover:bg-emerald-50 ${
                  year === currentYear
                    ? 'font-bold text-[var(--geodesis-primary)] bg-emerald-100'
                    : ''
                }`}
                aria-current={year === currentYear ? 'time' : undefined}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Visual track with live progress */}
          <div className="relative h-2.5 bg-[var(--timeline-track-bg)] rounded-full mx-1 cursor-pointer"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const percent = (e.clientX - rect.left) / rect.width;
                 const idx = Math.round(percent * (years.length - 1));
                 const targetYear = years[Math.max(0, Math.min(years.length - 1, idx))];
                 selectYear(targetYear);
               }}>
            <div 
              className="absolute top-0 h-2.5 bg-[var(--geodesis-primary)] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
            {/* Scrub handle */}
            <div 
              className="absolute top-1/2 -mt-1.5 w-4 h-4 bg-white border-[3px] border-[var(--geodesis-primary)] rounded-full shadow-sm cursor-grab active:cursor-grabbing transition-all"
              style={{ 
                left: `${progress}%`,
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>

        {/* Current year indicator */}
        <div className="flex items-center gap-2 text-xs flex-shrink-0 font-medium text-[var(--geodesis-text-secondary)]">
          <span className="font-mono px-2.5 py-0.5 bg-slate-100 rounded text-[var(--geodesis-primary)] font-semibold">
            {currentYear}
          </span>
          <span className="text-[var(--geodesis-text-muted)]">•</span>
          <button 
            onClick={() => selectYear(2030)} 
            className="text-[var(--geodesis-text-muted)] hover:text-[var(--geodesis-primary)] hover:underline"
          >
            2030
          </button>
          <button 
            onClick={() => selectYear(2050)} 
            className="text-[var(--geodesis-text-muted)] hover:text-[var(--geodesis-primary)] hover:underline"
          >
            2050
          </button>
        </div>
      </div>
    </div>
  );
};
