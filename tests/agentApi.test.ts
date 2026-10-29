import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler, {
  buildPlanMessages,
  clip,
  buildReasonMessages,
  extractJson,
  fallbackQueries,
  isInMekongDelta,
  isRateLimited,
  mergeSearchResults,
  parseAgentRequest,
  parsePlanQueries,
  pickDeepModel,
  pickFastModel,
  resetAgentState,
  selectModels,
  stripThinking,
  summarizeForecast,
  verifyAnswer,
} from '../api/agent';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AgentEvent, AgentStepInfo } from '../src/types/agent';

const KEY = 'test-nebius-key-123';
const TAVILY = 'tvly-test';

const validBody = {
  question: 'Should I switch to a salt-tolerant rice variety this dry season?',
  language: 'English',
  context: {
    location: { name: 'Ben Tre', lat: 10.24, lng: 106.38 },
    year: 2030,
    metrics: { yield: 4.1, salinity: 5.4, waterIndex: 0.68, ndvi: 0.74, riskScore: 41 },
    scenario: { name: 'Salinity Spike', rainfallDelta: -20, salinityDelta: 1.5, awdAdoption: 60 },
    projections: [
      { year: 2030, yield: 3.4, waterUse: 6900, riskScore: 55 },
      { year: 2031, yield: 3.2, waterUse: 7000, riskScore: 61 },
    ],
    recommendation: { crop: 'Salt-Tolerant ST25', confidence: 84, expectedYield: 4.1, riskLevel: 'Medium', reasoning: ['High salinity tolerance required'] },
  },
};

const MODEL_IDS = [
  'meta-llama/Llama-3.3-70B-Instruct',
  'nvidia/Nemotron-3_5-Lightning',
  'nvidia/Nemotron-3.5-Super-VL',
  'nvidia/nemotron-3-super-120b-a12b',
  'nvidia/Nemotron-3-Ultra-550b-a55b',
  'nvidia/llama-3.2-nv-embedqa-1b-v2',
];

const goodAnswer = {
  headline: 'Switch the lowest plots to a salt-tolerant variety and sow after the first heavy rain.',
  confidence: 'medium',
  actions: [
    { step: 'Plant a salt-tolerant variety such as ST25 in the lowest-lying plots', why: 'Salinity of 5.4 dS/m exceeds what sensitive varieties tolerate.', basis: 'evidence', cites: [1] },
    { step: 'Delay sowing until after the forecast rains', why: 'The next 16 days bring 61 mm of rain, which helps flush salt.', basis: 'forecast', cites: [] },
    { step: 'Adopt AWD on most plots', why: 'The scenario assumes 60% AWD adoption, which lowers simulated water use.', basis: 'engine', cites: [] },
  ],
  risks: [{ risk: 'Saline water arrives before the rains', mitigation: 'Close sluice gates at high tide', cites: [2] }],
  limits: 'Twin inputs are simulated demonstration data; sources were not field-verified.',
};

