/**
 * TIMELINE DOMAIN MODEL
 * Shared types for temporal navigation and playback.
 */

import { Year } from '../../integrations/types';

export interface TimelineYear {
  readonly year: Year;
  readonly label?: string;
  readonly isBaseline?: boolean;
  readonly isProjection?: boolean;
}

export interface TimelineRange {
  readonly start: Year;
  readonly end: Year;
  readonly resolution: 'annual' | '5-year' | 'decade';
}

export type PlaybackMode = 'once' | 'loop' | 'pingpong';

export interface TimelinePlayback {
  readonly mode: PlaybackMode;
  readonly speed: number;           // 1x, 2x, 0.5x etc.
  readonly isPlaying: boolean;
  readonly currentYear: Year;
}

export interface TimelineState {
  availableYears: Year[];
  currentYear: Year;
  isPlaying: boolean;
  playbackSpeed: number;
}
