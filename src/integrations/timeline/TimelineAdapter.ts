/**
 * TimelineAdapter
 * 
 * Adapter for timeline data and playback.
 * Mock implementation.
 */

import { TimelineState, Year } from '../types';

const AVAILABLE_YEARS: Year[] = [2026, 2027, 2028, 2029, 2030, 2035, 2040, 2050];

export class TimelineAdapter {
  private state: TimelineState = {
    availableYears: [...AVAILABLE_YEARS],
    currentYear: 2026,
    isPlaying: false,
    playbackSpeed: 1,
  };

  getAvailableYears(): Year[] {
    return [...this.state.availableYears];
  }

  getCurrentYear(): Year {
    return this.state.currentYear;
  }

  setCurrentYear(year: Year): void {
    if (this.state.availableYears.includes(year)) {
      this.state.currentYear = year;
    }
  }

  play(): void {
    this.state.isPlaying = true;
  }

  pause(): void {
    this.state.isPlaying = false;
  }

  getTimelineState(): TimelineState {
    return { ...this.state };
  }

  setPlaybackSpeed(speed: number): void {
    this.state.playbackSpeed = Math.max(0.5, Math.min(4, speed));
  }
}