interface Call {
  url: string;
  body: any;
  auth: string | null;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function chatCompletion(content: string, usage = { prompt_tokens: 120, completion_tokens: 80 }): Response {
  return json({ choices: [{ message: { content } }], usage });
}

const searchResults = [
  { title: 'Salt-tolerant rice for the Mekong Delta', url: 'https://www.irri.org/news/salt-tolerant#top', content: 'Salt-tolerant varieties such as ST25 can withstand salinity of 4 to 6 dS/m at the seedling stage in the Mekong Delta.', score: 0.9 },
  { title: 'Saltwater intrusion forecast', url: 'https://www.mrcmekong.org/salinity', content: 'Saltwater intrusion in the Mekong Delta peaks between February and May during the dry season, reaching far inland.', score: 0.8 },
  { title: 'Too short', url: 'https://example.org/short', content: 'tiny', score: 0.99 },
  { title: 'Bad scheme', url: 'javascript:alert(1)', content: 'x'.repeat(100), score: 0.95 },
];

const dailyForecast = {
  daily: {
    time: ['2030-02-01', '2030-02-02', '2030-02-03'],
    precipitation_sum: [0, 12.5, 48.5],
    temperature_2m_max: [33.1, 31.4, 30.2],
    temperature_2m_min: [24.2, 23.8, 23.1],
    et0_fao_evapotranspiration: [4.1, 3.2, 2.2],
  },
};

type Responder = (body: any, call: Call) => Response | Promise<Response>;

function installFetch(overrides: { chat?: Responder; models?: Responder; tavily?: Responder; meteo?: Responder } = {}) {
  const calls: Call[] = [];
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const auth = init?.headers ? (init.headers as Record<string, string>).Authorization ?? null : null;
    const call: Call = { url, body, auth };
    calls.push(call);

    if (url.endsWith('/models')) return (overrides.models ?? (() => json({ data: MODEL_IDS.map((id) => ({ id })) })))(body, call);
    if (url.endsWith('/chat/completions')) {
      const responder =
        overrides.chat ??
        ((b: any) => {
          const system = String(b.messages[0].content);
          if (system.includes('planning step')) {
            return chatCompletion('{"queries":["salt tolerant rice varieties Mekong Delta","Mekong Delta saltwater intrusion dry season 2030"]}');
          }
          return chatCompletion(JSON.stringify(goodAnswer));
        });
      return responder(body, call);
    }
    if (url.endsWith('/search')) return (overrides.tavily ?? (() => json({ results: searchResults, usage: { credits: 1 } })))(body, call);
    if (url.includes('/forecast')) return (overrides.meteo ?? (() => json(dailyForecast)))(body, call);
    return json({ error: 'not found' }, 404);
  });
  vi.stubGlobal('fetch', fn);
  return { calls, fn };
}

function createRes() {
  const lines: string[] = [];
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: null as unknown,
    writableEnded: false,
    destroyed: false,
    setHeader: vi.fn((k: string, v: string) => {
      res.headers[k] = v;
      return res;
    }),
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((data: unknown) => {
      res.body = data;
      res.writableEnded = true;
      return res;
    }),
    write: vi.fn((chunk: string) => {
      lines.push(...chunk.split('\n').filter(Boolean));
      return true;
    }),
    end: vi.fn(() => {
      res.writableEnded = true;
    }),
    on: vi.fn(),
  };
  const events = () => lines.map((l) => JSON.parse(l) as AgentEvent);
  return { res: res as VercelResponse & typeof res, events, lines };
}

function createReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return { method: 'POST', headers: { 'x-forwarded-for': '203.0.113.7' }, body: structuredClone(validBody), ...overrides } as unknown as VercelRequest;
}

const stepsOf = (events: AgentEvent[]): AgentStepInfo[] => {
  const latest = new Map<string, AgentStepInfo>();
  for (const e of events) if (e.type === 'step') latest.set(e.step.key, e.step);
  return [...latest.values()];
};

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  for (const k of ['NEBIUS_MODEL', 'NEBIUS_MODEL_FAST', 'NEBIUS_MODEL_DEEP', 'NEBIUS_BASE_URL', 'TAVILY_BASE_URL', 'OPEN_METEO_BASE']) delete process.env[k];
  process.env.NEBIUS_API_KEY = KEY;
  process.env.TAVILY_API_KEY = TAVILY;
  resetAgentState();
  vi.unstubAllGlobals();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  process.env = originalEnv;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('parseAgentRequest', () => {
  it('accepts a full payload and normalises the language', () => {
    const parsed = parseAgentRequest({ ...validBody, language: 'vi' });
    expect(parsed).not.toBeNull();
    expect(parsed!.language).toBe('Vietnamese');
    expect(parsed!.context.location.name).toBe('Ben Tre');
    expect(parsed!.context.projections).toHaveLength(2);
    expect(parsed!.context.recommendation?.crop).toBe('Salt-Tolerant ST25');
  });

  it('defaults to English for anything else', () => {
    expect(parseAgentRequest({ ...validBody, language: 'Klingon' })!.language).toBe('English');
  });

  it('rejects missing or too-short questions, missing context and invalid coordinates', () => {
    expect(parseAgentRequest({ ...validBody, question: 'hi' })).toBeNull();
    expect(parseAgentRequest({ question: validBody.question })).toBeNull();
    expect(parseAgentRequest(null)).toBeNull();
    expect(parseAgentRequest({ ...validBody, context: { ...validBody.context, location: { name: 'x', lat: 120, lng: 10 } } })).toBeNull();
    expect(parseAgentRequest({ ...validBody, context: { ...validBody.context, location: { name: 'x', lat: 'a', lng: 10 } } })).toBeNull();
  });

  it('limits sizes, strips control characters and clamps numbers', () => {
    const parsed = parseAgentRequest({
      ...validBody,
      question: `What\u0000 should\n I   plant? ${'x'.repeat(500)}`,
      context: {
        ...validBody.context,
        metrics: { ...validBody.context.metrics, riskScore: 9999, salinity: -5 },
        projections: Array.from({ length: 10 }, (_, i) => ({ year: 2030 + i, yield: 3, waterUse: 6000, riskScore: 50 })),
      },
    })!;
    expect(parsed.question.length).toBeLessThanOrEqual(300);
    expect([...parsed.question].some((ch) => ch.charCodeAt(0) < 32)).toBe(false);
    expect(parsed.context.metrics.riskScore).toBe(100);
    expect(parsed.context.metrics.salinity).toBe(0);
    expect(parsed.context.projections).toHaveLength(4);
  });

  it('knows whether a point is inside the Mekong Delta', () => {
    expect(isInMekongDelta(10.24, 106.38)).toBe(true);
    expect(isInMekongDelta(48.85, 2.35)).toBe(false);
  });
});

