/**
 * Shared contract between the browser and the serverless Geodesis Agent (api/agent.ts).
 * Type-only: this file is erased at build time on both sides.
 */

export type AgentLanguage = 'English' | 'Vietnamese';

export interface AgentContext {
  location: { name: string; lat: number; lng: number };
  year: number;
  /** Twin metrics as shown on screen. Simulated demonstration data. */
  metrics: { yield: number; salinity: number; waterIndex: number; ndvi: number; riskScore: number };
  scenario?: { name: string; rainfallDelta: number; salinityDelta: number; awdAdoption: number };
  projections?: Array<{ year: number; yield: number; waterUse: number; riskScore: number }>;
  recommendation?: { crop: string; confidence: number; expectedYield: number; riskLevel: string; reasoning: string[] };
}

export interface AgentRequest {
  question: string;
  language: AgentLanguage;
  context: AgentContext;
}

export type AgentStepId = 'context' | 'plan' | 'forecast' | 'search' | 'reason' | 'verify';

export interface AgentStepInfo {
  /** Unique per step instance, e.g. "reason#2" when a fallback model is tried. */
  key: string;
  id: AgentStepId;
  label: string;
  status: 'running' | 'done' | 'skipped' | 'failed';
  durationMs?: number;
  /** Model id, tool name or "code" - who did the work. */
  actor?: string;
  actorKind?: 'model' | 'tool' | 'code';
  detail?: string;
  items?: string[];
  tokens?: { prompt: number; completion: number };
}

export interface AgentSource {
  id: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedDate?: string;
}

export interface ForecastSummary {
  days: number;
  rainTotalMm: number;
  rainyDays: number;
  wettestDay?: { date: string; mm: number };
  maxTempC: number;
  minTempC: number;
  et0TotalMm: number | null;
  source: 'Open-Meteo';
}

/**
 * Where a claim comes from:
 *  - engine: the simulated twin state or the rule-based recommendation
 *  - forecast: the live Open-Meteo forecast
 *  - evidence: a numbered web source retrieved this run (citation required)
 *  - assumption: the model's own agronomic judgement
 */
export type AnswerBasis = 'engine' | 'forecast' | 'evidence' | 'assumption';

export interface AgentAction {
  step: string;
  why: string;
  basis: AnswerBasis;
  cites: number[];
}

export interface AgentRisk {
  risk: string;
  mitigation: string;
  cites: number[];
}

export interface AgentAnswer {
  headline: string;
  confidence: 'low' | 'medium' | 'high';
  actions: AgentAction[];
  risks: AgentRisk[];
  limits: string;
}

export type AgentEvent =
  | { type: 'step'; step: AgentStepInfo }
  | {
      type: 'result';
      answer: AgentAnswer;
      sources: AgentSource[];
      forecast: ForecastSummary | null;
      models: { planner: string; reasoner: string };
      /** Notes about automatic corrections applied by the verifier. */
      corrections: string[];
      totalMs: number;
    }
  | { type: 'error'; error: string };
