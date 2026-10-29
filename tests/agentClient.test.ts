import { describe, it, expect, vi, afterEach } from 'vitest';
import { AgentError, createNdjsonParser, friendlyAgentError, runAgent } from '../src/services/agentClient';
import { buildAgentContext, DEFAULT_AGENT_LOCATION, summarizeRecommendation } from '../src/services/agentContext';
import type { AgentEvent, AgentRequest } from '../src/types/agent';

const request: AgentRequest = {
  question: 'Should I switch to a salt-tolerant variety?',
  language: 'English',
  context: {
    location: { name: 'Ben Tre', lat: 10.24, lng: 106.38 },
    year: 2030,
    metrics: { yield: 4.1, salinity: 5.4, waterIndex: 0.68, ndvi: 0.74, riskScore: 41 },
  },
};

const stepEvent: AgentEvent = {
  type: 'step',
  step: { key: 'plan', id: 'plan', label: 'Plan', status: 'done' },
};
const resultEvent: AgentEvent = {
  type: 'result',
  answer: { headline: 'h', confidence: 'medium', actions: [], risks: [], limits: 'Simulated.' },
  sources: [],
  forecast: null,
  models: { planner: 'a', reasoner: 'b' },
  corrections: [],
  totalMs: 1234,
};

function streamOf(...chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/x-ndjson' } });
}

afterEach(() => vi.unstubAllGlobals());

describe('createNdjsonParser', () => {
  it('reassembles events split across chunk boundaries and ignores malformed lines', () => {
    const seen: AgentEvent[] = [];
    const parser = createNdjsonParser((e) => seen.push(e));
    const a = JSON.stringify(stepEvent);
    const b = JSON.stringify(resultEvent);
    parser.push(a.slice(0, 10));
    parser.push(`${a.slice(10)}\nnot json at all\n${b.slice(0, 5)}`);
    expect(seen).toHaveLength(1);
    parser.push(`${b.slice(5)}\n`);
    expect(seen.map((e) => e.type)).toEqual(['step', 'result']);
  });

  it('flushes a final line that has no trailing newline', () => {
    const seen: AgentEvent[] = [];
    const parser = createNdjsonParser((e) => seen.push(e));
    parser.push(JSON.stringify(resultEvent));
    expect(seen).toHaveLength(0);
    parser.flush();
    expect(seen).toHaveLength(1);
  });
});

describe('runAgent', () => {
  it('posts the request and streams events in order', async () => {
    const fetchMock = vi.fn(async () => streamOf(`${JSON.stringify(stepEvent)}\n`, `${JSON.stringify(resultEvent)}\n`));
    vi.stubGlobal('fetch', fetchMock);
    const seen: AgentEvent[] = [];
    await runAgent(request, (e) => seen.push(e));
    expect(seen.map((e) => e.type)).toEqual(['step', 'result']);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/agent');
    expect(JSON.parse(String(init.body)).question).toBe(request.question);
  });

  it('maps HTTP errors to AgentError reasons', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'rate_limited_client' }), { status: 429 })));
    await expect(runAgent(request, () => {})).rejects.toMatchObject({ name: 'AgentError', reason: 'rate_limited_client' });
    vi.stubGlobal('fetch', vi.fn(async () => new Response('oops', { status: 502 })));
    await expect(runAgent(request, () => {})).rejects.toMatchObject({ reason: 'http_502' });
  });

  it('reports network failures and streams that end without a result', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('failed to fetch'); }));
    await expect(runAgent(request, () => {})).rejects.toBeInstanceOf(AgentError);
    vi.stubGlobal('fetch', vi.fn(async () => streamOf(`${JSON.stringify(stepEvent)}\n`)));
    await expect(runAgent(request, () => {})).rejects.toMatchObject({ reason: 'stream_ended' });
  });

  it('treats an error event as a finished stream', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => streamOf(`${JSON.stringify({ type: 'error', error: 'invalid_model_output' })}\n`)));
    const seen: AgentEvent[] = [];
    await runAgent(request, (e) => seen.push(e));
    expect(seen).toEqual([{ type: 'error', error: 'invalid_model_output' }]);
  });
});

describe('friendlyAgentError', () => {
  it('never leaks raw provider text and always reassures that the twin is unaffected', () => {
    expect(friendlyAgentError('agent_not_configured')).toMatch(/not configured/);
    expect(friendlyAgentError('rate_limited_client')).toMatch(/wait a minute/);
    expect(friendlyAgentError('something_unexpected')).toMatch(/unaffected/);
  });
});

describe('buildAgentContext', () => {
  const liveMetrics = { yield: 3.7, salinity: 6.1, waterIndex: 0.6, ndvi: 0.7, riskScore: 58, economicHealth: 80, populationImpact: 90 };
  const scenario = { name: 'Salinity Spike', rainfallDelta: -20, salinityDelta: 1.5, awdAdoption: 60 };

  it('uses the selected region, projections and the same recommendation the panel shows', () => {
    const ctx = buildAgentContext({
      selectedLocation: { lat: 9.6, lng: 105.98, meta: { province: 'Soc Trang Province' } },
      currentYear: 2031,
      liveMetrics,
      scenario,
      simulationResults: {
        2032: { yield: 3.1, profit: 1, waterUse: 7000, riskScore: 66 },
        2031: { yield: 3.3, profit: 1, waterUse: 6900, riskScore: 60 },
      },
    });
    expect(ctx.location).toEqual({ name: 'Soc Trang Province', lat: 9.6, lng: 105.98 });
    expect(ctx.projections?.map((p) => p.year)).toEqual([2031, 2032]);
    expect(ctx.recommendation).toEqual(summarizeRecommendation(liveMetrics, 2031));
    expect(ctx.recommendation?.crop).toBe('Salt-Tolerant ST25');
    expect(ctx.recommendation?.riskLevel).toBe('Medium');
  });

  it('labels map clicks and falls back to a visible default when nothing is selected', () => {
    const clicked = buildAgentContext({ selectedLocation: { lat: 10.1, lng: 105.9, meta: {} }, currentYear: 2030, liveMetrics, scenario, simulationResults: null });
    expect(clicked.location.name).toBe('Mekong Delta');
    expect(clicked.projections).toBeUndefined();
    const outside = buildAgentContext({ selectedLocation: { lat: 48.8, lng: 2.3 }, currentYear: 2030, liveMetrics, scenario, simulationResults: null });
    expect(outside.location.name).toMatch(/outside the Mekong Delta/);
    const none = buildAgentContext({ selectedLocation: null, currentYear: 2030, liveMetrics, scenario, simulationResults: null });
    expect(none.location).toEqual(DEFAULT_AGENT_LOCATION);
  });
});