describe('model selection', () => {
  it('prefers Ultra, then Super, and never picks vision, embedding or non-Nemotron models', () => {
    expect(pickDeepModel(MODEL_IDS)).toBe('nvidia/Nemotron-3-Ultra-550b-a55b');
    expect(pickDeepModel(MODEL_IDS.filter((id) => !/ultra/i.test(id)))).toBe('nvidia/nemotron-3-super-120b-a12b');
    expect(pickDeepModel(['nvidia/Nemotron-3.5-Super-VL', 'nvidia/llama-3.2-nv-embedqa-1b-v2', 'meta-llama/Llama-3.3-70B-Instruct'])).toBeNull();
  });

  it('keeps the configured fast model when listed (case-insensitive) and otherwise picks Lightning or Nano', () => {
    expect(pickFastModel(MODEL_IDS, 'nvidia/nemotron-3_5-lightning')).toBe('nvidia/Nemotron-3_5-Lightning');
    expect(pickFastModel(['nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B'], 'nvidia/does-not-exist')).toBe('nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B');
    expect(pickFastModel(['meta-llama/x'], 'nvidia/Nemotron-3_5-Lightning')).toBe('nvidia/Nemotron-3_5-Lightning');
  });

  it('honours environment overrides and falls back to the fast model when no list is available', () => {
    expect(selectModels(MODEL_IDS, {} as NodeJS.ProcessEnv)).toEqual({ fast: 'nvidia/Nemotron-3_5-Lightning', deep: 'nvidia/Nemotron-3-Ultra-550b-a55b' });
    expect(selectModels(null, {} as NodeJS.ProcessEnv)).toEqual({ fast: 'nvidia/Nemotron-3_5-Lightning', deep: 'nvidia/Nemotron-3_5-Lightning' });
    expect(selectModels(MODEL_IDS, { NEBIUS_MODEL_DEEP: 'nvidia/custom-deep', NEBIUS_MODEL_FAST: 'nvidia/Nemotron-3_5-Lightning' } as unknown as NodeJS.ProcessEnv).deep).toBe('nvidia/custom-deep');
  });
});

describe('JSON extraction', () => {
  it('strips think blocks, fences and surrounding prose', () => {
    expect(stripThinking('<think>plan plan</think>{"a":1}')).toBe('{"a":1}');
    expect(stripThinking('hidden reasoning</think>{"a":1}')).toBe('{"a":1}');
    expect(extractJson('Sure! ```json\n{"a": {"b": "}"}, "c": [1,2]}\n``` hope that helps')).toEqual({ a: { b: '}' }, c: [1, 2] });
  });

  it('returns null for malformed or missing JSON', () => {
    expect(extractJson('no json here')).toBeNull();
    expect(extractJson('{"a": ')).toBeNull();
  });
});

