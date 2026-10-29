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

  // Live scrubbing: the year follows the pointer while it is held down on the track.
  const trackRef = React.useRef<HTMLDivElement>(null);
  const draggingRef = React.useRef(false);

  const yearAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return currentYear;
    const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return years[Math.round(percent * (years.length - 1))];
  };

  const stepYear = (delta: number) => {
    const i = years.indexOf(currentYear);
    selectYear(years[Math.max(0, Math.min(years.length - 1, i + delta))]);
  };

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
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Timeline year"
            aria-valuemin={years[0]}
            aria-valuemax={years[years.length - 1]}
            aria-valuenow={currentYear}
            className="relative h-2.5 bg-[var(--timeline-track-bg)] rounded-full mx-1 cursor-pointer touch-none select-none"
            onPointerDown={(e) => {
              draggingRef.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              selectYear(yearAt(e.clientX));
            }}
            onPointerMove={(e) => {
              if (draggingRef.current) selectYear(yearAt(e.clientX));
            }}
            onPointerUp={(e) => {
              draggingRef.current = false;
              if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={() => {
              draggingRef.current = false;
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); stepYear(1); }
              else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); stepYear(-1); }
              else if (e.key === 'Home') { e.preventDefault(); selectYear(years[0]); }
              else if (e.key === 'End') { e.preventDefault(); selectYear(years[years.length - 1]); }
            }}
          >
            <div 
              className="absolute top-0 h-2.5 bg-[var(--geodesis-primary)] rounded-full pointer-events-none"
              style={{ width: `${progress}%` }}
            />
            {/* Scrub handle */}
            <div 
              className="absolute top-1/2 -mt-1.5 w-4 h-4 bg-white border-[3px] border-[var(--geodesis-primary)] rounded-full shadow-sm cursor-grab active:cursor-grabbing pointer-events-none"
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