describe('planning', () => {
  it('parses, dedupes and limits model-chosen queries, rejecting URLs and fragments', () => {
    const text = JSON.stringify({
      queries: ['salt tolerant rice Mekong Delta', 'Salt tolerant rice Mekong Delta', 'https://evil.example/q', 'abc', 'AWD water savings Vietnam rice', 'a fourth long enough query'],
    });
    expect(parsePlanQueries(text)).toEqual(['salt tolerant rice Mekong Delta', 'AWD water savings Vietnam rice', 'a fourth long enough query']);
    expect(parsePlanQueries('not json')).toBeNull();
    expect(parsePlanQueries('{"queries": []}')).toBeNull();
  });

  it('builds default queries from the place, crop and year when the planner is unusable', () => {
    const req = parseAgentRequest(validBody)!;
    const queries = fallbackQueries(req);
    expect(queries).toHaveLength(3);
    expect(queries[0]).toContain('Ben Tre');
    expect(queries[1]).toContain('2030');
    expect(queries.every((q) => q.length <= 120)).toBe(true);
  });

  it('puts the question and simulated labels in the prompts', () => {
    const req = parseAgentRequest(validBody)!;
    const plan = buildPlanMessages(req);
    expect(plan[1].content).toContain(validBody.question);
    const reason = buildReasonMessages(req, [], null);
    expect(reason[0].content).toContain('SIMULATED');
    expect(reason[0].content).toContain('untrusted');
    expect(reason[1].content).toContain('SOURCES: none retrieved');
    expect(reason[1].content).toContain('LIVE FORECAST: unavailable');
  });

  it('asks for Vietnamese output and flags out-of-scope locations', () => {
    const req = parseAgentRequest({ ...validBody, language: 'Vietnamese', context: { ...validBody.context, location: { name: 'Paris', lat: 48.85, lng: 2.35 } } })!;
    const reason = buildReasonMessages(req, [], null);
    expect(reason[0].content).toContain('Write every string value in Vietnamese');
    expect(reason[1].content).toContain('OUTSIDE the Mekong Delta');
  });
});

describe('forecast and search tools', () => {
  it('summarises the daily forecast', () => {
    const summary = summarizeForecast(dailyForecast.daily)!;
    expect(summary.days).toBe(3);
    expect(summary.rainTotalMm).toBe(61);
    expect(summary.rainyDays).toBe(2);
    expect(summary.wettestDay).toEqual({ date: '2030-02-03', mm: 48.5 });
    expect(summary.maxTempC).toBe(33.1);
    expect(summary.minTempC).toBe(23.1);
    expect(summary.et0TotalMm).toBe(9.5);
    expect(summarizeForecast({})).toBeNull();
    expect(summarizeForecast({ time: ['2030-01-01'], precipitation_sum: [1] })).toBeNull();
  });

  it('merges search batches: valid URLs only, de-duplicated, best score first, capped, numbered', () => {
    const duplicate = { ...searchResults[0], url: 'https://www.irri.org/news/salt-tolerant', score: 0.95 };
    const many = Array.from({ length: 10 }, (_, i) => ({ title: `T${i}`, url: `https://site${i}.org/p`, content: `${'useful content '.repeat(5)}${i}`, score: i / 20 }));
    const merged = mergeSearchResults([searchResults, [duplicate], many]);
    expect(merged.length).toBe(6);
    expect(merged.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(merged[0].url).toBe('https://www.irri.org/news/salt-tolerant');
    expect(merged.every((s) => /^https?:\/\//.test(s.url))).toBe(true);
    expect(merged.find((s) => s.title === 'Too short')).toBeUndefined();
    expect(merged.find((s) => s.url.startsWith('javascript'))).toBeUndefined();
    expect(merged[0].domain).toBe('irri.org');
  });
});

describe('verifyAnswer', () => {
  const ctx = { sourceCount: 2, hasForecast: true };

  it('accepts a well-formed answer', () => {
    const v = verifyAnswer(goodAnswer, ctx);
    expect(v.ok).toBe(true);
    expect(v.answer!.actions).toHaveLength(3);
    expect(v.answer!.actions[0].cites).toEqual([1]);
  });

  it('removes citations that do not match a retrieved source and relabels unsupported evidence', () => {
    const raw = structuredClone(goodAnswer);
    raw.actions[0].cites = [7];
    const v = verifyAnswer(raw, ctx);
    expect(v.ok).toBe(true);
    expect(v.answer!.actions[0].cites).toEqual([]);
    expect(v.answer!.actions[0].basis).toBe('assumption');
    expect(v.fixes.join(' ')).toMatch(/does not match any retrieved source/);
  });

  it('treats a cited claim as evidence and relabels a forecast claim when no forecast exists', () => {
    const raw = structuredClone(goodAnswer);
    raw.actions[2].cites = [2];
    const v = verifyAnswer(raw, { sourceCount: 2, hasForecast: false });
    expect(v.answer!.actions[2].basis).toBe('evidence');
    expect(v.answer!.actions[1].basis).toBe('assumption');
  });

  it('caps confidence, lowers it without evidence and adds the simulated-data note', () => {
    const raw = { ...structuredClone(goodAnswer), confidence: 'high', limits: 'Field conditions vary.' };
    const v = verifyAnswer(raw, ctx);
    expect(v.answer!.confidence).toBe('medium');
    expect(v.answer!.limits).toMatch(/simulated/);
    expect(verifyAnswer(goodAnswer, { sourceCount: 0, hasForecast: false }).answer!.confidence).toBe('low');
  });

  it('adds the simulated-data note in the answer language, and not at all when already stated', () => {
    const vi = { ...structuredClone(goodAnswer), limits: 'Điều kiện thực tế có thể khác.' };
    expect(verifyAnswer(vi, { ...ctx, language: 'Vietnamese' }).answer!.limits).toMatch(/mô phỏng/);
    const stated = { ...structuredClone(goodAnswer), limits: 'Dữ liệu đầu vào là mô phỏng.' };
    const v = verifyAnswer(stated, { ...ctx, language: 'Vietnamese' });
    expect(v.answer!.limits).toBe('Dữ liệu đầu vào là mô phỏng.');
    expect(v.fixes.join(' ')).not.toMatch(/simulated-data note/);
  });

  it('always states that guidance is not calibrated outside the Mekong Delta, whatever the model said', () => {
    const outside = verifyAnswer(goodAnswer, { ...ctx, outsideDelta: true });
    expect(outside.answer!.limits).toMatch(/outside the Mekong Delta/);
    expect(outside.fixes.join(' ')).toMatch(/out-of-scope note/);
    const vi = verifyAnswer(goodAnswer, { ...ctx, outsideDelta: true, language: 'Vietnamese' });
    expect(vi.answer!.limits).toMatch(/ngoài đồng bằng sông Cửu Long/);
    const already = { ...structuredClone(goodAnswer), limits: 'Simulated inputs; this is outside the delta and not calibrated.' };
    expect(verifyAnswer(already, { ...ctx, outsideDelta: true }).fixes.join(' ')).not.toMatch(/out-of-scope note/);
    expect(verifyAnswer(goodAnswer, ctx).answer!.limits).not.toMatch(/outside the Mekong Delta/);
  });

  it('shortens over-long text at a word boundary instead of mid-word, and says so', () => {
    expect(clip('short text', 50)).toBe('short text');
    const long = 'Current salinity is rising and the simulated recommendation favours standard rice with stable yield outlook';
    const out = clip(long, 60);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith('…')).toBe(true);
    expect(long.startsWith(out.slice(0, -1))).toBe(true);
    expect(long[out.length - 1]).toBe(' ');
    const raw = { ...structuredClone(goodAnswer), headline: long.repeat(3) };
    const v = verifyAnswer(raw, ctx);
    expect(v.answer!.headline.length).toBeLessThanOrEqual(220);
    expect(v.answer!.headline.endsWith('…')).toBe(true);
    expect(v.fixes.join(' ')).toMatch(/shortened text/);
  });

  it('strips URLs the model wrote itself', () => {
    const raw = structuredClone(goodAnswer);
    raw.actions[0].why = 'See https://made-up.example/paper for details on salinity.';
    const v = verifyAnswer(raw, ctx);
    expect(v.answer!.actions[0].why).not.toMatch(/https?:/);
    expect(v.fixes.join(' ')).toMatch(/removed a URL/);
  });

  it('rejects structurally broken answers and leaked planning text', () => {
    expect(verifyAnswer('nope', ctx).ok).toBe(false);
    expect(verifyAnswer({ ...goodAnswer, actions: [goodAnswer.actions[0]] }, ctx).issues).toContain('fewer than two usable actions');
    expect(verifyAnswer({ ...goodAnswer, headline: '' }, ctx).issues).toContain('missing headline');
    expect(verifyAnswer({ ...goodAnswer, risks: [] }, ctx).issues).toContain('no usable risks');
    const leaked = { ...structuredClone(goodAnswer), headline: "Here's a thinking process: first I consider the question" };
    expect(verifyAnswer(leaked, ctx).issues).toContain('contains planning notes');
  });
});

describe('POST /api/agent', () => {
  it('rejects non-POST, unconfigured, invalid and oversized requests', async () => {
    let r = createRes();
    await handler(createReq({ method: 'GET' }), r.res);
    expect(r.res.statusCode).toBe(405);

    delete process.env.NEBIUS_API_KEY;
    r = createRes();
    await handler(createReq(), r.res);
    expect(r.res.statusCode).toBe(503);
    expect(r.res.body).toEqual({ error: 'agent_not_configured' });
    process.env.NEBIUS_API_KEY = KEY;

    r = createRes();
    await handler(createReq({ body: { question: 'x' } as any }), r.res);
    expect(r.res.statusCode).toBe(400);

    r = createRes();
    await handler(createReq({ body: { ...validBody, question: validBody.question, pad: 'x'.repeat(13_000) } as any }), r.res);
    expect(r.res.statusCode).toBe(413);
  });

  it('rate limits a client after six runs per minute', async () => {
    for (let i = 0; i < 6; i += 1) expect(isRateLimited('198.51.100.9')).toBe(false);
    expect(isRateLimited('198.51.100.9')).toBe(true);
    const r = createRes();
    for (let i = 0; i < 6; i += 1) isRateLimited('203.0.113.7');
    await handler(createReq(), r.res);
    expect(r.res.statusCode).toBe(429);
    expect(r.res.headers['Retry-After']).toBe('60');
  });

  it('runs the full workflow: plan, forecast and search in parallel, reason with the largest model, verify', async () => {
    const { calls } = installFetch();
    const { res, events, lines } = createRes();
    await handler(createReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toMatch(/ndjson/);
    expect(lines.every((l) => { try { JSON.parse(l); return true; } catch { return false; } })).toBe(true);

    const all = events();
    const steps = stepsOf(all);
    expect(steps.map((s) => s.id)).toEqual(['context', 'plan', 'forecast', 'search', 'reason', 'verify']);
    expect(steps.every((s) => s.status === 'done')).toBe(true);
    expect(steps.find((s) => s.id === 'plan')!.actor).toBe('nvidia/Nemotron-3_5-Lightning');
    expect(steps.find((s) => s.id === 'reason')!.actor).toBe('nvidia/Nemotron-3-Ultra-550b-a55b');
    expect(steps.find((s) => s.id === 'search')!.actor).toBe('Tavily');
    expect(steps.find((s) => s.id === 'plan')!.items).toEqual(['salt tolerant rice varieties Mekong Delta', 'Mekong Delta saltwater intrusion dry season 2030']);

    const last = all[all.length - 1];
    expect(last.type).toBe('result');
    if (last.type !== 'result') throw new Error('expected result');
    expect(last.models).toEqual({ planner: 'nvidia/Nemotron-3_5-Lightning', reasoner: 'nvidia/Nemotron-3-Ultra-550b-a55b' });
    expect(last.sources.map((s) => s.id)).toEqual([1, 2]);
    expect(last.sources.every((s) => /^https?:\/\//.test(s.url))).toBe(true);
    expect(last.forecast?.rainTotalMm).toBe(61);
    expect(last.answer.actions[0].basis).toBe('evidence');

    // Authorisation and request shapes
    const tavilyCalls = calls.filter((c) => c.url.endsWith('/search'));
    expect(tavilyCalls).toHaveLength(2);
    expect(tavilyCalls.every((c) => c.auth === `Bearer ${TAVILY}`)).toBe(true);
    expect(tavilyCalls[0].body).toMatchObject({ search_depth: 'basic', max_results: 4, include_answer: false });
    const chatCalls = calls.filter((c) => c.url.endsWith('/chat/completions'));
    expect(chatCalls.map((c) => c.body.model)).toEqual(['nvidia/Nemotron-3_5-Lightning', 'nvidia/Nemotron-3-Ultra-550b-a55b']);
    expect(chatCalls[0].body.reasoning_effort).toBe('none');
    expect(chatCalls.every((c) => c.auth === `Bearer ${KEY}`)).toBe(true);

    // The reasoning prompt carries the retrieved sources and the live forecast
    const reasonPrompt = String(chatCalls[1].body.messages[1].content);
    expect(reasonPrompt).toContain('[1] Salt-tolerant rice for the Mekong Delta');
    expect(reasonPrompt).toContain('rain 61 mm over 2 rainy days');

    // No secret ever reaches the client
    expect(lines.join('\n')).not.toContain(KEY);
    expect(lines.join('\n')).not.toContain(TAVILY);
  });

  it('skips web search when no Tavily key is configured and never labels claims as evidence', async () => {
    delete process.env.TAVILY_API_KEY;
    const noEvidence = structuredClone(goodAnswer);
    noEvidence.actions[0].cites = [1];
    noEvidence.risks[0].cites = [2];
    const { calls } = installFetch({
      chat: (b) => (String(b.messages[0].content).includes('planning step') ? chatCompletion('{"queries":["salt tolerant rice Mekong Delta"]}') : chatCompletion(JSON.stringify(noEvidence))),
    });
    const { res, events } = createRes();
    await handler(createReq(), res);

    const search = stepsOf(events()).find((s) => s.id === 'search')!;
    expect(search.status).toBe('skipped');
    expect(calls.some((c) => c.url.endsWith('/search'))).toBe(false);
    const last = events().at(-1)!;
    if (last.type !== 'result') throw new Error('expected result');
    expect(last.sources).toEqual([]);
    expect(last.answer.actions.every((a) => a.basis !== 'evidence' && a.cites.length === 0)).toBe(true);
    expect(last.corrections.join(' ')).toMatch(/does not match any retrieved source/);
  });

  it('continues with default queries when the planner fails or returns garbage', async () => {
    const { calls } = installFetch({
      chat: (b) => (String(b.messages[0].content).includes('planning step') ? chatCompletion('Sure, I will search for stuff') : chatCompletion(JSON.stringify(goodAnswer))),
    });
    const { res, events } = createRes();
    await handler(createReq(), res);

    const plan = stepsOf(events()).find((s) => s.id === 'plan')!;
    expect(plan.status).toBe('failed');
    expect(plan.items).toHaveLength(3);
    expect(calls.filter((c) => c.url.endsWith('/search'))).toHaveLength(3);
    expect(events().at(-1)!.type).toBe('result');
  });

  it('falls back to the fast model when the large model errors', async () => {
    installFetch({
      chat: (b) => {
        const system = String(b.messages[0].content);
        if (system.includes('planning step')) return chatCompletion('{"queries":["salt tolerant rice Mekong Delta"]}');
        if (b.model.includes('Ultra')) return json({ error: 'overloaded' }, 503);
        return chatCompletion(JSON.stringify(goodAnswer));
      },
    });
    const { res, events } = createRes();
    await handler(createReq(), res);

    const reasonSteps = stepsOf(events()).filter((s) => s.id === 'reason');
    expect(reasonSteps.map((s) => [s.status, s.actor])).toEqual([
      ['failed', 'nvidia/Nemotron-3-Ultra-550b-a55b'],
      ['done', 'nvidia/Nemotron-3_5-Lightning'],
    ]);
    const last = events().at(-1)!;
    if (last.type !== 'result') throw new Error('expected result');
    expect(last.models.reasoner).toBe('nvidia/Nemotron-3_5-Lightning');
  });

  it('repairs an invalid first reply once, with the validation problems in the follow-up prompt', async () => {
    let reasonCalls = 0;
    const { calls } = installFetch({
      chat: (b) => {
        if (String(b.messages[0].content).includes('planning step')) return chatCompletion('{"queries":["salt tolerant rice Mekong Delta"]}');
        reasonCalls += 1;
        return reasonCalls === 1 ? chatCompletion('<think>hmm</think>Here is my answer: it depends.') : chatCompletion(JSON.stringify(goodAnswer));
      },
    });
    const { res, events } = createRes();
    await handler(createReq(), res);

    const steps = stepsOf(events());
    expect(steps.filter((s) => s.id === 'verify').map((s) => s.status)).toEqual(['failed', 'done']);
    const repairCall = calls.filter((c) => c.url.endsWith('/chat/completions')).at(-1)!;
    expect(repairCall.body.messages.at(-1).content).toContain('failed validation');
    expect(events().at(-1)!.type).toBe('result');
  });

  it('ends with an error event when no model produces a valid answer', async () => {
    installFetch({
      chat: (b) => (String(b.messages[0].content).includes('planning step') ? chatCompletion('{"queries":["salt tolerant rice Mekong Delta"]}') : chatCompletion('I cannot answer in JSON.')),
    });
    const { res, events } = createRes();
    await handler(createReq(), res);
    const last = events().at(-1)!;
    expect(last).toEqual({ type: 'error', error: 'invalid_model_output' });
    expect(res.end).toHaveBeenCalled();
  });

  it('retries without reasoning_effort when the model rejects the parameter', async () => {
    const { calls } = installFetch({
      chat: (b) => {
        if (b.reasoning_effort) return json({ error: { message: 'unsupported parameter' } }, 400);
        return String(b.messages[0].content).includes('planning step')
          ? chatCompletion('{"queries":["salt tolerant rice Mekong Delta"]}')
          : chatCompletion(JSON.stringify(goodAnswer));
      },
    });
    const { res, events } = createRes();
    await handler(createReq(), res);
    expect(events().at(-1)!.type).toBe('result');
    const withEffort = calls.filter((c) => c.url.endsWith('/chat/completions') && c.body.reasoning_effort);
    const without = calls.filter((c) => c.url.endsWith('/chat/completions') && !c.body.reasoning_effort);
    expect(withEffort.length).toBeGreaterThan(0);
    expect(without.length).toBeGreaterThan(0);
  });

  it('works without the model catalog by using the configured default model for every step', async () => {
    const { calls } = installFetch({ models: () => json({ error: 'nope' }, 500) });
    const { res, events } = createRes();
    await handler(createReq(), res);
    const last = events().at(-1)!;
    if (last.type !== 'result') throw new Error('expected result');
    expect(last.models).toEqual({ planner: 'nvidia/Nemotron-3_5-Lightning', reasoner: 'nvidia/Nemotron-3_5-Lightning' });
    expect(calls.filter((c) => c.url.endsWith('/chat/completions')).every((c) => c.body.model === 'nvidia/Nemotron-3_5-Lightning')).toBe(true);
  });

  it('keeps going without the forecast when Open-Meteo is down', async () => {
    installFetch({ meteo: () => json({ error: 'down' }, 503) });
    const { res, events } = createRes();
    await handler(createReq(), res);
    const forecast = stepsOf(events()).find((s) => s.id === 'forecast')!;
    expect(forecast.status).toBe('failed');
    const last = events().at(-1)!;
    if (last.type !== 'result') throw new Error('expected result');
    expect(last.forecast).toBeNull();
    expect(last.answer.actions.find((a) => a.basis === 'forecast')).toBeUndefined();
  });

  it('reports Tavily failures in the trace without failing the run', async () => {
    installFetch({ tavily: () => json({ detail: 'invalid key' }, 401) });
    const { res, events } = createRes();
    await handler(createReq(), res);
    const search = stepsOf(events()).find((s) => s.id === 'search')!;
    expect(search.status).toBe('failed');
    expect(search.detail).toMatch(/key rejected/);
    expect(events().at(-1)!.type).toBe('result');
  });
});
